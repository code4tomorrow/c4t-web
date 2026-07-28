import clsx from "clsx";
import React from "react";
import type {
    CourseBadgeItem,
    CourseBadgeTone,
    CourseDifficulty,
} from "./types";

const toneClasses: Record<CourseBadgeTone, string> = {
    purple: "border-brand-purple-primary/70 bg-brand-purple-primary/20 text-[#D8D3FF]",
    blue: "border-brand-purple-secondary/70 bg-brand-purple-secondary/20 text-[#DCE4FF]",
    green: "border-emerald-500/50 bg-emerald-500/10 text-emerald-200",
    amber: "border-amber-500/50 bg-amber-500/10 text-amber-200",
    grey: "border-dim-grey/70 bg-dark-grey-accent text-[#D6D3DC]",
};

export interface CourseBadgeProps {
    children: React.ReactNode;
    tone?: CourseBadgeTone;
    icon?: React.ReactNode;
    description?: string;
    className?: string;
}

export const CourseBadge: React.FC<CourseBadgeProps> = ({
    children,
    tone = "purple",
    icon,
    description,
    className,
}) => {
    return (
        <span
            title={description}
            className={clsx(
                "inline-flex min-h-[28px] items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
                toneClasses[tone],
                className
            )}
        >
            {icon && <span aria-hidden="true">{icon}</span>}
            <span>{children}</span>
        </span>
    );
};

const difficultyTone: Record<CourseDifficulty, CourseBadgeTone> = {
    "Absolute beginner": "green",
    Beginner: "green",
    "Beginner to intermediate": "blue",
    Intermediate: "blue",
    "Advanced intermediate": "amber",
    Advanced: "amber",
};

export interface DifficultyBadgeProps {
    difficulty: CourseDifficulty;
    className?: string;
}

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({
    difficulty,
    className,
}) => (
    <CourseBadge
        tone={difficultyTone[difficulty]}
        description={`Course difficulty: ${difficulty}`}
        className={className}
    >
        {difficulty}
    </CourseBadge>
);

export interface CourseChipListProps {
    items: CourseBadgeItem[];
    label?: string;
    className?: string;
}

export const CourseChipList: React.FC<CourseChipListProps> = ({
    items,
    label = "Course details",
    className,
}) => {
    if (!items.length) return null;

    return (
        <ul
            aria-label={label}
            className={clsx("flex flex-wrap gap-2", className)}
        >
            {items.map((item) => (
                <li key={item.id}>
                    <CourseBadge
                        tone={item.tone}
                        icon={item.icon}
                        description={item.description}
                    >
                        {item.label}
                    </CourseBadge>
                </li>
            ))}
        </ul>
    );
};

export default CourseBadge;
