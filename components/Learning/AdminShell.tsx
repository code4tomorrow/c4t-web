import type { Role } from "@prisma/client";
import clsx from "clsx";
import Link from "next/link";
import React from "react";

export interface AdminShellProps {
    children: React.ReactNode;
    title: string;
    description?: string;
    active: "queue" | "courses" | "users" | "audit";
    role: Role;
    actions?: React.ReactNode;
}

const NAV = [
    {
        id: "queue",
        label: "Grading queue",
        href: "/admin",
        roles: ["INSTRUCTOR", "ADMIN"],
    },
    {
        id: "courses",
        label: "Courses",
        href: "/admin/courses",
        roles: ["CONTENT_EDITOR", "ADMIN"],
    },
    { id: "users", label: "People", href: "/admin/users", roles: ["ADMIN"] },
    { id: "audit", label: "Audit log", href: "/admin/audit", roles: ["ADMIN"] },
] as const;

const AdminShell: React.FC<AdminShellProps> = ({
    children,
    title,
    description,
    active,
    role,
    actions,
}) => {
    // Menu items are filtered for clarity; the server still enforces access on
    // every page and API route.
    const items = NAV.filter((item) =>
        (item.roles as readonly string[]).includes(role)
    );

    return (
        <div className="min-h-screen bg-dark-grey-primary text-white">
            <a
                href="#admin-main"
                className="sr-only z-[100] rounded-md bg-white px-4 py-2 text-black focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
            >
                Skip to content
            </a>

            <header className="border-b border-white/10 bg-dark-grey-secondary px-4 py-4 md:px-8">
                <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-3">
                    <div>
                        <Link
                            href="/learn/dashboard"
                            className="text-xs font-semibold uppercase tracking-wider text-brand-purple-secondary hover:text-white"
                        >
                            ← Back to learning
                        </Link>
                        <p className="mt-1 text-sm text-medium-grey">
                            C4T admin · signed in as{" "}
                            {role.toLowerCase().replace("_", " ")}
                        </p>
                    </div>
                    {actions}
                </div>
            </header>

            <div className="mx-auto max-w-screen-2xl px-4 py-6 md:px-8">
                <nav aria-label="Admin" className="mb-6">
                    <ul className="flex flex-wrap gap-2 pl-0">
                        {items.map((item) => (
                            <li key={item.id}>
                                <Link
                                    href={item.href}
                                    aria-current={
                                        item.id === active ? "page" : undefined
                                    }
                                    className={clsx(
                                        "inline-flex min-h-[44px] items-center rounded-xl px-4 py-2 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-brand-purple-secondary",
                                        item.id === active
                                            ? "bg-brand-purple-primary text-white"
                                            : "border border-white/15 text-medium-grey hover:text-white"
                                    )}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <main id="admin-main" tabIndex={-1}>
                    <h1 className="text-3xl font-bold">{title}</h1>
                    {description && (
                        <p className="mt-2 max-w-3xl text-medium-grey">
                            {description}
                        </p>
                    )}
                    <div className="mt-6">{children}</div>
                </main>
            </div>
        </div>
    );
};

export default AdminShell;
