"use client";

import CourseBadge from "@components/Learning/CourseBadge";
import LearnerShell, {
    LearnerNavigationItem,
} from "@components/Learning/LearnerShell";
import { useLearningProgress } from "hooks/useLearningProgress";
import type { RubricCriterion } from "learning/course-models";
import { courseRegistry } from "learning/course-registry";
import Head from "next/head";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { learningItemKey } from "@utils/learning/state";
import type {
    AssignmentAttemptRecord,
    QuizAttemptRecord,
} from "@utils/learning/types";

type WorkFilter = "all" | "pending" | "submitted" | "passed" | "completed";

interface ProjectWork {
    id: string;
    courseId: string;
    courseSlug: string;
    courseTitle: string;
    title: string;
    instructions: string;
    estimatedMinutes: number;
    passingScore: number;
    maximumAttempts: number | null;
    rubric: RubricCriterion[];
    kind: "assignment" | "final";
}

interface CheckpointWork {
    id: string;
    courseId: string;
    courseTitle: string;
    moduleTitle: string;
    title: string;
    instructions: string;
    passingScore: number;
}

const statusLabel = (
    attempts: AssignmentAttemptRecord[]
): {
    filter: Exclude<WorkFilter, "all">;
    label: string;
    tone: "grey" | "blue" | "green";
} => {
    if (
        attempts.some(
            (attempt) => attempt.passed || attempt.status === "approved"
        )
    ) {
        return { filter: "passed", label: "Passed", tone: "green" };
    }
    if (
        attempts.some(
            (attempt) =>
                attempt.status === "submitted" ||
                attempt.status === "under-review" ||
                attempt.status === "needs-revision"
        )
    ) {
        return { filter: "submitted", label: "Submitted", tone: "blue" };
    }
    return { filter: "pending", label: "Not submitted", tone: "grey" };
};

const formatDate = (value?: string) => {
    if (!value) return "Draft";
    const time = Date.parse(value);
    return Number.isNaN(time)
        ? "Recently"
        : new Intl.DateTimeFormat(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
          }).format(new Date(time));
};

const scoreText = (attempt: { score?: number; maxScore?: number }) =>
    typeof attempt.score === "number" &&
    typeof attempt.maxScore === "number" &&
    attempt.maxScore > 0
        ? `${Math.round((attempt.score / attempt.maxScore) * 100)}%`
        : "Not scored";

export interface AssignmentsPageProps {
    initialFilter?: WorkFilter;
    completedView?: boolean;
}

