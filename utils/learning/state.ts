import {
    ActiveTimeInput,
    AssignmentAttemptInput,
    AssignmentAttemptRecord,
    AwardBadgeInput,
    AwardPointsInput,
    BadgeAward,
    CertificateEligibility,
    CompleteInteractionInput,
    CourseCompletionPolicy,
    CourseProgress,
    EnrollCourseInput,
    EnrollmentRecord,
    ImportLearningDataResult,
    LEARNING_STATE_SCHEMA_VERSION,
    LearningState,
    LearningStreak,
    LearningSummary,
    LocalCertificate,
    PointEvent,
    QuizAttemptInput,
    QuizAttemptRecord,
    ResumePosition,
    SafetyAcknowledgement,
    SetLessonCompletionInput,
} from "./types";

const DEFAULT_QUIZ_AVERAGE = 80;
const DEFAULT_FINAL_PROJECT_SCORE = 80;

const isBrowser = () => typeof window !== "undefined";

const createId = (prefix: string) => {
    const uuid =
        typeof globalThis.crypto !== "undefined" &&
        typeof globalThis.crypto.randomUUID === "function"
            ? globalThis.crypto.randomUUID()
            : `${Date.now().toString(36)}-${Math.random()
                  .toString(36)
                  .slice(2)}`;
    return `${prefix}-${uuid}`;
};

const isoNow = (value?: string) => {
    if (value && !Number.isNaN(Date.parse(value))) return value;
    return new Date().toISOString();
};

const clamp = (value: number, minimum: number, maximum: number) =>
    Math.min(Math.max(value, minimum), maximum);

const unique = (values: string[] = []) => Array.from(new Set(values));

export const learningItemKey = (courseId: string, itemId: string) =>
    `${courseId}::${itemId}`;

export const badgeAwardKey = (badgeId: string, courseId?: string) =>
    `${courseId || "global"}::${badgeId}`;

export const createEmptyLearningState = ({
    now,
    deviceId,
}: {
    now?: string;
    deviceId?: string;
} = {}): LearningState => {
    const timestamp = isoNow(now);
    return {
        schemaVersion: LEARNING_STATE_SCHEMA_VERSION,
        deviceId: deviceId || createId("device"),
        createdAt: timestamp,
        updatedAt: timestamp,
        enrollments: {},
        lessonProgress: {},
        quizAttempts: {},
        assignmentAttempts: {},
        resumePositions: {},
        activity: {
            totalSeconds: 0,
            byDate: {},
            byCourse: {},
            byLesson: {},
        },
        pointEvents: [],
        badges: {},
        safetyAcknowledgements: {},
        certificates: {},
    };
};

const touch = (
    state: LearningState,
    patch: Partial<LearningState>,
    now?: string
): LearningState => ({
    ...state,
    ...patch,
    schemaVersion: LEARNING_STATE_SCHEMA_VERSION,
    updatedAt: isoNow(now),
});

export const enrollInCourse = (
    state: LearningState,
    input: EnrollCourseInput,
    now?: string
): LearningState => {
    const timestamp = isoNow(now);
    const current = state.enrollments[input.courseId];
    const enrollment: EnrollmentRecord = {
        courseId: input.courseId,
        enrolledAt: current?.enrolledAt || timestamp,
        updatedAt: timestamp,
        status: input.status || current?.status || "active",
        pacing: input.pacing || current?.pacing || "self-paced",
    };

    return touch(
        state,
        {
            enrollments: {
                ...state.enrollments,
                [input.courseId]: enrollment,
            },
        },
        timestamp
    );
};

export const updateEnrollmentStatus = (
    state: LearningState,
    courseId: string,
    status: EnrollmentRecord["status"],
    now?: string
): LearningState =>
    enrollInCourse(
        state,
        {
            courseId,
            status,
            pacing: state.enrollments[courseId]?.pacing,
        },
        now
    );

export const awardPoints = (
    state: LearningState,
    input: AwardPointsInput,
    now?: string
): LearningState => {
    const timestamp = isoNow(input.awardedAt || now);
    const points = Number.isFinite(input.points) ? Math.round(input.points) : 0;
    const id = input.id || createId("points");

    if (!points || state.pointEvents.some((event) => event.id === id)) {
        return state;
    }

    const event: PointEvent = {
        id,
        points,
        reason: input.reason,
        awardedAt: timestamp,
        courseId: input.courseId,
    };

    return touch(
        state,
        { pointEvents: [...state.pointEvents, event] },
        timestamp
    );
};

export const setLessonCompletion = (
    state: LearningState,
    input: SetLessonCompletionInput,
    now?: string
): LearningState => {
    const timestamp = isoNow(now);
    const key = learningItemKey(input.courseId, input.lessonId);
    const current = state.lessonProgress[key];
    const wasComplete = Boolean(current?.completedAt);
    const next = {
        courseId: input.courseId,
        lessonId: input.lessonId,
        moduleId: input.moduleId || current?.moduleId,
        startedAt: current?.startedAt || timestamp,
        updatedAt: timestamp,
        completedAt: input.completed
            ? current?.completedAt || timestamp
            : undefined,
        activeSeconds: current?.activeSeconds || 0,
        completedInteractionIds: current?.completedInteractionIds || [],
    };

    let updated = touch(
        state,
        {
            lessonProgress: {
                ...state.lessonProgress,
                [key]: next,
            },
        },
        timestamp
    );

    if (input.completed && !wasComplete) {
        updated = awardPoints(
            updated,
            {
                id: `lesson-complete:${key}`,
                points: 10,
                reason: "Completed a lesson",
                courseId: input.courseId,
                awardedAt: timestamp,
            },
            timestamp
        );
    }

    return updated;
};

