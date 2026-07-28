import clsx from "clsx";
import React from "react";
import { CourseBadge } from "./CourseBadge";

const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

export interface LearningProgressBarProps {
    value: number;
    max?: number;
    label?: string;
    showValue?: boolean;
    compact?: boolean;
    className?: string;
}

export const LearningProgressBar: React.FC<LearningProgressBarProps> = ({
    value,
    max = 100,
    label = "Course progress",
    showValue = true,
    compact = false,
    className,
}) => {
    const safeMax = max > 0 ? max : 100;
    const safeValue = clamp(value, 0, safeMax);
    const percentage = Math.round((safeValue / safeMax) * 100);

    return (
        <div className={clsx("w-full", className)}>
            {(label || showValue) && (
                <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                    <span className="font-medium text-[#D6D3DC]">{label}</span>
                    {showValue && (
                        <span className="font-bold tabular-nums text-white">
                            {percentage}%
                        </span>
                    )}
                </div>
            )}
            <div
                role="progressbar"
                aria-label={label}
                aria-valuemin={0}
                aria-valuemax={safeMax}
                aria-valuenow={safeValue}
                aria-valuetext={`${percentage}% complete`}
                className={clsx(
                    "w-full overflow-hidden rounded-full bg-dark-grey-primary ring-1 ring-inset ring-white/10",
                    compact ? "h-1.5" : "h-2.5"
                )}
            >
                <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-purple-primary to-brand-purple-secondary motion-safe:transition-[width] motion-safe:duration-500 motion-reduce:transition-none"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

export interface LearningProgressCardProps {
    courseTitle: string;
    currentItem?: string;
    description?: string;
    progress: number;
    completedLessons?: number;
    totalLessons?: number;
    estimatedMinutesRemaining?: number;
    currentStreak?: number;
    lastActivity?: string;
    href?: string;
    actionLabel?: string;
    onContinue?: () => void;
    className?: string;
}

const LearningProgressCard: React.FC<LearningProgressCardProps> = ({
    courseTitle,
    currentItem,
    description,
    progress,
    completedLessons,
    totalLessons,
    estimatedMinutesRemaining,
    currentStreak,
    lastActivity,
    href,
    actionLabel = "Continue learning",
    onContinue,
    className,
}) => {
    const actionClasses =
        "inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-gradient-to-b from-brand-purple-primary to-brand-purple-secondary px-4 py-2.5 text-sm font-bold text-white outline-none motion-safe:transition-[filter,transform] hover:brightness-110 focus-visible:ring-2 focus-visible:ring-brand-purple-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-dark-grey-secondary active:translate-y-px sm:w-auto";

    return (
        <article
            className={clsx(
                "rounded-2xl border border-white/10 bg-dark-grey-secondary p-4 shadow-[0_18px_50px_rgba(0,0,0,0.2)] sm:p-5",
                className
            )}
        >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <CourseBadge tone="purple">In progress</CourseBadge>
                        {currentStreak !== undefined && currentStreak > 0 && (
                            <CourseBadge
                                tone="amber"
                                description={`${currentStreak}-day learning streak`}
                            >
                                {currentStreak} day streak
                            </CourseBadge>
                        )}
                    </div>
                    <h3 className="mt-3 text-xl font-bold text-white sm:text-2xl">
                        {courseTitle}
                    </h3>
                    {currentItem && (
                        <p className="mt-1 font-semibold text-brand-purple-secondary">
                            Next: {currentItem}
                        </p>
                    )}
                    {description && (
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#C7C3CE]">
                            {description}
                        </p>
                    )}

                    <div className="mt-5">
                        <LearningProgressBar value={progress} />
                    </div>

                    <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                        {completedLessons !== undefined &&
                            totalLessons !== undefined && (
                                <div className="flex gap-1">
                                    <dt className="text-medium-grey">
                                        Lessons:
                                    </dt>
                                    <dd className="font-semibold text-white">
                                        {completedLessons}/{totalLessons}
                                    </dd>
                                </div>
                            )}
                        {estimatedMinutesRemaining !== undefined && (
                            <div className="flex gap-1">
                                <dt className="text-medium-grey">Time left:</dt>
                                <dd className="font-semibold text-white">
                                    {estimatedMinutesRemaining} min
                                </dd>
                            </div>
                        )}
                        {lastActivity && (
                            <div className="flex gap-1">
                                <dt className="text-medium-grey">
                                    Last activity:
                                </dt>
                                <dd className="font-semibold text-white">
                                    {lastActivity}
                                </dd>
                            </div>
                        )}
                    </dl>
                </div>

                {(href || onContinue) && (
                    <div className="shrink-0">
                        {href ? (
                            <a className={actionClasses} href={href}>
                                {actionLabel}
                            </a>
                        ) : (
                            <button
                                className={actionClasses}
                                type="button"
                                onClick={onContinue}
                            >
                                {actionLabel}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </article>
    );
};

export default LearningProgressCard;
