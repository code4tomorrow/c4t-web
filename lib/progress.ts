import type {
    AssignmentSubmission,
    Enrollment,
    LessonProgress,
    SafetyAcknowledgement,
} from "@prisma/client";
import type { Course } from "learning/course-models";
import { getCourseById } from "./courses";

/**
 * Everything here is computed on the server from stored rows plus the
 * version-controlled course definition. A client may report "I finished this
 * interaction"; it may never report "I am 100% complete" or "I passed".
 *
 * The authored curriculum grades with open-ended rubric prompts rather than
 * multiple-choice keys, so module checkpoints, applied assignments, and the
 * final assessment all flow through one instructor-reviewed submission
 * pipeline. Only INSTRUCTOR and ADMIN roles can set a score — a learner
 * cannot approve their own work.
 */

export interface CourseRequirements {
    requiredLessonIds: string[];
    /** lessonId -> interaction ids that must be recorded before it counts. */
    requiredInteractions: Record<string, string[]>;
    checkpointIds: string[];
    checkpointPassingScores: Record<string, number>;
    assignmentIds: string[];
    finalAssessmentId: string;
    minimumQuizAverage: number;
    capstonePassingScore: number;
    safetyAcknowledgementRequired: boolean;
    totalHours: number;
    suggestedWeeks: number;
}

export interface RuleOverrides {
    minimumQuizAverage?: number | null;
    capstonePassingScore?: number | null;
}

export const getCourseRequirements = (
    course: Course,
    overrides: RuleOverrides = {}
): CourseRequirements => {
    const requiredLessons = course.modules.flatMap((module) =>
        module.lessons.filter((lesson) => lesson.required)
    );

    return {
        requiredLessonIds: requiredLessons.map((lesson) => lesson.id),
        requiredInteractions: Object.fromEntries(
            requiredLessons.map((lesson) => [
                lesson.id,
                [lesson.interaction.id],
            ])
        ),
        checkpointIds: course.modules.map((module) => module.checkpoint.id),
        checkpointPassingScores: Object.fromEntries(
            course.modules.map((module) => [
                module.checkpoint.id,
                module.checkpoint.passingScore,
            ])
        ),
        assignmentIds: course.assignments.map((assignment) => assignment.id),
        finalAssessmentId: course.finalAssessment.id,
        minimumQuizAverage:
            overrides.minimumQuizAverage ??
            course.certificateRules.minimumQuizAverage,
        capstonePassingScore:
            overrides.capstonePassingScore ??
            course.certificateRules.capstonePassingScore,
        safetyAcknowledgementRequired:
            course.certificateRules.safetyAcknowledgementRequired,
        totalHours: course.estimatedTotalHours,
        suggestedWeeks: course.suggestedWeeks,
    };
};

export interface ProgressInput {
    lessonProgress: LessonProgress[];
    submissions: AssignmentSubmission[];
    safety?: SafetyAcknowledgement | null;
    activeSeconds?: number;
}

export interface CourseProgress {
    courseId: string;
    percentage: number;
    completedLessons: number;
    totalLessons: number;
    passedCheckpoints: number;
    totalCheckpoints: number;
    checkpointAverage: number | null;
    submittedAssignments: number;
    approvedAssignments: number;
    totalAssignments: number;
    activeSeconds: number;
    lastActivityAt: Date | null;
}

/** A lesson counts only when every required interaction has been recorded. */
export const isLessonComplete = (
    requirements: CourseRequirements,
    lessonId: string,
    progress?: LessonProgress
): boolean => {
    if (!progress?.completedAt) return false;

    const required = requirements.requiredInteractions[lessonId] || [];
    return required.every((interactionId) =>
        progress.completedInteractionIds.includes(interactionId)
    );
};

export const groupSubmissions = (
    submissions: AssignmentSubmission[]
): Map<string, AssignmentSubmission[]> => {
    const byAssignment = new Map<string, AssignmentSubmission[]>();
    submissions.forEach((submission) => {
        const list = byAssignment.get(submission.assignmentId) || [];
        list.push(submission);
        byAssignment.set(submission.assignmentId, list);
    });
    return byAssignment;
};

