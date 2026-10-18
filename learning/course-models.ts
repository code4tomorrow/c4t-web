export type CourseLevel =
    | "absolute-beginner"
    | "beginner"
    | "beginner-intermediate"
    | "intermediate"
    | "advanced-intermediate"
    | "advanced";

export type ModuleKind = "setup" | "core" | "capstone";

export type RequirementCategory =
    | "browser"
    | "software"
    | "account"
    | "hardware"
    | "compute"
    | "dataset";

export type InteractionType =
    | "prediction"
    | "ordering"
    | "code-trace"
    | "code-editor"
    | "visualizer"
    | "simulator"
    | "diagram"
    | "data-lab"
    | "scenario"
    | "debugging"
    | "design-review"
    | "reflection";

export type AssessmentType =
    | "module-checkpoint"
    | "applied-assignment"
    | "capstone";

export type CoverageStage = "introduced" | "practiced" | "assessed" | "applied";

export interface FreePath {
    name: string;
    description: string;
    setupSteps: string[];
    verification: string;
    url?: string;
}

export interface PaidOption {
    name: string;
    description: string;
    required: false;
}

export interface CourseRequirement {
    id: string;
    category: RequirementCategory;
    name: string;
    required: boolean;
    reason: string;
    freePath: FreePath;
    paidOptions: PaidOption[];
    accessibilityNotes: string;
}

export interface SimulatorDefinition {
    id: string;
    name: string;
    purpose: string;
    capabilities: string[];
    limitations: string[];
    noHardwareRequired: true;
    keyboardAccessible: true;
    screenReaderSummary: string;
}

export interface LessonInteraction {
    id: string;
    type: InteractionType;
    title: string;
    prompt: string;
    instructions: string[];
    successFeedback: string;
    retryFeedback: string;
    completionCondition: string;
    accessibleAlternative: string;
}

export interface WorkedExample {
    title: string;
    context: string;
    steps: string[];
    result: string;
}

export interface LessonCheckpoint {
    prompt: string;
    successCriteria: string[];
    feedback: string;
}

export interface Lesson {
    id: string;
    slug: string;
    order: number;
    title: string;
    objective: string;
    estimatedMinutes: number;
    motivatingScenario: string;
    explanation: string;
    workedExample: WorkedExample;
    interaction: LessonInteraction;
    practiceTask: string;
    feedbackGuidance: string;
    checkpoint: LessonCheckpoint;
    summary: string;
    nextLessonConnection: string;
    accessibilityAlternative: string;
    sourceTopics: string[];
    required: true;
}

export interface RubricCriterion {
    id: string;
    label: string;
    description: string;
    points: number;
}

export interface Assessment {
    id: string;
    type: AssessmentType;
    title: string;
    instructions: string;
    estimatedMinutes: number;
    passingScore: number;
    maximumAttempts: number | null;
    sourceTopics: string[];
    rubric: RubricCriterion[];
    feedbackPolicy: string;
    remediation: string;
}

export interface CourseModule {
    id: string;
    slug: string;
    order: number;
    kind: ModuleKind;
    title: string;
    overview: string;
    outcomes: string[];
    lessons: Lesson[];
    checkpoint: Assessment;
    practicalApplication: string;
    reviewSupport: string;
}

export interface AppliedAssignment {
    id: string;
    title: string;
    brief: string;
    estimatedMinutes: number;
    relatedModuleIds: string[];
    sourceTopics: string[];
    passingScore: number;
    attempts: number | null;
    rubric: RubricCriterion[];
    freeCompletionPath: string;
}

export interface PacingTemplate {
    id: string;
    type: "self-paced" | "weekly";
    estimatedTotalHours: number;
    weeklyHours: number;
    suggestedWeeks: number;
    releasePlan: string[];
    catchUpGuidance: string;
    finalProjectWindow: string;
}

export interface CertificateRules {
    requiredLessonCompletionPercent: 100;
    requiredAssignmentsSubmitted: true;
    minimumQuizAverage: number;
    capstonePassingScore: number;
    manualReviewsMustBeApproved: true;
    safetyAcknowledgementRequired: boolean;
    retryPolicy: string;
}

export interface CourseAttribution {
    creator: "Zafir Shamsi";
    displayText: "Course created by Zafir Shamsi.";
}

export interface SourceTopicCoverage {
    courseId: string;
    sourceTopic: string;
    moduleId: string;
    lessonId: string;
    activityId: string;
    stages: CoverageStage[];
    completionStatus: "complete";
}

/** A free tool students use in a live class, shown on the course page. */
export interface LiveClassTool {
    name: string;
    /** External download/editor link, or a /learn/tools/ concept simulator. */
    url: string;
    note: string;
}

/**
 * Schedule for an instructor-led class. Present only on live courses, which
 * appear under their term's tab on /courses instead of the self-paced catalog.
 */
export interface LiveSession {
    /** Stable key used to group courses into a term tab, e.g. "fall-2026". */
    term: string;
    termLabel: string;
    format: string;
    meets: string;
    starts: string;
    weeks: number;
    minutesPerClass: number;
    /** Self-paced course to take after the class ends. */
    continueWith: string;
    classTools: LiveClassTool[];
}

export interface Course {
    id: string;
    order: number;
    version: string;
    status: "ready-for-review";
    slug: string;
    title: string;
    summary: string;
    description: string;
    intendedAudience: string;
    level: CourseLevel;
    prerequisites: string[];
    recommendedPriorCourses: string[];
    learningOutcomes: string[];
    estimatedTotalHours: number;
    weeklyCommitmentHours: number;
    suggestedWeeks: number;
    tags: string[];
    visualTreatment: {
        icon: string;
        accent: string;
        alt: string;
    };
    requirements: CourseRequirement[];
    simulators: SimulatorDefinition[];
    freeCompletionPromise: string;
    /** null for self-paced courses. */
    liveSession: LiveSession | null;
    modules: CourseModule[];
    assignments: AppliedAssignment[];
    finalAssessment: Assessment;
    pacing: PacingTemplate[];
    certificateRules: CertificateRules;
    attribution: CourseAttribution;
    sourceTopics: string[];
    sourceTopicCoverage: SourceTopicCoverage[];
}

export interface CurriculumCoverageReport {
    schemaVersion: "1.0";
    generatedFrom: "learning/source-curriculum.js";
    courseCount: number;
    topicCount: number;
    courses: Array<{
        courseId: string;
        courseSlug: string;
        courseTitle: string;
        topics: SourceTopicCoverage[];
    }>;
}
