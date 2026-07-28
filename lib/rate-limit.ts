import { tooManyRequests } from "./api";

interface Bucket {
    count: number;
    resetAt: number;
}

// In-memory fixed-window limiter. This is per-instance: on a serverless
// platform each warm instance keeps its own counters, so it throttles runaway
// clients and accidental loops but is not a distributed guarantee. The real
// protections against replay are the unique constraints and idempotency keys
// in the database.
const buckets = new Map<string, Bucket>();

const sweep = (now: number) => {
    if (buckets.size < 5000) return;
    buckets.forEach((bucket, key) => {
        if (bucket.resetAt <= now) buckets.delete(key);
    });
};

export interface RateLimitOptions {
    /** Unique key, usually `${routeName}:${userId}`. */
    key: string;
    limit: number;
    windowSeconds: number;
}

/** Throws a 429 when the caller has exceeded the window's allowance. */
export const enforceRateLimit = ({
    key,
    limit,
    windowSeconds,
}: RateLimitOptions) => {
    const now = Date.now();
    sweep(now);

    const existing = buckets.get(key);

    if (!existing || existing.resetAt <= now) {
        buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
        return;
    }

    if (existing.count >= limit) {
        const seconds = Math.ceil((existing.resetAt - now) / 1000);
        throw tooManyRequests(`Too many requests. Try again in ${seconds}s.`);
    }

    existing.count += 1;
};

/** Test helper — clears all counters. */
export const resetRateLimits = () => buckets.clear();
