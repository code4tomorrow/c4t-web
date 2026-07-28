"use client";

import clsx from "clsx";
import React, { useId, useMemo, useState } from "react";
import type {
    CourseRequirement,
    FreeSetupPath,
    RequirementOption,
} from "./types";

export interface RequirementsSetupProps {
    courseTitle?: string;
    freePath: FreeSetupPath;
    software?: CourseRequirement[];
    hardware?: CourseRequirement[];
    accounts?: CourseRequirement[];
    completedStepIds?: string[];
    defaultCompletedStepIds?: string[];
    onCompletedStepIdsChange?: (completedStepIds: string[]) => void;
    onOpenSimulator?: (requirement: CourseRequirement) => void;
    className?: string;
}

const ExternalLink: React.FC<{
    link: NonNullable<RequirementOption["link"]>;
}> = ({ link }) => (
    <a
        className="inline-flex min-h-[44px] items-center rounded-lg border border-brand-purple-secondary/60 px-3 py-2 text-sm font-semibold text-[#DCE4FF] outline-none motion-safe:transition-colors hover:bg-brand-purple-secondary/10 focus-visible:ring-2 focus-visible:ring-brand-purple-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-dark-grey-secondary"
        href={link.href}
        target="_blank"
        rel="noreferrer noopener"
    >
        {link.label}
        <span className="sr-only"> (opens in a new tab)</span>
    </a>
);

const RequirementChoice: React.FC<{
    option: RequirementOption;
    free?: boolean;
}> = ({ option, free = false }) => (
    <div
        className={clsx(
            "rounded-xl border p-3",
            free
                ? "border-emerald-500/40 bg-emerald-500/[0.07]"
                : "border-white/10 bg-dark-grey-primary/40"
        )}
    >
        <div className="flex flex-wrap items-center gap-2">
            <h5 className="text-sm font-semibold text-white">{option.name}</h5>
            {free && (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-emerald-200">
                    Free
                </span>
            )}
        </div>
        <p className="mt-1 text-sm leading-6 text-[#C7C3CE]">
            {option.description}
        </p>
        {!!option.steps?.length && (
            <ol className="mt-3 list-inside list-decimal space-y-1 text-sm leading-6 text-[#C7C3CE]">
                {option.steps.map((step, index) => (
                    <li key={`${option.name}-${index}`}>{step}</li>
                ))}
            </ol>
        )}
        {option.link && (
            <div className="mt-3">
                <ExternalLink link={option.link} />
            </div>
        )}
    </div>
);