export const completeLessonInteraction = (
    state: LearningState,
    input: CompleteInteractionInput,
    now?: string
): LearningState => {
    const timestamp = isoNow(now);
    const key = learningItemKey(input.courseId, input.lessonId);
    const current = state.lessonProgress[key];
    const interactions = unique([
        ...(current?.completedInteractionIds || []),
        input.interactionId,
    ]);

    return touch(
        state,
        {
            lessonProgress: {
                ...state.lessonProgress,
                [key]: {
                    courseId: input.courseId,
                    lessonId: input.lessonId,
                    moduleId: input.moduleId || current?.moduleId,
                    startedAt: current?.startedAt || timestamp,
                    updatedAt: timestamp,
                    completedAt: current?.completedAt,
                    activeSeconds: current?.activeSeconds || 0,
                    completedInteractionIds: interactions,
                },
            },
        },
        timestamp
    );
};

export const recordQuizAttempt = (
    state: LearningState,
    input: QuizAttemptInput,
    now?: string
): LearningState => {
    const timestamp = isoNow(input.submittedAt || now);
    const maxScore =
        Number.isFinite(input.maxScore) && input.maxScore > 0
            ? input.maxScore
            : 1;
    const score = clamp(
        Number.isFinite(input.score) ? input.score : 0,
        0,
        maxScore
    );
    const percentage = (score / maxScore) * 100;
    const passed =
        typeof input.passed === "boolean"
            ? input.passed
            : percentage >= DEFAULT_QUIZ_AVERAGE;
    const key = learningItemKey(input.courseId, input.quizId);
    const attempt: QuizAttemptRecord = {
        id: input.id || createId("quiz-attempt"),
        courseId: input.courseId,
        quizId: input.quizId,
        lessonId: input.lessonId,
        score,
        maxScore,
        passed,
        submittedAt: timestamp,
        pointsEarned:
            input.pointsEarned === undefined
                ? passed
                    ? 5
                    : 0
                : Math.max(0, Math.round(input.pointsEarned)),
    };
    const attempts = state.quizAttempts[key] || [];
    const withoutDuplicate = attempts.filter(
        (existing) => existing.id !== attempt.id
    );
    let updated = touch(
        state,
        {
            quizAttempts: {
                ...state.quizAttempts,
                [key]: [...withoutDuplicate, attempt],
            },
        },
        timestamp
    );

    if (passed && attempt.pointsEarned) {
        updated = awardPoints(
            updated,
            {
                id: `quiz-pass:${key}`,
                points: attempt.pointsEarned,
                reason: "Passed a quiz",
                courseId: input.courseId,
                awardedAt: timestamp,
            },
            timestamp
        );
    }

    return updated;
};

export const recordAssignmentAttempt = (
    state: LearningState,
    input: AssignmentAttemptInput,
    now?: string
): LearningState => {
    const timestamp = isoNow(input.updatedAt || now);
    const key = learningItemKey(input.courseId, input.assignmentId);
    const passed =
        input.passed === true ||
        input.status === "approved" ||
        (typeof input.score === "number" &&
            typeof input.maxScore === "number" &&
            input.maxScore > 0 &&
            (input.score / input.maxScore) * 100 >=
                DEFAULT_FINAL_PROJECT_SCORE);
    const attempt: AssignmentAttemptRecord = {
        id: input.id || createId("assignment-attempt"),
        courseId: input.courseId,
        assignmentId: input.assignmentId,
        status: input.status,
        score: input.score,
        maxScore: input.maxScore,
        passed,
        submittedAt:
            input.submittedAt ||
            (input.status === "draft" ? undefined : timestamp),
        updatedAt: timestamp,
        pointsEarned:
            input.pointsEarned === undefined
                ? passed
                    ? 20
                    : 0
                : Math.max(0, Math.round(input.pointsEarned)),
    };
    const attempts = state.assignmentAttempts[key] || [];
    const withoutDuplicate = attempts.filter(
        (existing) => existing.id !== attempt.id
    );
    let updated = touch(
        state,
        {
            assignmentAttempts: {
                ...state.assignmentAttempts,
                [key]: [...withoutDuplicate, attempt],
            },
        },
        timestamp
    );

    if (passed && attempt.pointsEarned) {
        updated = awardPoints(
            updated,
            {
                id: `assignment-pass:${key}`,
                points: attempt.pointsEarned,
                reason: "Passed an assignment",
                courseId: input.courseId,
                awardedAt: timestamp,
            },
            timestamp
        );
    }

    return updated;
};

export const setResumePosition = (
    state: LearningState,
    position: Omit<ResumePosition, "updatedAt"> & { updatedAt?: string },
    now?: string
): LearningState => {
    const timestamp = isoNow(position.updatedAt || now);
    return touch(
        state,
        {
            resumePositions: {
                ...state.resumePositions,
                [position.courseId]: {
                    ...position,
                    scrollOffset:
                        typeof position.scrollOffset === "number"
                            ? Math.max(0, position.scrollOffset)
                            : undefined,
                    updatedAt: timestamp,
                },
            },
        },
        timestamp
    );
};

