import type { Role } from "@prisma/client";
import CourseBadge from "@components/Learning/CourseBadge";
import LearnerShell from "@components/Learning/LearnerShell";
import { buildLearnerNavigation } from "@components/Learning/learnerNavigation";
import { findAssessment } from "lib/courses";
import { requireAuth } from "lib/guards";
import prisma from "lib/prisma";
import type { RubricCriterion } from "learning/course-models";
import Head from "next/head";
import Link from "next/link";
import React from "react";

interface AttemptView {
    id: string;
    attemptNumber: number;
    status: string;
    score: number | null;
    submittedAt: string | null;
    gradedAt: string | null;
    responseText: string | null;
    repositoryUrl: string | null;
    feedback: Array<{ body: string; author: string; createdAt: string }>;
}

interface ReportProps {
    role: Role;
    assignment: {
        id: string;
        title: string;
        instructions: string;
        kind: string;
        estimatedMinutes: number;
        passingScore: number;
        maxAttempts: number | null;
        rubric: RubricCriterion[];
    };
    course: { slug: string; title: string };
    attempts: AttemptView[];
    relatedLessons: Array<{ id: string; title: string; href: string }>;
    badgeCount: number;
    certificateCount: number;
}

const formatDate = (value: string | null) =>
    value
        ? new Intl.DateTimeFormat(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
          }).format(new Date(value))
        : "—";

const tone = (status: string) =>
    status === "APPROVED"
        ? ("green" as const)
        : status === "SUBMITTED" || status === "UNDER_REVIEW"
        ? ("blue" as const)
        : status === "NEEDS_REVISION" || status === "REJECTED"
        ? ("amber" as const)
        : ("grey" as const);

