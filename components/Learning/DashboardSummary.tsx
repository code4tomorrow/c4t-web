"use client";

import Link from "next/link";
import React, { useMemo } from "react";
import { useLearningProgress } from "../../hooks/useLearningProgress";
import { calculateCourseProgress } from "@utils/learning/state";
import { CourseCompletionPolicy, ResumePosition } from "@utils/learning/types";

export interface DashboardCourse extends CourseCompletionPolicy {
    href: string;
    summary?: string;
    resumeHref?: (position: ResumePosition) => string;
}

export interface DashboardSummaryProps {
    courses: DashboardCourse[];
    discoverHref?: string;
    className?: string;
}

const formatActiveTime = (seconds: number) => {
    const totalMinutes = Math.round(seconds / 60);
    if (totalMinutes < 60) return `${totalMinutes}m`;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
};

const formatActivityDate = (value?: string) => {
    if (!value) return "Not started";
    const timestamp = Date.parse(value);
    if (Number.isNaN(timestamp)) return "Recently";
    return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        year:
            new Date(timestamp).getFullYear() !== new Date().getFullYear()
                ? "numeric"
                : undefined,
    }).format(new Date(timestamp));
};

const DashboardSummary: React.FC<DashboardSummaryProps> = ({
    courses,
    discoverHref = "/courses",
    className,
}) => {
    const { state, summary, hydrated } = useLearningProgress();
    const activeCourses = useMemo(
        () =>
            courses
                .filter(
                    (course) =>
                        state.enrollments[course.courseId]?.status !==
                            "completed" &&
                        Boolean(state.enrollments[course.courseId])
                )
                .map((course) => ({
                    course,
                    progress: calculateCourseProgress(state, course),
                }))
                .sort(
                    (left, right) =>
                        Date.parse(right.progress.lastActivityAt || "0") -
                        Date.parse(left.progress.lastActivityAt || "0")
                ),
        [courses, state]
    );

    const stats = [
        {
            label: "Active courses",
            value: summary.enrolledCourseCount.toString(),
        },
        {
            label: "Lessons finished",
            value: summary.completedLessonCount.toString(),
        },
        {
            label: "Active learning",
            value: formatActiveTime(summary.activeSeconds),
        },
        {
            label: "Current streak",
            value: `${summary.streak.currentDays} day${
                summary.streak.currentDays === 1 ? "" : "s"
            }`,
        },
    ];

    if (!hydrated) {
        return (
            <div
                className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-6 text-medium-grey"
                role="status"
            >
                Loading progress saved on this device…
            </div>
        );
    }

    return (
        <section className={className} aria-label="Learning dashboard summary">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-4"
                    >
                        <p className="text-sm text-medium-grey">{stat.label}</p>
                        <p className="mt-1 text-2xl font-bold text-white">
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-8 flex items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">
                        Continue learning
                    </h2>
                    <p className="mt-1 text-sm text-medium-grey">
                        Pick up from the latest position saved in this browser.
                    </p>
                </div>
                <Link
                    href={discoverHref}
                    className="shrink-0 text-sm font-semibold text-brand-purple-secondary hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-purple-secondary"
                >
                    Discover courses
                </Link>
            </div>

            {activeCourses.length ? (
                <div className="mt-4 grid gap-4 xl:grid-cols-2">
                    {activeCourses.map(({ course, progress }) => {
                        const continueHref =
                            progress.resume && course.resumeHref
                                ? course.resumeHref(progress.resume)
                                : course.href;
                        return (
                            <article
                                key={course.courseId}
                                className="flex flex-col rounded-2xl border border-white/10 bg-dark-grey-secondary p-5"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">
                                            {course.courseTitle}
                                        </h3>
                                        {course.summary && (
                                            <p className="mt-1 line-clamp-2 text-sm text-medium-grey">
                                                {course.summary}
                                            </p>
                                        )}
                                    </div>
                                    <span className="shrink-0 rounded-full bg-brand-purple-primary/30 px-2.5 py-1 text-xs font-bold text-brand-purple-secondary">
                                        {progress.percentage}%
                                    </span>
                                </div>

                                <div className="mt-5">
                                    <div
                                        className="h-2 overflow-hidden rounded-full bg-black/30"
                                        role="progressbar"
                                        aria-label={`${course.courseTitle} progress`}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-valuenow={progress.percentage}
                                    >
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-brand-purple-primary to-brand-purple-secondary"
                                            style={{
                                                width: `${progress.percentage}%`,
                                            }}
                                        />
                                    </div>
                                    <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-medium-grey">
                                        <span>
                                            {progress.completedLessons} of{" "}
                                            {progress.totalLessons} lessons
                                        </span>
                                        <span>
                                            Last activity:{" "}
                                            {formatActivityDate(
                                                progress.lastActivityAt
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <Link
                                    href={continueHref}
                                    className="mt-5 inline-flex min-h-[44px] items-center justify-center self-start rounded-xl bg-gradient-to-b from-brand-purple-primary to-brand-purple-secondary px-5 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-white"
                                >
                                    {progress.resume
                                        ? "Resume course"
                                        : "Start next lesson"}
                                </Link>
                            </article>
                        );
                    })}
                </div>
            ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-white/20 bg-white/[0.03] p-8 text-center">
                    <h3 className="font-bold text-white">
                        No active course yet
                    </h3>
                    <p className="mx-auto mt-2 max-w-lg text-sm text-medium-grey">
                        Enroll for free to start saving lesson progress on this
                        device. No account is needed.
                    </p>
                    <Link
                        href={discoverHref}
                        className="mt-4 inline-flex min-h-[44px] items-center rounded-xl bg-brand-purple-primary px-5 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-purple-secondary"
                    >
                        Browse free courses
                    </Link>
                </div>
            )}
        </section>
    );
};

export default DashboardSummary;