export const isSubmitted = (submissions: AssignmentSubmission[] = []) =>
    submissions.some((submission) => submission.status !== "DRAFT");

export const isApproved = (submissions: AssignmentSubmission[] = []) =>
    submissions.some((submission) => submission.status === "APPROVED");

/** Highest graded score for an item, or null when nothing has been graded. */
export const bestScore = (
    submissions: AssignmentSubmission[] = []
): number | null => {
    const scores = submissions
        .map((submission) => submission.score)
        .filter((score): score is number => typeof score === "number");
    return scores.length ? Math.max(...scores) : null;
};

export const calculateCourseProgress = (
    requirements: CourseRequirements,
    input: ProgressInput,
    courseId: string
): CourseProgress => {
    const lessonById = new Map(
        input.lessonProgress.map((row) => [row.lessonId, row])
    );

    const completedLessons = requirements.requiredLessonIds.filter((lessonId) =>
        isLessonComplete(requirements, lessonId, lessonById.get(lessonId))
    ).length;

    const byAssignment = groupSubmissions(input.submissions);

    const passedCheckpoints = requirements.checkpointIds.filter(
        (checkpointId) => {
            const score = bestScore(byAssignment.get(checkpointId));
            return (
                score !== null &&
                score >=
                    (requirements.checkpointPassingScores[checkpointId] ?? 0)
            );
        }
    ).length;

    const checkpointScores = requirements.checkpointIds
        .map((checkpointId) => bestScore(byAssignment.get(checkpointId)))
        .filter((score): score is number => score !== null);

    const projectIds = [
        ...requirements.assignmentIds,
        requirements.finalAssessmentId,
    ];

    const submittedAssignments = projectIds.filter((assignmentId) =>
        isSubmitted(byAssignment.get(assignmentId))
    ).length;
    const approvedAssignments = projectIds.filter((assignmentId) =>
        isApproved(byAssignment.get(assignmentId))
    ).length;

    // Lessons, checkpoints, and projects each contribute to the percentage.
    const totalUnits =
        requirements.requiredLessonIds.length +
        requirements.checkpointIds.length +
        projectIds.length;
    const completedUnits =
        completedLessons + passedCheckpoints + approvedAssignments;

    const lastActivityAt = input.lessonProgress.reduce<Date | null>(
        (latest, row) =>
            !latest || row.updatedAt > latest ? row.updatedAt : latest,
        null
    );

    return {
        courseId,
        percentage: totalUnits
            ? Math.min(100, Math.round((completedUnits / totalUnits) * 100))
            : 0,
        completedLessons,
        totalLessons: requirements.requiredLessonIds.length,
        passedCheckpoints,
        totalCheckpoints: requirements.checkpointIds.length,
        checkpointAverage: checkpointScores.length
            ? Math.round(
                  checkpointScores.reduce((sum, score) => sum + score, 0) /
                      checkpointScores.length
              )
            : null,
        submittedAssignments,
        approvedAssignments,
        totalAssignments: projectIds.length,
        activeSeconds: input.activeSeconds ?? 0,
        lastActivityAt,
    };
};

export type EligibilityCode =
    | "lessons"
    | "checkpoints"
    | "checkpoint-average"
    | "assignments"
    | "final-project"
    | "manual-review"
    | "safety";

export interface EligibilityRequirement {
    code: EligibilityCode;
    label: string;
    met: boolean;
    detail: string;
}

export interface CertificateEligibility {
    eligible: boolean;
    requirements: EligibilityRequirement[];
}