const AssignmentReportPage: React.FC<ReportProps> = ({
    role,
    assignment,
    course,
    attempts,
    relatedLessons,
    badgeCount,
    certificateCount,
}) => {
    const approved = attempts.find((attempt) => attempt.status === "APPROVED");
    const scores = attempts
        .map((attempt) => attempt.score)
        .filter((score): score is number => typeof score === "number");
    const best = scores.length ? Math.max(...scores) : null;

    const navigation = buildLearnerNavigation({
        role,
        badges: badgeCount,
        certificates: certificateCount,
    });

    return (
        <>
            <Head>
                <title>{`${assignment.title} | C4T Learning`}</title>
                <meta name="robots" content="noindex" />
            </Head>
            <LearnerShell
                title={assignment.title}
                description={`${course.title} · ${assignment.kind}`}
                activeItemId="assignments"
                navigation={navigation}
            >
                <nav aria-label="Breadcrumb" className="mb-6 text-sm">
                    <ol className="flex list-none flex-wrap items-center gap-2 pl-0 text-medium-grey">
                        <li>
                            <Link
                                href="/learn/assignments"
                                className="underline-offset-4 hover:text-white hover:underline"
                            >
                                Assignments
                            </Link>
                        </li>
                        <li aria-hidden="true">/</li>
                        <li>
                            <Link
                                href={`/courses/${course.slug}`}
                                className="underline-offset-4 hover:text-white hover:underline"
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

                <div className="space-y-6">
                    <section className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-5 sm:p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-xl font-bold text-white">
                                Your result
                            </h2>
                            <CourseBadge
                                tone={tone(attempts[0]?.status ?? "NONE")}
                            >
                                {approved
                                    ? "Approved"
                                    : attempts[0]?.status.replace(/_/g, " ") ??
                                      "Not submitted"}
                            </CourseBadge>
                        </div>

                        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                [
                                    "Best score",
                                    best === null ? "Not graded" : `${best}%`,
                                ],
                                ["Pass mark", `${assignment.passingScore}%`],
                                [
                                    "Attempts used",
                                    `${attempts.length}${
                                        assignment.maxAttempts === null
                                            ? " of unlimited"
                                            : ` of ${assignment.maxAttempts}`
                                    }`,
                                ],
                                [
                                    "Estimated time",
                                    `${assignment.estimatedMinutes} min`,
                                ],
                            ].map(([label, value]) => (
                                <div
                                    key={label}
                                    className="rounded-xl border border-white/10 bg-dark-grey-primary/40 p-3"
                                >
                                    <dt className="text-xs uppercase tracking-wider text-medium-grey">
                                        {label}
                                    </dt>
                                    <dd className="mt-1 text-lg font-bold text-white">
                                        {value}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </section>

                    <section className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-5 sm:p-6">
                        <h2 className="text-xl font-bold text-white">Brief</h2>
                        <p className="mt-3 text-sm leading-6 text-[#C7C3CE]">
                            {assignment.instructions}
                        </p>
                    </section>

                    <section className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-5 sm:p-6">
                        <h2 className="text-xl font-bold text-white">Rubric</h2>
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

                    <section className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-5 sm:p-6">
                        <h2 className="text-xl font-bold text-white">
                            Attempt history
                        </h2>
                        {attempts.length === 0 ? (
                            <p className="mt-3 text-sm text-medium-grey">
                                No attempts submitted yet.
                            </p>
                        ) : (
                            <ol className="mt-4 list-none space-y-3 pl-0">
                                {attempts.map((attempt) => (
                                    <li
                                        key={attempt.id}
                                        className="rounded-xl border border-white/10 bg-dark-grey-primary/40 p-4"
                                    >
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-bold text-white">
                                                Attempt {attempt.attemptNumber}
                                            </span>
                                            <CourseBadge
                                                tone={tone(attempt.status)}
                                            >
                                                {attempt.status.replace(
                                                    /_/g,
                                                    " "
                                                )}
                                            </CourseBadge>
                                        </div>
                                        <p className="mt-2 text-sm text-[#C7C3CE]">
                                            Score:{" "}
                                            {attempt.score === null
                                                ? "Not graded"
                                                : `${attempt.score}%`}{" "}
                                            · Submitted{" "}
                                            {formatDate(attempt.submittedAt)} ·
                                            Graded{" "}
                                            {formatDate(attempt.gradedAt)}
                                        </p>
                                        {attempt.repositoryUrl && (
                                            <p className="mt-1 break-all text-sm">
                                                <a
                                                    href={attempt.repositoryUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer nofollow"
                                                    className="text-brand-purple-secondary underline-offset-4 hover:underline"
                                                >
                                                    {attempt.repositoryUrl}
                                                </a>
                                            </p>
                                        )}
                                        {attempt.responseText && (
                                            <details className="mt-2">
                                                <summary className="cursor-pointer text-sm font-semibold text-brand-purple-secondary">
                                                    Your write-up
                                                </summary>
                                                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#D6D3DC]">
                                                    {attempt.responseText}
                                                </p>
                                            </details>
                                        )}
                                        {attempt.feedback.map(
                                            (entry, index) => (
                                                <div
                                                    key={index}
                                                    className="mt-3 rounded-lg border border-white/10 bg-dark-grey-secondary p-3"
                                                >
                                                    <p className="text-xs font-bold uppercase tracking-wider text-medium-grey">
                                                        Feedback from{" "}
                                                        {entry.author}
                                                    </p>
                                                    <p className="mt-1 text-sm leading-6 text-[#D6D3DC]">
                                                        {entry.body}
                                                    </p>
                                                </div>
                                            )
                                        )}
                                    </li>
                                ))}
                            </ol>
                        )}
                    </section>

                    {!approved && relatedLessons.length > 0 && (
                        <section className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-5 sm:p-6">
                            <h2 className="text-xl font-bold text-white">
                                Lessons to revisit
                            </h2>
                            <ul className="mt-3 space-y-2 text-sm leading-6">
                                {relatedLessons.map((lesson) => (
                                    <li key={lesson.id}>
                                        <Link
                                            href={lesson.href}
                                            className="text-brand-purple-secondary underline-offset-4 hover:underline"
                                        >
                                            {lesson.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>
            </LearnerShell>
        </>
    );
};

export const getServerSideProps = requireAuth<ReportProps>(
    async ({ params, userId, role }) => {
        const assignmentId = String(params?.assignmentId || "");
        const location = findAssessment(assignmentId);

        if (!location) return { notFound: true };

        const { course, kind } = location;

        // Scoped by userId: a learner can never read another learner's attempts.
        const [rows, badgeCount, certificateCount] = await Promise.all([
            prisma.assignmentSubmission.findMany({
                where: { userId, assignmentId },
                orderBy: { attemptNumber: "desc" },
                include: {
                    feedback: {
                        orderBy: { createdAt: "desc" },
                        include: {
                            author: {
                                select: { displayName: true, name: true },
                            },
                        },
                    },
                },
            }),
            prisma.userBadge.count({ where: { userId } }),
            prisma.certificate.count({ where: { userId } }),
        ]);

        const source =
            kind === "checkpoint"
                ? course.modules.find(
                      (module) => module.checkpoint.id === assignmentId
                  )?.checkpoint
                : kind === "assignment"
                ? course.assignments.find((item) => item.id === assignmentId)
                : course.finalAssessment;

        if (!source) return { notFound: true };

        const relatedModuleIds =
            kind === "assignment"
                ? course.assignments.find((item) => item.id === assignmentId)
                      ?.relatedModuleIds ?? []
                : course.modules.map((module) => module.id);

        return {
            props: {
                role,
                assignment: {
                    id: assignmentId,
                    title: source.title,
                    instructions:
                        "brief" in source ? source.brief : source.instructions,
                    kind:
                        kind === "checkpoint"
                            ? "Module checkpoint"
                            : kind === "assignment"
                            ? "Applied assignment"
                            : "Final assessment",
                    estimatedMinutes: source.estimatedMinutes,
                    passingScore: source.passingScore,
                    maxAttempts:
                        "attempts" in source
                            ? source.attempts
                            : source.maximumAttempts,
                    rubric: source.rubric,
                },
                course: { slug: course.slug, title: course.title },
                attempts: rows.map((row) => ({
                    id: row.id,
                    attemptNumber: row.attemptNumber,
                    status: row.status,
                    score: row.score,
                    submittedAt: row.submittedAt?.toISOString() ?? null,
                    gradedAt: row.gradedAt?.toISOString() ?? null,
                    responseText: row.responseText,
                    repositoryUrl: row.repositoryUrl,
                    feedback: row.feedback.map((entry) => ({
                        body: entry.body,
                        author:
                            entry.author.displayName ||
                            entry.author.name ||
                            "Instructor",
                        createdAt: entry.createdAt.toISOString(),
                    })),
                })),
                relatedLessons: course.modules
                    .filter((module) => relatedModuleIds.includes(module.id))
                    .flatMap((module) => module.lessons)
                    .slice(0, 6)
                    .map((lesson) => ({
                        id: lesson.id,
                        title: lesson.title,
                        href: `/learn/courses/${course.slug}/lessons/${lesson.slug}`,
                    })),
                badgeCount,
                certificateCount,
            },
        };
    }
);

export default AssignmentReportPage;
