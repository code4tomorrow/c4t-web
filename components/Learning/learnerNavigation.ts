import type { Role } from "@prisma/client";
import type { LearnerNavigationItem } from "./LearnerShell";

/**
 * Roles that get the admin link. Declared here rather than imported from
 * lib/api, because this module ships to the browser and lib/api pulls in
 * NextAuth (and therefore nodemailer, which cannot be bundled for the client).
 * Access itself is enforced server-side by lib/guards and lib/api.
 */
const STAFF_ROLES: Role[] = ["INSTRUCTOR", "CONTENT_EDITOR", "ADMIN"];

export interface LearnerNavigationBadges {
    /** Assignments and checkpoints the learner has not submitted yet. */
    pendingAssignments?: number;
    badges?: number;
    certificates?: number;
    /**
     * The viewer's effective role. Staff get an extra link into the admin area
     * so it is reachable without typing the URL. Passing the *effective* role
     * means an admin previewing as a learner correctly loses the link.
     */
    role?: Role;
}

/**
 * Single source of truth for the learning-area sidebar. Every `/learn` page
 * renders the same items in the same order so the current-page indicator and
 * keyboard order stay consistent.
 */
export const buildLearnerNavigation = (
    badges: LearnerNavigationBadges = {}
): LearnerNavigationItem[] => {
    const items: LearnerNavigationItem[] = [
        {
            id: "dashboard",
            label: "Dashboard",
            href: "/learn/dashboard",
            icon: "⌂",
        },
        { id: "courses", label: "Courses", href: "/courses", icon: "⌘" },
        {
            id: "paths",
            label: "Learning paths",
            href: "/learn/paths",
            icon: "⇗",
        },
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

    // Menu visibility is a convenience only; /admin is enforced on the server.
    if (badges.role && STAFF_ROLES.includes(badges.role)) {
        items.push({
            id: "admin",
            label: "Admin",
            href: "/admin",
            icon: "⚙",
        });
    }

    return items;
};
