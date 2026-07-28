"use client";

import DashboardSummary, {
    DashboardCourse,
} from "@components/Learning/DashboardSummary";
import LearnerShell from "@components/Learning/LearnerShell";
import { buildLearnerNavigation } from "@components/Learning/learnerNavigation";
import { useLearningProgress } from "hooks/useLearningProgress";
import type { Course } from "learning/course-models";
import { toCourseCompletionPolicy } from "learning/course-policies";
import { courseRegistry } from "learning/course-registry";
import Head from "next/head";
import Link from "next/link";
import React, { useMemo } from "react";
import type { ResumePosition } from "@utils/learning/types";

const findResumeHref = (course: Course, resume: ResumePosition) => {
    const lesson = course.modules
        .flatMap((module) => module.lessons)
        .find((item) => item.id === resume.lessonId);
    const fallback = course.modules[0]?.lessons[0];

    return lesson || fallback
        ? `/learn/courses/${course.slug}/lessons/${
              lesson?.slug || fallback?.slug
          }`
        : `/courses/${course.slug}`;
};

const dashboardCourses: DashboardCourse[] = courseRegistry.map((course) => ({
    ...toCourseCompletionPolicy(course),
    href: `/courses/${course.slug}`,
    summary: course.summary,
    resumeHref: (resume) => findResumeHref(course, resume),
}));

const formatDate = (value: string) => {
    const timestamp = Date.parse(value);
    if (Number.isNaN(timestamp)) return "Recently";
    return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
    }).format(new Date(timestamp));
};

const DashboardPage: React.FC = () => {
    const { state, summary, hydrated } = useLearningProgress();
    const pendingAssignments = useMemo(
        () =>
            courseRegistry.reduce((total, course) => {
                if (!state.enrollments[course.id]) return total;
                const assignmentIds = [
                    ...course.assignments.map((assignment) => assignment.id),
                    course.finalAssessment.id,
                ];
                return (
                    total +
                    assignmentIds.filter((assignmentId) => {
                        const attempts =
                            state.assignmentAttempts[
                                `${course.id}::${assignmentId}`
                            ] || [];
                        return !attempts.some(
                            (attempt) =>
                                attempt.status === "submitted" ||
                                attempt.status === "under-review" ||
                                attempt.status === "approved"
                        );
                    }).length
                );
            }, 0),
        [state.assignmentAttempts, state.enrollments]
    );
    const recentMilestones = useMemo(
        () =>
            [
                ...state.pointEvents.map((event) => ({
                    id: event.id,
                    title: event.reason,
                    detail: `${event.points > 0 ? "+" : ""}${
                        event.points
                    } points`,
                    at: event.awardedAt,
                })),
                ...Object.entries(state.badges).map(([key, badge]) => ({
                    id: `badge-${key}`,
                    title: `Badge earned: ${badge.title}`,
                    detail: badge.description,
                    at: badge.awardedAt,
                })),
            ]
                .sort(
                    (left, right) => Date.parse(right.at) - Date.parse(left.at)
                )
                .slice(0, 5),
        [state.badges, state.pointEvents]
    );

    const navigation = buildLearnerNavigation({
        pendingAssignments: pendingAssignments,
        badges: summary.badgeCount,
        certificates: Object.keys(state.certificates).length,
    });

    return (
        <>
            <Head>
                <title>Learning Dashboard | C4T</title>
                <meta
                    name="description"
                    content="Continue free Code 4 Tomorrow courses and review progress saved locally on this device."
                />
                <meta name="robots" content="noindex" />
            </Head>
            <LearnerShell
                title="Your learning dashboard"
                description="Continue a course, see what is next, and keep control of the progress saved in this browser."
                activeItemId="dashboard"
                navigation={navigation}
                actions={
                    <Link
                        href="/courses"
                        className="inline-flex min-h-[40px] items-center rounded-lg bg-brand-purple-primary px-3 py-2 text-sm font-semibold text-white outline-none hover:bg-brand-purple-secondary focus-visible:ring-2 focus-visible:ring-white"
                    >
                        Browse free courses
                    </Link>
                }
            >
                <DashboardSummary courses={dashboardCourses} />

                <div className="mt-8 grid gap-4 xl:grid-cols-2">
                    <section className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    Recent milestones
                                </h2>
                                <p className="mt-1 text-sm text-medium-grey">
                                    Activity recorded from completed learning
                                    work—not time spent with an idle tab.
                                </p>
                            </div>
                            <Link
                                href="/learn/achievements"
                                className="shrink-0 text-sm font-semibold text-brand-purple-secondary outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                            >
                                View all
                            </Link>
                        </div>

                        {!hydrated ? (
                            <p className="mt-5 text-sm text-medium-grey">
                                Loading milestones…
                            </p>
                        ) : recentMilestones.length ? (
                            <ol className="mt-4 divide-y divide-white/10">
                                {recentMilestones.map((milestone) => (
                                    <li
                                        key={milestone.id}
                                        className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-white">
                                                {milestone.title}
                                            </p>
                                            <p className="mt-1 text-xs leading-5 text-medium-grey">
                                                {milestone.detail}
                                            </p>
                                        </div>
                                        <time
                                            dateTime={milestone.at}
                                            className="shrink-0 text-xs text-medium-grey"
                                        >
                                            {formatDate(milestone.at)}
                                        </time>
                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <div className="mt-4 rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-center">
                                <p className="font-semibold text-white">
                                    Your first milestone is close
                                </p>
                                <p className="mt-1 text-sm leading-6 text-medium-grey">
                                    Complete a lesson to earn points and your
                                    first badge.
                                </p>
                            </div>
                        )}
                    </section>

                    <section className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-5">
                        <h2 className="text-xl font-bold text-white">
                            Learn fully free
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-[#C7C3CE]">
                            No account, payment, paid API, cloud credit, GPU, or
                            physical hardware is required. Hardware and advanced
                            AI courses include browser simulations and local
                            alternatives.
                        </p>
                        <ul className="mt-4 grid gap-2 text-sm text-[#D6D3DC] sm:grid-cols-2">
                            {[
                                "Browser-based labs",
                                "No-hardware simulators",
                                "Local progress backup",
                                "Device-local certificates",
                            ].map((item) => (
                                <li
                                    key={item}
                                    className="flex gap-2 rounded-xl bg-dark-grey-primary/40 px-3 py-2"
                                >
                                    <span
                                        aria-hidden="true"
                                        className="text-emerald-300"
                                    >
                                        ✓
                                    </span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Link
                            href="/learn/assignments"
                            className="mt-5 inline-flex min-h-[44px] items-center rounded-xl border border-brand-purple-secondary/50 px-4 py-2 text-sm font-semibold text-[#DCE4FF] outline-none hover:bg-brand-purple-secondary/10 focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                        >
                            Review upcoming work
                        </Link>
                    </section>
                </div>
            </LearnerShell>
        </>
    );
};

export default DashboardPage;