export const localDateKey = (date: Date = new Date()) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export const recordActiveTime = (
    state: LearningState,
    input: ActiveTimeInput,
    now?: string
): LearningState => {
    const seconds = Math.max(
        0,
        Math.floor(Number.isFinite(input.seconds) ? input.seconds : 0)
    );
    if (!seconds) return state;

    const timestamp = isoNow(input.occurredAt || now);
    const dateKey = localDateKey(new Date(timestamp));
    const byCourse = { ...state.activity.byCourse };
    const byLesson = { ...state.activity.byLesson };

    if (input.courseId) {
        byCourse[input.courseId] = (byCourse[input.courseId] || 0) + seconds;
    }

    if (input.courseId && input.lessonId) {
        const key = learningItemKey(input.courseId, input.lessonId);
        byLesson[key] = (byLesson[key] || 0) + seconds;
    }

    let updated = touch(
        state,
        {
            activity: {
                totalSeconds: state.activity.totalSeconds + seconds,
                byDate: {
                    ...state.activity.byDate,
                    [dateKey]: (state.activity.byDate[dateKey] || 0) + seconds,
                },
                byCourse,
                byLesson,
            },
        },
        timestamp
    );

    if (input.courseId && input.lessonId) {
        const key = learningItemKey(input.courseId, input.lessonId);
        const current = state.lessonProgress[key];
        updated = touch(
            updated,
            {
                lessonProgress: {
                    ...updated.lessonProgress,
                    [key]: {
                        courseId: input.courseId,
                        lessonId: input.lessonId,
                        moduleId: current?.moduleId,
                        startedAt: current?.startedAt || timestamp,
                        updatedAt: timestamp,
                        completedAt: current?.completedAt,
                        activeSeconds: (current?.activeSeconds || 0) + seconds,
                        completedInteractionIds:
                            current?.completedInteractionIds || [],
                    },
                },
            },
            timestamp
        );
    }

    return updated;
};

export const awardBadge = (
    state: LearningState,
    input: AwardBadgeInput,
    now?: string
): LearningState => {
    const key = badgeAwardKey(input.badgeId, input.courseId);
    if (state.badges[key]) return state;

    const timestamp = isoNow(input.awardedAt || now);
    const badge: BadgeAward = {
        badgeId: input.badgeId,
        title: input.title,
        description: input.description,
        awardedAt: timestamp,
        courseId: input.courseId,
    };

    return touch(
        state,
        { badges: { ...state.badges, [key]: badge } },
        timestamp
    );
};

export const acknowledgeSafety = (
    state: LearningState,
    courseId: string,
    acknowledgementId: string,
    now?: string
): LearningState => {
    const timestamp = isoNow(now);
    const key = learningItemKey(courseId, acknowledgementId);
    const acknowledgement: SafetyAcknowledgement = {
        acknowledgementId,
        courseId,
        acknowledgedAt: timestamp,
    };
    return touch(
        state,
        {
            safetyAcknowledgements: {
                ...state.safetyAcknowledgements,
                [key]: acknowledgement,
            },
        },
        timestamp
    );
};

const dateKeyToUtc = (key: string) => {
    const parts = key.split("-").map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return Number.NaN;
    return Date.UTC(parts[0], parts[1] - 1, parts[2]);
};

const dayDifference = (later: string, earlier: string) =>
    Math.round(
        (dateKeyToUtc(later) - dateKeyToUtc(earlier)) / (24 * 60 * 60 * 1000)
    );

export const calculateLearningStreak = (
    activityByDate: Record<string, number>,
    now: Date = new Date()
): LearningStreak => {
    const activeDates = Object.entries(activityByDate)
        .filter(([, seconds]) => seconds > 0)
        .map(([date]) => date)
        .filter((date) => !Number.isNaN(dateKeyToUtc(date)))
        .sort();

    if (!activeDates.length) {
        return { currentDays: 0, longestDays: 0 };
    }

    let longestDays = 1;
    let runningDays = 1;
    for (let index = 1; index < activeDates.length; index += 1) {
        if (dayDifference(activeDates[index], activeDates[index - 1]) === 1) {
            runningDays += 1;
            longestDays = Math.max(longestDays, runningDays);
        } else {
            runningDays = 1;
        }
    }

    const lastActiveDate = activeDates[activeDates.length - 1];
    const today = localDateKey(now);
    const gapFromToday = dayDifference(today, lastActiveDate);
    let currentDays = 0;

    if (gapFromToday === 0 || gapFromToday === 1) {
        currentDays = 1;
        for (let index = activeDates.length - 1; index > 0; index -= 1) {
            if (
                dayDifference(activeDates[index], activeDates[index - 1]) !== 1
            ) {
                break;
            }
            currentDays += 1;
        }
    }

    return {
        currentDays,
        longestDays,
        lastActiveDate,
    };
};

export const getTotalPoints = (state: LearningState) =>
    state.pointEvents.reduce((total, event) => total + event.points, 0);

const hasCompletedRequiredLesson = (
    state: LearningState,
    policy: CourseCompletionPolicy,
    lessonId: string
) => {
    const progress =
        state.lessonProgress[learningItemKey(policy.courseId, lessonId)];
    if (!progress?.completedAt) return false;
    const requiredInteractions =
        policy.requiredLessonInteractionIds?.[lessonId] || [];
    return requiredInteractions.every((interactionId) =>
        progress.completedInteractionIds.includes(interactionId)
    );
};

const getQuizPercentage = (
    state: LearningState,
    courseId: string,
    quizId: string
) => {
    const attempts =
        state.quizAttempts[learningItemKey(courseId, quizId)] || [];
    if (!attempts.length) return null;
    return Math.max(
        ...attempts.map((attempt) =>
            attempt.maxScore > 0 ? (attempt.score / attempt.maxScore) * 100 : 0
        )
    );
};

const getAssignmentAttempts = (
    state: LearningState,
    courseId: string,
    assignmentId: string
) => state.assignmentAttempts[learningItemKey(courseId, assignmentId)] || [];

const hasSubmittedAssignment = (
    state: LearningState,
    courseId: string,
    assignmentId: string
) =>
    getAssignmentAttempts(state, courseId, assignmentId).some(
        (attempt) => attempt.status !== "draft"
    );

const hasApprovedAssignment = (
    state: LearningState,
    courseId: string,
    assignmentId: string
) =>
    getAssignmentAttempts(state, courseId, assignmentId).some(
        (attempt) => attempt.status === "approved"
    );

const hasPassedFinalProject = (
    state: LearningState,
    courseId: string,
    assignmentId: string,
    minimumScore: number
) =>
    getAssignmentAttempts(state, courseId, assignmentId).some((attempt) => {
        if (attempt.passed || attempt.status === "approved") return true;
        if (
            typeof attempt.score !== "number" ||
            typeof attempt.maxScore !== "number" ||
            attempt.maxScore <= 0
        ) {
            return false;
        }
        return (attempt.score / attempt.maxScore) * 100 >= minimumScore;
    });

