import {
    authedRoute,
    badRequest,
    conflict,
    forbidden,
    parseBody,
} from "lib/api";
import { findAssessment } from "lib/courses";
import { audit } from "lib/learner";
import { submissionRateLimit } from "lib/limits";
import prisma from "lib/prisma";
import { POINT_VALUES, pointKey } from "lib/progress";
import { assignmentSubmitSchema } from "lib/schemas";

/**
 * Submits a module checkpoint, applied assignment, or final assessment for
 * instructor review.
 *
 * A learner can submit and revise; they can never set `score` or move their own
 * work to APPROVED. Scoring happens only in /api/admin/grade, which requires an
 * INSTRUCTOR or ADMIN role.
 */
export default authedRoute(["POST"], async ({ req, userId }) => {
    submissionRateLimit(userId);

    const input = parseBody(assignmentSubmitSchema, req.body);
    const assessment = findAssessment(input.assignmentId);

    if (!assessment)
        throw badRequest("Unknown assignment.", "unknown_assignment");

    if (!input.responseText?.trim() && !input.repositoryUrl?.trim()) {
        throw badRequest(
            "Add a written response or a repository link before submitting.",
            "empty_submission"
        );
    }

    const courseId = assessment.course.id;

    const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
    });

    if (!enrollment) throw forbidden("Enroll in this course first.");
    if (enrollment.status === "WITHDRAWN") {
        throw forbidden("This enrollment is withdrawn.");
    }

    const previous = await prisma.assignmentSubmission.findMany({
        where: { userId, assignmentId: assessment.id },
        orderBy: { attemptNumber: "desc" },
    });

    if (previous.some((row) => row.status === "APPROVED")) {
        throw conflict("This work is already approved.", "already_approved");
    }

    // An attempt awaiting review cannot be resubmitted — that would let a
    // learner flood the grading queue.
    const pending = previous.find(
        (row) => row.status === "SUBMITTED" || row.status === "UNDER_REVIEW"
    );
    if (pending) {
        throw conflict(
            "This submission is already awaiting review.",
            "awaiting_review"
        );
    }

    const attemptNumber = (previous[0]?.attemptNumber ?? 0) + 1;

    if (
        assessment.maxAttempts !== null &&
        attemptNumber > assessment.maxAttempts
    ) {
        throw badRequest(
            `You have used all ${assessment.maxAttempts} attempts.`,
            "attempts_exhausted"
        );
    }

    const submission = await prisma.assignmentSubmission.create({
        data: {
            userId,
            courseId,
            assignmentId: assessment.id,
            attemptNumber,
            status: "SUBMITTED",
            responseText: input.responseText?.trim() || null,
            repositoryUrl: input.repositoryUrl?.trim() || null,
            submittedAt: new Date(),
            maxScore: 100,
        },
    });

    await prisma.pointTransaction
        .create({
            data: {
                userId,
                courseId,
                points: POINT_VALUES.assignmentSubmitted,
                reason: `Submitted: ${assessment.title}`,
                idempotencyKey: pointKey(
                    "assignmentSubmitted",
                    courseId,
                    assessment.id
                ),
            },
        })
        .catch(() => undefined);

    await audit(
        userId,
        "submission.created",
        "AssignmentSubmission",
        submission.id,
        {
            courseId,
            assignmentId: assessment.id,
            attemptNumber,
        }
    );

    return {
        submission: {
            id: submission.id,
            assignmentId: submission.assignmentId,
            attemptNumber: submission.attemptNumber,
            status: submission.status,
            submittedAt: submission.submittedAt,
        },
    };
});
