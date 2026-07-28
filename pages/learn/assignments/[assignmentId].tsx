"use client";

import CourseBadge from "@components/Learning/CourseBadge";
import LearnerShell from "@components/Learning/LearnerShell";
import { buildLearnerNavigation } from "@components/Learning/learnerNavigation";
import { useLearningProgress } from "hooks/useLearningProgress";
import type {
    Assessment,
    AppliedAssignment,
    Course,
    RubricCriterion,
} from "learning/course-models";
import { courseRegistry } from "learning/course-registry";
import type { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import React, { useMemo } from "react";
import { learningItemKey } from "@utils/learning/state";
import type { AssignmentAttemptRecord } from "@utils/learning/types";

type AssignmentKind = "assignment" | "final";

interface AssignmentReportProps {
    assignment: {
        id: string;
        kind: AssignmentKind;
        title: string;
        instructions: string;
        estimatedMinutes: number;
        passingScore: number;
        maximumAttempts: number | null;
        rubric: RubricCriterion[];
        /** Only the final assessment carries a remediation plan. */
        remediation: string | null;
        freeCompletionPath: string | null;
        objectives: string[];
    };
    course: {
        id: string;
        slug: string;
        title: string;
    };
    /** Lessons recommended for review when a criterion is not met. */
    relatedLessons: Array<{ id: string; title: string; href: string }>;
}

const formatDate = (value?: string) => {
    if (!value) return "Draft";
    const time = Date.parse(value);
    return Number.isNaN(time)
        ? "Recently"
        : new Intl.DateTimeFormat(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
          }).format(new Date(time));
};

const scorePercent = (attempt: AssignmentAttemptRecord): number | null =>
    typeof attempt.score === "number" &&
    typeof attempt.maxScore === "number" &&
    attempt.maxScore > 0
        ? Math.round((attempt.score / attempt.maxScore) * 100)
        : null;

const statusTone = (
    status: AssignmentAttemptRecord["status"]
): "grey" | "blue" | "green" | "amber" => {
    if (status === "approved") return "green";
    if (status === "submitted" || status === "under-review") return "blue";
    if (status === "needs-revision") return "amber";
    return "grey";
};

