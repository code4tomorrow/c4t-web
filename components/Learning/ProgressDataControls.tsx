"use client";

import clsx from "clsx";
import React, { ChangeEvent, useRef, useState } from "react";
import { useLearningProgress } from "../../hooks/useLearningProgress";
import { MAX_LEARNING_BACKUP_BYTES } from "../../utils/learning/state";

export interface ProgressDataControlsProps {
    className?: string;
    compact?: boolean;
}

const ProgressDataControls: React.FC<ProgressDataControlsProps> = ({
    className,
    compact = false,
}) => {
    const { actions, error, hydrated, storageAvailable } =
        useLearningProgress();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [message, setMessage] = useState("");

    const handleExport = () => {
        const blob = new Blob([actions.exportData()], {
            type: "application/json",
        });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `c4t-learning-progress-${new Date()
            .toISOString()
            .slice(0, 10)}.json`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.URL.revokeObjectURL(url);
        setMessage("Backup downloaded.");
    };

    const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            if (file.size > MAX_LEARNING_BACKUP_BYTES) {
                setMessage("That backup is larger than the 2 MB safety limit.");
                return;
            }
            const result = actions.importData(await file.text(), "merge");
            setMessage(
                result.ok
                    ? "Backup merged with this device."
                    : result.error || "That backup could not be imported."
            );
        } catch {
            setMessage(
                "The backup could not be read. Choose an unmodified JSON export and try again."
            );
        } finally {
            event.target.value = "";
        }
    };

    const handleReset = () => {
        const confirmed = window.confirm(
            "Reset all course progress saved in this browser? Export a backup first if you may need it later."
        );
        if (!confirmed) return;
        actions.reset();
        setMessage("Local progress reset.");
    };

    const buttonClass = clsx(
        "rounded-lg border border-white/10 bg-white/5 font-semibold text-white transition-colors",
        "hover:border-brand-purple-secondary/60 hover:bg-brand-purple-primary/20",
        "focus:outline-none focus:ring-2 focus:ring-brand-purple-secondary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        compact ? "px-2.5 py-2 text-xs" : "px-3 py-2 text-sm"
    );

    return (
        <section
            aria-label="Learning progress backup controls"
            className={clsx("space-y-2", className)}
        >
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    className={buttonClass}
                    onClick={handleExport}
                    disabled={!hydrated}
                >
                    Export backup
                </button>
                <button
                    type="button"
                    className={buttonClass}
                    onClick={() => inputRef.current?.click()}
                    disabled={!hydrated}
                >
                    Import &amp; merge
                </button>
                <button
                    type="button"
                    className={clsx(
                        buttonClass,
                        "text-red-200 hover:border-red-300/60 hover:bg-red-500/10"
                    )}
                    onClick={handleReset}
                    disabled={!hydrated}
                >
                    Reset
                </button>
                <input
                    ref={inputRef}
                    className="sr-only"
                    type="file"
                    accept="application/json,.json"
                    onChange={handleImport}
                    aria-label="Choose a learning progress backup"
                />
            </div>
            {!storageAvailable && hydrated && (
                <p className="text-xs text-amber-200">
                    Storage is unavailable; progress is temporary in this tab.
                </p>
            )}
            {(message || error) && (
                <p
                    className="text-xs text-medium-grey"
                    role="status"
                    aria-live="polite"
                >
                    {message || error}
                </p>
            )}
        </section>
    );
};

export default ProgressDataControls;
