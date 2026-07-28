import CourseBadge from "@components/Learning/CourseBadge";
import LearnerShell from "@components/Learning/LearnerShell";
import { buildLearnerNavigation } from "@components/Learning/learnerNavigation";
import { getCourseById } from "lib/courses";
import { requireAuth } from "lib/guards";
import prisma from "lib/prisma";
import Head from "next/head";
import Link from "next/link";
import React, { useMemo, useState } from "react";

type WorkKind = "checkpoint" | "assignment" | "final";
type StatusFilter = "all" | "todo" | "awaiting" | "approved" | "revise";

export interface WorkItem {
    id: string;
    courseId: string;
    courseSlug: string;
    courseTitle: string;
    title: string;
    instructions: string;
    kind: WorkKind;
    passingScore: number;
    maxAttempts: number | null;
    attempts: number;
    status: string;
    score: number | null;
    lastFeedback: string | null;
    submittedAt: string | null;
}

interface AssignmentsProps {
    items: WorkItem[];
    badgeCount: number;
    certificateCount: number;
    completedView: boolean;
}

const kindLabel: Record<WorkKind, string> = {
    checkpoint: "Module checkpoint",
    assignment: "Applied assignment",
    final: "Final assessment",
};

const statusMeta = (item: WorkItem) => {
    if (item.status === "APPROVED")
        return {
            label: "Approved",
            tone: "green" as const,
            filter: "approved",
        };
    if (item.status === "SUBMITTED" || item.status === "UNDER_REVIEW")
        return {
            label: "Awaiting review",
            tone: "blue" as const,
            filter: "awaiting",
        };
    if (item.status === "NEEDS_REVISION")
        return {
            label: "Needs revision",
            tone: "amber" as const,
            filter: "revise",
        };
    if (item.status === "REJECTED")
        return {
            label: "Not accepted",
            tone: "amber" as const,
            filter: "revise",
        };
    return { label: "Not submitted", tone: "grey" as const, filter: "todo" };
};

const SubmitForm: React.FC<{
    item: WorkItem;
    onDone: () => void;
}> = ({ item, onDone }) => {
    const [responseText, setResponseText] = useState("");
    const [repositoryUrl, setRepositoryUrl] = useState("");
    const [acknowledged, setAcknowledged] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setBusy(true);
        try {
            const response = await fetch("/api/learn/submissions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    assignmentId: item.id,
                    responseText: responseText.trim() || undefined,
                    repositoryUrl: repositoryUrl.trim() || undefined,
                    rubricAcknowledged: true,
                }),
            });
            const body = await response.json();
            if (!response.ok)
                throw new Error(body.error || "Submission failed.");
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

    const textId = `response-${item.id}`;
    const repoId = `repo-${item.id}`;

    return (
        <form onSubmit={submit} className="mt-4 border-t border-white/10 pt-4">
            <label
                htmlFor={textId}
                className="block text-sm font-semibold text-[#D6D3DC]"
            >
                Your write-up
            </label>
            <textarea
                id={textId}
                rows={5}
                value={responseText}
                onChange={(event) => setResponseText(event.target.value)}
                maxLength={20000}
                placeholder="Explain your approach, your evidence, and what you would improve."
                className="mt-2 w-full rounded-xl border border-white/15 bg-dark-grey-primary/40 px-3 py-2 text-sm text-white outline-none placeholder:text-dim-grey focus:border-brand-purple-secondary focus:ring-2 focus:ring-brand-purple-secondary/40"
            />

            <label
                htmlFor={repoId}
                className="mt-3 block text-sm font-semibold text-[#D6D3DC]"
            >
                Repository or pull-request link{" "}
                <span className="font-normal text-medium-grey">(optional)</span>
            </label>
            <input
                id={repoId}
                type="url"
                value={repositoryUrl}
                onChange={(event) => setRepositoryUrl(event.target.value)}
                placeholder="https://github.com/you/project"
                className="mt-2 min-h-[44px] w-full rounded-xl border border-white/15 bg-dark-grey-primary/40 px-3 py-2 text-sm text-white outline-none placeholder:text-dim-grey focus:border-brand-purple-secondary focus:ring-2 focus:ring-brand-purple-secondary/40"
            />

            <label className="mt-3 flex items-start gap-2 text-sm text-[#D6D3DC]">
                <input
                    type="checkbox"
                    checked={acknowledged}
                    onChange={(event) => setAcknowledged(event.target.checked)}
                    className="mt-1 h-5 w-5 accent-[#7892EE]"
                />
                I checked my work against every rubric criterion.
            </label>

            {error && (
                <p role="alert" className="mt-3 text-sm text-red-300">
                    {error}
                </p>
            )}

            <button
                type="submit"
                disabled={busy || !acknowledged}
                className="mt-4 min-h-[44px] rounded-xl bg-brand-purple-primary px-5 py-2 text-sm font-bold text-white outline-none hover:bg-brand-purple-secondary focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-40"
            >
                {busy ? "Submitting…" : "Submit for review"}
            </button>
        </form>
    );
};

