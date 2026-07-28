"use client";

import CourseBadge from "@components/Learning/CourseBadge";
import LearnerShell, {
    LearnerNavigationItem,
} from "@components/Learning/LearnerShell";
import { useLearningProgress } from "hooks/useLearningProgress";
import { courseRegistry } from "learning/course-registry";
import Head from "next/head";
import Link from "next/link";
import React, { useMemo } from "react";

const builtInBadges = [
    {
        id: "first-steps",
        icon: "↗",
        title: "First Steps",
        description: "Complete your first lesson.",
    },
    {
        id: "focused-hour",
        icon: "◷",
        title: "Focused Hour",
        description: "Record one active hour of learning.",
    },
    {
        id: "quiz-ace",
        icon: "✓",
        title: "Quiz Ace",
        description: "Earn a perfect checkpoint score.",
    },
    {
        id: "three-day-streak",
        icon: "✦",
        title: "Momentum",
        description: "Learn on three consecutive days.",
    },
    {
        id: "seven-day-streak",
        icon: "★",
        title: "Week of Learning",
        description: "Learn on seven consecutive days.",
    },
] as const;

const formatDate = (value: string) => {
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp)
        ? "Recently"
        : new Intl.DateTimeFormat(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
          }).format(new Date(timestamp));
};

const AchievementsPage: React.FC = () => {
    const { state, summary, hydrated } = useLearningProgress();
    const earnedBadges = Object.entries(state.badges);
    const recentPoints = useMemo(
        () =>
            state.pointEvents
                .slice()
                .sort(
                    (left, right) =>
                        Date.parse(right.awardedAt) - Date.parse(left.awardedAt)
                )
                .slice(0, 20),
        [state.pointEvents]
    );
    const courseTitle = (courseId?: string) =>
        courseRegistry.find((course) => course.id === courseId)?.title;

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

    return (
        <>
            <Head>
                <title>Achievements | C4T Learning</title>
                <meta
                    name="description"
                    content="Review learning points, badges, and streaks earned through meaningful course work."
                />
                <meta name="robots" content="noindex" />
            </Head>
            <LearnerShell
                title="Achievements"
                description="Private encouragement for meaningful learning—there is no public leaderboard and no point farming."
                activeItemId="achievements"
                navigation={navigation}
            >
                {!hydrated ? (
                    <div
                        role="status"
                        className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-6 text-medium-grey"
                    >
                        Loading achievements…
                    </div>
                ) : (
                    <>
                        <section
                            aria-label="Achievement totals"
                            className="grid gap-3 sm:grid-cols-3"
                        >
                            {[
                                {
                                    label: "Learning points",
                                    value: summary.points,
                                    detail: "Awarded once for completed work",
                                },
                                {
                                    label: "Badges earned",
                                    value: summary.badgeCount,
                                    detail: "Saved on this device",
                                },
                                {
                                    label: "Longest streak",
                                    value: `${summary.streak.longestDays}d`,
                                    detail: `Current: ${
                                        summary.streak.currentDays
                                    } day${
                                        summary.streak.currentDays === 1
                                            ? ""
                                            : "s"
                                    }`,
                                },
                            ].map((stat) => (
                                <article
                                    key={stat.label}
                                    className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-5"
                                >
                                    <p className="text-sm text-medium-grey">
                                        {stat.label}
                                    </p>
                                    <p className="mt-1 text-3xl font-bold text-white">
                                        {stat.value}
                                    </p>
                                    <p className="mt-2 text-xs text-medium-grey">
                                        {stat.detail}
                                    </p>
                                </article>
                            ))}
                        </section>

                        <section className="mt-8" aria-labelledby="badge-title">
                            <div className="flex items-end justify-between gap-4">
                                <div>
                                    <h2
                                        id="badge-title"
                                        className="text-2xl font-bold text-white"
                                    >
                                        Badge collection
                                    </h2>
                                    <p className="mt-1 text-sm text-medium-grey">
                                        Locked badges explain the next genuine
                                        milestone.
                                    </p>
                                </div>
                                <CourseBadge tone="purple">
                                    {summary.badgeCount} earned
                                </CourseBadge>
                            </div>
                            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {builtInBadges.map((badge) => {
                                    const earnedEntry = earnedBadges.find(
                                        ([, award]) =>
                                            award.badgeId === badge.id
                                    );
                                    const earned = Boolean(earnedEntry);
                                    return (
                                        <article
                                            key={badge.id}
                                            className={`rounded-2xl border p-5 ${
                                                earned
                                                    ? "border-brand-purple-secondary/40 bg-gradient-to-br from-brand-purple-primary/20 to-dark-grey-secondary"
                                                    : "border-white/10 bg-dark-grey-secondary opacity-70"
                                            }`}
                                        >
                                            <span
                                                aria-hidden="true"
                                                className={`flex h-12 w-12 items-center justify-center rounded-full text-xl ${
                                                    earned
                                                        ? "bg-brand-purple-secondary/20 text-[#DCE4FF]"
                                                        : "bg-dark-grey-primary text-dim-grey"
                                                }`}
                                            >
                                                {badge.icon}
                                            </span>
                                            <div className="mt-4 flex items-start justify-between gap-2">
                                                <h3 className="font-bold text-white">
                                                    {badge.title}
                                                </h3>
                                                <CourseBadge
                                                    tone={
                                                        earned
                                                            ? "green"
                                                            : "grey"
                                                    }
                                                >
                                                    {earned
                                                        ? "Earned"
                                                        : "Locked"}
                                                </CourseBadge>
                                            </div>
                                            <p className="mt-2 text-sm leading-6 text-medium-grey">
                                                {badge.description}
                                            </p>
                                            {earnedEntry && (
                                                <time
                                                    dateTime={
                                                        earnedEntry[1].awardedAt
                                                    }
                                                    className="mt-3 block text-xs text-[#C7C3CE]"
                                                >
                                                    Earned{" "}
                                                    {formatDate(
                                                        earnedEntry[1].awardedAt
                                                    )}
                                                </time>
                                            )}
                                        </article>
                                    );
                                })}

                                {earnedBadges
                                    .filter(
                                        ([, award]) =>
                                            !builtInBadges.some(
                                                (badge) =>
                                                    badge.id === award.badgeId
                                            )
                                    )
                                    .map(([key, award]) => (
                                        <article
                                            key={key}
                                            className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.07] p-5"
                                        >
                                            <span
                                                aria-hidden="true"
                                                className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-xl text-emerald-200"
                                            >
                                                ★
                                            </span>
                                            <h3 className="mt-4 font-bold text-white">
                                                {award.title}
                                            </h3>
                                            <p className="mt-2 text-sm leading-6 text-medium-grey">
                                                {award.description}
                                            </p>
                                            {courseTitle(award.courseId) && (
                                                <p className="mt-2 text-xs text-emerald-100">
                                                    {courseTitle(
                                                        award.courseId
                                                    )}
                                                </p>
                                            )}
                                            <time
                                                dateTime={award.awardedAt}
                                                className="mt-2 block text-xs text-[#C7C3CE]"
                                            >
                                                Earned{" "}
                                                {formatDate(award.awardedAt)}
                                            </time>
                                        </article>
                                    ))}
                            </div>
                        </section>

                        <section
                            className="mt-8 rounded-2xl border border-white/10 bg-dark-grey-secondary p-5"
                            aria-labelledby="points-title"
                        >
                            <h2
                                id="points-title"
                                className="text-xl font-bold text-white"
                            >
                                Points history
                            </h2>
                            <p className="mt-1 text-sm text-medium-grey">
                                Each entry is tied to actual recorded learning
                                activity.
                            </p>
                            {recentPoints.length ? (
                                <ol className="mt-4 divide-y divide-white/10">
                                    {recentPoints.map((event) => (
                                        <li
                                            key={event.id}
                                            className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                                        >
                                            <div>
                                                <p className="text-sm font-semibold text-white">
                                                    {event.reason}
                                                </p>
                                                <p className="mt-1 text-xs text-medium-grey">
                                                    {courseTitle(
                                                        event.courseId
                                                    ) ||
                                                        "Learning milestone"}{" "}
                                                    ·{" "}
                                                    {formatDate(
                                                        event.awardedAt
                                                    )}
                                                </p>
                                            </div>
                                            <span className="shrink-0 text-sm font-bold text-emerald-200">
                                                +{event.points}
                                            </span>
                                        </li>
                                    ))}
                                </ol>
                            ) : (
                                <div className="mt-4 rounded-xl border border-dashed border-white/15 p-6 text-center">
                                    <p className="font-semibold text-white">
                                        No points yet
                                    </p>
                                    <p className="mt-1 text-sm text-medium-grey">
                                        Complete a lesson or pass a checkpoint
                                        to begin.
                                    </p>
                                    <Link
                                        href="/courses"
                                        className="mt-4 inline-flex min-h-[44px] items-center rounded-xl bg-brand-purple-primary px-4 py-2 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                                    >
                                        Start learning
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

export default AchievementsPage;
