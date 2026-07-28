export const LEARNING_STATE_SCHEMA_VERSION = 1 as const;

export type LearningStateSchemaVersion = typeof LEARNING_STATE_SCHEMA_VERSION;

export type EnrollmentStatus = "active" | "paused" | "completed";
export type CoursePacing = "self-paced" | "weekly" | "cohort";
export type AssignmentAttemptStatus =
    | "draft"
    | "submitted"
    | "under-review"
    | "needs-revision"
    | "approved";

export interface EnrollmentRecord {
    courseId: string;
    enrolledAt: string;
    updatedAt: string;
    status: EnrollmentStatus;
    pacing: CoursePacing;
}

export interface LessonProgressRecord {
    courseId: string;
    lessonId: string;
    moduleId?: string;
    startedAt: string;
    updatedAt: string;
    completedAt?: string;
    activeSeconds: number;
    completedInteractionIds: string[];
}

export interface QuizAttemptRecord {
    id: string;
    courseId: string;
    quizId: string;
    lessonId?: string;
    score: number;
    maxScore: number;
    passed: boolean;
    submittedAt: string;
    pointsEarned: number;
}

export interface AssignmentAttemptRecord {
    id: string;
    courseId: string;
    assignmentId: string;
    status: AssignmentAttemptStatus;
    score?: number;
    maxScore?: number;
    passed?: boolean;
    submittedAt?: string;
    updatedAt: string;
    pointsEarned: number;
}

export interface ResumePosition {
    courseId: string;
    moduleId?: string;
    lessonId: string;
    blockId?: string;
    scrollOffset?: number;
    updatedAt: string;
}

export interface ActiveTimeRecord {
    totalSeconds: number;
    byDate: Record<string, number>;
    byCourse: Record<string, number>;
    byLesson: Record<string, number>;
}

export interface PointEvent {
    id: string;
    points: number;
    reason: string;
    awardedAt: string;
    courseId?: string;
}

export interface BadgeAward {
    badgeId: string;
    title: string;
    description: string;
    awardedAt: string;
    courseId?: string;
}

export interface SafetyAcknowledgement {
    acknowledgementId: string;
    courseId: string;
    acknowledgedAt: string;
}

export interface LocalCertificate {
    id: string;
    courseId: string;
    courseTitle: string;
    learnerName: string;
    issuedAt: string;
    localOnly: true;
}

export interface LearningState {
    schemaVersion: LearningStateSchemaVersion;
    deviceId: string;
    createdAt: string;
    updatedAt: string;
    enrollments: Record<string, EnrollmentRecord>;
    lessonProgress: Record<string, LessonProgressRecord>;
    quizAttempts: Record<string, QuizAttemptRecord[]>;
    assignmentAttempts: Record<string, AssignmentAttemptRecord[]>;
    resumePositions: Record<string, ResumePosition>;
    activity: ActiveTimeRecord;
    pointEvents: PointEvent[];
    badges: Record<string, BadgeAward>;
    safetyAcknowledgements: Record<string, SafetyAcknowledgement>;
    certificates: Record<string, LocalCertificate>;
}

export interface CourseCompletionPolicy {
    courseId: string;
    courseTitle: string;
    requiredLessonIds: string[];
    requiredLessonInteractionIds?: Record<string, string[]>;
    requiredQuizIds?: string[];
    requiredQuizPassingScores?: Record<string, number>;
    requiredAssignmentIds?: string[];
    manuallyReviewedAssignmentIds?: string[];
    finalProjectAssignmentIds?: string[];
    safetyAcknowledgementIds?: string[];
    minimumQuizAverage?: number;
    minimumFinalProjectScore?: number;
}

export interface CourseProgress {
    courseId: string;
    percentage: number;
    completedRequirements: number;
    totalRequirements: number;
    completedLessons: number;
    totalLessons: number;
    attemptedQuizzes: number;
    totalQuizzes: number;
    quizAverage: number | null;
    submittedAssignments: number;
    totalAssignments: number;
    activeSeconds: number;
    lastActivityAt?: string;
    resume?: ResumePosition;
}

export type EligibilityRequirementCode =
    | "lessons"
    | "assignments"
    | "quiz-average"
    | "manual-review"
    | "final-project"
    | "safety";

export interface EligibilityRequirement {
    code: EligibilityRequirementCode;
    label: string;
    met: boolean;
    detail: string;
}

export interface CertificateEligibility {
    eligible: boolean;
    requirements: EligibilityRequirement[];
    quizAverage: number | null;
}

export interface LearningStreak {
    currentDays: number;
    longestDays: number;
    lastActiveDate?: string;
}

export interface LearningSummary {
    enrolledCourseCount: number;
    completedLessonCount: number;
    activeSeconds: number;
    points: number;
    badgeCount: number;
    streak: LearningStreak;
}

export interface EnrollCourseInput {
    courseId: string;
    pacing?: CoursePacing;
    status?: EnrollmentStatus;
}

export interface SetLessonCompletionInput {
    courseId: string;
    lessonId: string;
    moduleId?: string;
    completed: boolean;
}

export interface CompleteInteractionInput {
    courseId: string;
    lessonId: string;
    interactionId: string;
    moduleId?: string;
}

export interface QuizAttemptInput {
    id?: string;
    courseId: string;
    quizId: string;
    lessonId?: string;
    score: number;
    maxScore: number;
    passed?: boolean;
    submittedAt?: string;
    pointsEarned?: number;
}

export interface AssignmentAttemptInput {
    id?: string;
    courseId: string;
    assignmentId: string;
    status: AssignmentAttemptStatus;
    score?: number;
    maxScore?: number;
    passed?: boolean;
    submittedAt?: string;
    updatedAt?: string;
    pointsEarned?: number;
}

export interface ActiveTimeInput {
    seconds: number;
    courseId?: string;
    lessonId?: string;
    occurredAt?: string;
}

export interface AwardPointsInput {
    id?: string;
    points: number;
    reason: string;
    awardedAt?: string;
    courseId?: string;
}

export interface AwardBadgeInput {
    badgeId: string;
    title: string;
    description: string;
    awardedAt?: string;
    courseId?: string;
}

export interface ImportLearningDataResult {
    ok: boolean;
    state?: LearningState;
    error?: string;
}

export type LearningImportMode = "replace" | "merge";
