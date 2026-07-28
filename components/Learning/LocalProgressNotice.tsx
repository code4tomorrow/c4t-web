import clsx from "clsx";
import React from "react";

export interface LocalProgressNoticeProps {
    className?: string;
    compact?: boolean;
}

const LocalProgressNotice: React.FC<LocalProgressNoticeProps> = ({
    className,
    compact = false,
}) => (
    <aside
        role="note"
        aria-label="How progress is saved"
        className={clsx(
            "rounded-xl border border-brand-purple-secondary/30 bg-brand-purple-primary/10 text-medium-grey",
            compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm",
            className
        )}
    >
        <p className="font-semibold text-white">Private, local progress</p>
        <p className={clsx(!compact && "mt-1")}>
            Your learning record stays in this browser on this device. No
            account or paid service is required, but progress does not
            automatically sync to another device. Export a backup before
            clearing browser data.
        </p>
    </aside>
);

export default LocalProgressNotice;
