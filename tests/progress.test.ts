import { describe, expect, it } from "vitest";
import type { AssignmentSubmission, LessonProgress } from "@prisma/client";
import { getCourseById } from "lib/courses";
import {
    calculateCertificateEligibility,
    calculateCourseProgress,
    calculatePacing,
    calculateStreak,
    getCourseRequirements,
    isLessonComplete,
    pointKey,
} from "lib/progress";

const course = getCourseById("course-01")!;
const requirements = getCourseRequirements(course);

const lesson = (
    lessonId: string,
    interactionIds: string[],
    completed: boolean
): LessonProgress =>
    ({
        id: `lp-${lessonId}`,
        userId: "user-1",
        courseId: course.id,
        moduleId: "module",
        lessonId,
        startedAt: new Date(),
        completedAt: completed ? new Date() : null,
        completedInteractionIds: interactionIds,
        checkpointPassed: false,
        activeSeconds: 0,
        updatedAt: new Date(),
    } as LessonProgress);

const submission = (
    assignmentId: string,
    status: AssignmentSubmission["status"],
    score: number | null
): AssignmentSubmission =>
    ({
        id: `sub-${assignmentId}-${status}`,
        userId: "user-1",
        courseId: course.id,
        assignmentId,
        attemptNumber: 1,
        status,
        responseText: "work",
        repositoryUrl: null,
        autoScore: null,
        score,
        maxScore: 100,
        passed: status === "APPROVED",
        submittedAt: new Date(),
        gradedAt: score === null ? null : new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
    } as AssignmentSubmission);

/** A learner who has met every requirement. */
const fullyCompleteInput = () => ({
    lessonProgress: requirements.requiredLessonIds.map((lessonId) =>
        lesson(lessonId, requirements.requiredInteractions[lessonId], true)
    ),
    submissions: [
        // The orientation checkpoint is authored with a 100% pass mark.
        ...requirements.checkpointIds.map((id) =>
            submission(id, "APPROVED", 100)
        ),
        ...requirements.assignmentIds.map((id) =>
            submission(id, "APPROVED", 90)
        ),
        submission(requirements.finalAssessmentId, "APPROVED", 90),
    ],
    safety: null,
});

describe("lesson completion", () => {
    it("does not count a lesson whose required interaction is missing", () => {
        const lessonId = requirements.requiredLessonIds[0];
        expect(
            isLessonComplete(requirements, lessonId, lesson(lessonId, [], true))
        ).toBe(false);
    });

    it("does not count a lesson that has interactions but no completion time", () => {
        const lessonId = requirements.requiredLessonIds[0];
        expect(
            isLessonComplete(
                requirements,
                lessonId,
                lesson(
                    lessonId,
                    requirements.requiredInteractions[lessonId],
                    false
                )
            )
        ).toBe(false);
    });

    it("counts a lesson with both the interaction and a completion time", () => {
        const lessonId = requirements.requiredLessonIds[0];
        expect(
            isLessonComplete(
                requirements,
                lessonId,
                lesson(
                    lessonId,
                    requirements.requiredInteractions[lessonId],
                    true
                )
            )
        ).toBe(true);
    });
});

describe("course progress", () => {
    it("is zero for a learner with no records", () => {
        const progress = calculateCourseProgress(
            requirements,
            { lessonProgress: [], submissions: [] },
            course.id
        );
        expect(progress.percentage).toBe(0);
        expect(progress.completedLessons).toBe(0);
    });

    it("reaches 100% only when lessons, checkpoints, and projects are all done", () => {
        const progress = calculateCourseProgress(
            requirements,
            fullyCompleteInput(),
            course.id
        );
        expect(progress.percentage).toBe(100);
        expect(progress.completedLessons).toBe(
            requirements.requiredLessonIds.length
        );
        expect(progress.approvedAssignments).toBe(progress.totalAssignments);
    });

    it("ignores submitted-but-ungraded work when computing checkpoints passed", () => {
        const progress = calculateCourseProgress(
            requirements,
            {
                lessonProgress: [],
                submissions: requirements.checkpointIds.map((id) =>
                    submission(id, "SUBMITTED", null)
                ),
            },
            course.id
        );
        expect(progress.passedCheckpoints).toBe(0);
        expect(progress.checkpointAverage).toBeNull();
    });
});