export const calculateCertificateEligibility = (
    requirements: CourseRequirements,
    input: ProgressInput
): CertificateEligibility => {
    const lessonById = new Map(
        input.lessonProgress.map((row) => [row.lessonId, row])
    );
    const completedLessons = requirements.requiredLessonIds.filter((lessonId) =>
        isLessonComplete(requirements, lessonId, lessonById.get(lessonId))
    ).length;

    const byAssignment = groupSubmissions(input.submissions);

    const passedCheckpointIds = requirements.checkpointIds.filter(
        (checkpointId) => {
            const score = bestScore(byAssignment.get(checkpointId));
            return (
                score !== null &&
                score >=
                    (requirements.checkpointPassingScores[checkpointId] ?? 0)
            );
        }
    );

    const checkpointScores = requirements.checkpointIds
        .map((checkpointId) => bestScore(byAssignment.get(checkpointId)))
        .filter((score): score is number => score !== null);
    const checkpointAverage = checkpointScores.length
        ? Math.round(
              checkpointScores.reduce((sum, score) => sum + score, 0) /
                  checkpointScores.length
          )
        : 0;

    const appliedSubmitted = requirements.assignmentIds.every((assignmentId) =>
        isSubmitted(byAssignment.get(assignmentId))
    );

    const finalScore = bestScore(
        byAssignment.get(requirements.finalAssessmentId)
    );
    const finalPassed =
        finalScore !== null && finalScore >= requirements.capstonePassingScore;

    const projectIds = [
        ...requirements.assignmentIds,
        requirements.finalAssessmentId,
    ];
    const allReviewed = projectIds.every((assignmentId) =>
        isApproved(byAssignment.get(assignmentId))
    );

    const safetyMet =
        !requirements.safetyAcknowledgementRequired || Boolean(input.safety);

    const list: EligibilityRequirement[] = [
        {
            code: "lessons",
            label: "All required lessons complete",
            met: completedLessons === requirements.requiredLessonIds.length,
            detail: `${completedLessons} of ${requirements.requiredLessonIds.length} lessons`,
        },
        {
            code: "checkpoints",
            label: "Every module checkpoint passed",
            met:
                passedCheckpointIds.length ===
                requirements.checkpointIds.length,
            detail: `${passedCheckpointIds.length} of ${requirements.checkpointIds.length} passed`,
        },
        {
            code: "checkpoint-average",
            label: `Checkpoint average of at least ${requirements.minimumQuizAverage}%`,
            met: checkpointAverage >= requirements.minimumQuizAverage,
            detail: checkpointScores.length
                ? `${checkpointAverage}% average`
                : "No checkpoints graded yet",
        },
        {
            code: "assignments",
            label: "Both applied assignments submitted",
            met: appliedSubmitted,
            detail: `${
                requirements.assignmentIds.filter((assignmentId) =>
                    isSubmitted(byAssignment.get(assignmentId))
                ).length
            } of ${requirements.assignmentIds.length} submitted`,
        },
        {
            code: "final-project",
            label: `Final assessment scored at least ${requirements.capstonePassingScore}%`,
            met: finalPassed,
            detail:
                finalScore !== null
                    ? `Best score ${finalScore}%`
                    : "Not graded yet",
        },
        {
            code: "manual-review",
            label: "All reviewed work approved by an instructor",
            met: allReviewed,
            detail: allReviewed
                ? "Approved"
                : `${
                      projectIds.filter((id) =>
                          isApproved(byAssignment.get(id))
                      ).length
                  } of ${projectIds.length} approved`,
        },
    ];

    if (requirements.safetyAcknowledgementRequired) {
        list.push({
            code: "safety",
            label: "Hardware safety acknowledgement signed",
            met: safetyMet,
            detail: safetyMet ? "Signed" : "Not signed",
        });
    }

    return {
        eligible: list.every((requirement) => requirement.met),
        requirements: list,
    };
};

// ------------------------------------------------------------- pacing ----

export type PaceStatus = "ahead" | "on-track" | "behind" | "not-started";

export interface PacingSnapshot {
    status: PaceStatus;
    expectedPercentage: number;
    actualPercentage: number;
    weeksElapsed: number;
    totalWeeks: number;
    label: string;
}

