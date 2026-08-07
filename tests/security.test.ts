import type { IncomingMessage } from "http";
import { describe, expect, it } from "vitest";
import { lessonProgressSchema } from "lib/schemas";
import {
    PREVIEWABLE_ROLES,
    VIEW_AS_COOKIE,
    resolveEffectiveRole,
} from "lib/view-as";

/**
 * Regression tests for privilege boundaries.
 *
 * Each of these covers a hole that existed at some point, so a future
 * refactor that quietly reopens one fails here rather than in production.
 */

const requestWithCookie = (cookie: string) =>
    ({ headers: { cookie } } as unknown as IncomingMessage);

describe("lesson progress input", () => {
    it("ignores a client-supplied checkpointPassed flag", () => {
        // The client used to be able to assert this, and the server stored it
        // verbatim. Checkpoint passing is derived from graded submissions, so
        // the field must never survive parsing.
        const parsed = lessonProgressSchema.parse({
            lessonId: "course-01-start-free-choose",
            completedInteractionIds: [],
            checkpointPassed: true,
        });

        expect(parsed).not.toHaveProperty("checkpointPassed");
    });

    it("never accepts a completion flag or percentage from the client", () => {
        const parsed = lessonProgressSchema.parse({
            lessonId: "course-01-start-free-choose",
            completedInteractionIds: [],
            completed: true,
            completedAt: new Date().toISOString(),
            progressPercent: 100,
        });

        expect(parsed).not.toHaveProperty("completed");
        expect(parsed).not.toHaveProperty("completedAt");
        expect(parsed).not.toHaveProperty("progressPercent");
    });

    it("caps how many interaction ids a single request may claim", () => {
        const result = lessonProgressSchema.safeParse({
            lessonId: "course-01-start-free-choose",
            completedInteractionIds: Array(51).fill("x"),
        });

        expect(result.success).toBe(false);
    });
});

describe("role preview", () => {
    it("cannot be used to escalate: a learner forging the cookie stays a learner", () => {
        const resolved = resolveEffectiveRole(
            "LEARNER",
            requestWithCookie(`${VIEW_AS_COOKIE}=ADMIN`)
        );

        expect(resolved.effectiveRole).toBe("LEARNER");
        expect(resolved.previewRole).toBeNull();
    });

    it("cannot be used to escalate from any non-admin role", () => {
        for (const role of ["LEARNER", "INSTRUCTOR", "CONTENT_EDITOR"] as const) {
            const resolved = resolveEffectiveRole(
                role,
                requestWithCookie(`${VIEW_AS_COOKIE}=ADMIN`)
            );
            expect(resolved.effectiveRole).toBe(role);
        }
    });

    it("only ever narrows an admin's privileges, never widens them", () => {
        expect(PREVIEWABLE_ROLES).not.toContain("ADMIN");

        for (const role of PREVIEWABLE_ROLES) {
            const resolved = resolveEffectiveRole(
                "ADMIN",
                requestWithCookie(`${VIEW_AS_COOKIE}=${role}`)
            );
            expect(resolved.effectiveRole).toBe(role);
            expect(resolved.realRole).toBe("ADMIN");
        }
    });

    it("ignores a preview value that is not a real role", () => {
        const resolved = resolveEffectiveRole(
            "ADMIN",
            requestWithCookie(`${VIEW_AS_COOKIE}=SUPERUSER`)
        );

        expect(resolved.effectiveRole).toBe("ADMIN");
        expect(resolved.previewRole).toBeNull();
    });
});
