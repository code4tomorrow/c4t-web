"use client";

import { useEffect } from "react";
import { learningStoreActions } from "@utils/learning/store";

export interface ActiveLearningTimeOptions {
    courseId?: string;
    lessonId?: string;
    enabled?: boolean;
    idleAfterMs?: number;
    flushEveryMs?: number;
}

/**
 * Tracks focused, visible learning time without sending activity off-device.
 * Mouse, touch, keyboard, focus, and visibility events all refresh the idle
 * timer. Short partial seconds are carried until the next flush.
 */
export const useActiveLearningTime = ({
    courseId,
    lessonId,
    enabled = true,
    idleAfterMs = 60_000,
    flushEveryMs = 15_000,
}: ActiveLearningTimeOptions = {}) => {
    useEffect(() => {
        if (!enabled || typeof window === "undefined") return;

        let lastInteractionAt = Date.now();
        let lastTickAt = Date.now();
        let unflushedSeconds = 0;

        const markInteraction = () => {
            lastInteractionAt = Date.now();
        };

        const flush = () => {
            const wholeSeconds = Math.floor(unflushedSeconds);
            if (!wholeSeconds) return;
            unflushedSeconds -= wholeSeconds;
            learningStoreActions.recordActiveTime({
                seconds: wholeSeconds,
                courseId,
                lessonId,
            });
        };

        const tick = () => {
            const now = Date.now();
            const elapsedMs = Math.max(0, now - lastTickAt);
            const isActive =
                document.visibilityState === "visible" &&
                document.hasFocus() &&
                now - lastInteractionAt <= idleAfterMs;
            if (isActive) {
                unflushedSeconds +=
                    Math.min(elapsedMs, flushEveryMs * 2) / 1000;
            }
            lastTickAt = now;
            if (unflushedSeconds * 1000 >= flushEveryMs) flush();
        };

        const handleVisibilityChange = () => {
            tick();
            if (document.visibilityState !== "visible") flush();
            else markInteraction();
        };

        const handleBlur = () => {
            tick();
            flush();
        };

        const intervalId = window.setInterval(
            tick,
            Math.max(1_000, Math.min(5_000, flushEveryMs))
        );
        const passive: AddEventListenerOptions = { passive: true };

        window.addEventListener("pointerdown", markInteraction, passive);
        window.addEventListener("pointermove", markInteraction, passive);
        window.addEventListener("touchstart", markInteraction, passive);
        window.addEventListener("keydown", markInteraction);
        window.addEventListener("focus", markInteraction);
        window.addEventListener("blur", handleBlur);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            tick();
            flush();
            window.clearInterval(intervalId);
            window.removeEventListener("pointerdown", markInteraction, passive);
            window.removeEventListener("pointermove", markInteraction, passive);
            window.removeEventListener("touchstart", markInteraction, passive);
            window.removeEventListener("keydown", markInteraction);
            window.removeEventListener("focus", markInteraction);
            window.removeEventListener("blur", handleBlur);
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };
    }, [courseId, enabled, flushEveryMs, idleAfterMs, lessonId]);
};

export default useActiveLearningTime;