export const calculatePacing = (
    enrollment: Pick<Enrollment, "startedAt" | "pacing" | "targetDate">,
    requirements: CourseRequirements,
    actualPercentage: number,
    now: Date = new Date()
): PacingSnapshot => {
    const totalWeeks = requirements.suggestedWeeks || 1;
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;

    const deadline = enrollment.targetDate;
    const spanWeeks = deadline
        ? Math.max(
              1,
              (deadline.getTime() - enrollment.startedAt.getTime()) / msPerWeek
          )
        : totalWeeks;

    const weeksElapsed = Math.max(
        0,
        (now.getTime() - enrollment.startedAt.getTime()) / msPerWeek
    );

    const expectedPercentage = Math.min(
        100,
        Math.round((weeksElapsed / spanWeeks) * 100)
    );

    // Self-paced learners with no target date have no schedule to fall behind.
    if (enrollment.pacing === "SELF_PACED" && !deadline) {
        return {
            status: actualPercentage > 0 ? "on-track" : "not-started",
            expectedPercentage: 0,
            actualPercentage,
            weeksElapsed: Math.floor(weeksElapsed),
            totalWeeks,
            label:
                actualPercentage > 0
                    ? "Self-paced — no deadline"
                    : "Not started yet",
        };
    }

    if (actualPercentage === 0 && weeksElapsed < 1) {
        return {
            status: "not-started",
            expectedPercentage,
            actualPercentage,
            weeksElapsed: Math.floor(weeksElapsed),
            totalWeeks,
            label: "Just enrolled",
        };
    }

    const difference = actualPercentage - expectedPercentage;
    const status: PaceStatus =
        difference >= 10 ? "ahead" : difference <= -15 ? "behind" : "on-track";

    return {
        status,
        expectedPercentage,
        actualPercentage,
        weeksElapsed: Math.floor(weeksElapsed),
        totalWeeks,
        label:
            status === "ahead"
                ? "Ahead of schedule"
                : status === "behind"
                ? "Behind schedule"
                : "On track",
    };
};

// ------------------------------------------------------------ streaks ----

/**
 * Consecutive days ending today or yesterday. Yesterday still counts so a
 * learner does not lose a streak to a time-zone boundary.
 */
export const calculateStreak = (
    dates: string[],
    today: string
): { current: number; longest: number } => {
    if (!dates.length) return { current: 0, longest: 0 };

    const sorted = Array.from(new Set(dates)).sort();
    const dayMs = 24 * 60 * 60 * 1000;
    const toTime = (value: string) => Date.parse(`${value}T00:00:00Z`);

    let longest = 1;
    let run = 1;

    for (let index = 1; index < sorted.length; index += 1) {
        const gap = toTime(sorted[index]) - toTime(sorted[index - 1]);
        run = gap === dayMs ? run + 1 : 1;
        if (run > longest) longest = run;
    }

    const gapFromToday =
        (toTime(today) - toTime(sorted[sorted.length - 1])) / dayMs;

    let current = 0;
    if (gapFromToday <= 1) {
        current = 1;
        for (let index = sorted.length - 1; index > 0; index -= 1) {
            const gap = toTime(sorted[index]) - toTime(sorted[index - 1]);
            if (gap === dayMs) current += 1;
            else break;
        }
    }

    return { current, longest };
};

// ------------------------------------------------------------- points ----

export const POINT_VALUES = {
    lessonComplete: 20,
    checkpointPassed: 40,
    assignmentSubmitted: 30,
    assignmentApproved: 100,
    courseCompleted: 500,
} as const;

/**
 * Stable key per awardable event. The unique index on
 * (userId, idempotencyKey) makes a replayed request a no-op, which is what
 * prevents point farming.
 */
export const pointKey = (
    kind: keyof typeof POINT_VALUES,
    courseId: string,
    itemId?: string
) => [kind, courseId, itemId].filter(Boolean).join(":");

export const resolveCourseOrThrow = (courseId: string): Course => {
    const course = getCourseById(courseId);
    if (!course) throw new Error(`Unknown course: ${courseId}`);
    return course;
};