const getCourseLastActivityAt = (
    state: LearningState,
    courseId: string
): string | undefined => {
    const timestamps: string[] = [];
    const enrollment = state.enrollments[courseId];
    if (enrollment) timestamps.push(enrollment.updatedAt);
    const resume = state.resumePositions[courseId];
    if (resume) timestamps.push(resume.updatedAt);

    Object.values(state.lessonProgress).forEach((lesson) => {
        if (lesson.courseId === courseId) timestamps.push(lesson.updatedAt);
    });
    Object.values(state.quizAttempts)
        .flat()
        .forEach((attempt) => {
            if (attempt.courseId === courseId)
                timestamps.push(attempt.submittedAt);
        });
    Object.values(state.assignmentAttempts)
        .flat()
        .forEach((attempt) => {
            if (attempt.courseId === courseId)
                timestamps.push(attempt.updatedAt);
        });

    return timestamps.sort(
        (left, right) => Date.parse(right) - Date.parse(left)
    )[0];
};

export const calculateCertificateEligibility = (
    state: LearningState,
    policy: CourseCompletionPolicy
): CertificateEligibility => {
    const lessonIds = unique(policy.requiredLessonIds);
    const quizIds = unique(policy.requiredQuizIds);
    const assignmentIds = unique(policy.requiredAssignmentIds);
    const manuallyReviewedIds = unique(policy.manuallyReviewedAssignmentIds);
    const finalProjectIds = unique(policy.finalProjectAssignmentIds);
    const safetyIds = unique(policy.safetyAcknowledgementIds);
    const quizPassingScores = policy.requiredQuizPassingScores || {};
    const minimumQuizAverage =
        policy.minimumQuizAverage ?? DEFAULT_QUIZ_AVERAGE;
    const minimumFinalProjectScore =
        policy.minimumFinalProjectScore ?? DEFAULT_FINAL_PROJECT_SCORE;

    const completedLessons = lessonIds.filter((lessonId) =>
        hasCompletedRequiredLesson(state, policy, lessonId)
    ).length;
    const submittedAssignments = assignmentIds.filter((assignmentId) =>
        hasSubmittedAssignment(state, policy.courseId, assignmentId)
    ).length;
    const quizScores = quizIds
        .map((quizId) => getQuizPercentage(state, policy.courseId, quizId))
        .filter((score): score is number => score !== null);
    const quizAverage =
        quizScores.length === quizIds.length && quizScores.length
            ? quizScores.reduce((total, score) => total + score, 0) /
              quizScores.length
            : quizIds.length
            ? null
            : null;
    const passedQuizCount = quizIds.filter((quizId) => {
        const score = getQuizPercentage(state, policy.courseId, quizId);
        return (
            score !== null &&
            score >=
                clamp(quizPassingScores[quizId] ?? DEFAULT_QUIZ_AVERAGE, 0, 100)
        );
    }).length;
    const approvedManualAssignments = manuallyReviewedIds.filter(
        (assignmentId) =>
            hasApprovedAssignment(state, policy.courseId, assignmentId)
    ).length;
    const passedFinalProjects = finalProjectIds.filter((assignmentId) =>
        hasPassedFinalProject(
            state,
            policy.courseId,
            assignmentId,
            minimumFinalProjectScore
        )
    ).length;
    const safetyAcknowledged = safetyIds.filter(
        (acknowledgementId) =>
            state.safetyAcknowledgements[
                learningItemKey(policy.courseId, acknowledgementId)
            ]
    ).length;

    const requirements = [
        {
            code: "lessons" as const,
            label: "Required lessons",
            met: completedLessons === lessonIds.length,
            detail: `${completedLessons} of ${lessonIds.length} completed`,
        },
        {
            code: "assignments" as const,
            label: "Required assignments",
            met: submittedAssignments === assignmentIds.length,
            detail: `${submittedAssignments} of ${assignmentIds.length} submitted`,
        },
        {
            code: "quiz-average" as const,
            label: "Checkpoints and quiz average",
            met:
                !quizIds.length ||
                (quizAverage !== null &&
                    passedQuizCount === quizIds.length &&
                    quizAverage >= minimumQuizAverage),
            detail: !quizIds.length
                ? "No graded quizzes required"
                : quizAverage === null
                ? `Complete all ${quizIds.length} required quizzes`
                : passedQuizCount !== quizIds.length
                ? `${passedQuizCount} of ${quizIds.length} checkpoints meet their required score`
                : `${Math.round(
                      quizAverage
                  )}% average; ${minimumQuizAverage}% required`,
        },
        {
            code: "manual-review" as const,
            label: "Manual reviews",
            met: approvedManualAssignments === manuallyReviewedIds.length,
            detail: `${approvedManualAssignments} of ${manuallyReviewedIds.length} approved`,
        },
        {
            code: "final-project" as const,
            label: "Final project",
            met: passedFinalProjects === finalProjectIds.length,
            detail: `${passedFinalProjects} of ${finalProjectIds.length} passed`,
        },
        {
            code: "safety" as const,
            label: "Safety acknowledgements",
            met: safetyAcknowledged === safetyIds.length,
            detail: `${safetyAcknowledged} of ${safetyIds.length} acknowledged`,
        },
    ];

    return {
        eligible: requirements.every((requirement) => requirement.met),
        requirements,
        quizAverage,
    };
};

