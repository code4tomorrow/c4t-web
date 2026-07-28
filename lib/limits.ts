import { enforceRateLimit } from "./rate-limit";

/**
 * Named limits for abuse-prone endpoints, so the numbers live in one place
 * rather than being scattered through route handlers.
 */

export const enrollRateLimit = (userId: string) =>
    enforceRateLimit({
        key: `enroll:${userId}`,
        limit: 20,
        windowSeconds: 60 * 10,
    });

export const progressRateLimit = (userId: string) =>
    enforceRateLimit({
        key: `progress:${userId}`,
        limit: 240,
        windowSeconds: 60,
    });

export const activityRateLimit = (userId: string) =>
    enforceRateLimit({
        key: `activity:${userId}`,
        limit: 120,
        windowSeconds: 60,
    });

export const submissionRateLimit = (userId: string) =>
    enforceRateLimit({
        key: `submission:${userId}`,
        limit: 30,
        windowSeconds: 60 * 5,
    });

export const certificateRateLimit = (userId: string) =>
    enforceRateLimit({
        key: `certificate:${userId}`,
        limit: 10,
        windowSeconds: 60 * 10,
    });

export const verifyRateLimit = (ip: string) =>
    enforceRateLimit({
        key: `verify:${ip}`,
        limit: 60,
        windowSeconds: 60,
    });

export const gradeRateLimit = (userId: string) =>
    enforceRateLimit({
        key: `grade:${userId}`,
        limit: 120,
        windowSeconds: 60,
    });
