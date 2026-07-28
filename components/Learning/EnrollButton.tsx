"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useState } from "react";

export interface EnrollButtonProps {
    courseId: string;
    courseSlug: string;
    firstLessonHref: string;
    className?: string;
}

/**
 * Enrolls the signed-in learner and sends them to the first lesson.
 * Visitors who are not signed in are routed to /login and returned here.
 */
const EnrollButton: React.FC<EnrollButtonProps> = ({
    courseId,
    firstLessonHref,
    className,
}) => {
    const router = useRouter();
    const { status } = useSession();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const enroll = async () => {
        if (status !== "authenticated") {
            router.push(
                `/login?callbackUrl=${encodeURIComponent(router.asPath)}`
            );
            return;
        }

        setBusy(true);
        setError(null);
        try {
            const response = await fetch("/api/learn/enroll", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ courseId }),
            });
            const body = await response.json();

            // Already enrolled is not an error from the learner's point of view.
            if (!response.ok && body.code !== "duplicate") {
                throw new Error(body.error || "Could not enroll.");
            }

            router.push(firstLessonHref);
        } catch (caught) {
            setError(
                caught instanceof Error ? caught.message : "Could not enroll."
            );
            setBusy(false);
        }
    };

    return (
        <div>
            <button
                type="button"
                onClick={enroll}
                disabled={busy || status === "loading"}
                className={className}
            >
                {busy
                    ? "Enrolling…"
                    : status === "authenticated"
                    ? "Enroll and start"
                    : "Sign in to start"}
            </button>
            {error && (
                <p role="alert" className="mt-2 text-sm text-red-300">
                    {error}
                </p>
            )}
        </div>
    );
};

export default EnrollButton;
