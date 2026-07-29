import Footer from "@components/Footer";
import Navbar from "@components/Navbar";
import type { Role } from "@prisma/client";
import { requireAuth } from "lib/guards";
import { ROLE_LABELS } from "lib/view-as";
import Head from "next/head";
import Link from "next/link";
import React, { useState } from "react";

interface PreviewBlockedProps {
    previewRole: Role | null;
    realRole: Role;
    next: string;
}

/**
 * Shown when an administrator previewing a lower role opens a page their real
 * role could see. Without this they would hit a bare 404 with no navigation
 * and no obvious way to end the preview.
 */
const PreviewBlockedPage: React.FC<PreviewBlockedProps> = ({
    previewRole,
    realRole,
    next,
}) => {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const exitAndContinue = async () => {
        setBusy(true);
        setError(null);
        try {
            const response = await fetch("/api/admin/view-as", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: null }),
            });
            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body.error || "Could not end the preview.");
            }
            // Full navigation so the server re-evaluates without the cookie.
            window.location.href = next;
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Could not end the preview."
            );
            setBusy(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-dark-grey-primary">
            <Head>
                <title>You are previewing another role | C4T</title>
                <meta name="robots" content="noindex" />
            </Head>
            <Navbar />

            <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-14">
                <span aria-hidden="true" className="text-4xl">
                    👁️
                </span>
                <h1 className="mt-4 text-3xl font-bold text-white">
                    That page is hidden while you preview
                </h1>
                <p className="mt-3 text-sm leading-6 text-[#C7C3CE]">
                    You are signed in as{" "}
                    <strong className="text-white">
                        {ROLE_LABELS[realRole]}
                    </strong>
                    , but currently previewing the site as{" "}
                    <strong className="text-white">
                        {previewRole ? ROLE_LABELS[previewRole] : "another role"}
                    </strong>
                    . A {previewRole ? ROLE_LABELS[previewRole].toLowerCase() : "learner"}{" "}
                    cannot open{" "}
                    <span className="font-mono text-xs text-medium-grey">
                        {next}
                    </span>
                    , so neither can you while the preview is on — that is the
                    point of the preview.
                </p>

                {error && (
                    <p
                        role="alert"
                        className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100"
                    >
                        {error}
                    </p>
                )}

                <div className="mt-7 flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={exitAndContinue}
                        disabled={busy}
                        className="min-h-[48px] rounded-xl bg-gradient-to-b from-brand-purple-primary to-brand-purple-secondary px-6 py-3 text-sm font-bold text-white outline-none transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-white disabled:opacity-60"
                    >
                        {busy ? "Ending preview…" : "Exit preview and continue"}
                    </button>
                    <Link
                        href="/learn/dashboard"
                        className="inline-flex min-h-[48px] items-center rounded-xl border border-white/15 px-6 py-3 text-sm font-bold text-white outline-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                    >
                        Stay in preview
                    </Link>
                </div>

                <p className="mt-6 text-xs leading-5 text-medium-grey">
                    Ending the preview restores your full access immediately. It
                    never changes your account or anyone else&apos;s.
                </p>
            </main>
            <Footer />
        </div>
    );
};

export const getServerSideProps = requireAuth<PreviewBlockedProps>(
    async ({ query, previewRole, realRole }) => {
        const raw = typeof query.next === "string" ? query.next : "";
        // Same-origin relative paths only, so this cannot become a redirector.
        const next =
            raw.startsWith("/") && !raw.startsWith("//") ? raw : "/admin";

        // Nothing to explain if they are not actually previewing.
        if (!previewRole) {
            return { redirect: { destination: next, permanent: false } };
        }

        return { props: { previewRole, realRole, next } };
    }
);

export default PreviewBlockedPage;