export const calculateCourseProgress = (
    state: LearningState,
    policy: CourseCompletionPolicy
): CourseProgress => {
    const lessonIds = unique(policy.requiredLessonIds);
    const quizIds = unique(policy.requiredQuizIds);
    const assignmentIds = unique(policy.requiredAssignmentIds);
    const manualIds = unique(policy.manuallyReviewedAssignmentIds);
    const finalIds = unique(policy.finalProjectAssignmentIds);
    const safetyIds = unique(policy.safetyAcknowledgementIds);
    const quizPassingScores = policy.requiredQuizPassingScores || {};
    const minimumFinalScore =
        policy.minimumFinalProjectScore ?? DEFAULT_FINAL_PROJECT_SCORE;
    const completedLessons = lessonIds.filter((lessonId) =>
        hasCompletedRequiredLesson(state, policy, lessonId)
    ).length;
    const quizScores = quizIds
        .map((quizId) => getQuizPercentage(state, policy.courseId, quizId))
        .filter((score): score is number => score !== null);
    const submittedAssignments = assignmentIds.filter((assignmentId) =>
        hasSubmittedAssignment(state, policy.courseId, assignmentId)
    ).length;
    const quizAverage =
        quizScores.length === quizIds.length && quizScores.length
            ? quizScores.reduce((total, score) => total + score, 0) /
              quizScores.length
            : null;
    const quizAverageMet =
        !quizIds.length ||
        (quizAverage !== null &&
            quizAverage >= (policy.minimumQuizAverage ?? DEFAULT_QUIZ_AVERAGE));
    const passedQuizzes = quizIds.filter((quizId) => {
        const score = getQuizPercentage(state, policy.courseId, quizId);
        return (
            score !== null &&
            score >=
                clamp(quizPassingScores[quizId] ?? DEFAULT_QUIZ_AVERAGE, 0, 100)
        );
    }).length;
    const manualApproved = manualIds.filter((assignmentId) =>
        hasApprovedAssignment(state, policy.courseId, assignmentId)
    ).length;
    const finalPassed = finalIds.filter((assignmentId) =>
        hasPassedFinalProject(
            state,
            policy.courseId,
            assignmentId,
            minimumFinalScore
        )
    ).length;
    const safetyComplete = safetyIds.filter(
        (acknowledgementId) =>
            state.safetyAcknowledgements[
                learningItemKey(policy.courseId, acknowledgementId)
            ]
    ).length;

    const totalRequirements =
        lessonIds.length +
        quizIds.length +
        (quizIds.length ? 1 : 0) +
        assignmentIds.length +
        manualIds.length +
        finalIds.length +
        safetyIds.length;
    const completedRequirements =
        completedLessons +
        passedQuizzes +
        (quizIds.length && passedQuizzes === quizIds.length && quizAverageMet
            ? 1
            : 0) +
        submittedAssignments +
        manualApproved +
        finalPassed +
        safetyComplete;

    return {
        courseId: policy.courseId,
        percentage: totalRequirements
            ? Math.round((completedRequirements / totalRequirements) * 100)
            : 0,
        completedRequirements,
        totalRequirements,
        completedLessons,
        totalLessons: lessonIds.length,
        attemptedQuizzes: quizScores.length,
        totalQuizzes: quizIds.length,
        quizAverage,
        submittedAssignments,
        totalAssignments: assignmentIds.length,
        activeSeconds: state.activity.byCourse[policy.courseId] || 0,
        lastActivityAt: getCourseLastActivityAt(state, policy.courseId),
        resume: state.resumePositions[policy.courseId],
    };
};

export const getLearningSummary = (
    state: LearningState,
    now: Date = new Date()
): LearningSummary => ({
    enrolledCourseCount: Object.values(state.enrollments).filter(
        (enrollment) => enrollment.status !== "completed"
    ).length,
    completedLessonCount: Object.values(state.lessonProgress).filter(
        (lesson) => lesson.completedAt
    ).length,
    activeSeconds: state.activity.totalSeconds,
    points: getTotalPoints(state),
    badgeCount: Object.keys(state.badges).length,
    streak: calculateLearningStreak(state.activity.byDate, now),
});

export const applyBuiltInBadges = (
    state: LearningState,
    now?: string
): LearningState => {
    let updated = state;
    const completedLessons = Object.values(state.lessonProgress).filter(
        (lesson) => lesson.completedAt
    ).length;
    const perfectQuiz = Object.values(state.quizAttempts)
        .flat()
        .some(
            (attempt) =>
                attempt.maxScore > 0 && attempt.score === attempt.maxScore
        );
    const streak = calculateLearningStreak(
        state.activity.byDate,
        now ? new Date(now) : new Date()
    );

    if (completedLessons) {
        updated = awardBadge(
            updated,
            {
                badgeId: "first-steps",
                title: "First Steps",
                description: "Completed a first lesson.",
            },
            now
        );
    }
    if (state.activity.totalSeconds >= 60 * 60) {
        updated = awardBadge(
            updated,
            {
                badgeId: "focused-hour",
                title: "Focused Hour",
                description: "Spent one active hour learning.",
            },
            now
        );
    }
    if (perfectQuiz) {
        updated = awardBadge(
            updated,
            {
                badgeId: "quiz-ace",
                title: "Quiz Ace",
                description: "Earned a perfect quiz score.",
            },
            now
        );
    }
    if (streak.longestDays >= 3) {
        updated = awardBadge(
            updated,
            {
                badgeId: "three-day-streak",
                title: "Momentum",
                description: "Learned on three consecutive days.",
            },
            now
        );
    }
    if (streak.longestDays >= 7) {
        updated = awardBadge(
            updated,
            {
                badgeId: "seven-day-streak",
                title: "Week of Learning",
                description: "Learned on seven consecutive days.",
            },
            now
        );
    }

    return updated;
};

