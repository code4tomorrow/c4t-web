export type PathCourseRole = "core" | "foundation";

export interface LearningPathStep {
    courseId: string;
    role: PathCourseRole;
}

export interface LearningPathDefinition {
    id: string;
    slug: string;
    title: string;
    summary: string;
    outcome: string;
    icon: string;
    accent: string;
    skills: string[];
    steps: LearningPathStep[];
}

declare const learningPathDefinitions: LearningPathDefinition[];

export default learningPathDefinitions;
