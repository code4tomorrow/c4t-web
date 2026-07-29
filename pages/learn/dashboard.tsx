import type { Role } from "@prisma/client";
import CourseBadge from "@components/Learning/CourseBadge";
import LearnerShell from "@components/Learning/LearnerShell";
import { buildLearnerNavigation } from "@components/Learning/learnerNavigation";
import { LearningProgressBar } from "@components/Learning/LearningProgress";
import { getCourseById } from "lib/courses";
import { requireAuth } from "lib/guards";
import { getLearnerSnapshot, type LearnerSnapshot } from "lib/learner";
import Head from "next/head";
import Link from "next/link";
import React from "react";

interface DashboardProps {
    role: Role;
    snapshot: LearnerSnapshot;
    displayName: string;
    /** lessonId -> href, resolved on the server from the course registry. */
    resumeHrefs: Record<string, string>;
}

const paceTone = {
    ahead: "green",
    "on-track": "blue",
    behind: "amber",
    "not-started": "grey",
} as const;

const formatHours = (seconds: number) => {
    const hours = seconds / 3600;
    if (hours >= 1) return `${hours.toFixed(1)}h`;
    return `${Math.round(seconds / 60)}m`;
};

const DashboardPage: React.FC<DashboardProps> = ({
    role,
    snapshot,
    displayName,
    resumeHrefs,
}) => {
    const { courses, summary, badges } = snapshot;

    const active = courses.filter(
        (course) => course.enrollment.status === "ACTIVE"
    );
    const continueCourse = active.slice().sort((left, right) => {
        const l = left.progress.lastActivityAt
            ? Date.parse(String(left.progress.lastActivityAt))
            : 0;
        const r = right.progress.lastActivityAt
            ? Date.parse(String(right.progress.lastActivityAt))
            : 0;
        return r - l;
    })[0];

    const pendingReview = courses.reduce(
        (total, course) =>
            total +
            (course.progress.submittedAssignments -
                course.progress.approvedAssignments),
        0
    );

    const navigation = buildLearnerNavigation({
        role,
        pendingAssignments: pendingReview || undefined,
        badges: summary.badgeCount,
        certificates: snapshot.certificates.length,
    });

    return (
        <>
            <Head>
                <title>Dashboard | C4T Learning</title>
                <meta name="robots" content="noindex" />
            </Head>
            <LearnerShell
                title={`Welcome back, ${displayName}`}
                description="Your saved progress, synced across every device you sign in on."
                activeItemId="dashboard"
                navigation={navigation}
                learnerName={displayName}
            >
                {courses.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/20 bg-white/[0.03] p-8 text-center">
                        <h2 className="text-2xl font-bold text-white">
                            Let&apos;s find your first course
                        </h2>
                        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-medium-grey">
                            Every C4T course is free end to end — browser
                            simulators stand in for hardware, and paid tools are
                            always optional. Work through the lessons, submit
                            two projects and a capstone, and earn a verifiable
                            certificate.
                        </p>
                        <div className="mt-6 flex flex-wrap justify-center gap-3">
                            <Link
                                href="/courses"
                                className="min-h-[48px] rounded-xl bg-gradient-to-b from-brand-purple-primary to-brand-purple-secondary px-6 py-3 text-sm font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-white"
                            >
                                Discover courses
                            </Link>
                            <Link
                                href="/learn/paths"
                                className="min-h-[48px] rounded-xl border border-white/15 px-6 py-3 text-sm font-bold text-white outline-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                            >
                                Browse learning paths
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {continueCourse && (
                            <section
                                aria-labelledby="continue-title"
                                className="rounded-2xl border border-brand-purple-secondary/40 bg-brand-purple-secondary/[0.07] p-5 sm:p-6"
                            >
                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-purple-secondary">
                                    Continue learning
                                </p>
                                <h2
                                    id="continue-title"
                                    className="mt-2 text-2xl font-bold text-white"
                                >
                                    {continueCourse.title}
                                </h2>
                                <div className="mt-4 max-w-md">
                                    <LearningProgressBar
                                        value={
                                            continueCourse.progress.percentage
                                        }
                                        label="Course progress"
                                    />
                                </div>
                                <p className="mt-3 text-sm text-[#C7C3CE]">
                                    {continueCourse.progress.completedLessons}{" "}
                                    of {continueCourse.progress.totalLessons}{" "}
                                    lessons complete ·{" "}
                                    {formatHours(
                                        continueCourse.progress.activeSeconds
                                    )}{" "}
                                    of active learning time
                                </p>
                                <Link
                                    href={
                                        (continueCourse.enrollment
                                            .resumeLessonId &&
                                            resumeHrefs[
                                                continueCourse.enrollment
                                                    .resumeLessonId
                                            ]) ||
                                        `/courses/${continueCourse.slug}`
                                    }
                                    className="mt-5 inline-flex min-h-[48px] items-center rounded-xl bg-gradient-to-b from-brand-purple-primary to-brand-purple-secondary px-6 py-3 text-sm font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-white"
                                >
                                    Resume course →
                                </Link>
                            </section>
                        )}

                        <section aria-labelledby="snapshot-title">
                            <h2
                                id="snapshot-title"
                                className="text-xl font-bold text-white"
                            >
                                Learning snapshot
                            </h2>
                            <dl className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                {[
                                    [
                                        "Active courses",
                                        `${summary.activeCourses}`,
                                    ],
                                    [
                                        "Lessons completed",
                                        `${summary.completedLessons}`,
                                    ],
                                    [
                                        "Active learning time",
                                        formatHours(summary.activeSeconds),
                                    ],
                                    [
                                        "Current streak",
                                        `${summary.currentStreak} day${
                                            summary.currentStreak === 1
                                                ? ""
                                                : "s"
                                        }`,
                                    ],
                                    ["Points", `${summary.points}`],
                                    ["Badges", `${summary.badgeCount}`],
                                    [
                                        "Longest streak",
                                        `${summary.longestStreak} days`,
                                    ],
                                    [
                                        "Courses completed",
                                        `${summary.completedCourses}`,
                                    ],
                                ].map(([label, value]) => (
                                    <div
                                        key={label}
                                        className="rounded-xl border border-white/10 bg-dark-grey-secondary p-4"
                                    >
                                        <dt className="text-xs uppercase tracking-wider text-medium-grey">
                                            {label}
                                        </dt>
                                        <dd className="mt-1 text-2xl font-bold text-white">
                                            {value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </section>

                        <section aria-labelledby="courses-title">
                            <h2
                                id="courses-title"
                                className="text-xl font-bold text-white"
                            >
                                My courses
                            </h2>
                            <div className="mt-3 grid gap-4 xl:grid-cols-2">
                                {courses.map((course) => (
                                    <article
                                        key={course.courseId}
                                        className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-5"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                            <h3 className="text-lg font-bold text-white">
                                                <Link
                                                    href={`/courses/${course.slug}`}
                                                    className="underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                                                >
                                                    {course.title}
                                                </Link>
                                            </h3>
                                            <CourseBadge
                                                tone={
                                                    paceTone[
                                                        course.pacing.status
                                                    ]
                                                }
                                            >
                                                {course.pacing.label}
                                            </CourseBadge>
                                        </div>

                                        <div className="mt-4">
                                            <LearningProgressBar
                                                value={
                                                    course.progress.percentage
                                                }
                                                label="Progress"
                                            />
                                        </div>

                                        <ul className="mt-3 space-y-1 text-sm text-[#C7C3CE]">
                                            <li>
                                                {
                                                    course.progress
                                                        .completedLessons
                                                }
                                                /{course.progress.totalLessons}{" "}
                                                lessons ·{" "}
                                                {
                                                    course.progress
                                                        .passedCheckpoints
                                                }
                                                /
                                                {
                                                    course.progress
                                                        .totalCheckpoints
                                                }{" "}
                                                checkpoints
                                            </li>
                                            <li>
                                                {
                                                    course.progress
                                                        .approvedAssignments
                                                }
                                                /
                                                {
                                                    course.progress
                                                        .totalAssignments
                                                }{" "}
                                                projects approved
                                            </li>
                                        </ul>

                                        {course.certificateId ? (
                                            <Link
                                                href="/learn/certificates"
                                                className="mt-4 inline-flex min-h-[44px] items-center rounded-xl border border-emerald-500/40 px-4 py-2 text-sm font-bold text-emerald-100 outline-none hover:bg-emerald-500/10 focus-visible:ring-2 focus-visible:ring-emerald-300"
                                            >
                                                🎓 View certificate
                                            </Link>
                                        ) : course.eligibility.eligible ? (
                                            <Link
                                                href="/learn/certificates"
                                                className="mt-4 inline-flex min-h-[44px] items-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-white"
                                            >
                                                Claim your certificate
                                            </Link>
                                        ) : (
                                            <Link
                                                href={`/courses/${course.slug}`}
                                                className="mt-4 inline-flex min-h-[44px] items-center rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-[#D6D3DC] outline-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                                            >
                                                Open course
                                            </Link>
                                        )}
                                    </article>
                                ))}
                            </div>
                        </section>

                        {badges.length > 0 && (
                            <section aria-labelledby="badges-title">
                                <h2
                                    id="badges-title"
                                    className="text-xl font-bold text-white"
                                >
                                    Recent badges
                                </h2>
                                <ul className="mt-3 flex flex-wrap gap-2">
                                    {badges.slice(0, 8).map((badge) => (
                                        <li
                                            key={`${badge.id}-${badge.courseId}`}
                                        >
                                            <CourseBadge tone="purple" icon="★">
                                                {badge.title}
                                            </CourseBadge>
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

export const getServerSideProps = requireAuth<DashboardProps>(
    async ({ session, userId, role }) => {
        const snapshot = await getLearnerSnapshot(userId);

        // Resolve resume links here so the client never has to load the whole
        // course registry just to build a URL.
        const resumeHrefs: Record<string, string> = {};
        snapshot.courses.forEach((entry) => {
            const lessonId = entry.enrollment.resumeLessonId;
            if (!lessonId) return;
            const course = getCourseById(entry.courseId);
            const lesson = course?.modules
                .flatMap((module) => module.lessons)
                .find((item) => item.id === lessonId);
            if (course && lesson) {
                resumeHrefs[
                    lessonId
                ] = `/learn/courses/${course.slug}/lessons/${lesson.slug}`;
            }
        });

        return {
            props: {
                role,
                // Dates must be serialisable for the props payload.
                snapshot: JSON.parse(
                    JSON.stringify(snapshot)
                ) as LearnerSnapshot,
                displayName:
                    session.user.displayName || session.user.name || "learner",
                resumeHrefs,
            },
        };
    }
);

export default DashboardPage;