export const markCourseCompleted = (
    state: LearningState,
    policy: CourseCompletionPolicy,
    now?: string
): LearningState => {
    const timestamp = isoNow(now);
    let updated = updateEnrollmentStatus(
        state,
        policy.courseId,
        "completed",
        timestamp
    );
    updated = awardBadge(
        updated,
        {
            badgeId: "course-complete",
            courseId: policy.courseId,
            title: "Course Complete",
            description: `Completed ${policy.courseTitle}.`,
            awardedAt: timestamp,
        },
        timestamp
    );
    return awardPoints(
        updated,
        {
            id: `course-complete:${policy.courseId}`,
            points: 100,
            reason: "Completed a course",
            courseId: policy.courseId,
            awardedAt: timestamp,
        },
        timestamp
    );
};

export const issueLocalCertificate = (
    state: LearningState,
    policy: CourseCompletionPolicy,
    learnerName: string,
    now?: string
): { state: LearningState; certificate: LocalCertificate } => {
    const existing = state.certificates[policy.courseId];
    if (existing) {
        return {
            state: markCourseCompleted(state, policy, now),
            certificate: existing,
        };
    }

    if (!learnerName.trim()) {
        throw new Error("Enter a learner name before creating a certificate.");
    }

    const eligibility = calculateCertificateEligibility(state, policy);
    if (!eligibility.eligible) {
        throw new Error(
            "The course completion requirements have not been met yet."
        );
    }

    const timestamp = isoNow(now);
    const certificate: LocalCertificate = {
        id: createId("local-certificate"),
        courseId: policy.courseId,
        courseTitle: policy.courseTitle,
        learnerName: learnerName.trim(),
        issuedAt: timestamp,
        localOnly: true,
    };
    const withCertificate = touch(
        state,
        {
            certificates: {
                ...state.certificates,
                [policy.courseId]: certificate,
            },
        },
        timestamp
    );

    return {
        state: markCourseCompleted(withCertificate, policy, timestamp),
        certificate,
    };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const MAX_BACKUP_RECORDS = 10_000;
export const MAX_LEARNING_BACKUP_BYTES = 2 * 1024 * 1024;

const forbiddenRecordKeys = new Set(["__proto__", "prototype", "constructor"]);
const isSafeKey = (value: string) =>
    value.length > 0 && value.length <= 500 && !forbiddenRecordKeys.has(value);
const isSafeText = (value: unknown, maximumLength = 500): value is string =>
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= maximumLength;
const isOptionalText = (value: unknown, maximumLength = 500) =>
    value === undefined || isSafeText(value, maximumLength);
const isIsoDate = (value: unknown) =>
    isSafeText(value, 50) && !Number.isNaN(Date.parse(value));
const isOptionalIsoDate = (value: unknown) =>
    value === undefined || isIsoDate(value);
const isFiniteNumber = (
    value: unknown,
    minimum = 0,
    maximum = 1_000_000_000_000
): value is number =>
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= minimum &&
    value <= maximum;
const hasOnlyKeys = (
    value: Record<string, unknown>,
    allowedKeys: readonly string[]
) => Object.keys(value).every((key) => allowedKeys.includes(key));
const isSafeRecord = (
    value: unknown,
    maximumEntries = MAX_BACKUP_RECORDS
): value is Record<string, unknown> =>
    isRecord(value) &&
    Object.keys(value).length <= maximumEntries &&
    Object.keys(value).every(isSafeKey);
const isStringArray = (value: unknown, maximumItems = 500) =>
    Array.isArray(value) &&
    value.length <= maximumItems &&
    value.every((item) => isSafeText(item));
const isNumberRecord = (
    value: unknown,
    validateKey: (key: string) => boolean = isSafeKey
) =>
    isSafeRecord(value) &&
    Object.entries(value).every(
        ([key, entry]) => validateKey(key) && isFiniteNumber(entry)
    );
const isValidDateKey = (key: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(key) &&
    new Date(`${key}T00:00:00.000Z`).toISOString().slice(0, 10) === key;

const isEnrollmentRecord = (key: string, value: unknown) =>
    isRecord(value) &&
    hasOnlyKeys(value, [
        "courseId",
        "enrolledAt",
        "updatedAt",
        "status",
        "pacing",
    ]) &&
    value.courseId === key &&
    isIsoDate(value.enrolledAt) &&
    isIsoDate(value.updatedAt) &&
    ["active", "paused", "completed"].includes(String(value.status)) &&
    ["self-paced", "weekly", "cohort"].includes(String(value.pacing));

const isLessonProgressRecord = (key: string, value: unknown) =>
    isRecord(value) &&
    hasOnlyKeys(value, [
        "courseId",
        "lessonId",
        "moduleId",
        "startedAt",
        "updatedAt",
        "completedAt",
        "activeSeconds",
        "completedInteractionIds",
    ]) &&
    isSafeText(value.courseId) &&
    isSafeText(value.lessonId) &&
    key === learningItemKey(value.courseId, value.lessonId) &&
    isOptionalText(value.moduleId) &&
    isIsoDate(value.startedAt) &&
    isIsoDate(value.updatedAt) &&
    isOptionalIsoDate(value.completedAt) &&
    isFiniteNumber(value.activeSeconds) &&
    isStringArray(value.completedInteractionIds);

const isQuizAttemptRecord = (
    key: string,
    value: unknown
): value is QuizAttemptRecord =>
    isRecord(value) &&
    hasOnlyKeys(value, [
        "id",
        "courseId",
        "quizId",
        "lessonId",
        "score",
        "maxScore",
        "passed",
        "submittedAt",
        "pointsEarned",
    ]) &&
    isSafeText(value.id) &&
    isSafeText(value.courseId) &&
    isSafeText(value.quizId) &&
    key === learningItemKey(value.courseId, value.quizId) &&
    isOptionalText(value.lessonId) &&
    isFiniteNumber(value.score) &&
    isFiniteNumber(value.maxScore, 0.000001) &&
    value.score <= value.maxScore &&
    typeof value.passed === "boolean" &&
    isIsoDate(value.submittedAt) &&
    isFiniteNumber(value.pointsEarned, 0, 1_000_000);

const isAssignmentAttemptRecord = (
    key: string,
    value: unknown
): value is AssignmentAttemptRecord =>
    isRecord(value) &&
    hasOnlyKeys(value, [
        "id",
        "courseId",
        "assignmentId",
        "status",
        "score",
        "maxScore",
        "passed",
        "submittedAt",
        "updatedAt",
        "pointsEarned",
    ]) &&
    isSafeText(value.id) &&
    isSafeText(value.courseId) &&
    isSafeText(value.assignmentId) &&
    key === learningItemKey(value.courseId, value.assignmentId) &&
    [
        "draft",
        "submitted",
        "under-review",
        "needs-revision",
        "approved",
    ].includes(String(value.status)) &&
    (value.score === undefined || isFiniteNumber(value.score)) &&
    (value.maxScore === undefined ||
        isFiniteNumber(value.maxScore, 0.000001)) &&
    (value.score === undefined ||
        value.maxScore === undefined ||
        value.score <= value.maxScore) &&
    typeof value.passed === "boolean" &&
    isOptionalIsoDate(value.submittedAt) &&
    isIsoDate(value.updatedAt) &&
    isFiniteNumber(value.pointsEarned, 0, 1_000_000);

const isAttemptRecord = <T>(
    value: unknown,
    validateAttempt: (key: string, attempt: unknown) => attempt is T
): value is Record<string, T[]> =>
    isSafeRecord(value) &&
    Object.entries(value).every(
        ([key, attempts]) =>
            Array.isArray(attempts) &&
            attempts.length <= 1_000 &&
            attempts.every((attempt) => validateAttempt(key, attempt))
    );

const isResumePosition = (key: string, value: unknown) =>
    isRecord(value) &&
    hasOnlyKeys(value, [
        "courseId",
        "moduleId",
        "lessonId",
        "blockId",
        "scrollOffset",
        "updatedAt",
    ]) &&
    value.courseId === key &&
    isOptionalText(value.moduleId) &&
    isSafeText(value.lessonId) &&
    isOptionalText(value.blockId) &&
    (value.scrollOffset === undefined ||
        isFiniteNumber(value.scrollOffset, 0, 100_000_000)) &&
    isIsoDate(value.updatedAt);

const isPointEvent = (value: unknown): value is PointEvent =>
    isRecord(value) &&
    hasOnlyKeys(value, ["id", "points", "reason", "awardedAt", "courseId"]) &&
    isSafeText(value.id) &&
    isFiniteNumber(value.points, -10_000, 10_000) &&
    value.points !== 0 &&
    isSafeText(value.reason, 1_000) &&
    isIsoDate(value.awardedAt) &&
    isOptionalText(value.courseId);

const isBadgeAward = (key: string, value: unknown) =>
    isRecord(value) &&
    hasOnlyKeys(value, [
        "badgeId",
        "title",
        "description",
        "awardedAt",
        "courseId",
    ]) &&
    isSafeText(value.badgeId) &&
    key ===
        badgeAwardKey(
            value.badgeId,
            typeof value.courseId === "string" ? value.courseId : undefined
        ) &&
    isSafeText(value.title, 500) &&
    isSafeText(value.description, 2_000) &&
    isIsoDate(value.awardedAt) &&
    isOptionalText(value.courseId);

const isSafetyAcknowledgement = (key: string, value: unknown) =>
    isRecord(value) &&
    hasOnlyKeys(value, ["acknowledgementId", "courseId", "acknowledgedAt"]) &&
    isSafeText(value.acknowledgementId) &&
    isSafeText(value.courseId) &&
    key === learningItemKey(value.courseId, value.acknowledgementId) &&
    isIsoDate(value.acknowledgedAt);

const isLocalCertificate = (key: string, value: unknown) =>
    isRecord(value) &&
    hasOnlyKeys(value, [
        "id",
        "courseId",
        "courseTitle",
        "learnerName",
        "issuedAt",
        "localOnly",
    ]) &&
    isSafeText(value.id) &&
    value.courseId === key &&
    isSafeText(value.courseTitle, 500) &&
    isSafeText(value.learnerName, 100) &&
    isIsoDate(value.issuedAt) &&
    value.localOnly === true;

export const isLearningState = (value: unknown): value is LearningState => {
    if (!isRecord(value)) return false;
    const activity = value.activity;
    const pointEvents = value.pointEvents;
    return (
        hasOnlyKeys(value, [
            "schemaVersion",
            "deviceId",
            "createdAt",
            "updatedAt",
            "enrollments",
            "lessonProgress",
            "quizAttempts",
            "assignmentAttempts",
            "resumePositions",
            "activity",
            "pointEvents",
            "badges",
            "safetyAcknowledgements",
            "certificates",
        ]) &&
        value.schemaVersion === LEARNING_STATE_SCHEMA_VERSION &&
        isSafeText(value.deviceId) &&
        isIsoDate(value.createdAt) &&
        isIsoDate(value.updatedAt) &&
        isSafeRecord(value.enrollments) &&
        Object.entries(value.enrollments).every(([key, entry]) =>
            isEnrollmentRecord(key, entry)
        ) &&
        isSafeRecord(value.lessonProgress) &&
        Object.entries(value.lessonProgress).every(([key, entry]) =>
            isLessonProgressRecord(key, entry)
        ) &&
        isAttemptRecord(value.quizAttempts, isQuizAttemptRecord) &&
        isAttemptRecord(value.assignmentAttempts, isAssignmentAttemptRecord) &&
        isSafeRecord(value.resumePositions) &&
        Object.entries(value.resumePositions).every(([key, entry]) =>
            isResumePosition(key, entry)
        ) &&
        isRecord(activity) &&
        hasOnlyKeys(activity, [
            "totalSeconds",
            "byDate",
            "byCourse",
            "byLesson",
        ]) &&
        isFiniteNumber(activity.totalSeconds) &&
        isNumberRecord(activity.byDate, isValidDateKey) &&
        isNumberRecord(activity.byCourse) &&
        isNumberRecord(activity.byLesson) &&
        Array.isArray(pointEvents) &&
        pointEvents.length <= MAX_BACKUP_RECORDS &&
        pointEvents.every(isPointEvent) &&
        new Set(pointEvents.map((event) => event.id)).size ===
            pointEvents.length &&
        isSafeRecord(value.badges) &&
        Object.entries(value.badges).every(([key, entry]) =>
            isBadgeAward(key, entry)
        ) &&
        isSafeRecord(value.safetyAcknowledgements) &&
        Object.entries(value.safetyAcknowledgements).every(([key, entry]) =>
            isSafetyAcknowledgement(key, entry)
        ) &&
        isSafeRecord(value.certificates) &&
        Object.entries(value.certificates).every(([key, entry]) =>
            isLocalCertificate(key, entry)
        )
    );
};

export const serializeLearningData = (state: LearningState) =>
    JSON.stringify(state, null, 2);

export const parseLearningData = (
    serialized: string
): ImportLearningDataResult => {
    if (
        new TextEncoder().encode(serialized).byteLength >
        MAX_LEARNING_BACKUP_BYTES
    ) {
        return {
            ok: false,
            error: "This learning backup is larger than the 2 MB safety limit.",
        };
    }
    try {
        const parsed: unknown = JSON.parse(serialized);
        if (!isLearningState(parsed)) {
            return {
                ok: false,
                error: "This file is not a supported Code 4 Tomorrow learning backup.",
            };
        }
        return {
            ok: true,
            state: parsed,
        };
    } catch {
        return {
            ok: false,
            error: "The selected file is not valid JSON.",
        };
    }
};

const laterRecord = <T>(
    left: T | undefined,
    right: T | undefined,
    getTimestamp: (value: T) => string
) => {
    if (!left) return right;
    if (!right) return left;
    return Date.parse(getTimestamp(right)) > Date.parse(getTimestamp(left))
        ? right
        : left;
};

const mergeTimestampedRecords = <T>(
    left: Record<string, T>,
    right: Record<string, T>,
    getTimestamp: (value: T) => string
) => {
    const merged: Record<string, T> = {};
    unique([...Object.keys(left), ...Object.keys(right)]).forEach((key) => {
        const value = laterRecord(left[key], right[key], getTimestamp);
        if (value) merged[key] = value;
    });
    return merged;
};

const mergeAttempts = <T extends { id: string }>(
    left: Record<string, T[]>,
    right: Record<string, T[]>
) => {
    const merged: Record<string, T[]> = {};
    unique([...Object.keys(left), ...Object.keys(right)]).forEach((key) => {
        const attempts = [...(left[key] || []), ...(right[key] || [])];
        const byId = new Map<string, T>();
        attempts.forEach((attempt) => byId.set(attempt.id, attempt));
        merged[key] = Array.from(byId.values());
    });
    return merged;
};

const mergeNumberRecords = (
    left: Record<string, number>,
    right: Record<string, number>
) => {
    const merged: Record<string, number> = {};
    unique([...Object.keys(left), ...Object.keys(right)]).forEach((key) => {
        merged[key] = Math.max(left[key] || 0, right[key] || 0);
    });
    return merged;
};

export const mergeLearningStates = (
    current: LearningState,
    imported: LearningState,
    now?: string
): LearningState => {
    const pointEvents = new Map<string, PointEvent>();
    [...current.pointEvents, ...imported.pointEvents].forEach((event) =>
        pointEvents.set(event.id, event)
    );

    const merged: LearningState = {
        schemaVersion: LEARNING_STATE_SCHEMA_VERSION,
        deviceId: current.deviceId,
        createdAt:
            Date.parse(current.createdAt) <= Date.parse(imported.createdAt)
                ? current.createdAt
                : imported.createdAt,
        updatedAt: isoNow(now),
        enrollments: mergeTimestampedRecords(
            current.enrollments,
            imported.enrollments,
            (enrollment) => enrollment.updatedAt
        ),
        lessonProgress: mergeTimestampedRecords(
            current.lessonProgress,
            imported.lessonProgress,
            (lesson) => lesson.updatedAt
        ),
        quizAttempts: mergeAttempts(
            current.quizAttempts,
            imported.quizAttempts
        ),
        assignmentAttempts: mergeAttempts(
            current.assignmentAttempts,
            imported.assignmentAttempts
        ),
        resumePositions: mergeTimestampedRecords(
            current.resumePositions,
            imported.resumePositions,
            (position) => position.updatedAt
        ),
        activity: {
            totalSeconds: Math.max(
                current.activity.totalSeconds,
                imported.activity.totalSeconds
            ),
            byDate: mergeNumberRecords(
                current.activity.byDate,
                imported.activity.byDate
            ),
            byCourse: mergeNumberRecords(
                current.activity.byCourse,
                imported.activity.byCourse
            ),
            byLesson: mergeNumberRecords(
                current.activity.byLesson,
                imported.activity.byLesson
            ),
        },
        pointEvents: Array.from(pointEvents.values()),
        badges: {
            ...imported.badges,
            ...current.badges,
        },
        safetyAcknowledgements: {
            ...imported.safetyAcknowledgements,
            ...current.safetyAcknowledgements,
        },
        certificates: {
            ...imported.certificates,
            ...current.certificates,
        },
    };

    return applyBuiltInBadges(merged, merged.updatedAt);
};

export const canUseLearningStorage = () => {
    if (!isBrowser()) return false;
    try {
        const key = "__c4t_learning_storage_test__";
        window.localStorage.setItem(key, key);
        window.localStorage.removeItem(key);
        return true;
    } catch {
        return false;
    }
};
