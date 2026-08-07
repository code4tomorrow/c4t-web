import { authedRoute, badRequest, forbidden, parseBody } from "lib/api";
import { findLesson } from "lib/courses";
import { audit, getCourseSettings } from "lib/learner";
import { progressRateLimit } from "lib/limits";
import prisma from "lib/prisma";
import {
    getCourseRequirements,
    isLessonComplete,
    POINT_VALUES,
    pointKey,
} from "lib/progress";
import { lessonProgressSchema } from "lib/schemas";

/**
 * Records which interactions a learner finished in a lesson.
 *
 * The client sends interaction ids only. Whether that makes the lesson
 * "complete" is decided here against the course's completion rule, and the
 * completion timestamp is set by the server.
 */
export default authedRoute(["POST"], async ({ req, userId }) => {
    progressRateLimit(userId);

    const input = parseBody(lessonProgressSchema, req.body);
    const location = findLesson(input.lessonId);

    if (!location) throw badRequest("Unknown lesson.", "unknown_lesson");

    const { course, module, lesson } = location;

    const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId: course.id } },
    });

    if (!enrollment) {
        throw forbidden("Enroll in this course before recording progress.");
    }
    if (enrollment.status === "WITHDRAWN") {
        throw forbidden("This enrollment is withdrawn.");
    }

    const override = await getCourseSettings(course.id);
    const requirements = getCourseRequirements(course, {
        minimumQuizAverage: override?.minimumQuizAverage,
        capstonePassingScore: override?.capstonePassingScore,
    });

    // Only interaction ids that actually belong to this lesson are accepted.
    const allowed = new Set([lesson.interaction.id]);
    const accepted = input.completedInteractionIds.filter((id) =>
        allowed.has(id)
    );

    const existing = await prisma.lessonProgress.findUnique({
        where: { userId_lessonId: { userId, lessonId: lesson.id } },
    });

    const mergedInteractions = Array.from(
        new Set([...(existing?.completedInteractionIds ?? []), ...accepted])
    );

    const requiredInteractions =
        requirements.requiredInteractions[lesson.id] ?? [];
    const satisfiesRule = requiredInteractions.every((id) =>
        mergedInteractions.includes(id)
    );

    // Completion is server-decided and set once — re-posting never moves it.
    const completedAt = satisfiesRule
        ? existing?.completedAt ?? new Date()
        : null;

    const progress = await prisma.lessonProgress.upsert({
        where: { userId_lessonId: { userId, lessonId: lesson.id } },
        create: {
            userId,
            courseId: course.id,
            moduleId: module.id,
            lessonId: lesson.id,
            completedInteractionIds: mergedInteractions,
            completedAt,
        },
        update: {
            completedInteractionIds: mergedInteractions,
            completedAt,
        },
    });

    const justCompleted = Boolean(completedAt) && !existing?.completedAt;

    if (justCompleted) {
        // Idempotent: the unique (userId, idempotencyKey) index means a
        // replayed request cannot award the same points twice.
        await prisma.pointTransaction
            .create({
                data: {
                    userId,
                    courseId: course.id,
                    points: POINT_VALUES.lessonComplete,
                    reason: `Completed lesson: ${lesson.title}`,
                    idempotencyKey: pointKey(
                        "lessonComplete",
                        course.id,
                        lesson.id
                    ),
                },
            })
            .catch(() => undefined);

        await audit(userId, "lesson.completed", "Lesson", lesson.id, {
            courseId: course.id,
        });
    }

    // Move the resume pointer forward so any device continues in the right place.
    await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { resumeLessonId: lesson.id, resumeUpdatedAt: new Date() },
    });

    return {
        lessonId: lesson.id,
        completed: isLessonComplete(requirements, lesson.id, progress),
        completedAt: progress.completedAt,
        completedInteractionIds: progress.completedInteractionIds,
        pointsAwarded: justCompleted ? POINT_VALUES.lessonComplete : 0,
    };
});
