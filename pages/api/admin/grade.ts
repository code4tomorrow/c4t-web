import { authedRoute, badRequest, notFound, parseBody } from "lib/api";
import { findAssessment } from "lib/courses";
import { audit } from "lib/learner";
import { gradeRateLimit } from "lib/limits";
import prisma from "lib/prisma";
import { POINT_VALUES, pointKey } from "lib/progress";
import { gradeSchema } from "lib/schemas";

/**
 * Grades a learner submission.
 *
 * Restricted to INSTRUCTOR and ADMIN. This is the only path that can set a
 * score or move work to APPROVED — a learner can never approve their own work,
 * which is what makes the certificate meaningful.
 */
export default authedRoute(
    ["POST"],
    async ({ req, userId }) => {
        gradeRateLimit(userId);

        const input = parseBody(gradeSchema, req.body);

        const submission = await prisma.assignmentSubmission.findUnique({
            where: { id: input.submissionId },
        });
        if (!submission) throw notFound("Submission not found.");

        if (input.status === "APPROVED" && typeof input.score !== "number") {
            throw badRequest(
                "A score is required to approve work.",
                "score_required"
            );
        }

        const assessment = findAssessment(submission.assignmentId);
        const passingScore = assessment?.passingScore ?? 70;
        const passed =
            input.status === "APPROVED" &&
            typeof input.score === "number" &&
            input.score >= passingScore;

        if (input.status === "APPROVED" && !passed) {
            throw badRequest(
                `Approving requires at least ${passingScore}%. Use "needs revision" instead.`,
                "below_passing_score"
            );
        }

        const graded = await prisma.$transaction(async (tx) => {
            const updated = await tx.assignmentSubmission.update({
                where: { id: submission.id },
                data: {
                    status: input.status,
                    score: input.score ?? submission.score,
                    passed,
                    gradedAt: new Date(),
                },
            });

            if (input.feedback) {
                await tx.instructorFeedback.create({
                    data: {
                        submissionId: submission.id,
                        authorId: userId,
                        body: input.feedback,
                    },
                });
            }

            if (input.status === "APPROVED") {
                await tx.pointTransaction.createMany({
                    data: [
                        {
                            userId: submission.userId,
                            courseId: submission.courseId,
                            points: POINT_VALUES.assignmentApproved,
                            reason: `Approved: ${
                                assessment?.title ?? submission.assignmentId
                            }`,
                            idempotencyKey: pointKey(
                                "assignmentApproved",
                                submission.courseId,
                                submission.assignmentId
                            ),
                        },
                    ],
                    skipDuplicates: true,
                });
            }

            await tx.notification.create({
                data: {
                    userId: submission.userId,
                    type: "ASSIGNMENT_GRADED",
                    title:
                        input.status === "APPROVED"
                            ? "Your work was approved"
                            : "Your work was reviewed",
                    body: `${
                        assessment?.title ?? "Your submission"
                    } is now ${input.status.replace(/_/g, " ").toLowerCase()}.`,
                    href: `/learn/assignments/${submission.assignmentId}`,
                },
            });

            return updated;
        });

        await audit(
            userId,
            "submission.graded",
            "AssignmentSubmission",
            submission.id,
            {
                status: input.status,
                score: input.score ?? null,
                learnerId: submission.userId,
            }
        );

        return { submission: graded };
    },
    ["INSTRUCTOR", "ADMIN"]
);
