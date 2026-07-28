import clsx from "clsx";
import Link from "next/link";
import React from "react";
import LocalProgressNotice from "./LocalProgressNotice";
import ProgressDataControls from "./ProgressDataControls";

export interface LearnerNavigationItem {
    id: string;
    label: string;
    href: string;
    icon?: React.ReactNode;
    badge?: string | number;
}

export interface LearnerShellProps {
    children: React.ReactNode;
    title: string;
    description?: string;
    learnerName?: string;
    activeItemId?: string;
    navigation: LearnerNavigationItem[];
    actions?: React.ReactNode;
    className?: string;
    returnHref?: string;
    showDataControls?: boolean;
    showLocalProgressNotice?: boolean;
}

const LearnerNav: React.FC<{
    items: LearnerNavigationItem[];
    activeItemId?: string;
    onNavigate?: () => void;
}> = ({ items, activeItemId, onNavigate }) => (
    <ul className="space-y-1">
        {items.map((item) => {
            const active = item.id === activeItemId;
            return (
                <li key={item.id}>
                    <Link
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        className={clsx(
                            "flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold",
                            "focus:outline-none focus:ring-2 focus:ring-brand-purple-secondary",
                            active
                                ? "bg-brand-purple-primary text-white"
                                : "text-medium-grey transition-colors hover:bg-white/5 hover:text-white"
                        )}
                    >
                        {item.icon && (
                            <span
                                className="flex h-5 w-5 shrink-0 items-center justify-center"
                                aria-hidden="true"
                            >
                                {item.icon}
                            </span>
                        )}
                        <span>{item.label}</span>
                        {item.badge !== undefined && (
                            <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs text-white">
                                {item.badge}
                            </span>
                        )}
                    </Link>
                </li>
            );
        })}
    </ul>
);

const LearnerShell: React.FC<LearnerShellProps> = ({
    children,
    title,
    description,
    learnerName,
    activeItemId,
    navigation,
    actions,
    className,
    returnHref = "/",
    showDataControls = true,
    showLocalProgressNotice = true,
}) => (
    <div
        className={clsx(
            "min-h-screen bg-dark-grey-primary text-white",
            className
        )}
    >
        <a
            href="#learning-main"
            className="sr-only z-[100] rounded-md bg-white px-4 py-2 text-black focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
        >
            Skip to learning content
        </a>

        <header className="border-b border-white/10 bg-dark-grey-secondary px-4 py-4 md:px-8">
            <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4">
                <div className="min-w-0">
                    <Link
                        href={returnHref}
                        className="text-xs font-semibold uppercase tracking-wider text-brand-purple-secondary hover:text-white"
                    >
                        ← Code 4 Tomorrow
                    </Link>
                    <p className="mt-1 truncate text-sm text-medium-grey">
                        {learnerName
                            ? `Learning as ${learnerName}`
                            : "Learning on this device"}
                    </p>
                </div>
                {actions && (
                    <div className="flex shrink-0 items-center gap-2">
                        {actions}
                    </div>
                )}
            </div>
        </header>

        <div className="mx-auto max-w-screen-2xl px-4 py-5 md:px-8">
            <details className="mb-5 rounded-xl border border-white/10 bg-dark-grey-secondary p-3 lg:hidden">
                <summary className="cursor-pointer py-1 font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-purple-secondary">
                    Learning menu
                </summary>
                <nav aria-label="Learning area" className="mt-3">
                    <LearnerNav
                        items={navigation}
                        activeItemId={activeItemId}
                    />
                </nav>
            </details>

            <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
                <aside className="hidden lg:block">
                    <div className="sticky top-6 space-y-5">
                        <nav
                            aria-label="Learning area"
                            className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-3"
                        >
                            <LearnerNav
                                items={navigation}
                                activeItemId={activeItemId}
                            />
                        </nav>
                        {showLocalProgressNotice && (
                            <LocalProgressNotice compact />
                        )}
                        {showDataControls && <ProgressDataControls compact />}
                    </div>
                </aside>

                <main id="learning-main" tabIndex={-1} className="min-w-0">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold md:text-4xl">
                            {title}
                        </h1>
                        {description && (
                            <p className="mt-2 max-w-3xl text-medium-grey">
                                {description}
                            </p>
                        )}
                    </div>
                    {showLocalProgressNotice && (
                        <LocalProgressNotice className="mb-6 lg:hidden" />
                    )}
                    {showDataControls && (
                        <ProgressDataControls className="mb-6 lg:hidden" />
                    )}
                    {children}
                </main>
            </div>
        </div>
    </div>
);

export default LearnerShell;
