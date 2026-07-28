import AdminShell from "@components/Learning/AdminShell";
import CourseBadge from "@components/Learning/CourseBadge";
import type { Role } from "@prisma/client";
import { findAssessment } from "lib/courses";
import { requireAuth } from "lib/guards";
import prisma from "lib/prisma";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";

interface QueueItem {
    id: string;
    assignmentId: string;
    assignmentTitle: string;
    courseTitle: string;
    passingScore: number;
    attemptNumber: number;
    status: string;
    learnerName: string;
    submittedAt: string | null;
    responseText: string | null;
    repositoryUrl: string | null;
}

interface QueueProps {
    items: QueueItem[];
    role: Role;
}

const GradeForm: React.FC<{ item: QueueItem; onDone: () => void }> = ({
    item,
    onDone,
}) => {
    const [score, setScore] = useState(item.passingScore);
    const [feedback, setFeedback] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const send = async (status: string) => {
        setError(null);
        setBusy(true);
        try {
            const response = await fetch("/api/admin/grade", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    submissionId: item.id,
                    status,
                    score,
                    feedback: feedback.trim() || undefined,
                }),
            });
            const body = await response.json();
            if (!response.ok) throw new Error(body.error || "Grading failed.");
            onDone();
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Something went wrong."
            );
            setBusy(false);
        }
    };

    return (
        <div className="mt-4 border-t border-white/10 pt-4">
            <label
                htmlFor={`score-${item.id}`}
                className="block text-sm font-semibold text-[#D6D3DC]"
            >
                Score: {score}%{" "}
                <span className="font-normal text-medium-grey">
                    (pass mark {item.passingScore}%)
                </span>
            </label>
            <input
                id={`score-${item.id}`}
                type="range"
                min={0}
                max={100}
                value={score}
                onChange={(event) => setScore(Number(event.target.value))}
                className="mt-2 w-full accent-[#7892EE]"
            />

            <label
                htmlFor={`feedback-${item.id}`}
                className="mt-3 block text-sm font-semibold text-[#D6D3DC]"
            >
                Feedback for the learner
            </label>
            <textarea
                id={`feedback-${item.id}`}
                rows={3}
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/15 bg-dark-grey-primary/40 px-3 py-2 text-sm text-white outline-none focus:border-brand-purple-secondary focus:ring-2 focus:ring-brand-purple-secondary/40"
            />

            {error && (
                <p role="alert" className="mt-3 text-sm text-red-300">
                    {error}
                </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
                <button
                    type="button"
                    disabled={busy}
                    onClick={() => send("APPROVED")}
                    className="min-h-[44px] rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white outline-none hover:bg-emerald-500 focus-visible:ring-2 focus-visible:ring-white disabled:opacity-60"
                >
                    Approve
                </button>
                <button
                    type="button"
                    disabled={busy}
                    onClick={() => send("NEEDS_REVISION")}
                    className="min-h-[44px] rounded-xl border border-amber-500/50 px-4 py-2 text-sm font-bold text-amber-100 outline-none hover:bg-amber-500/10 focus-visible:ring-2 focus-visible:ring-amber-300 disabled:opacity-60"
                >
                    Needs revision
                </button>
                <button
                    type="button"
                    disabled={busy}
                    onClick={() => send("UNDER_REVIEW")}
                    className="min-h-[44px] rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-[#D6D3DC] outline-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-brand-purple-secondary disabled:opacity-60"
                >
                    Mark under review
                </button>
            </div>
        </div>
    );
};

const GradingQueuePage: React.FC<QueueProps> = ({ items, role }) => {
    const router = useRouter();
    const [openId, setOpenId] = useState<string | null>(null);

    return (
        <>
            <Head>
                <title>Grading queue | C4T Admin</title>
                <meta name="robots" content="noindex" />
            </Head>
            <AdminShell
                title="Grading queue"
                description="Work waiting for review, oldest first. Approving is the only way a learner becomes eligible for a certificate."
                active="queue"
                role={role}
            >
                {items.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-white/20 bg-white/[0.03] p-8 text-center text-medium-grey">
                        Nothing is waiting for review right now.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {items.map((item) => (
                            <article
                                key={item.id}
                                className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-5"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-purple-secondary">
                                            {item.courseTitle}
                                        </p>
                                        <h2 className="mt-2 text-lg font-bold text-white">
                                            {item.assignmentTitle}
                                        </h2>
                                        <p className="mt-1 text-sm text-medium-grey">
                                            {item.learnerName} · attempt{" "}
                                            {item.attemptNumber} ·{" "}
                                            {item.submittedAt
                                                ? new Intl.DateTimeFormat(
                                                      undefined,
                                                      { dateStyle: "medium" }
                                                  ).format(
                                                      new Date(item.submittedAt)
                                                  )
                                                : "—"}
                                        </p>
                                    </div>
                                    <CourseBadge
                                        tone={
                                            item.status === "UNDER_REVIEW"
                                                ? "amber"
                                                : "blue"
                                        }
                                    >
                                        {item.status.replace(/_/g, " ")}
                                    </CourseBadge>
                                </div>

                                {item.repositoryUrl && (
                                    <p className="mt-3 break-all text-sm">
                                        <a
                                            href={item.repositoryUrl}
                                            target="_blank"
                                            rel="noopener noreferrer nofollow"
                                            className="text-brand-purple-secondary underline-offset-4 hover:underline"
                                        >
                                            {item.repositoryUrl}
                                        </a>
                                    </p>
                                )}

                                {item.responseText && (
                                    <div className="mt-3 max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-dark-grey-primary/40 p-3">
                                        <p className="whitespace-pre-wrap text-sm leading-6 text-[#D6D3DC]">
                                            {item.responseText}
                                        </p>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={() =>
                                        setOpenId(
                                            openId === item.id ? null : item.id
                                        )
                                    }
                                    aria-expanded={openId === item.id}
                                    className="mt-4 min-h-[44px] rounded-xl bg-brand-purple-primary px-4 py-2 text-sm font-semibold text-white outline-none hover:bg-brand-purple-secondary focus-visible:ring-2 focus-visible:ring-white"
                                >
                                    {openId === item.id
                                        ? "Cancel"
                                        : "Grade this"}
                                </button>

                                {openId === item.id && (
                                    <GradeForm
                                        item={item}
                                        onDone={() => {
                                            setOpenId(null);
                                            router.replace(router.asPath);
                                        }}
                                    />
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </AdminShell>
        </>
    );
};

export const getServerSideProps = requireAuth<QueueProps>(
    async ({ role }) => {
        const rows = await prisma.assignmentSubmission.findMany({
            where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
            orderBy: { submittedAt: "asc" },
            take: 100,
            include: {
                user: { select: { displayName: true, name: true } },
            },
        });

        return {
            props: {
                role,
                items: rows.map((row) => {
                    const assessment = findAssessment(row.assignmentId);
                    return {
                        id: row.id,
                        assignmentId: row.assignmentId,
                        assignmentTitle: assessment?.title ?? row.assignmentId,
                        courseTitle: assessment?.course.title ?? row.courseId,
                        passingScore: assessment?.passingScore ?? 70,
                        attemptNumber: row.attemptNumber,
                        status: row.status,
                        // Display name only — never the learner's email.
                        learnerName:
                            row.user.displayName || row.user.name || "Learner",
                        submittedAt: row.submittedAt?.toISOString() ?? null,
                        responseText: row.responseText,
                        repositoryUrl: row.repositoryUrl,
                    };
                }),
            },
        };
    },
    { roles: ["INSTRUCTOR", "ADMIN"] }
);

export default GradingQueuePage;
