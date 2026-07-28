"use client";

import CourseBadge from "@components/Learning/CourseBadge";
import LearnerShell from "@components/Learning/LearnerShell";
import { buildLearnerNavigation } from "@components/Learning/learnerNavigation";
import { LearningProgressBar } from "@components/Learning/LearningProgress";
import { useLearningProgress } from "hooks/useLearningProgress";
import { toCourseCompletionPolicy } from "learning/course-policies";
import { courseRegistry } from "learning/course-registry";
import Head from "next/head";
import Link from "next/link";
import React, { useMemo } from "react";
import { calculateCourseProgress, localDateKey } from "@utils/learning/state";

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
};

const formatDate = (value?: string) => {
    if (!value) return "Not started";
    const timestamp = Date.parse(value);
    if (Number.isNaN(timestamp)) return "Recently";
    return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(timestamp));
};

const lastSevenDays = () =>
    Array.from({ length: 7 }, (_, index) => {
        const date = new Date();
        date.setHours(12, 0, 0, 0);
        date.setDate(date.getDate() - (6 - index));
        return {
            key: localDateKey(date),
            label: new Intl.DateTimeFormat(undefined, {
                weekday: "short",
            }).format(date),
            fullLabel: new Intl.DateTimeFormat(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
            }).format(date),
        };
    });

