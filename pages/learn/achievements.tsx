import type { Role } from "@prisma/client";
import CourseBadge from "@components/Learning/CourseBadge";
import LearnerShell from "@components/Learning/LearnerShell";
import { buildLearnerNavigation } from "@components/Learning/learnerNavigation";
import { requireAuth } from "lib/guards";
import { getLearnerSnapshot, type LearnerSnapshot } from "lib/learner";
import prisma from "lib/prisma";
import Head from "next/head";
import Link from "next/link";
import React from "react";

interface AchievementsProps {
    role: Role;
    snapshot: LearnerSnapshot;
    recentPoints: Array<{
        id: string;
        reason: string;
        points: number;
        at: string;
    }>;
    /** Learners who opt out see a plain progress summary instead. */
    reduceGamification: boolean;
}

const formatDate = (value: string) =>
    new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
    }).format(new Date(value));

const AchievementsPage: React.FC<AchievementsProps> = ({
    role,
    snapshot,
    recentPoints,
    reduceGamification,
}) => {
    const { summary, badges } = snapshot;

    const navigation = buildLearnerNavigation({
        role,
        badges: summary.badgeCount,
        certificates: snapshot.certificates.length,
    });

    return (
        <>
            <Head>
                <title>Achievements | C4T Learning</title>
                <meta name="robots" content="noindex" />
            </Head>
            <LearnerShell
                title="Achievements"
                description="Points and badges are awarded for finishing real work — completing lessons, passing checkpoints, and getting projects approved."
                activeItemId="achievements"
                navigation={navigation}
            >
                {reduceGamification ? (
                    <div className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-6">
                        <h2 className="text-xl font-bold text-white">
                            Gamification is turned off
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-[#C7C3CE]">
                            You chose a simpler experience, so points, badges,
                            and streaks are hidden. You have completed{" "}
                            <strong className="text-white">
                                {summary.completedLessons} lessons
                            </strong>{" "}
                            across{" "}
                            <strong className="text-white">
                                {snapshot.courses.length} courses
                            </strong>
                            .
                        </p>
                        <Link
                            href="/learn/settings"
                            className="mt-4 inline-flex min-h-[44px] items-center rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white outline-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                        >
                            Change this in settings
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <section aria-labelledby="stats-title">
                            <h2
                                id="stats-title"
                                className="text-xl font-bold text-white"
                            >
                                Your totals
                            </h2>
                            <dl className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                {[
                                    ["Points", `${summary.points}`],
                                    ["Badges", `${summary.badgeCount}`],
                                    [
                                        "Current streak",
                                        `${summary.currentStreak} days`,
                                    ],
                                    [
                                        "Longest streak",
                                        `${summary.longestStreak} days`,
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

                        <section aria-labelledby="badges-title">
                            <h2
                                id="badges-title"
                                className="text-xl font-bold text-white"
                            >
                                Badges earned
                            </h2>
                            {badges.length === 0 ? (
                                <p className="mt-3 rounded-2xl border border-dashed border-white/20 bg-white/[0.03] p-6 text-sm text-medium-grey">
                                    No badges yet. Completing a course earns
                                    your first one.
                                </p>
                            ) : (
                                <ul className="mt-3 grid list-none gap-3 pl-0 sm:grid-cols-2">
                                    {badges.map((badge) => (
                                        <li
                                            key={`${badge.id}-${badge.courseId}`}
                                            className="rounded-xl border border-white/10 bg-dark-grey-secondary p-4"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span
                                                    aria-hidden="true"
                                                    className="text-xl"
                                                >
                                                    ★
                                                </span>
                                                <h3 className="font-bold text-white">
                                                    {badge.title}
                                                </h3>
                                            </div>
                                            <p className="mt-1.5 text-sm leading-6 text-[#C7C3CE]">
                                                {badge.description}
                                            </p>
                                            <p className="mt-2 text-xs text-medium-grey">
                                                Earned{" "}
                                                {formatDate(badge.awardedAt)}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>

                        <section aria-labelledby="points-title">
                            <h2
                                id="points-title"
                                className="text-xl font-bold text-white"
                            >
                                Recent points
                            </h2>
                            {recentPoints.length === 0 ? (
                                <p className="mt-3 text-sm text-medium-grey">
                                    Complete a lesson to earn your first points.
                                </p>
                            ) : (
                                <ul className="mt-3 list-none space-y-2 pl-0">
                                    {recentPoints.map((entry) => (
                                        <li
                                            key={entry.id}
                                            className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-dark-grey-secondary px-4 py-3"
                                        >
                                            <span className="text-sm text-[#D6D3DC]">
                                                {entry.reason}
                                            </span>
                                            <span className="flex shrink-0 items-center gap-3">
                                                <CourseBadge tone="purple">
                                                    +{entry.points}
                                                </CourseBadge>
                                                <span className="text-xs text-medium-grey">
                                                    {formatDate(entry.at)}
                                                </span>
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    </div>
                )}
            </LearnerShell>
        </>
    );
};

export const getServerSideProps = requireAuth<AchievementsProps>(
    async ({ userId, role }) => {
        const [snapshot, points] = await Promise.all([
            getLearnerSnapshot(userId),
            prisma.pointTransaction.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                take: 20,
            }),
        ]);

        return {
            props: {
                role,
                snapshot: JSON.parse(
                    JSON.stringify(snapshot)
                ) as LearnerSnapshot,
                recentPoints: points.map((entry) => ({
                    id: entry.id,
                    reason: entry.reason,
                    points: entry.points,
                    at: entry.createdAt.toISOString(),
                })),
                reduceGamification: Boolean(
                    snapshot.profile?.reduceGamification
                ),
            },
        };
    }
);

export default AchievementsPage;
