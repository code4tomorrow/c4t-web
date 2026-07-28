"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface LessonProgressState {
    completedInteractionIds: string[];
    completedAt: string | null;
}

interface Options {
    courseId: string;
    lessonId: string;
    initial: LessonProgressState;
}

/**
 * Persists lesson progress to the server.
 *
 * The client reports only which interactions were finished; the server decides
 * whether that completes the lesson and returns the authoritative state, which
 * we then render.
 */
export const useServerProgress = ({ courseId, lessonId, initial }: Options) => {
    const [state, setState] = useState<LessonProgressState>(initial);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset when navigating between lessons.
    useEffect(() => {
        setState(initial);
        setError(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lessonId]);

    const post = useCallback(
        async (interactionIds: string[]) => {
            setSaving(true);
            setError(null);
            try {
                const response = await fetch("/api/learn/progress", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        lessonId,
                        completedInteractionIds: interactionIds,
                    }),
                });
                const body = await response.json();
                if (!response.ok) {
                    throw new Error(body.error || "Could not save progress.");
                }
                setState({
                    completedInteractionIds: body.completedInteractionIds ?? [],
                    completedAt: body.completedAt ?? null,
                });
                return true;
            } catch (caught) {
                setError(
                    caught instanceof Error
                        ? caught.message
                        : "Could not save progress."
                );
                return false;
            } finally {
                setSaving(false);
            }
        },
        [lessonId]
    );

    const completeInteraction = useCallback(
        (interactionId: string) =>
            post(
                Array.from(
                    new Set([...state.completedInteractionIds, interactionId])
                )
            ),
        [post, state.completedInteractionIds]
    );

    return {
        state,
        saving,
        error,
        completeInteraction,
        courseId,
    };
};

const FLUSH_INTERVAL_MS = 60_000;
const IDLE_AFTER_MS = 90_000;

/**
 * Counts *active* learning time only: the tab must be visible and the learner
 * must have interacted recently. Time is flushed periodically and on unload so
 * a closed tab does not lose the last minute.
 */
export const useActiveTime = ({
    courseId,
    lessonId,
    enabled = true,
}: {
    courseId: string;
    lessonId: string;
    enabled?: boolean;
}) => {
    const secondsRef = useRef(0);
    const lastInteractionRef = useRef(Date.now());
    const startedAtRef = useRef(new Date().toISOString());

    useEffect(() => {
        if (!enabled || typeof window === "undefined") return undefined;

        const markInteraction = () => {
            lastInteractionRef.current = Date.now();
        };

        const events = ["keydown", "pointerdown", "scroll", "focus"];
        events.forEach((event) =>
            window.addEventListener(event, markInteraction, { passive: true })
        );

        const flush = (useBeacon = false) => {
            const seconds = Math.floor(secondsRef.current);
            if (seconds < 5) return;
            secondsRef.current = 0;

            const payload = JSON.stringify({
                courseId,
                lessonId,
                seconds: Math.min(seconds, 1800),
                startedAt: startedAtRef.current,
                localDate: new Intl.DateTimeFormat("en-CA", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                }).format(new Date()),
            });
            startedAtRef.current = new Date().toISOString();

            if (useBeacon && navigator.sendBeacon) {
                navigator.sendBeacon(
                    "/api/learn/activity",
                    new Blob([payload], { type: "application/json" })
                );
                return;
            }

            fetch("/api/learn/activity", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: payload,
                keepalive: true,
            }).catch(() => undefined);
        };

        const tick = window.setInterval(() => {
            const idle =
                Date.now() - lastInteractionRef.current > IDLE_AFTER_MS;
            if (document.visibilityState === "visible" && !idle) {
                secondsRef.current += 1;
            }
        }, 1000);

        const flushTimer = window.setInterval(() => flush(), FLUSH_INTERVAL_MS);

        const onHidden = () => {
            if (document.visibilityState === "hidden") flush(true);
        };
        document.addEventListener("visibilitychange", onHidden);
        window.addEventListener("pagehide", () => flush(true));

        return () => {
            flush(true);
            window.clearInterval(tick);
            window.clearInterval(flushTimer);
            events.forEach((event) =>
                window.removeEventListener(event, markInteraction)
            );
            document.removeEventListener("visibilitychange", onHidden);
        };
    }, [courseId, lessonId, enabled]);
};