export const AssignmentsPage: React.FC<AssignmentsPageProps> = ({
    initialFilter = "all",
    completedView = false,
}) => {
    const { state, actions, hydrated, summary } = useLearningProgress();
    const [filter, setFilter] = useState<WorkFilter>(initialFilter);
    const [rubricConfirmed, setRubricConfirmed] = useState<
        Record<string, boolean>
    >({});
    const [checkpointScores, setCheckpointScores] = useState<
        Record<string, number>
    >({});
    const [message, setMessage] = useState("");

    const relevantCourseIds = useMemo(() => {
        const ids = new Set(Object.keys(state.enrollments));
        Object.values(state.assignmentAttempts)
            .flat()
            .forEach((attempt) => ids.add(attempt.courseId));
        Object.values(state.quizAttempts)
            .flat()
            .forEach((attempt) => ids.add(attempt.courseId));
        return ids;
    }, [state.assignmentAttempts, state.enrollments, state.quizAttempts]);

    const projects = useMemo<ProjectWork[]>(
        () =>
            courseRegistry
                .filter((course) => relevantCourseIds.has(course.id))
                .flatMap((course) => [
                    ...course.assignments.map((assignment) => ({
                        id: assignment.id,
                        courseId: course.id,
                        courseSlug: course.slug,
                        courseTitle: course.title,
                        title: assignment.title,
                        instructions: assignment.brief,
                        estimatedMinutes: assignment.estimatedMinutes,
                        passingScore: assignment.passingScore,
                        maximumAttempts: assignment.attempts,
                        rubric: assignment.rubric,
                        kind: "assignment" as const,
                    })),
                    {
                        id: course.finalAssessment.id,
                        courseId: course.id,
                        courseSlug: course.slug,
                        courseTitle: course.title,
                        title: course.finalAssessment.title,
                        instructions: course.finalAssessment.instructions,
                        estimatedMinutes:
                            course.finalAssessment.estimatedMinutes,
                        passingScore: course.finalAssessment.passingScore,
                        maximumAttempts: course.finalAssessment.maximumAttempts,
                        rubric: course.finalAssessment.rubric,
                        kind: "final" as const,
                    },
                ]),
        [relevantCourseIds]
    );

    const checkpoints = useMemo<CheckpointWork[]>(
        () =>
            courseRegistry
                .filter((course) => relevantCourseIds.has(course.id))
                .flatMap((course) =>
                    course.modules.map((module) => ({
                        id: module.checkpoint.id,
                        courseId: course.id,
                        courseTitle: course.title,
                        moduleTitle: module.title,
                        title: module.checkpoint.title,
                        instructions: module.checkpoint.instructions,
                        passingScore: module.checkpoint.passingScore,
                    }))
                ),
        [relevantCourseIds]
    );

    const visibleProjects = projects.filter((project) => {
        if (filter === "all") return true;
        const attempts =
            state.assignmentAttempts[
                learningItemKey(project.courseId, project.id)
            ] || [];
        const status = statusLabel(attempts).filter;
        return filter === "completed"
            ? status === "submitted" || status === "passed"
            : status === filter;
    });

    const pendingCount = projects.filter((project) => {
        const attempts =
            state.assignmentAttempts[
                learningItemKey(project.courseId, project.id)
            ] || [];
        return statusLabel(attempts).filter === "pending";
    }).length;

    const navigation: LearnerNavigationItem[] = [
        {
            id: "dashboard",
            label: "Dashboard",
            href: "/learn/dashboard",
            icon: "⌂",
        },
        { id: "courses", label: "Courses", href: "/courses", icon: "⌘" },
        {
            id: "assignments",
            label: "Assignments",
            href: "/learn/assignments",
            icon: "✓",
            badge: pendingCount || undefined,
        },
        {
            id: "progress",
            label: "Progress",
            href: "/learn/progress",
            icon: "↗",
        },
        {
            id: "achievements",
            label: "Achievements",
            href: "/learn/achievements",
            icon: "★",
            badge: summary.badgeCount || undefined,
        },
        {
            id: "certificates",
            label: "Certificates",
            href: "/learn/certificates",
            icon: "◇",
            badge: Object.keys(state.certificates).length || undefined,
        },
    ];

    const recordSubmission = (project: ProjectWork) => {
        actions.recordAssignmentAttempt({
            courseId: project.courseId,
            assignmentId: project.id,
            status: "submitted",
            pointsEarned: 0,
        });
        setMessage(`${project.title} was recorded as submitted locally.`);
    };

    const recordRubricReview = (project: ProjectWork) => {
        actions.recordAssignmentAttempt({
            courseId: project.courseId,
            assignmentId: project.id,
            status: "approved",
            score: project.passingScore,
            maxScore: 100,
            passed: true,
        });
        setMessage(`${project.title} passed your local rubric review.`);
    };

    const recordCheckpoint = (checkpoint: CheckpointWork) => {
        const key = learningItemKey(checkpoint.courseId, checkpoint.id);
        const score = Math.min(
            100,
            Math.max(0, checkpointScores[key] ?? checkpoint.passingScore)
        );
        actions.recordQuizAttempt({
            courseId: checkpoint.courseId,
            quizId: checkpoint.id,
            score,
            maxScore: 100,
            passed: score >= checkpoint.passingScore,
        });
        setMessage(`${checkpoint.title}: ${score}% saved on this device.`);
    };

    return (
        <>
            <Head>
                <title>{`${
                    completedView ? "Completed Assignments" : "Assignments"
                } | C4T Learning`}</title>
                <meta
                    name="description"
                    content={
                        completedView
                            ? "Review completed and submitted C4T course assignments saved locally on this device."
                            : "Review projects, checkpoints, local submissions, and attempt history for free C4T courses."
                    }
                />
                <meta name="robots" content="noindex" />
            </Head>
            <LearnerShell
                title={
                    completedView
                        ? "Completed assignments"
                        : "Assignments & checkpoints"
                }
                description={
                    completedView
                        ? "Review every submitted or passed project and its device-local attempt history."
                        : "Complete projects, review rubrics, and keep an attempt history entirely on this device."
                }
                activeItemId="assignments"
                navigation={navigation}
            >
                <aside className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/[0.07] p-4 text-sm leading-6 text-amber-100">
                    <strong>Local self-review:</strong> no account or payment is
                    required. Because there is no instructor account, project
                    approval here is a private rubric self-check and only
                    supports a device-local certificate.
                </aside>

                {!hydrated ? (
                    <div
                        role="status"
                        className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-6 text-medium-grey"
                    >
                        Loading assignment history…
                    </div>
                ) : !projects.length ? (
                    <div className="rounded-2xl border border-dashed border-white/20 bg-white/[0.03] p-8 text-center">
                        <h2 className="text-xl font-bold text-white">
                            No assignments yet
                        </h2>
                        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-medium-grey">
                            Start any free course. Its projects and module
                            checkpoints will appear here automatically.
                        </p>
                        <Link
                            href="/courses"
                            className="mt-4 inline-flex min-h-[44px] items-center rounded-xl bg-brand-purple-primary px-5 py-2 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                        >
                            Browse free courses
                        </Link>
                    </div>
                ) : (
                    <>
                        <div
                            className="flex flex-wrap gap-2"
                            role="group"
                            aria-label="Filter assignments"
                        >
                            {(
                                [
                                    ["all", "All"],
                                    ["pending", "Not submitted"],
                                    ["submitted", "Submitted"],
                                    ["passed", "Passed"],
                                    ["completed", "Completed"],
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

                        {message && (
                            <p
                                role="status"
                                aria-live="polite"
                                className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.07] p-3 text-sm text-emerald-100"
                            >
                                {message}
                            </p>
                        )}

                        <section
                            className="mt-7"
                            aria-labelledby="projects-title"
                        >
                            <h2
                                id="projects-title"
                                className="text-2xl font-bold text-white"
                            >
                                Applied projects
                            </h2>
                            <p className="mt-1 text-sm text-medium-grey">
                                Two assignments and one final assessment are
                                included with each course.
                            </p>
                            {visibleProjects.length ? (
                                <div className="mt-4 grid gap-4 xl:grid-cols-2">
                                    {visibleProjects.map((project) => {
                                        const key = learningItemKey(
                                            project.courseId,
                                            project.id
                                        );
                                        const attempts = (
                                            state.assignmentAttempts[key] || []
                                        )
                                            .slice()
                                            .sort(
                                                (left, right) =>
                                                    Date.parse(
                                                        right.updatedAt
                                                    ) -
                                                    Date.parse(left.updatedAt)
                                            );
                                        const status = statusLabel(attempts);
                                        return (
                                            <article
                                                key={key}
                                                className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-5"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-purple-secondary">
                                                            {
                                                                project.courseTitle
                                                            }{" "}
                                                            ·{" "}
                                                            {project.kind ===
                                                            "final"
                                                                ? "Final assessment"
                                                                : "Applied assignment"}
                                                        </p>
                                                        <h3 className="mt-2 text-lg font-bold text-white">
                                                            {project.title}
                                                        </h3>
                                                    </div>
                                                    <CourseBadge
                                                        tone={status.tone}
                                                    >
                                                        {status.label}
                                                    </CourseBadge>
                                                </div>
                                                <p className="mt-3 text-sm leading-6 text-[#C7C3CE]">
                                                    {project.instructions}
                                                </p>
                                                <p className="mt-3 text-xs text-medium-grey">
                                                    About{" "}
                                                    {project.estimatedMinutes}{" "}
                                                    min · Passing rubric:{" "}
                                                    {project.passingScore}% ·{" "}
                                                    {project.maximumAttempts ===
                                                    null
                                                        ? "Unlimited attempts"
                                                        : `${project.maximumAttempts} attempts`}
                                                </p>

                                                <details className="mt-4 rounded-xl border border-white/10 bg-dark-grey-primary/30">
                                                    <summary className="min-h-[44px] cursor-pointer px-3 py-3 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-brand-purple-secondary">
                                                        Rubric and local
                                                        self-review
                                                    </summary>
                                                    <div className="border-t border-white/10 p-3">
                                                        <ul className="space-y-2">
                                                            {project.rubric.map(
                                                                (criterion) => (
                                                                    <li
                                                                        key={
                                                                            criterion.id
                                                                        }
                                                                        className="text-sm leading-6 text-[#C7C3CE]"
                                                                    >
                                                                        <strong className="text-white">
                                                                            {
                                                                                criterion.label
                                                                            }
                                                                        </strong>{" "}
                                                                        (
                                                                        {
                                                                            criterion.points
                                                                        }{" "}
                                                                        pts):{" "}
                                                                        {
                                                                            criterion.description
                                                                        }
                                                                    </li>
                                                                )
                                                            )}
                                                        </ul>
                                                        <label className="mt-4 flex items-start gap-2 text-sm text-[#D6D3DC]">
                                                            <input
                                                                type="checkbox"
                                                                checked={Boolean(
                                                                    rubricConfirmed[
                                                                        key
                                                                    ]
                                                                )}
                                                                onChange={(
                                                                    event
                                                                ) =>
                                                                    setRubricConfirmed(
                                                                        (
                                                                            current
                                                                        ) => ({
                                                                            ...current,
                                                                            [key]: event
                                                                                .target
                                                                                .checked,
                                                                        })
                                                                    )
                                                                }
                                                                className="mt-1 h-5 w-5 accent-[#7892EE]"
                                                            />
                                                            I checked my work
                                                            against every rubric
                                                            criterion and met
                                                            the minimum passing
                                                            requirements.
                                                        </label>
                                                    </div>
                                                </details>

                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            recordSubmission(
                                                                project
                                                            )
                                                        }
                                                        className="min-h-[44px] rounded-xl bg-brand-purple-primary px-4 py-2 text-sm font-semibold text-white outline-none hover:bg-brand-purple-secondary focus-visible:ring-2 focus-visible:ring-white"
                                                    >
                                                        Record submission
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            !rubricConfirmed[
                                                                key
                                                            ]
                                                        }
                                                        onClick={() =>
                                                            recordRubricReview(
                                                                project
                                                            )
                                                        }
                                                        className="min-h-[44px] rounded-xl border border-emerald-500/40 px-4 py-2 text-sm font-semibold text-emerald-100 outline-none hover:bg-emerald-500/10 focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
                                                    >
                                                        Record passing review
                                                    </button>
                                                    <Link
                                                        href={`/courses/${project.courseSlug}`}
                                                        className="inline-flex min-h-[44px] items-center rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-[#D6D3DC] outline-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                                                    >
                                                        Course instructions
                                                    </Link>
                                                </div>

                                                <details className="mt-4 border-t border-white/10 pt-3">
                                                    <summary className="cursor-pointer text-sm font-semibold text-brand-purple-secondary outline-none focus-visible:ring-2 focus-visible:ring-brand-purple-secondary">
                                                        Attempt history (
                                                        {attempts.length})
                                                    </summary>
                                                    {attempts.length ? (
                                                        <ol className="mt-3 space-y-2">
                                                            {attempts.map(
                                                                (
                                                                    attempt,
                                                                    index
                                                                ) => (
                                                                    <li
                                                                        key={
                                                                            attempt.id
                                                                        }
                                                                        className="rounded-lg bg-dark-grey-primary/40 p-3 text-xs text-medium-grey"
                                                                    >
                                                                        <span className="font-semibold text-white">
                                                                            Attempt{" "}
                                                                            {attempts.length -
                                                                                index}
                                                                        </span>{" "}
                                                                        ·{" "}
                                                                        {
                                                                            attempt.status
                                                                        }{" "}
                                                                        ·{" "}
                                                                        {scoreText(
                                                                            attempt
                                                                        )}{" "}
                                                                        ·{" "}
                                                                        {formatDate(
                                                                            attempt.submittedAt ||
                                                                                attempt.updatedAt
                                                                        )}
                                                                    </li>
                                                                )
                                                            )}
                                                        </ol>
                                                    ) : (
                                                        <p className="mt-2 text-xs text-medium-grey">
                                                            No attempts
                                                            recorded.
                                                        </p>
                                                    )}
                                                </details>
                                            </article>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="mt-4 rounded-xl border border-dashed border-white/15 p-5 text-sm text-medium-grey">
                                    No assignments match this filter.
                                </p>
                            )}
                        </section>

                        <section
                            className="mt-10"
                            aria-labelledby="checkpoints-title"
                        >
                            <h2
                                id="checkpoints-title"
                                className="text-2xl font-bold text-white"
                            >
                                Module checkpoints
                            </h2>
                            <p className="mt-1 text-sm text-medium-grey">
                                Enter the score from your checkpoint self-check.
                                An 80% course average is normally required.
                            </p>
                            <div className="mt-4 grid gap-3 lg:grid-cols-2">
                                {checkpoints.map((checkpoint) => {
                                    const key = learningItemKey(
                                        checkpoint.courseId,
                                        checkpoint.id
                                    );
                                    const attempts: QuizAttemptRecord[] =
                                        state.quizAttempts[key] || [];
                                    const best = attempts.length
                                        ? Math.max(
                                              ...attempts.map((attempt) =>
                                                  attempt.maxScore
                                                      ? (attempt.score /
                                                            attempt.maxScore) *
                                                        100
                                                      : 0
                                              )
                                          )
                                        : null;
                                    return (
                                        <article
                                            key={key}
                                            className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-4"
                                        >
                                            <p className="text-xs font-semibold text-brand-purple-secondary">
                                                {checkpoint.courseTitle} ·{" "}
                                                {checkpoint.moduleTitle}
                                            </p>
                                            <h3 className="mt-1 font-bold text-white">
                                                {checkpoint.title}
                                            </h3>
                                            <p className="mt-2 text-sm leading-6 text-medium-grey">
                                                {checkpoint.instructions}
                                            </p>
                                            <div className="mt-3 flex flex-wrap items-end gap-2">
                                                <label className="text-xs font-semibold text-[#D6D3DC]">
                                                    Score (0–100)
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={100}
                                                        value={
                                                            checkpointScores[
                                                                key
                                                            ] ??
                                                            checkpoint.passingScore
                                                        }
                                                        onChange={(event) =>
                                                            setCheckpointScores(
                                                                (current) => ({
                                                                    ...current,
                                                                    [key]: Number(
                                                                        event
                                                                            .target
                                                                            .value
                                                                    ),
                                                                })
                                                            )
                                                        }
                                                        className="mt-1 block h-11 w-24 rounded-lg border border-white/15 bg-dark-grey-primary px-3 text-white outline-none focus:border-brand-purple-secondary"
                                                    />
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        recordCheckpoint(
                                                            checkpoint
                                                        )
                                                    }
                                                    className="min-h-[44px] rounded-lg bg-brand-purple-primary px-4 py-2 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-white"
                                                >
                                                    Save attempt
                                                </button>
                                                <span className="pb-3 text-xs text-medium-grey">
                                                    {best === null
                                                        ? "No attempts"
                                                        : `Best: ${Math.round(
                                                              best
                                                          )}% · ${
                                                              attempts.length
                                                          } attempt${
                                                              attempts.length ===
                                                              1
                                                                  ? ""
                                                                  : "s"
                                                          }`}
                                                </span>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </section>
                    </>
                )}
            </LearnerShell>
        </>
    );
};

export default AssignmentsPage;
