import { getCourseById } from "lib/courses";
import prisma from "lib/prisma";

/**
 * Graded work for the /learn/assignments pages. Kept out of the page module:
 * Next strips only what getServerSideProps uses, so an exported helper in a
 * page file drags Prisma and the whole course registry into the browser.
 */

export type WorkKind = "checkpoint" | "assignment" | "final";
export interface WorkItem {
    id: string;
    courseId: string;
    courseSlug: string;
    courseTitle: string;
    title: string;
    instructions: string;
    kind: WorkKind;
    passingScore: number;
    maxAttempts: number | null;
    attempts: number;
    status: string;
    score: number | null;
    lastFeedback: string | null;
    submittedAt: string | null;
}

/** Builds every graded item across a learner's enrolled courses. */
export const loadWorkItems = async (userId: string) => {
    const [enrollments, submissions, badgeCount, certificateCount] =
        await Promise.all([
            prisma.enrollment.findMany({ where: { userId } }),
            prisma.assignmentSubmission.findMany({
                where: { userId },
                orderBy: { attemptNumber: "desc" },
                include: {
                    feedback: {
                        orderBy: { createdAt: "desc" },
                        take: 1,
                    },
                },
            }),
            prisma.userBadge.count({ where: { userId } }),
            prisma.certificate.count({ where: { userId } }),
        ]);

    const latestByAssignment = new Map<string, (typeof submissions)[number]>();
    const attemptCounts = new Map<string, number>();
    submissions.forEach((submission) => {
        attemptCounts.set(
            submission.assignmentId,
            (attemptCounts.get(submission.assignmentId) ?? 0) + 1
        );
        const existing = latestByAssignment.get(submission.assignmentId);
        if (!existing || submission.attemptNumber > existing.attemptNumber) {
            latestByAssignment.set(submission.assignmentId, submission);
        }
    });

    const items: WorkItem[] = [];

    enrollments.forEach((enrollment) => {
        const course = getCourseById(enrollment.courseId);
        if (!course) return;

        const push = (
            id: string,
            title: string,
            instructions: string,
            kind: WorkKind,
            passingScore: number,
            maxAttempts: number | null
        ) => {
            const latest = latestByAssignment.get(id);
            const approved = submissions.find(
                (row) => row.assignmentId === id && row.status === "APPROVED"
            );
            items.push({
                id,
                courseId: course.id,
                courseSlug: course.slug,
                courseTitle: course.title,
                title,
                instructions,
                kind,
                passingScore,
                maxAttempts,
                attempts: attemptCounts.get(id) ?? 0,
                status: approved?.status ?? latest?.status ?? "NONE",
                score: approved?.score ?? latest?.score ?? null,
                lastFeedback: latest?.feedback[0]?.body ?? null,
                submittedAt: latest?.submittedAt?.toISOString() ?? null,
            });
        };

        course.modules.forEach((module) =>
            push(
                module.checkpoint.id,
                module.checkpoint.title,
                module.checkpoint.instructions,
                "checkpoint",
                module.checkpoint.passingScore,
                module.checkpoint.maximumAttempts
            )
        );
        course.assignments.forEach((assignment) =>
            push(
                assignment.id,
                assignment.title,
                assignment.brief,
                "assignment",
                assignment.passingScore,
                assignment.attempts
            )
        );
        push(
            course.finalAssessment.id,
            course.finalAssessment.title,
            course.finalAssessment.instructions,
            "final",
            course.finalAssessment.passingScore,
            course.finalAssessment.maximumAttempts
        );
    });

    return { items, badgeCount, certificateCount };
};