const AssignmentReportPage: React.FC<AssignmentReportProps> = ({
    assignment,
    course,
    relatedLessons,
}) => {
    const { state, summary, hydrated } = useLearningProgress();

    const attempts = useMemo(() => {
        const key = learningItemKey(course.id, assignment.id);
        return (state.assignmentAttempts[key] || [])
            .slice()
            .sort(
                (left, right) =>
                    Date.parse(right.updatedAt) - Date.parse(left.updatedAt)
            );
    }, [assignment.id, course.id, state.assignmentAttempts]);

    const bestAttempt = useMemo(() => {
        let best: AssignmentAttemptRecord | undefined;
        let bestScore = -1;
        attempts.forEach((attempt) => {
            const percent = scorePercent(attempt) ?? -1;
            if (percent > bestScore) {
                bestScore = percent;
                best = attempt;
            }
        });
        return best;
    }, [attempts]);

    const passed = attempts.some(
        (attempt) => attempt.passed || attempt.status === "approved"
    );
    const bestScore = bestAttempt ? scorePercent(bestAttempt) : null;
    const pointsEarned = attempts.reduce(
        (total, attempt) => total + attempt.pointsEarned,
        0
    );

    const navigation = buildLearnerNavigation({
        badges: summary.badgeCount,
        certificates: Object.keys(state.certificates).length,
    });

    return (
        <>
            <Head>
                <title>{`${assignment.title} | C4T Learning`}</title>
                <meta name="robots" content="noindex" />
            </Head>
            <LearnerShell
                title={assignment.title}
                description={`${course.title} · ${
                    assignment.kind === "final"
                        ? "Final assessment"
                        : "Applied assignment"
                }`}
                activeItemId="assignments"
                navigation={navigation}
            >
                <nav aria-label="Breadcrumb" className="mb-6 text-sm">
                    <ol className="flex list-none flex-wrap items-center gap-2 pl-0 text-medium-grey">
                        <li>
                            <Link
                                href="/learn/assignments"
                                className="underline-offset-4 hover:text-white hover:underline focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                            >
                                Assignments
                            </Link>
                        </li>
                        <li aria-hidden="true">/</li>
                        <li>
                            <Link
                                href={`/courses/${course.slug}`}
                                className="underline-offset-4 hover:text-white hover:underline focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                            >
                                {course.title}
                            </Link>
                        </li>
                        <li aria-hidden="true">/</li>
                        <li aria-current="page" className="text-white">
                            {assignment.title}
                        </li>
                    </ol>
                </nav>

                {!hydrated ? (
                    <div
                        role="status"
                        className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-6 text-medium-grey"
                    >
                        Loading your attempt history…
                    </div>
                ) : (
                    <div className="space-y-6">
                        <section
                            aria-labelledby="result-title"
                            className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-5 sm:p-6"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <h2
                                    id="result-title"
                                    className="text-xl font-bold text-white"
                                >
                                    Your result
                                </h2>
                                <CourseBadge
                                    tone={
                                        passed
                                            ? "green"
                                            : attempts.length
                                            ? "blue"
                                            : "grey"
                                    }
                                    icon={passed ? "✓" : undefined}
                                >
                                    {passed
                                        ? "Passed"
                                        : attempts.length
                                        ? "Submitted"
                                        : "Not started"}
                                </CourseBadge>
                            </div>

                            <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {[
                                    {
                                        label: "Best score",
                                        value:
                                            bestScore === null
                                                ? "Not scored"
                                                : `${bestScore}%`,
                                    },
                                    {
                                        label: "Passing rubric",
                                        value: `${assignment.passingScore}%`,
                                    },
                                    {
                                        label: "Attempts used",
                                        value: `${attempts.length}${
                                            assignment.maximumAttempts === null
                                                ? " of unlimited"
                                                : ` of ${assignment.maximumAttempts}`
                                        }`,
                                    },
                                    {
                                        label: "Points earned",
                                        value: `${pointsEarned}`,
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.label}
                                        className="rounded-xl border border-white/10 bg-dark-grey-primary/40 p-3"
                                    >
                                        <dt className="text-xs uppercase tracking-wider text-medium-grey">
                                            {item.label}
                                        </dt>
                                        <dd className="mt-1 text-lg font-bold text-white">
                                            {item.value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>

                            {!attempts.length && (
                                <p className="mt-4 rounded-xl border border-white/10 bg-dark-grey-primary/40 p-4 text-sm leading-6 text-medium-grey">
                                    You have not recorded an attempt yet. Open
                                    the assignments page to review the rubric
                                    and record a submission.
                                </p>
                            )}

                            <Link
                                href="/learn/assignments"
                                className="mt-5 inline-flex min-h-[44px] items-center rounded-xl bg-brand-purple-primary px-5 py-2 text-sm font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                            >
                                {attempts.length
                                    ? "Record another attempt"
                                    : "Start this assignment"}
                            </Link>
                        </section>

                        <section
                            aria-labelledby="brief-title"
                            className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-5 sm:p-6"
                        >
                            <h2
                                id="brief-title"
                                className="text-xl font-bold text-white"
                            >
                                Brief
                            </h2>
                            <p className="mt-3 text-sm leading-6 text-[#C7C3CE]">
                                {assignment.instructions}
                            </p>
                            <p className="mt-3 text-xs text-medium-grey">
                                About {assignment.estimatedMinutes} minutes of
                                focused work.
                            </p>
                            {assignment.freeCompletionPath && (
                                <p className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.07] p-3 text-sm leading-6 text-emerald-100">
                                    <strong>Free path:</strong>{" "}
                                    {assignment.freeCompletionPath}
                                </p>
                            )}
                            {assignment.objectives.length > 0 && (
                                <>
                                    <h3 className="mt-5 font-bold text-white">
                                        Learning objectives assessed
                                    </h3>
                                    <ul className="mt-2 space-y-1.5 text-sm leading-6 text-[#C7C3CE]">
                                        {assignment.objectives.map(
                                            (objective) => (
                                                <li key={objective}>
                                                    • {objective}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </>
                            )}
                        </section>

                        <section
                            aria-labelledby="rubric-title"
                            className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-5 sm:p-6"
                        >
                            <h2
                                id="rubric-title"
                                className="text-xl font-bold text-white"
                            >
                                Rubric
                            </h2>
                            <ul className="mt-3 space-y-3">
                                {assignment.rubric.map((criterion) => (
                                    <li
                                        key={criterion.id}
                                        className="rounded-xl border border-white/10 bg-dark-grey-primary/40 p-4 text-sm leading-6 text-[#C7C3CE]"
                                    >
                                        <p className="font-bold text-white">
                                            {criterion.label}{" "}
                                            <span className="font-normal text-medium-grey">
                                                ({criterion.points} pts)
                                            </span>
                                        </p>
                                        <p className="mt-1">
                                            {criterion.description}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section
                            aria-labelledby="history-title"
                            className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-5 sm:p-6"
                        >
                            <h2
                                id="history-title"
                                className="text-xl font-bold text-white"
                            >
                                Attempt history
                            </h2>
                            {attempts.length ? (
                                <ol className="mt-4 list-none space-y-3 pl-0">
                                    {attempts.map((attempt, index) => {
                                        const percent = scorePercent(attempt);
                                        const isBest =
                                            bestAttempt?.id === attempt.id;
                                        return (
                                            <li
                                                key={attempt.id}
                                                className="rounded-xl border border-white/10 bg-dark-grey-primary/40 p-4"
                                            >
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="font-bold text-white">
                                                        Attempt{" "}
                                                        {attempts.length -
                                                            index}
                                                    </span>
                                                    <CourseBadge
                                                        tone={statusTone(
                                                            attempt.status
                                                        )}
                                                    >
                                                        {attempt.status.replace(
                                                            /-/g,
                                                            " "
                                                        )}
                                                    </CourseBadge>
                                                    {isBest &&
                                                        percent !== null && (
                                                            <CourseBadge tone="purple">
                                                                Best attempt
                                                            </CourseBadge>
                                                        )}
                                                </div>
                                                <p className="mt-2 text-sm text-[#C7C3CE]">
                                                    Score:{" "}
                                                    {percent === null
                                                        ? "Not scored"
                                                        : `${percent}%`}{" "}
                                                    · Points:{" "}
                                                    {attempt.pointsEarned}
                                                </p>
                                                <p className="mt-1 text-xs text-medium-grey">
                                                    Submitted{" "}
                                                    {formatDate(
                                                        attempt.submittedAt
                                                    )}{" "}
                                                    · Updated{" "}
                                                    {formatDate(
                                                        attempt.updatedAt
                                                    )}
                                                </p>
                                            </li>
                                        );
                                    })}
                                </ol>
                            ) : (
                                <p className="mt-3 text-sm leading-6 text-medium-grey">
                                    No attempts recorded on this device yet.
                                </p>
                            )}
                        </section>

                        {(!passed || assignment.remediation) &&
                            relatedLessons.length > 0 && (
                                <section
                                    aria-labelledby="review-title"
                                    className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-5 sm:p-6"
                                >
                                    <h2
                                        id="review-title"
                                        className="text-xl font-bold text-white"
                                    >
                                        Recommended review
                                    </h2>
                                    {assignment.remediation && (
                                        <p className="mt-3 text-sm leading-6 text-[#C7C3CE]">
                                            {assignment.remediation}
                                        </p>
                                    )}
                                    <ul className="mt-3 space-y-2 text-sm leading-6">
                                        {relatedLessons.map((lesson) => (
                                            <li key={lesson.id}>
                                                <Link
                                                    href={lesson.href}
                                                    className="text-brand-purple-secondary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                                                >
                                                    {lesson.title}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}
                    </div>
                )}
            </LearnerShell>
        </>
    );
};

interface AssignmentLocation {
    course: Course;
    assignment: AppliedAssignment | Assessment;
    kind: AssignmentKind;
}

const findAssignment = (
    assignmentId: string
): AssignmentLocation | undefined => {
    for (const course of courseRegistry) {
        const applied = course.assignments.find(
            (item) => item.id === assignmentId
        );
        if (applied) {
            return { course, assignment: applied, kind: "assignment" };
        }
        if (course.finalAssessment.id === assignmentId) {
            return {
                course,
                assignment: course.finalAssessment,
                kind: "final",
            };
        }
    }
    return undefined;
};

export const getStaticPaths: GetStaticPaths = async () => ({
    paths: courseRegistry.flatMap((course) =>
        [
            ...course.assignments.map((assignment) => assignment.id),
            course.finalAssessment.id,
        ].map((assignmentId) => ({ params: { assignmentId } }))
    ),
    fallback: false,
});

export const getStaticProps: GetStaticProps<AssignmentReportProps> = async ({
    params,
}) => {
    const found = findAssignment(String(params?.assignmentId || ""));

    if (!found) {
        return { notFound: true };
    }

    const { course, assignment, kind } = found;
    const relatedModuleIds =
        kind === "assignment"
            ? (assignment as AppliedAssignment).relatedModuleIds
            : course.modules.map((module) => module.id);

    const relatedLessons = course.modules
        .filter((module) => relatedModuleIds.includes(module.id))
        .flatMap((module) => module.lessons)
        .slice(0, 6)
        .map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            href: `/learn/courses/${course.slug}/lessons/${lesson.slug}`,
        }));

    return {
        props: {
            assignment: {
                id: assignment.id,
                kind,
                title: assignment.title,
                instructions:
                    kind === "assignment"
                        ? (assignment as AppliedAssignment).brief
                        : (assignment as Assessment).instructions,
                estimatedMinutes: assignment.estimatedMinutes,
                passingScore: assignment.passingScore,
                maximumAttempts:
                    kind === "assignment"
                        ? (assignment as AppliedAssignment).attempts
                        : (assignment as Assessment).maximumAttempts,
                rubric: assignment.rubric,
                remediation:
                    kind === "final"
                        ? (assignment as Assessment).remediation
                        : null,
                freeCompletionPath:
                    kind === "assignment"
                        ? (assignment as AppliedAssignment).freeCompletionPath
                        : null,
                objectives: course.learningOutcomes.slice(0, 4),
            },
            course: {
                id: course.id,
                slug: course.slug,
                title: course.title,
            },
            relatedLessons,
        },
    };
};

export default AssignmentReportPage;
