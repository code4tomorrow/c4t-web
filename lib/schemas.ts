import { z } from "zod";

/** Shared request schemas. Every mutation validates against one of these. */

export const courseIdSchema = z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/i, "must be a course id");

const contentIdSchema = z.string().min(1).max(200);

export const enrollSchema = z.object({
    courseId: courseIdSchema,
    pacing: z.enum(["SELF_PACED", "WEEKLY", "COHORT"]).default("SELF_PACED"),
    targetDate: z.iso.datetime().optional(),
    weeklyHoursGoal: z.number().int().min(1).max(60).optional(),
});

export const updateEnrollmentSchema = z.object({
    courseId: courseIdSchema,
    status: z.enum(["ACTIVE", "PAUSED", "WITHDRAWN"]).optional(),
    pacing: z.enum(["SELF_PACED", "WEEKLY", "COHORT"]).optional(),
    targetDate: z.iso.datetime().nullable().optional(),
    weeklyHoursGoal: z.number().int().min(1).max(60).nullable().optional(),
});

export const lessonProgressSchema = z.object({
    lessonId: contentIdSchema,
    /**
     * Interactions the learner actually finished. The server decides whether
     * that satisfies the lesson's completion rule — the client never sends a
     * "complete" flag or a percentage.
     */
    completedInteractionIds: z.array(contentIdSchema).max(50).default([]),
    checkpointPassed: z.boolean().optional(),
});

export const resumeSchema = z.object({
    courseId: courseIdSchema,
    lessonId: contentIdSchema,
});

export const activitySchema = z.object({
    courseId: courseIdSchema.optional(),
    lessonId: contentIdSchema.optional(),
    /** Capped at 30 minutes per flush so a forged payload cannot inflate time. */
    seconds: z.number().int().min(1).max(1800),
    startedAt: z.iso.datetime(),
    /** Learner's local date (YYYY-MM-DD) so streaks respect their time zone. */
    localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD"),
});

export const assignmentSaveSchema = z.object({
    assignmentId: contentIdSchema,
    responseText: z.string().max(20000).optional(),
    repositoryUrl: z
        .string()
        .url()
        .max(500)
        .refine(
            (value) => {
                try {
                    const url = new URL(value);
                    return (
                        url.protocol === "https:" &&
                        ["github.com", "gitlab.com", "codeberg.org"].includes(
                            url.hostname.replace(/^www\./, "")
                        )
                    );
                } catch {
                    return false;
                }
            },
            { message: "must be an https GitHub, GitLab, or Codeberg URL" }
        )
        .optional()
        .or(z.literal("")),
});

export const assignmentSubmitSchema = assignmentSaveSchema.extend({
    /** Learner confirms they met each rubric criterion before submitting. */
    rubricAcknowledged: z.literal(true),
});

export const safetySchema = z.object({
    courseId: courseIdSchema,
});

export const credentialsSchema = z.object({
    email: z.email().max(200),
    // 10+ characters, following NIST guidance: length over character classes.
    password: z.string().min(10, "must be at least 10 characters").max(200),
});

export const registerSchema = credentialsSchema.extend({
    displayName: z.string().trim().min(2).max(60),
});

export const onboardingSchema = z.object({
    displayName: z.string().trim().min(2).max(60),
    experienceLevel: z.enum([
        "NEW_TO_CODING",
        "SOME_BASICS",
        "COMFORTABLE",
        "EXPERIENCED",
    ]),
    interests: z.array(z.string().max(60)).max(12).default([]),
    weeklyGoalHours: z.number().int().min(1).max(40).optional(),
    timeZone: z.string().max(80).default("UTC"),
    reduceMotion: z.boolean().default(false),
    reduceGamification: z.boolean().default(false),
    highContrast: z.boolean().default(false),
});

export const settingsSchema = onboardingSchema.partial().extend({
    emailAssignmentDue: z.boolean().optional(),
    emailModuleReleased: z.boolean().optional(),
    emailFeedback: z.boolean().optional(),
    emailCertificate: z.boolean().optional(),
});

export const certificateIssueSchema = z.object({
    courseId: courseIdSchema,
});

// ------------------------------------------------------------- admin ----

export const gradeSchema = z.object({
    submissionId: z.string().min(1).max(60),
    status: z.enum(["APPROVED", "NEEDS_REVISION", "REJECTED", "UNDER_REVIEW"]),
    score: z.number().int().min(0).max(100).optional(),
    feedback: z.string().trim().min(1).max(5000).optional(),
});

export const courseSettingsSchema = z.object({
    courseId: courseIdSchema,
    status: z.enum(["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"]).optional(),
    enforcePrerequisites: z.boolean().optional(),
    minimumQuizAverage: z.number().int().min(0).max(100).nullable().optional(),
    capstonePassingScore: z
        .number()
        .int()
        .min(0)
        .max(100)
        .nullable()
        .optional(),
    certificatesEnabled: z.boolean().optional(),
});

export const revokeCertificateSchema = z.object({
    certificateId: z.string().min(1).max(60),
    reason: z.string().trim().min(3).max(500),
});

export const roleChangeSchema = z.object({
    userId: z.string().min(1).max(60),
    role: z.enum(["LEARNER", "INSTRUCTOR", "CONTENT_EDITOR", "ADMIN"]),
});