describe("certificate eligibility", () => {
    it("is denied when nothing has been done", () => {
        const result = calculateCertificateEligibility(requirements, {
            lessonProgress: [],
            submissions: [],
        });
        expect(result.eligible).toBe(false);
        expect(result.requirements.every((item) => !item.met)).toBe(true);
    });

    it("is granted when every requirement is met", () => {
        const result = calculateCertificateEligibility(
            requirements,
            fullyCompleteInput()
        );
        expect(result.eligible).toBe(true);
    });

    it("is denied when the final project is submitted but not approved", () => {
        const input = fullyCompleteInput();
        input.submissions = input.submissions.map((row) =>
            row.assignmentId === requirements.finalAssessmentId
                ? submission(row.assignmentId, "SUBMITTED", null)
                : row
        );

        const result = calculateCertificateEligibility(requirements, input);
        expect(result.eligible).toBe(false);
        expect(
            result.requirements.find((item) => item.code === "final-project")
                ?.met
        ).toBe(false);
    });

    it("is denied when the checkpoint average is below the threshold", () => {
        const input = fullyCompleteInput();
        // Approved, but scored below the course's minimum average.
        input.submissions = input.submissions.map((row) =>
            requirements.checkpointIds.includes(row.assignmentId)
                ? submission(row.assignmentId, "APPROVED", 40)
                : row
        );

        const result = calculateCertificateEligibility(requirements, input);
        expect(result.eligible).toBe(false);
        expect(
            result.requirements.find(
                (item) => item.code === "checkpoint-average"
            )?.met
        ).toBe(false);
    });

    it("requires a safety acknowledgement for hardware courses", () => {
        const hardware = getCourseById("course-09")!;
        const hardwareReqs = getCourseRequirements(hardware);
        expect(hardwareReqs.safetyAcknowledgementRequired).toBe(true);

        const result = calculateCertificateEligibility(hardwareReqs, {
            lessonProgress: [],
            submissions: [],
            safety: null,
        });
        expect(result.requirements.some((item) => item.code === "safety")).toBe(
            true
        );
    });

    it("honours an admin override of the course thresholds", () => {
        const input = fullyCompleteInput();
        expect(
            calculateCertificateEligibility(requirements, input).eligible
        ).toBe(true);

        // Raising the bar above what this learner achieved revokes eligibility.
        const strict = getCourseRequirements(course, {
            minimumQuizAverage: 100,
            capstonePassingScore: 95,
        });
        const result = calculateCertificateEligibility(strict, input);
        expect(result.eligible).toBe(false);
        expect(
            result.requirements.find((item) => item.code === "final-project")
                ?.met
        ).toBe(false);
    });
});

describe("pacing", () => {
    const start = new Date("2026-01-01T00:00:00Z");

    it("never marks an open-ended self-paced learner as behind", () => {
        const result = calculatePacing(
            { startedAt: start, pacing: "SELF_PACED", targetDate: null },
            requirements,
            5,
            new Date("2026-06-01T00:00:00Z")
        );
        expect(result.status).toBe("on-track");
    });

    it("marks a weekly learner behind when they trail the schedule", () => {
        const result = calculatePacing(
            { startedAt: start, pacing: "WEEKLY", targetDate: null },
            requirements,
            5,
            // Most of the way through a 6-week course with 5% done.
            new Date("2026-02-05T00:00:00Z")
        );
        expect(result.status).toBe("behind");
    });

    it("marks a learner ahead when they outpace the schedule", () => {
        const result = calculatePacing(
            { startedAt: start, pacing: "WEEKLY", targetDate: null },
            requirements,
            90,
            new Date("2026-01-08T00:00:00Z")
        );
        expect(result.status).toBe("ahead");
    });
});

describe("streaks", () => {
    it("returns zero with no activity", () => {
        expect(calculateStreak([], "2026-03-10")).toEqual({
            current: 0,
            longest: 0,
        });
    });

    it("counts consecutive days ending today", () => {
        expect(
            calculateStreak(
                ["2026-03-08", "2026-03-09", "2026-03-10"],
                "2026-03-10"
            )
        ).toEqual({ current: 3, longest: 3 });
    });

    it("still counts a streak that ended yesterday", () => {
        expect(
            calculateStreak(["2026-03-08", "2026-03-09"], "2026-03-10").current
        ).toBe(2);
    });

    it("breaks the current streak after a missed day but keeps the longest", () => {
        const result = calculateStreak(
            ["2026-03-01", "2026-03-02", "2026-03-03", "2026-03-08"],
            "2026-03-10"
        );
        expect(result.current).toBe(0);
        expect(result.longest).toBe(3);
    });

    it("ignores duplicate dates", () => {
        expect(
            calculateStreak(
                ["2026-03-09", "2026-03-09", "2026-03-10"],
                "2026-03-10"
            ).current
        ).toBe(2);
    });
});

describe("point idempotency keys", () => {
    it("is stable for the same event", () => {
        expect(pointKey("lessonComplete", "course-01", "lesson-1")).toBe(
            pointKey("lessonComplete", "course-01", "lesson-1")
        );
    });

    it("differs across lessons and across courses", () => {
        expect(pointKey("lessonComplete", "course-01", "lesson-1")).not.toBe(
            pointKey("lessonComplete", "course-01", "lesson-2")
        );
        expect(pointKey("lessonComplete", "course-01", "lesson-1")).not.toBe(
            pointKey("lessonComplete", "course-02", "lesson-1")
        );
    });
});
