import AdminShell from "@components/Learning/AdminShell";
import type { Role } from "@prisma/client";
import { isInitialAdminEmail } from "lib/auth";
import { requireAdmin } from "lib/guards";
import prisma from "lib/prisma";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";

interface PersonRow {
    id: string;
    displayName: string;
    email: string;
    role: Role;
    enrollments: number;
    certificates: number;
    joinedAt: string;
    /** Listed in INITIAL_ADMIN_EMAILS; their admin role cannot be removed. */
    foundingAdmin: boolean;
}

interface UsersProps {
    people: PersonRow[];
    role: Role;
    currentUserId: string;
    query: string;
    /** Accounts matching the search (or all accounts), before the page cap. */
    matchCount: number;
}

const PAGE_SIZE = 200;

const ROLES: Role[] = ["LEARNER", "INSTRUCTOR", "CONTENT_EDITOR", "ADMIN"];

const AdminUsersPage: React.FC<UsersProps> = ({
    people,
    role,
    currentUserId,
    query,
    matchCount,
}) => {
    const router = useRouter();
    const [busy, setBusy] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState(query);

    const changeRole = async (person: PersonRow, nextRole: Role) => {
        const userId = person.id;
        // Admin is the one role that can grant itself to others, so make it a
        // deliberate choice rather than a mis-click in a dropdown.
        if (
            nextRole === "ADMIN" &&
            !window.confirm(
                `Make ${person.displayName} (${person.email}) an admin? Admins can change anyone's role, including granting admin.`
            )
        ) {
            return;
        }
        setBusy(userId);
        setError(null);
        try {
            const response = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, role: nextRole }),
            });
            const body = await response.json();
            if (!response.ok) throw new Error(body.error || "Update failed.");
            router.replace(router.asPath);
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Something went wrong."
            );
        } finally {
            setBusy(null);
        }
    };

    return (
        <>
            <Head>
                <title>People | C4T Admin</title>
                <meta name="robots" content="noindex" />
            </Head>
            <AdminShell
                title="People"
                description="Grant instructor access so staff can grade submissions. Role changes are written to the audit log."
                active="users"
                role={role}
            >
                <form
                    role="search"
                    className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end"
                    onSubmit={(event) => {
                        event.preventDefault();
                        const q = search.trim();
                        router.push({
                            pathname: router.pathname,
                            query: q ? { q } : {},
                        });
                    }}
                >
                    <label className="flex-1 text-sm font-semibold text-[#D6D3DC]">
                        <span className="mb-1.5 block">
                            Find someone by email or name
                        </span>
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="name@example.com"
                            className="min-h-[44px] w-full rounded-xl border border-white/15 bg-dark-grey-secondary px-3 py-2 text-white outline-none placeholder:text-dim-grey focus:border-brand-purple-secondary focus:ring-2 focus:ring-brand-purple-secondary/40"
                        />
                    </label>
                    <button
                        type="submit"
                        className="min-h-[44px] rounded-xl bg-gradient-to-b from-brand-purple-primary to-brand-purple-secondary px-5 py-2 text-sm font-bold text-white outline-none hover:brightness-110 focus-visible:ring-2 focus-visible:ring-white"
                    >
                        Search
                    </button>
                </form>
                <p className="mb-4 text-sm text-medium-grey" aria-live="polite">
                    {query
                        ? `${matchCount} ${
                              matchCount === 1 ? "match" : "matches"
                          } for “${query}”`
                        : `${matchCount} ${
                              matchCount === 1 ? "person" : "people"
                          }`}
                    {matchCount > people.length &&
                        ` · showing the newest ${people.length}. Search to find anyone else.`}
                </p>

                {error && (
                    <p
                        role="alert"
                        className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100"
                    >
                        {error}
                    </p>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] border-collapse text-sm">
                        <caption className="sr-only">
                            All registered people and their roles
                        </caption>
                        <thead>
                            <tr className="border-b border-white/15 text-left text-xs uppercase tracking-wider text-medium-grey">
                                <th scope="col" className="py-3 pr-4">
                                    Person
                                </th>
                                <th scope="col" className="py-3 pr-4">
                                    Courses
                                </th>
                                <th scope="col" className="py-3 pr-4">
                                    Certificates
                                </th>
                                <th scope="col" className="py-3">
                                    Role
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {people.map((person) => (
                                <tr
                                    key={person.id}
                                    className="border-b border-white/5"
                                >
                                    <th
                                        scope="row"
                                        className="py-3 pr-4 text-left font-semibold text-white"
                                    >
                                        {person.displayName}
                                        <span className="block text-xs font-normal text-medium-grey">
                                            {person.email}
                                        </span>
                                    </th>
                                    <td className="py-3 pr-4 text-medium-grey">
                                        {person.enrollments}
                                    </td>
                                    <td className="py-3 pr-4 text-medium-grey">
                                        {person.certificates}
                                    </td>
                                    <td className="py-3">
                                        <label
                                            htmlFor={`role-${person.id}`}
                                            className="sr-only"
                                        >
                                            Role for {person.displayName}
                                        </label>
                                        <select
                                            id={`role-${person.id}`}
                                            value={person.role}
                                            disabled={
                                                busy === person.id ||
                                                person.id === currentUserId ||
                                                person.foundingAdmin
                                            }
                                            onChange={(event) =>
                                                changeRole(
                                                    person,
                                                    event.target.value as Role
                                                )
                                            }
                                            className="min-h-[40px] rounded-lg border border-white/15 bg-dark-grey-secondary px-3 py-1.5 text-sm text-white outline-none focus:border-brand-purple-secondary focus:ring-2 focus:ring-brand-purple-secondary/40 disabled:opacity-50"
                                        >
                                            {ROLES.map((value) => (
                                                <option
                                                    key={value}
                                                    value={value}
                                                >
                                                    {value
                                                        .toLowerCase()
                                                        .replace("_", " ")}
                                                </option>
                                            ))}
                                        </select>
                                        {person.id === currentUserId && (
                                            <span className="ml-2 text-xs text-medium-grey">
                                                (you)
                                            </span>
                                        )}
                                        {person.foundingAdmin && (
                                            <span className="ml-2 text-xs text-medium-grey">
                                                founding admin
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </AdminShell>
        </>
    );
};

export const getServerSideProps = requireAdmin<UsersProps>(
    async ({ role, userId, query: params }) => {
        const query =
            typeof params.q === "string" ? params.q.trim().slice(0, 120) : "";
        const where = query
            ? {
                  OR: [
                      {
                          email: {
                              contains: query,
                              mode: "insensitive" as const,
                          },
                      },
                      {
                          displayName: {
                              contains: query,
                              mode: "insensitive" as const,
                          },
                      },
                      {
                          name: {
                              contains: query,
                              mode: "insensitive" as const,
                          },
                      },
                  ],
              }
            : {};
        const [matchCount, users] = await Promise.all([
            prisma.user.count({ where }),
            prisma.user.findMany({
                where,
                orderBy: { createdAt: "desc" },
                take: PAGE_SIZE,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    displayName: true,
                    role: true,
                    createdAt: true,
                    _count: {
                        select: { enrollments: true, certificates: true },
                    },
                },
            }),
        ]);

        return {
            props: {
                role,
                currentUserId: userId,
                query,
                matchCount,
                people: users.map((user) => ({
                    id: user.id,
                    displayName: user.displayName || user.name || "Learner",
                    email: user.email || "—",
                    role: user.role,
                    enrollments: user._count.enrollments,
                    certificates: user._count.certificates,
                    joinedAt: user.createdAt.toISOString(),
                    foundingAdmin:
                        user.role === "ADMIN" &&
                        isInitialAdminEmail(user.email),
                })),
            },
        };
    }
);

export default AdminUsersPage;
