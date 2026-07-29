"use client";

import type { Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { PREVIEWABLE_ROLES, ROLE_LABELS, VIEW_AS_COOKIE } from "lib/view-as";

const readCookie = (name: string) => {
    if (typeof document === "undefined") return null;
    const match = document.cookie
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${name}=`));
    return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
};

const setPreview = async (role: Role | null) => {
    const response = await fetch("/api/admin/view-as", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
    });
    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Could not switch role.");
    }
};

/**
 * Global banner shown while an administrator is previewing another role, plus
 * the control to switch or exit. Rendered on every page so the way out is
 * always reachable — including from learner pages where the admin nav is gone.
 *
 * The banner is presentational. Whether the preview actually applies is decided
 * on the server in resolveEffectiveRole.
 */
const ViewAsBanner: React.FC = () => {
    const router = useRouter();
    const { data: session } = useSession();
    const [preview, setPreviewState] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // The cookie is the source of truth the server reads, so mirror it here.
    useEffect(() => {
        setPreviewState(readCookie(VIEW_AS_COOKIE));
    }, [router.asPath]);

    if (!session?.user) return null;

    // While previewing, session.user.role still reports ADMIN (it comes from the
    // database), which is exactly how we know to offer the exit control.
    const isAdmin = session.user.role === "ADMIN";
    if (!isAdmin && !preview) return null;
    if (!isAdmin) return null;

    const change = async (role: Role | null) => {
        setBusy(true);
        setError(null);
        try {
            await setPreview(role);
            setPreviewState(role);
            // Server-rendered pages must be refetched under the new role.
            router.replace(router.asPath);
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Could not switch role."
            );
        } finally {
            setBusy(false);
        }
    };

    if (!preview) {
        // Not previewing: offer a compact switcher, only on admin pages.
        if (!router.asPath.startsWith("/admin")) return null;

        return (
            <div className="border-b border-white/10 bg-dark-grey-secondary px-4 py-2 md:px-8">
                <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center gap-2 text-sm">
                    <span className="text-medium-grey">Preview the site as:</span>
                    {PREVIEWABLE_ROLES.map((role) => (
                        <button
                            key={role}
                            type="button"
                            disabled={busy}
                            onClick={() => change(role)}
                            className="min-h-[36px] rounded-lg border border-white/15 px-3 py-1 text-xs font-semibold text-white outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-brand-purple-secondary disabled:opacity-50"
                        >
                            {ROLE_LABELS[role]}
                        </button>
                    ))}
                    {error && (
                        <span role="alert" className="text-xs text-red-300">
                            {error}
                        </span>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div
            role="status"
            className="sticky top-0 z-[60] border-b border-amber-400/40 bg-amber-500/95 px-4 py-2 text-black md:px-8"
        >
            <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center gap-x-3 gap-y-2 text-sm">
                <span aria-hidden="true">👁️</span>
                <strong>
                    Previewing as{" "}
                    {ROLE_LABELS[preview as Role] ?? preview}
                </strong>
                <span className="hidden sm:inline">
                    — your admin permissions are paused. Your own progress and
                    submissions are unchanged.
                </span>

                <span className="ml-auto flex flex-wrap items-center gap-2">
                    {PREVIEWABLE_ROLES.filter((role) => role !== preview).map(
                        (role) => (
                            <button
                                key={role}
                                type="button"
                                disabled={busy}
                                onClick={() => change(role)}
                                className="min-h-[36px] rounded-lg border border-black/25 px-3 py-1 text-xs font-bold outline-none hover:bg-black/10 focus-visible:ring-2 focus-visible:ring-black disabled:opacity-50"
                            >
                                {ROLE_LABELS[role]}
                            </button>
                        )
                    )}
                    <button
                        type="button"
                        disabled={busy}
                        onClick={() => change(null)}
                        className="min-h-[36px] rounded-lg bg-black px-3 py-1 text-xs font-bold text-white outline-none hover:bg-black/80 focus-visible:ring-2 focus-visible:ring-black disabled:opacity-50"
                    >
                        {busy ? "Switching…" : "Exit preview"}
                    </button>
                </span>

                {error && (
                    <span role="alert" className="w-full text-xs font-semibold">
                        {error}
                    </span>
                )}
            </div>
        </div>
    );
};

export default ViewAsBanner;
