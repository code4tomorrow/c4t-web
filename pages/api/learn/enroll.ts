import {
    authedRoute,
    badRequest,
    conflict,
    notFound,
    parseBody,
} from "lib/api";
import { getCourseById } from "lib/courses";
import { audit, getCourseSettings } from "lib/learner";
import prisma from "lib/prisma";
import { enrollRateLimit } from "lib/limits";
import { enrollSchema } from "lib/schemas";

export default authedRoute(["POST"], async ({ req, userId }) => {
    enrollRateLimit(userId);

    const input = parseBody(enrollSchema, req.body);
    const course = getCourseById(input.courseId);

    if (!course) throw notFound("That course does not exist.");

    const settings = await getCourseSettings(course.id);
    const status = settings?.status ?? "REVIEW";

    // Enrollment is only possible in a published course. Draft, review, and
    // archived courses are not enrollable no matter what the client sends.
    if (status !== "PUBLISHED") {
        throw badRequest(
            "This course is not open for enrollment yet.",
            "not_published"
        );
    }

    if (settings?.enforcePrerequisites) {
        const required = course.recommendedPriorCourses;
        if (required.length) {
            const completed = await prisma.enrollment.findMany({
                where: {
                    userId,
                    courseId: { in: required },
                    status: "COMPLETED",
                },
                select: { courseId: true },
            });
            const done = new Set(completed.map((row) => row.courseId));
            const missing = required.filter((id) => !done.has(id));
            if (missing.length) {
                throw badRequest(
                    "Finish the required prior courses first.",
                    "prerequisites_not_met"
                );
            }
        }
    }

    const existing = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId: course.id } },
    });

    if (existing) {
        // Re-enrolling a withdrawn learner reactivates rather than duplicating.
        if (existing.status === "WITHDRAWN" || existing.status === "PAUSED") {
            const reactivated = await prisma.enrollment.update({
                where: { id: existing.id },
                data: { status: "ACTIVE" },
            });
            return { enrollment: reactivated, reactivated: true };
        }
        throw conflict("You are already enrolled in this course.", "duplicate");
    }

    const enrollment = await prisma.enrollment.create({
        data: {
            userId,
            courseId: course.id,
            pacing: input.pacing,
            targetDate: input.targetDate ? new Date(input.targetDate) : null,
            weeklyHoursGoal: input.weeklyHoursGoal ?? null,
            resumeLessonId: course.modules[0]?.lessons[0]?.id ?? null,
        },
    });

    await audit(userId, "enrollment.created", "Enrollment", enrollment.id, {
        courseId: course.id,
    });

    return { enrollment, reactivated: false };
});
