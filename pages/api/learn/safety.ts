import { authedRoute, badRequest, forbidden, parseBody } from "lib/api";
import { getCourseById } from "lib/courses";
import { audit } from "lib/learner";
import prisma from "lib/prisma";
import { safetySchema } from "lib/schemas";

/** Records the hardware-safety acknowledgement required by hardware courses. */
export default authedRoute(["POST"], async ({ req, userId }) => {
    const input = parseBody(safetySchema, req.body);
    const course = getCourseById(input.courseId);

    if (!course) throw badRequest("Unknown course.", "unknown_course");
    if (!course.certificateRules.safetyAcknowledgementRequired) {
        throw badRequest(
            "This course does not require a safety acknowledgement.",
            "not_required"
        );
    }

    const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId: course.id } },
    });
    if (!enrollment) throw forbidden("Enroll in this course first.");

    const record = await prisma.safetyAcknowledgement.upsert({
        where: { userId_courseId: { userId, courseId: course.id } },
        create: { userId, courseId: course.id },
        update: {},
    });

    await audit(userId, "safety.acknowledged", "Course", course.id);

    return { acknowledgedAt: record.acknowledgedAt };
});