const ProgressPage: React.FC = () => {
    const { state, summary, hydrated } = useLearningProgress();
    const courseProgress = useMemo(
        () =>
            courseRegistry
                .filter(
                    (course) =>
                        Boolean(state.enrollments[course.id]) ||
                        Boolean(state.activity.byCourse[course.id])
                )
                .map((course) => ({
                    course,
                    progress: calculateCourseProgress(
                        state,
                        toCourseCompletionPolicy(course)
                    ),
                }))
                .sort(
                    (left, right) =>
                        Date.parse(
                            right.progress.lastActivityAt ||
                                "1970-01-01T00:00:00.000Z"
                        ) -
                        Date.parse(
                            left.progress.lastActivityAt ||
                                "1970-01-01T00:00:00.000Z"
                        )
                ),
        [state]
    );
    const week = useMemo(
        () =>
            lastSevenDays().map((day) => ({
                ...day,
                seconds: state.activity.byDate[day.key] || 0,
            })),
        [state.activity.byDate]
    );
    const maxDailySeconds = Math.max(1, ...week.map((day) => day.seconds));
    const weeklySeconds = week.reduce((total, day) => total + day.seconds, 0);
    const attemptedQuizScores = Object.values(state.quizAttempts)
        .flat()
        .filter((attempt) => attempt.maxScore > 0)
        .map((attempt) => (attempt.score / attempt.maxScore) * 100);
    const averageQuizScore = attemptedQuizScores.length
        ? Math.round(
              attemptedQuizScores.reduce((total, score) => total + score, 0) /
                  attemptedQuizScores.length
          )
        : null;

    const navigation = buildLearnerNavigation({
        badges: summary.badgeCount,
        certificates: Object.keys(state.certificates).length,
    });

    return (
        <>
            <Head>
                <title>Learning Progress | C4T</title>
                <meta
                    name="description"
                    content="Review course progress, learning time, quiz performance, streaks, and milestones saved on this device."
                />
                <meta name="robots" content="noindex" />
            </Head>
            <LearnerShell
                title="Learning progress"
                description="A clear, private view of meaningful work completed on this device."
                activeItemId="progress"
                navigation={navigation}
            >
                {!hydrated ? (
                    <div
                        role="status"
                        className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-6 text-medium-grey"
                    >
                        Loading progress saved in this browser…
                    </div>
                ) : (
                    <>
                        <section
                            aria-label="Learning statistics"
                            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
                        >
                            {[
                                {
                                    label: "Active learning",
                                    value: formatTime(summary.activeSeconds),
                                    detail: `${formatTime(
                                        weeklySeconds
                                    )} in the last 7 days`,
                                },
                                {
                                    label: "Lessons complete",
                                    value: String(summary.completedLessonCount),
                                    detail: `${courseProgress.length} course${
                                        courseProgress.length === 1 ? "" : "s"
                                    } started`,
                                },
                                {
                                    label: "Quiz average",
                                    value:
                                        averageQuizScore === null
                                            ? "—"
                                            : `${averageQuizScore}%`,
                                    detail: attemptedQuizScores.length
                                        ? `${
                                              attemptedQuizScores.length
                                          } recorded attempt${
                                              attemptedQuizScores.length === 1
                                                  ? ""
                                                  : "s"
                                          }`
                                        : "No scored attempts yet",
                                },
                                {
                                    label: "Learning streak",
                                    value: `${summary.streak.currentDays} day${
                                        summary.streak.currentDays === 1
                                            ? ""
                                            : "s"
                                    }`,
                                    detail: `Longest: ${
                                        summary.streak.longestDays
                                    } day${
                                        summary.streak.longestDays === 1
                                            ? ""
                                            : "s"
                                    }`,
                                },
                            ].map((stat) => (
                                <article
                                    key={stat.label}
                                    className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-4"
                                >
                                    <p className="text-sm text-medium-grey">
                                        {stat.label}
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-white">
                                        {stat.value}
                                    </p>
                                    <p className="mt-2 text-xs leading-5 text-medium-grey">
                                        {stat.detail}
                                    </p>
                                </article>
                            ))}
                        </section>

                        <section className="mt-8 rounded-2xl border border-white/10 bg-dark-grey-secondary p-5">
                            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                                <div>
                                    <h2 className="text-xl font-bold text-white">
                                        Last 7 days
                                    </h2>
                                    <p className="mt-1 text-sm text-medium-grey">
                                        Only active learning interactions are
                                        counted.
                                    </p>
                                </div>
                                <CourseBadge tone="blue">
                                    {formatTime(weeklySeconds)} total
                                </CourseBadge>
                            </div>
                            <div
                                className="mt-6 grid h-48 grid-cols-7 items-end gap-2"
                                role="img"
                                aria-label={`Seven-day learning activity. ${week
                                    .map(
                                        (day) =>
                                            `${day.fullLabel}: ${formatTime(
                                                day.seconds
                                            )}`
                                    )
                                    .join("; ")}`}
                            >
                                {week.map((day) => {
                                    const height =
                                        day.seconds > 0
                                            ? Math.max(
                                                  8,
                                                  (day.seconds /
                                                      maxDailySeconds) *
                                                      100
                                              )
                                            : 3;
                                    return (
                                        <div
                                            key={day.key}
                                            className="flex h-full min-w-0 flex-col justify-end"
                                        >
                                            <div className="flex flex-1 items-end">
                                                <div
                                                    className="w-full rounded-t-md bg-gradient-to-t from-brand-purple-primary to-brand-purple-secondary motion-safe:transition-[height] motion-reduce:transition-none"
                                                    style={{
                                                        height: `${height}%`,
                                                    }}
                                                    title={`${
                                                        day.fullLabel
                                                    }: ${formatTime(
                                                        day.seconds
                                                    )}`}
                                                />
                                            </div>
                                            <span className="mt-2 truncate text-center text-[11px] text-medium-grey">
                                                {day.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        <section className="mt-8">
                            <div className="flex items-end justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        Course progress
                                    </h2>
                                    <p className="mt-1 text-sm text-medium-grey">
                                        Requirements, activity, and resume
                                        positions come from the local learning
                                        record.
                                    </p>
                                </div>
                                <Link
                                    href="/courses"
                                    className="shrink-0 text-sm font-semibold text-brand-purple-secondary outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                                >
                                    Browse courses
                                </Link>
                            </div>

                            {courseProgress.length ? (
                                <div className="mt-4 grid gap-4 xl:grid-cols-2">
                                    {courseProgress.map(
                                        ({ course, progress }) => {
                                            const resumeLesson = progress.resume
                                                ? course.modules
                                                      .flatMap(
                                                          (module) =>
                                                              module.lessons
                                                      )
                                                      .find(
                                                          (lesson) =>
                                                              lesson.id ===
                                                              progress.resume
                                                                  ?.lessonId
                                                      )
                                                : undefined;
                                            const firstLesson =
                                                course.modules[0]?.lessons[0];
                                            const continueLesson =
                                                resumeLesson || firstLesson;
                                            return (
                                                <article
                                                    key={course.id}
                                                    className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-5"
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-purple-secondary">
                                                                {state
                                                                    .enrollments[
                                                                    course.id
                                                                ]?.pacing ||
                                                                    "self-paced"}
                                                            </p>
                                                            <h3 className="mt-1 text-lg font-bold text-white">
                                                                {course.title}
                                                            </h3>
                                                        </div>
                                                        <CourseBadge
                                                            tone={
                                                                progress.percentage ===
                                                                100
                                                                    ? "green"
                                                                    : "purple"
                                                            }
                                                        >
                                                            {
                                                                progress.percentage
                                                            }
                                                            %
                                                        </CourseBadge>
                                                    </div>
                                                    <div className="mt-5">
                                                        <LearningProgressBar
                                                            value={
                                                                progress.percentage
                                                            }
                                                            label={`${course.title} requirements`}
                                                        />
                                                    </div>
                                                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                                        <div className="rounded-xl bg-dark-grey-primary/40 p-3">
                                                            <dt className="text-xs text-medium-grey">
                                                                Lessons
                                                            </dt>
                                                            <dd className="mt-1 font-bold text-white">
                                                                {
                                                                    progress.completedLessons
                                                                }
                                                                /
                                                                {
                                                                    progress.totalLessons
                                                                }
                                                            </dd>
                                                        </div>
                                                        <div className="rounded-xl bg-dark-grey-primary/40 p-3">
                                                            <dt className="text-xs text-medium-grey">
                                                                Assignments
                                                            </dt>
                                                            <dd className="mt-1 font-bold text-white">
                                                                {
                                                                    progress.submittedAssignments
                                                                }
                                                                /
                                                                {
                                                                    progress.totalAssignments
                                                                }
                                                            </dd>
                                                        </div>
                                                        <div className="rounded-xl bg-dark-grey-primary/40 p-3">
                                                            <dt className="text-xs text-medium-grey">
                                                                Active time
                                                            </dt>
                                                            <dd className="mt-1 font-bold text-white">
                                                                {formatTime(
                                                                    progress.activeSeconds
                                                                )}
                                                            </dd>
                                                        </div>
                                                        <div className="rounded-xl bg-dark-grey-primary/40 p-3">
                                                            <dt className="text-xs text-medium-grey">
                                                                Last activity
                                                            </dt>
                                                            <dd className="mt-1 font-bold text-white">
                                                                {formatDate(
                                                                    progress.lastActivityAt
                                                                )}
                                                            </dd>
                                                        </div>
                                                    </dl>
                                                    <div className="mt-5 flex flex-wrap gap-2">
                                                        {continueLesson && (
                                                            <Link
                                                                href={`/learn/courses/${course.slug}/lessons/${continueLesson.slug}`}
                                                                className="inline-flex min-h-[44px] items-center rounded-xl bg-brand-purple-primary px-4 py-2 text-sm font-semibold text-white outline-none hover:bg-brand-purple-secondary focus-visible:ring-2 focus-visible:ring-white"
                                                            >
                                                                {resumeLesson
                                                                    ? "Resume lesson"
                                                                    : "Start course"}
                                                            </Link>
                                                        )}
                                                        <Link
                                                            href={`/courses/${course.slug}`}
                                                            className="inline-flex min-h-[44px] items-center rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-[#D6D3DC] outline-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                                                        >
                                                            Course overview
                                                        </Link>
                                                    </div>
                                                </article>
                                            );
                                        }
                                    )}
                                </div>
                            ) : (
                                <div className="mt-4 rounded-2xl border border-dashed border-white/20 bg-white/[0.03] p-8 text-center">
                                    <h3 className="font-bold text-white">
                                        No course progress yet
                                    </h3>
                                    <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-medium-grey">
                                        Start any free course and complete a
                                        lesson. Your progress will appear here
                                        automatically on this device.
                                    </p>
                                    <Link
                                        href="/courses"
                                        className="mt-4 inline-flex min-h-[44px] items-center rounded-xl bg-brand-purple-primary px-5 py-2 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                                    >
                                        Find a free course
                                    </Link>
                                </div>
                            )}
                        </section>
                    </>
                )}
            </LearnerShell>
        </>
    );
};

export default ProgressPage;
