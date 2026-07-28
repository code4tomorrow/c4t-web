"use client";

import clsx from "clsx";
import React, { useMemo } from "react";
import { useLearningProgress } from "../../hooks/useLearningProgress";
import { badgeAwardKey } from "@utils/learning/state";

export interface AchievementDefinition {
    badgeId: string;
    title: string;
    description: string;
    courseId?: string;
}

export interface AchievementsPanelProps {
    achievements?: AchievementDefinition[];
    className?: string;
}

const defaultAchievements: AchievementDefinition[] = [
    {
        badgeId: "first-steps",
        title: "First Steps",
        description: "Complete your first lesson.",
    },
    {
        badgeId: "focused-hour",
        title: "Focused Hour",
        description: "Spend one active hour learning.",
    },
    {
        badgeId: "quiz-ace",
        title: "Quiz Ace",
        description: "Earn a perfect quiz score.",
    },
    {
        badgeId: "three-day-streak",
        title: "Momentum",
        description: "Learn on three consecutive days.",
    },
    {
        badgeId: "seven-day-streak",
        title: "Week of Learning",
        description: "Learn on seven consecutive days.",
    },
];

const AchievementsPanel: React.FC<AchievementsPanelProps> = ({
    achievements = defaultAchievements,
    className,
}) => {
    const { state, summary, hydrated } = useLearningProgress();
    const entries = useMemo(() => {
        const catalog = new Map(
            achievements.map((achievement) => [
                badgeAwardKey(achievement.badgeId, achievement.courseId),
                achievement,
            ])
        );

        Object.entries(state.badges).forEach(([key, award]) => {
            if (!catalog.has(key)) {
                catalog.set(key, {
                    badgeId: award.badgeId,
                    courseId: award.courseId,
                    title: award.title,
                    description: award.description,
                });
            }
        });

        return Array.from(catalog.entries())
            .map(([key, definition]) => ({
                definition,
                award: state.badges[key],
            }))
            .sort((left, right) => {
                if (left.award && !right.award) return -1;
                if (!left.award && right.award) return 1;
                return left.definition.title.localeCompare(
                    right.definition.title
                );
            });
    }, [achievements, state.badges]);

    if (!hydrated) {
        return (
            <div className="text-sm text-medium-grey" role="status">
                Loading achievements saved on this device…
            </div>
        );
    }

    return (
        <section
            className={className}
            aria-labelledby="learning-achievements-heading"
        >
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h2
                        id="learning-achievements-heading"
                        className="text-2xl font-bold text-white"
                    >
                        Achievements
                    </h2>
                    <p className="mt-1 text-sm text-medium-grey">
                        Badges and points are saved locally and are not a public
                        ranking.
                    </p>
                </div>
                <dl className="flex gap-5 rounded-xl border border-white/10 bg-dark-grey-secondary px-4 py-3">
                    <div>
                        <dt className="text-xs text-medium-grey">Points</dt>
                        <dd className="font-bold text-white">
                            {summary.points}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs text-medium-grey">Badges</dt>
                        <dd className="font-bold text-white">
                            {summary.badgeCount}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs text-medium-grey">
                            Best streak
                        </dt>
                        <dd className="font-bold text-white">
                            {summary.streak.longestDays}d
                        </dd>
                    </div>
                </dl>
            </div>

            <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {entries.map(({ definition, award }) => (
                    <li
                        key={badgeAwardKey(
                            definition.badgeId,
                            definition.courseId
                        )}
                        className={clsx(
                            "rounded-2xl border p-4",
                            award
                                ? "border-brand-purple-secondary/40 bg-brand-purple-primary/15"
                                : "border-white/10 bg-dark-grey-secondary opacity-70"
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <span
                                aria-hidden="true"
                                className={clsx(
                                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl",
                                    award
                                        ? "bg-brand-purple-primary text-white"
                                        : "bg-white/5 text-medium-grey"
                                )}
                            >
                                {award ? "★" : "○"}
                            </span>
                            <div>
                                <h3 className="font-bold text-white">
                                    {definition.title}
                                </h3>
                                <p className="mt-1 text-sm text-medium-grey">
                                    {definition.description}
                                </p>
                                <p className="mt-2 text-xs font-semibold text-brand-purple-secondary">
                                    {award
                                        ? `Earned ${new Intl.DateTimeFormat(
                                              undefined,
                                              {
                                                  month: "short",
                                                  day: "numeric",
                                                  year: "numeric",
                                              }
                                          ).format(new Date(award.awardedAt))}`
                                        : "Not earned yet"}
                                </p>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default AchievementsPanel;
