import { authedRoute, badRequest, parseBody } from "lib/api";
import { getCourseById } from "lib/courses";
import { audit } from "lib/learner";
import prisma from "lib/prisma";
import { courseSettingsSchema } from "lib/schemas";

/**
 * Publishes/unpublishes a course and adjusts its completion thresholds.
 * Restricted to CONTENT_EDITOR and ADMIN.
 */
export default authedRoute(
    ["POST"],
    async ({ req, userId }) => {
        const input = parseBody(courseSettingsSchema, req.body);
        const course = getCourseById(input.courseId);

        if (!course) throw badRequest("Unknown course.", "unknown_course");

        // A course cannot be published unless the authored content is actually
        // complete. This mirrors the checks the curriculum validator runs in CI.
        if (input.status === "PUBLISHED") {
            const problems: string[] = [];
            if (!course.title?.trim()) problems.push("missing title");
            if (!course.description?.trim())
                problems.push("missing description");
            if (!course.modules.length) problems.push("no modules");
            if (course.modules.some((module) => !module.lessons.length)) {
                problems.push("a module has no lessons");
            }
            if (!course.assignments.length) problems.push("no assignments");
            if (!course.finalAssessment) problems.push("no final assessment");
            if (!course.certificateRules) problems.push("no certificate rules");

            if (problems.length) {
                throw badRequest(
                    `Cannot publish: ${problems.join(", ")}.`,
                    "incomplete_course"
                );
            }
        }

        const settings = await prisma.courseSettings.upsert({
            where: { courseId: course.id },
            create: {
                courseId: course.id,
                status: input.status ?? "REVIEW",
                enforcePrerequisites: input.enforcePrerequisites ?? false,
                minimumQuizAverage: input.minimumQuizAverage ?? null,
                capstonePassingScore: input.capstonePassingScore ?? null,
                certificatesEnabled: input.certificatesEnabled ?? true,
                updatedById: userId,
            },
            update: {
                ...(input.status !== undefined && { status: input.status }),
                ...(input.enforcePrerequisites !== undefined && {
                    enforcePrerequisites: input.enforcePrerequisites,
                }),
                ...(input.minimumQuizAverage !== undefined && {
                    minimumQuizAverage: input.minimumQuizAverage,
                }),
                ...(input.capstonePassingScore !== undefined && {
                    capstonePassingScore: input.capstonePassingScore,
                }),
                ...(input.certificatesEnabled !== undefined && {
                    certificatesEnabled: input.certificatesEnabled,
                }),
                updatedById: userId,
            },
        });

        await audit(userId, "course.settings_updated", "Course", course.id, {
            status: settings.status,
        });

        return { settings };
    },
    ["CONTENT_EDITOR", "ADMIN"]
);
