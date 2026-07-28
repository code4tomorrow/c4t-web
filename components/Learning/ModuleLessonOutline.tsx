"use client";

import clsx from "clsx";
import React, { useEffect, useId, useMemo, useState } from "react";
import { LearningProgressBar } from "./LearningProgress";
import type {
    LessonOutlineItem,
    LessonStatus,
    ModuleOutlineItem,
} from "./types";

export interface ModuleLessonOutlineProps {
    modules: ModuleOutlineItem[];
    currentLessonId?: string;
    onLessonSelect?: (lesson: LessonOutlineItem) => void;
    title?: string;
    showDescriptions?: boolean;
    className?: string;
}

const statusText: Record<LessonStatus, string> = {
    "not-started": "Not started",
    "in-progress": "In progress",
    complete: "Complete",
    locked: "Locked",
};

const statusClasses: Record<LessonStatus, string> = {
    "not-started": "border-dim-grey/60 text-medium-grey",
    "in-progress":
        "border-brand-purple-secondary/60 bg-brand-purple-secondary/10 text-[#DCE4FF]",
    complete: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
    locked: "border-dim-grey/40 bg-dark-grey-primary/30 text-dim-grey",
};

const ModuleLessonOutline: React.FC<ModuleLessonOutlineProps> = ({
    modules,
    currentLessonId,
    onLessonSelect,
    title = "Course outline",
    showDescriptions = true,
    className,
}) => {
    const baseId = useId();
    const initialExpanded = useMemo(
        () =>
            new Set(
                modules
                    .filter(
                        (module) =>
                            module.initiallyExpanded ||
                            module.lessons.some(
                                (lesson) => lesson.id === currentLessonId
                            )
                    )
                    .map((module) => module.id)
            ),
        [currentLessonId, modules]
    );
    const [expandedModuleIds, setExpandedModuleIds] =
        useState<Set<string>>(initialExpanded);

    useEffect(() => {
        setExpandedModuleIds((previous) => {
            const missingRequiredModule = Array.from(initialExpanded).some(
                (moduleId) => !previous.has(moduleId)
            );
            if (!missingRequiredModule) return previous;

            const next = new Set(previous);
            initialExpanded.forEach((moduleId) => next.add(moduleId));
            return next;
        });
    }, [initialExpanded]);

    const toggleModule = (moduleId: string) => {
        setExpandedModuleIds((previous) => {
            const next = new Set(previous);
            next.has(moduleId) ? next.delete(moduleId) : next.add(moduleId);
            return next;
        });
    };

    return (
        <nav
            aria-labelledby={`${baseId}-title`}
            className={clsx(
                "w-full overflow-hidden rounded-2xl border border-white/10 bg-dark-grey-secondary",
                className
            )}
        >
            <header className="border-b border-white/10 p-4 sm:p-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-purple-secondary">
                    Learn in order or review anytime
                </p>
                <h2
                    id={`${baseId}-title`}
                    className="mt-1 text-xl font-bold text-white"
                >
                    {title}
                </h2>
                <p className="mt-1 text-sm text-medium-grey">
                    {modules.length}{" "}
                    {modules.length === 1 ? "module" : "modules"} ·{" "}
                    {modules.reduce(
                        (total, module) => total + module.lessons.length,
                        0
                    )}{" "}
                    lessons
                </p>
            </header>

            {!modules.length ? (
                <p className="p-5 text-sm text-[#C7C3CE]">
                    This course outline is being prepared.
                </p>
            ) : (
                <ol className="divide-y divide-white/10">
                    {modules.map((module, moduleIndex) => {
                        const expanded = expandedModuleIds.has(module.id);
                        const panelId = `${baseId}-module-${moduleIndex}`;
                        const completedLessons = module.lessons.filter(
                            (lesson) => lesson.status === "complete"
                        ).length;
                        const moduleProgress = module.lessons.length
                            ? (completedLessons / module.lessons.length) * 100
                            : 0;

                        return (
                            <li key={module.id}>
                                <button
                                    type="button"
                                    aria-expanded={expanded}
                                    aria-controls={panelId}
                                    onClick={() => toggleModule(module.id)}
                                    className="flex min-h-[64px] w-full items-start gap-3 p-4 text-left outline-none motion-safe:transition-colors hover:bg-white/[0.03] focus-visible:bg-brand-purple-primary/10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-purple-secondary sm:p-5"
                                >
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-purple-primary/25 text-sm font-bold text-[#D8D3FF]">
                                        {moduleIndex + 1}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block font-bold text-white">
                                            {module.title}
                                        </span>
                                        {showDescriptions &&
                                            module.description && (
                                                <span className="mt-1 block text-sm leading-5 text-medium-grey">
                                                    {module.description}
                                                </span>
                                            )}
                                        <span className="mt-2 block">
                                            <LearningProgressBar
                                                value={moduleProgress}
                                                label={`${module.title} progress`}
                                                showValue={false}
                                                compact
                                            />
                                        </span>
                                    </span>
                                    <span
                                        aria-hidden="true"
                                        className={clsx(
                                            "mt-1 text-xl text-brand-purple-secondary motion-safe:transition-transform motion-reduce:transition-none",
                                            expanded && "rotate-180"
                                        )}
                                    >
                                        ⌄
                                    </span>
                                </button>

                                <div
                                    id={panelId}
                                    hidden={!expanded}
                                    className="border-t border-white/[0.07] bg-dark-grey-primary/25 px-3 pb-3 sm:px-5 sm:pb-5"
                                >
                                    <ol className="pt-2">
                                        {module.lessons.map(
                                            (lesson, lessonIndex) => {
                                                const status =
                                                    lesson.status ||
                                                    "not-started";
                                                const current =
                                                    lesson.id ===
                                                    currentLessonId;
                                                const locked =
                                                    status === "locked";
                                                const content = (
                                                    <>
                                                        <span
                                                            aria-hidden="true"
                                                            className={clsx(
                                                                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold",
                                                                statusClasses[
                                                                    status
                                                                ]
                                                            )}
                                                        >
                                                            {status ===
                                                            "complete"
                                                                ? "✓"
                                                                : lessonIndex +
                                                                  1}
                                                        </span>
                                                        <span className="min-w-0 flex-1">
                                                            <span
                                                                className={clsx(
                                                                    "block text-sm font-semibold",
                                                                    current
                                                                        ? "text-brand-purple-secondary"
                                                                        : locked
                                                                        ? "text-dim-grey"
                                                                        : "text-white"
                                                                )}
                                                            >
                                                                {lesson.title}
                                                                {lesson.required ===
                                                                    false && (
                                                                    <span className="ml-2 text-xs font-normal text-medium-grey">
                                                                        Optional
                                                                    </span>
                                                                )}
                                                            </span>
                                                            {showDescriptions &&
                                                                lesson.description && (
                                                                    <span className="mt-1 block text-xs leading-5 text-medium-grey">
                                                                        {
                                                                            lesson.description
                                                                        }
                                                                    </span>
                                                                )}
                                                            <span className="mt-1 flex flex-wrap gap-3 text-[11px] text-medium-grey">
                                                                <span>
                                                                    {
                                                                        statusText[
                                                                            status
                                                                        ]
                                                                    }
                                                                </span>
                                                                {lesson.estimatedMinutes !==
                                                                    undefined && (
                                                                    <span>
                                                                        {
                                                                            lesson.estimatedMinutes
                                                                        }{" "}
                                                                        min
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </span>
                                                    </>
                                                );
                                                const itemClasses = clsx(
                                                    "flex min-h-[52px] w-full items-start gap-3 rounded-xl px-3 py-3 text-left outline-none motion-safe:transition-colors focus-visible:ring-2 focus-visible:ring-brand-purple-secondary",
                                                    current &&
                                                        "bg-brand-purple-secondary/10",
                                                    !locked &&
                                                        "hover:bg-white/[0.04]",
                                                    locked &&
                                                        "cursor-not-allowed opacity-70"
                                                );

                                                return (
                                                    <li
                                                        key={lesson.id}
                                                        aria-current={
                                                            current
                                                                ? "step"
                                                                : undefined
                                                        }
                                                    >
                                                        {lesson.href &&
                                                        !locked ? (
                                                            <a
                                                                href={
                                                                    lesson.href
                                                                }
                                                                className={
                                                                    itemClasses
                                                                }
                                                                onClick={() =>
                                                                    onLessonSelect?.(
                                                                        lesson
                                                                    )
                                                                }
                                                            >
                                                                {content}
                                                            </a>
                                                        ) : onLessonSelect &&
                                                          !locked ? (
                                                            <button
                                                                type="button"
                                                                className={
                                                                    itemClasses
                                                                }
                                                                onClick={() =>
                                                                    onLessonSelect(
                                                                        lesson
                                                                    )
                                                                }
                                                            >
                                                                {content}
                                                            </button>
                                                        ) : (
                                                            <div
                                                                className={
                                                                    itemClasses
                                                                }
                                                                aria-disabled={
                                                                    locked ||
                                                                    undefined
                                                                }
                                                            >
                                                                {content}
                                                            </div>
                                                        )}
                                                    </li>
                                                );
                                            }
                                        )}
                                    </ol>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            )}
        </nav>
    );
};

export default ModuleLessonOutline;