export const AssignmentsPage: React.FC<AssignmentsProps> = ({
    items,
    badgeCount,
    certificateCount,
    completedView,
}) => {
    const [filter, setFilter] = useState<StatusFilter>(
        completedView ? "approved" : "all"
    );
    const [openId, setOpenId] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const visible = useMemo(
        () =>
            items.filter((item) =>
                filter === "all" ? true : statusMeta(item).filter === filter
            ),
        [filter, items]
    );

    const pending = items.filter(
        (item) => statusMeta(item).filter === "todo"
    ).length;

    const navigation = buildLearnerNavigation({
        pendingAssignments: pending || undefined,
        badges: badgeCount,
        certificates: certificateCount,
    });

    const reload = () => {
        setOpenId(null);
        setRefreshKey((key) => key + 1);
        window.location.reload();
    };

    return (
        <>
            <Head>
                <title>{`${
                    completedView ? "Completed work" : "Assignments"
                } | C4T Learning`}</title>
                <meta name="robots" content="noindex" />
            </Head>
            <LearnerShell
                title={
                    completedView
                        ? "Completed work"
                        : "Assignments & checkpoints"
                }
                description="Checkpoints, applied assignments, and the final assessment are reviewed by a C4T instructor. Scores are set by the reviewer, not by you."
                activeItemId="assignments"
                navigation={navigation}
            >
                {items.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/20 bg-white/[0.03] p-8 text-center">
                        <h2 className="text-xl font-bold text-white">
                            No assignments yet
                        </h2>
                        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-medium-grey">
                            Enroll in a course and its checkpoints and projects
                            will appear here.
                        </p>
                        <Link
                            href="/courses"
                            className="mt-5 inline-flex min-h-[44px] items-center rounded-xl bg-brand-purple-primary px-5 py-2 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                        >
                            Browse free courses
                        </Link>
                    </div>
                ) : (
                    <>
                        <div
                            className="flex flex-wrap gap-2"
                            role="group"
                            aria-label="Filter work"
                        >
                            {(
                                [
                                    ["all", "All"],
                                    ["todo", "Not submitted"],
                                    ["awaiting", "Awaiting review"],
                                    ["revise", "Needs revision"],
                                    ["approved", "Approved"],
                                ] as const
                            ).map(([value, label]) => (
                                <button
                                    key={value}
                                    type="button"
                                    aria-pressed={filter === value}
                                    onClick={() => setFilter(value)}
                                    className={`min-h-[42px] rounded-full border px-4 py-2 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-brand-purple-secondary ${
                                        filter === value
                                            ? "border-brand-purple-secondary bg-brand-purple-primary text-white"
                                            : "border-white/15 text-medium-grey hover:text-white"
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        <p
                            className="mt-4 text-sm text-medium-grey"
                            aria-live="polite"
                        >
                            Showing {visible.length} of {items.length} items
                        </p>

                        <div className="mt-4 grid gap-4 xl:grid-cols-2">
                            {visible.map((item) => {
                                const meta = statusMeta(item);
                                const canSubmit =
                                    item.status !== "APPROVED" &&
                                    item.status !== "SUBMITTED" &&
                                    item.status !== "UNDER_REVIEW" &&
                                    (item.maxAttempts === null ||
                                        item.attempts < item.maxAttempts);

                                return (
                                    <article
                                        key={`${item.id}-${refreshKey}`}
                                        className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-5"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-purple-secondary">
                                                    {item.courseTitle} ·{" "}
                                                    {kindLabel[item.kind]}
                                                </p>
                                                <h3 className="mt-2 text-lg font-bold text-white">
                                                    {item.title}
                                                </h3>
                                            </div>
                                            <CourseBadge tone={meta.tone}>
                                                {meta.label}
                                            </CourseBadge>
                                        </div>

                                        <p className="mt-3 text-sm leading-6 text-[#C7C3CE]">
                                            {item.instructions}
                                        </p>

                                        <p className="mt-3 text-xs text-medium-grey">
                                            Pass mark {item.passingScore}% ·{" "}
                                            {item.attempts} attempt
                                            {item.attempts === 1
                                                ? ""
                                                : "s"}{" "}
                                            used
                                            {item.maxAttempts === null
                                                ? " · unlimited attempts"
                                                : ` of ${item.maxAttempts}`}
                                            {item.score !== null &&
                                                ` · scored ${item.score}%`}
                                        </p>

                                        {item.lastFeedback && (
                                            <div className="mt-3 rounded-xl border border-white/10 bg-dark-grey-primary/40 p-3">
                                                <p className="text-xs font-bold uppercase tracking-wider text-medium-grey">
                                                    Instructor feedback
                                                </p>
                                                <p className="mt-1 text-sm leading-6 text-[#D6D3DC]">
                                                    {item.lastFeedback}
                                                </p>
                                            </div>
                                        )}

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {canSubmit && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setOpenId(
                                                            openId === item.id
                                                                ? null
                                                                : item.id
                                                        )
                                                    }
                                                    aria-expanded={
                                                        openId === item.id
                                                    }
                                                    className="min-h-[44px] rounded-xl bg-brand-purple-primary px-4 py-2 text-sm font-semibold text-white outline-none hover:bg-brand-purple-secondary focus-visible:ring-2 focus-visible:ring-white"
                                                >
                                                    {openId === item.id
                                                        ? "Cancel"
                                                        : item.attempts
                                                        ? "Resubmit"
                                                        : "Submit work"}
                                                </button>
                                            )}
                                            <Link
                                                href={`/learn/assignments/${item.id}`}
                                                className="inline-flex min-h-[44px] items-center rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-[#D6D3DC] outline-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                                            >
                                                Full report
                                            </Link>
                                            <Link
                                                href={`/courses/${item.courseSlug}`}
                                                className="inline-flex min-h-[44px] items-center rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-[#D6D3DC] outline-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                                            >
                                                Course
                                            </Link>
                                        </div>

                                        {openId === item.id && (
                                            <SubmitForm
                                                item={item}
                                                onDone={reload}
                                            />
                                        )}
                                    </article>
                                );
                            })}
                        </div>
                    </>
                )}
            </LearnerShell>
        </>
    );
};

/** Builds every graded item across a learner's enrolled courses. */
export const loadWorkItems = async (userId: string) => {
    const [enrollments, submissions, badgeCount, certificateCount] =
        await Promise.all([
            prisma.enrollment.findMany({ where: { userId } }),
            prisma.assignmentSubmission.findMany({
                where: { userId },
                orderBy: { attemptNumber: "desc" },
                include: {
                    feedback: {
                        orderBy: { createdAt: "desc" },
                        take: 1,
                    },
                },
            }),
            prisma.userBadge.count({ where: { userId } }),
            prisma.certificate.count({ where: { userId } }),
        ]);

    const latestByAssignment = new Map<string, (typeof submissions)[number]>();
    const attemptCounts = new Map<string, number>();
    submissions.forEach((submission) => {
        attemptCounts.set(
            submission.assignmentId,
            (attemptCounts.get(submission.assignmentId) ?? 0) + 1
        );
        const existing = latestByAssignment.get(submission.assignmentId);
        if (!existing || submission.attemptNumber > existing.attemptNumber) {
            latestByAssignment.set(submission.assignmentId, submission);
        }
    });

    const items: WorkItem[] = [];

    enrollments.forEach((enrollment) => {
        const course = getCourseById(enrollment.courseId);
        if (!course) return;

        const push = (
            id: string,
            title: string,
            instructions: string,
            kind: WorkKind,
            passingScore: number,
            maxAttempts: number | null
        ) => {
            const latest = latestByAssignment.get(id);
            const approved = submissions.find(
                (row) => row.assignmentId === id && row.status === "APPROVED"
            );
            items.push({
                id,
                courseId: course.id,
                courseSlug: course.slug,
                courseTitle: course.title,
                title,
                instructions,
                kind,
                passingScore,
                maxAttempts,
                attempts: attemptCounts.get(id) ?? 0,
                status: approved?.status ?? latest?.status ?? "NONE",
                score: approved?.score ?? latest?.score ?? null,
                lastFeedback: latest?.feedback[0]?.body ?? null,
                submittedAt: latest?.submittedAt?.toISOString() ?? null,
            });
        };

        course.modules.forEach((module) =>
            push(
                module.checkpoint.id,
                module.checkpoint.title,
                module.checkpoint.instructions,
                "checkpoint",
                module.checkpoint.passingScore,
                module.checkpoint.maximumAttempts
            )
        );
        course.assignments.forEach((assignment) =>
            push(
                assignment.id,
                assignment.title,
                assignment.brief,
                "assignment",
                assignment.passingScore,
                assignment.attempts
            )
        );
        push(
            course.finalAssessment.id,
            course.finalAssessment.title,
            course.finalAssessment.instructions,
            "final",
            course.finalAssessment.passingScore,
            course.finalAssessment.maximumAttempts
        );
    });

    return { items, badgeCount, certificateCount };
};

export const getServerSideProps = requireAuth<AssignmentsProps>(
    async ({ userId }) => {
        const { items, badgeCount, certificateCount } = await loadWorkItems(
            userId
        );
        return {
            props: {
                items,
                badgeCount,
                certificateCount,
                completedView: false,
            },
        };
    }
);

export default AssignmentsPage;
