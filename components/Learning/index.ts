export { default as AchievementsPanel } from "./AchievementsPanel";
export type {
    AchievementDefinition,
    AchievementsPanelProps,
} from "./AchievementsPanel";

export { default as CertificatePanel } from "./CertificatePanel";
export { createCertificateDownload } from "./CertificatePanel";
export type { CertificatePanelProps } from "./CertificatePanel";

export { default as DashboardSummary } from "./DashboardSummary";
export type {
    DashboardCourse,
    DashboardSummaryProps,
} from "./DashboardSummary";

export { default as LearnerShell } from "./LearnerShell";
export type { LearnerNavigationItem, LearnerShellProps } from "./LearnerShell";

export { default as LocalProgressNotice } from "./LocalProgressNotice";
export type { LocalProgressNoticeProps } from "./LocalProgressNotice";

export { default as ProgressDataControls } from "./ProgressDataControls";
export type { ProgressDataControlsProps } from "./ProgressDataControls";

export { default as CourseAttribution } from "./CourseAttribution";
export type { CourseAttributionProps } from "./CourseAttribution";

export {
    default as CourseBadge,
    CourseBadge as Badge,
    CourseChipList,
    DifficultyBadge,
} from "./CourseBadge";
export type {
    CourseBadgeProps,
    CourseChipListProps,
    DifficultyBadgeProps,
} from "./CourseBadge";

export { default as RequirementsSetup } from "./RequirementsSetup";
export type { RequirementsSetupProps } from "./RequirementsSetup";

export { default as FreeLabSimulator } from "./FreeLabSimulator";
export type {
    FreeLabCompletion,
    FreeLabSimulatorProps,
} from "./FreeLabSimulator";

export { default as ModuleLessonOutline } from "./ModuleLessonOutline";
export type { ModuleLessonOutlineProps } from "./ModuleLessonOutline";

export {
    default as LearningProgressCard,
    LearningProgressBar,
} from "./LearningProgress";
export type {
    LearningProgressBarProps,
    LearningProgressCardProps,
} from "./LearningProgress";

export type {
    CourseBadgeItem,
    CourseBadgeTone,
    CourseDifficulty,
    CourseRequirement,
    FreeLabMode,
    FreeSetupPath,
    LessonOutlineItem,
    LessonStatus,
    ModuleOutlineItem,
    PaidRequirementOption,
    RequirementOption,
    SetupLink,
    SetupStep,
} from "./types";