const RequirementGroup: React.FC<{
    id: string;
    heading: string;
    emptyMessage: string;
    items: CourseRequirement[];
    onOpenSimulator?: (requirement: CourseRequirement) => void;
}> = ({ id, heading, emptyMessage, items, onOpenSimulator }) => (
    <section aria-labelledby={id}>
        <div className="mb-3 flex items-end justify-between gap-4">
            <h3 id={id} className="text-lg font-bold text-white">
                {heading}
            </h3>
            <span className="text-xs font-medium text-medium-grey">
                {items.length
                    ? `${items.length} ${items.length === 1 ? "item" : "items"}`
                    : "Nothing required"}
            </span>
        </div>

        {!items.length ? (
            <p className="rounded-xl border border-dashed border-dim-grey/60 bg-dark-grey-primary/30 p-4 text-sm text-[#C7C3CE]">
                {emptyMessage}
            </p>
        ) : (
            <div className="grid gap-3 md:grid-cols-2">
                {items.map((item) => (
                    <article
                        key={item.id}
                        className="rounded-xl border border-white/10 bg-dark-grey-accent/60 p-4"
                    >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                                <h4 className="font-bold text-white">
                                    {item.name}
                                </h4>
                                <p className="mt-1 text-sm leading-6 text-[#C7C3CE]">
                                    {item.purpose}
                                </p>
                            </div>
                            <span className="rounded-full border border-white/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-medium-grey">
                                {item.required === false
                                    ? "Optional"
                                    : "Course need"}
                            </span>
                        </div>

                        <div className="mt-3">
                            <RequirementChoice option={item.freeOption} free />
                        </div>

                        {item.simulator && (
                            <div className="mt-3 rounded-xl border border-brand-purple-secondary/40 bg-brand-purple-secondary/[0.08] p-3">
                                <p className="text-xs font-bold uppercase tracking-wider text-brand-purple-secondary">
                                    No-hardware path
                                </p>
                                <p className="mt-1 text-sm font-semibold text-white">
                                    {item.simulator.name}
                                </p>
                                <p className="mt-1 text-sm leading-6 text-[#C7C3CE]">
                                    {item.simulator.description}
                                </p>
                                {onOpenSimulator && (
                                    <button
                                        type="button"
                                        className="mt-3 min-h-[44px] rounded-lg bg-brand-purple-primary px-3 py-2 text-sm font-semibold text-white outline-none motion-safe:transition-colors hover:bg-brand-purple-secondary focus-visible:ring-2 focus-visible:ring-brand-purple-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-dark-grey-accent"
                                        onClick={() => onOpenSimulator(item)}
                                    >
                                        Open free simulator
                                    </button>
                                )}
                            </div>
                        )}

                        {!!item.paidOptions?.length && (
                            <details className="group mt-3 rounded-xl border border-white/10 bg-dark-grey-primary/30">
                                <summary className="min-h-[44px] cursor-pointer list-none rounded-xl px-3 py-3 text-sm font-semibold text-[#D6D3DC] outline-none focus-visible:ring-2 focus-visible:ring-brand-purple-secondary [&::-webkit-details-marker]:hidden">
                                    <span aria-hidden="true" className="mr-2">
                                        +
                                    </span>
                                    Optional paid alternatives
                                </summary>
                                <div className="space-y-3 border-t border-white/10 p-3">
                                    <p className="text-xs leading-5 text-medium-grey">
                                        You do not need these options to
                                        complete the course.
                                    </p>
                                    {item.paidOptions.map((option) => (
                                        <div key={option.name}>
                                            <RequirementChoice
                                                option={option}
                                            />
                                            {option.priceNote && (
                                                <p className="mt-1 text-xs text-amber-200">
                                                    {option.priceNote}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </details>
                        )}
                    </article>
                ))}
            </div>
        )}
    </section>
);

const RequirementsSetup: React.FC<RequirementsSetupProps> = ({
    courseTitle,
    freePath,
    software = [],
    hardware = [],
    accounts = [],
    completedStepIds,
    defaultCompletedStepIds = [],
    onCompletedStepIdsChange,
    onOpenSimulator,
    className,
}) => {
    const baseId = useId();
    const [internalCompletedIds, setInternalCompletedIds] = useState(
        defaultCompletedStepIds
    );
    const currentIds = completedStepIds ?? internalCompletedIds;
    const completedSet = useMemo(() => new Set(currentIds), [currentIds]);

    const updateStep = (stepId: string, checked: boolean) => {
        const next = new Set(currentIds);
        checked ? next.add(stepId) : next.delete(stepId);
        const nextIds = Array.from(next);
        if (completedStepIds === undefined) setInternalCompletedIds(nextIds);
        onCompletedStepIdsChange?.(nextIds);
    };

    const completedCount = freePath.steps.filter((step) =>
        completedSet.has(step.id)
    ).length;

    return (
        <section
            aria-labelledby={`${baseId}-title`}
            className={clsx(
                "w-full rounded-2xl border border-white/10 bg-dark-grey-secondary p-4 text-white shadow-[0_18px_50px_rgba(0,0,0,0.22)] sm:p-6",
                className
            )}
        >
            <header>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-purple-secondary">
                    Before you begin
                </p>
                <h2
                    id={`${baseId}-title`}
                    className="mt-2 text-2xl font-bold sm:text-3xl"
                >
                    Requirements &amp; setup
                    {courseTitle ? ` for ${courseTitle}` : ""}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[#C7C3CE] sm:text-base">
                    Start with the complete free pathway below. Hardware,
                    subscriptions, paid APIs, and cloud credits are never
                    required.
                </p>
            </header>

            <section
                aria-labelledby={`${baseId}-free-path`}
                className="mt-6 overflow-hidden rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/[0.12] to-brand-purple-primary/[0.08]"
            >
                <div className="flex flex-col justify-between gap-3 border-b border-emerald-500/20 p-4 sm:flex-row sm:items-start">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">
                            Start here · free path
                        </p>
                        <h3
                            id={`${baseId}-free-path`}
                            className="mt-1 text-xl font-bold text-white"
                        >
                            {freePath.title || "Complete setup at no cost"}
                        </h3>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#D4D1D9]">
                            {freePath.summary}
                        </p>
                    </div>
                    <span className="self-start whitespace-nowrap rounded-full bg-emerald-500/20 px-3 py-1.5 text-sm font-bold text-emerald-100">
                        {freePath.costLabel || "$0 required"}
                    </span>
                </div>

                <div className="p-4">
                    <div className="mb-3 flex items-center justify-between gap-4">
                        <p className="text-sm font-semibold text-white">
                            Setup checklist
                        </p>
                        <p
                            className="text-xs font-medium text-emerald-100"
                            aria-live="polite"
                        >
                            {completedCount} of {freePath.steps.length} complete
                        </p>
                    </div>
                    {completedStepIds === undefined && (
                        <p className="mb-3 text-xs leading-5 text-medium-grey">
                            This checklist is a temporary setup aid and resets
                            when the page reloads. Saved course progress begins
                            in the setup lessons below.
                        </p>
                    )}
                    <ol className="space-y-2">
                        {freePath.steps.map((step, index) => {
                            const checkboxId = `${baseId}-step-${index}`;
                            const checked = completedSet.has(step.id);
                            return (
                                <li
                                    key={step.id}
                                    className={clsx(
                                        "rounded-xl border p-3 motion-safe:transition-colors",
                                        checked
                                            ? "border-emerald-500/40 bg-emerald-500/[0.08]"
                                            : "border-white/10 bg-dark-grey-primary/30"
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <input
                                            id={checkboxId}
                                            type="checkbox"
                                            checked={checked}
                                            onChange={(event) =>
                                                updateStep(
                                                    step.id,
                                                    event.target.checked
                                                )
                                            }
                                            className="mt-1 h-5 w-5 shrink-0 accent-[#7892EE] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-purple-secondary"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <label
                                                htmlFor={checkboxId}
                                                className="cursor-pointer font-semibold text-white"
                                            >
                                                {index + 1}. {step.title}
                                            </label>
                                            <p className="mt-1 text-sm leading-6 text-[#C7C3CE]">
                                                {step.description}
                                            </p>
                                            <div className="mt-2 flex flex-wrap items-center gap-3">
                                                {step.estimatedMinutes !==
                                                    undefined && (
                                                    <span className="text-xs text-medium-grey">
                                                        About{" "}
                                                        {step.estimatedMinutes}{" "}
                                                        min
                                                    </span>
                                                )}
                                                {step.link && (
                                                    <ExternalLink
                                                        link={step.link}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                </div>
            </section>

            <div className="mt-8 space-y-8">
                <RequirementGroup
                    id={`${baseId}-software`}
                    heading="Software"
                    emptyMessage="No software installation is needed; use the browser-based course tools."
                    items={software}
                    onOpenSimulator={onOpenSimulator}
                />
                <RequirementGroup
                    id={`${baseId}-hardware`}
                    heading="Hardware"
                    emptyMessage="No physical hardware is needed for this course."
                    items={hardware}
                    onOpenSimulator={onOpenSimulator}
                />
                <RequirementGroup
                    id={`${baseId}-accounts`}
                    heading="Accounts"
                    emptyMessage="No external account is needed for this course."
                    items={accounts}
                    onOpenSimulator={onOpenSimulator}
                />
            </div>
        </section>
    );
};

export default RequirementsSetup;
