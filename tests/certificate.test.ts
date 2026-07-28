import { describe, expect, it } from "vitest";
import { buildCertificatePdf } from "lib/certificate-pdf";
import { newCertificateId } from "lib/certificates";
import {
    assignmentSubmitSchema,
    enrollSchema,
    activitySchema,
} from "lib/schemas";

describe("certificate ids", () => {
    it("uses the C4T prefix and is unguessable in length", () => {
        const id = newCertificateId();
        expect(id).toMatch(/^C4T-[0-9A-F]{20}$/);
    });

    it("does not repeat across many draws", () => {
        const ids = new Set(
            Array.from({ length: 500 }, () => newCertificateId())
        );
        expect(ids.size).toBe(500);
    });
});

describe("certificate pdf", () => {
    const base = {
        certificateId: "C4T-ABCDEF0123456789ABCD",
        learnerName: "Alex Rivera",
        courseTitle: "Computational Thinking and Coding Logic",
        completionDate: new Date("2026-05-01T00:00:00Z"),
        learningHours: 18,
        verificationUrl:
            "https://www.code4tomorrow.org/certificate/verify/C4T-ABCDEF0123456789ABCD",
    };

    it("produces a real PDF file", async () => {
        const bytes = await buildCertificatePdf(base);
        expect(bytes.length).toBeGreaterThan(1000);
        // PDF magic number.
        expect(Buffer.from(bytes.slice(0, 5)).toString()).toBe("%PDF-");
    });

    it("handles very long learner and course names without throwing", async () => {
        const bytes = await buildCertificatePdf({
            ...base,
            learnerName:
                "Bartholomew Maximilian Fitzgerald-Wellington the Third of Somewhere",
            courseTitle:
                "Custom Agent Harnesses, Evaluations, and Multi-Agent Systems for Advanced Practitioners",
        });
        expect(Buffer.from(bytes.slice(0, 5)).toString()).toBe("%PDF-");
    });
});

describe("request validation", () => {
    it("rejects an enrollment with an unexpected course id shape", () => {
        expect(
            enrollSchema.safeParse({ courseId: "../etc/passwd" }).success
        ).toBe(false);
        expect(enrollSchema.safeParse({ courseId: "course-01" }).success).toBe(
            true
        );
    });

    it("only accepts repository URLs from approved hosts over https", () => {
        const ok = assignmentSubmitSchema.safeParse({
            assignmentId: "course-01-final-assessment",
            responseText: "done",
            repositoryUrl: "https://github.com/someone/project",
            rubricAcknowledged: true,
        });
        expect(ok.success).toBe(true);

        for (const bad of [
            "http://github.com/someone/project",
            "https://evil.example.com/repo",
            "javascript:alert(1)",
        ]) {
            expect(
                assignmentSubmitSchema.safeParse({
                    assignmentId: "course-01-final-assessment",
                    repositoryUrl: bad,
                    rubricAcknowledged: true,
                }).success
            ).toBe(false);
        }
    });

    it("requires the rubric acknowledgement on submit", () => {
        expect(
            assignmentSubmitSchema.safeParse({
                assignmentId: "course-01-final-assessment",
                responseText: "done",
                rubricAcknowledged: false,
            }).success
        ).toBe(false);
    });

    it("caps a single activity flush so time cannot be inflated", () => {
        const payload = {
            courseId: "course-01",
            seconds: 999_999,
            startedAt: new Date().toISOString(),
            localDate: "2026-05-01",
        };
        expect(activitySchema.safeParse(payload).success).toBe(false);

        expect(
            activitySchema.safeParse({ ...payload, seconds: 600 }).success
        ).toBe(true);
    });

    it("rejects a malformed local date", () => {
        expect(
            activitySchema.safeParse({
                seconds: 60,
                startedAt: new Date().toISOString(),
                localDate: "01/05/2026",
            }).success
        ).toBe(false);
    });
});
