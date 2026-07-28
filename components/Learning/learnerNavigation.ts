import type { LearnerNavigationItem } from "./LearnerShell";

export interface LearnerNavigationBadges {
    /** Assignments and checkpoints the learner has not submitted yet. */
    pendingAssignments?: number;
    badges?: number;
    certificates?: number;
}

/**
 * Single source of truth for the learning-area sidebar. Every `/learn` page
 * renders the same items in the same order so the current-page indicator and
 * keyboard order stay consistent.
 */
export const buildLearnerNavigation = (
    badges: LearnerNavigationBadges = {}
): LearnerNavigationItem[] => [
    {
        id: "dashboard",
        label: "Dashboard",
        href: "/learn/dashboard",
        icon: "⌂",
    },
    { id: "courses", label: "Courses", href: "/courses", icon: "⌘" },
    { id: "paths", label: "Learning paths", href: "/learn/paths", icon: "⇗" },
    {
        id: "assignments",
        label: "Assignments",
        href: "/learn/assignments",
        icon: "✓",
        badge: badges.pendingAssignments || undefined,
    },
    {
        id: "progress",
        label: "Progress",
        href: "/learn/progress",
        icon: "↗",
    },
    {
        id: "achievements",
        label: "Achievements",
        href: "/learn/achievements",
        icon: "★",
        badge: badges.badges || undefined,
    },
    {
        id: "certificates",
        label: "Certificates",
        href: "/learn/certificates",
        icon: "◇",
        badge: badges.certificates || undefined,
    },
];
