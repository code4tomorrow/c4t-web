import clsx from "clsx";
import config from "config";
import { useTermPhase } from "hooks/useTermPhase";
import {
    isRegistrationOpen,
    scheduleFor,
    type TermPhase,
} from "@utils/sessionSchedule";
import React from "react";

/**
 * The register button for a live-class term. When the term's registration
 * closes (see utils/sessionSchedule), it turns into a closed notice that
 * points to the next session instead.
 */
const TermRegistration: React.FC<{
    term: string;
    termLabel: string;
    initialPhase: TermPhase;
    label: string;
    className?: string;
}> = ({ term, termLabel, initialPhase, label, className }) => {
    const phase = useTermPhase(term, initialPhase);
    const next = scheduleFor(term)?.nextSession;

    if (isRegistrationOpen(phase)) {
        return (
            <a
                href={config.links.studentRegistrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className={clsx(
                    "inline-flex min-h-[48px] shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-brand-purple-primary to-brand-purple-secondary px-6 py-3 text-sm font-bold text-white outline-none hover:brightness-110 focus-visible:ring-2 focus-visible:ring-white",
                    className
                )}
            >
                {label}
                <span className="sr-only"> (opens in a new tab)</span>
            </a>
        );
    }

    return (
        <div
            className={clsx(
                "max-w-xs shrink-0 rounded-xl border border-white/15 bg-dark-grey-primary/50 p-4 text-sm",
                className
            )}
        >
            <p className="font-bold text-white">
                {phase === "ended"
                    ? `The ${termLabel} session has ended`
                    : `${termLabel} registration has closed`}
            </p>
            {next && (
                <p className="mt-1 leading-6 text-[#C7C3CE]">
                    {next.label} classes start in {next.starts}.{" "}
                    <a
                        href={config.links.studentRegistrationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-brand-purple-secondary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                    >
                        Sign up for {next.label}
                        <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                </p>
            )}
        </div>
    );
};

export default TermRegistration;
