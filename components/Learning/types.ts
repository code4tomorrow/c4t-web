import type { ReactNode } from "react";

export type CourseDifficulty =
    | "Absolute beginner"
    | "Beginner"
    | "Beginner to intermediate"
    | "Intermediate"
    | "Advanced intermediate"
    | "Advanced";

export type CourseBadgeTone = "purple" | "blue" | "green" | "amber" | "grey";

export interface CourseBadgeItem {
    id: string;
    label: string;
    tone?: CourseBadgeTone;
    icon?: ReactNode;
    description?: string;
}

export interface SetupLink {
    label: string;
    href: string;
}

export interface SetupStep {
    id: string;
    title: string;
    description: string;
    estimatedMinutes?: number;
    link?: SetupLink;
}

export interface FreeSetupPath {
    title?: string;
    summary: string;
    costLabel?: string;
    steps: SetupStep[];
}

export interface RequirementOption {
    name: string;
    description: string;
    link?: SetupLink;
    steps?: string[];
}

export interface PaidRequirementOption extends RequirementOption {
    priceNote?: string;
}

export interface CourseRequirement {
    id: string;
    name: string;
    purpose: string;
    freeOption: RequirementOption;
    paidOptions?: PaidRequirementOption[];
    required?: boolean;
    simulator?: {
        name: string;
        description: string;
    };
}

export type LessonStatus =
    | "not-started"
    | "in-progress"
    | "complete"
    | "locked";

export interface LessonOutlineItem {
    id: string;
    title: string;
    description?: string;
    estimatedMinutes?: number;
    href?: string;
    required?: boolean;
    status?: LessonStatus;
}

export interface ModuleOutlineItem {
    id: string;
    title: string;
    description?: string;
    lessons: LessonOutlineItem[];
    initiallyExpanded?: boolean;
}

