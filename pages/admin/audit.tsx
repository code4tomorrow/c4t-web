import AdminShell from "@components/Learning/AdminShell";
import type { Role } from "@prisma/client";
import { requireAdmin } from "lib/guards";
import prisma from "lib/prisma";
import Head from "next/head";
import React from "react";

interface AuditRow {
    id: string;
    action: string;
    targetType: string;
    targetId: string;
    actor: string;
    createdAt: string;
    metadata: string | null;
}

interface AuditProps {
    rows: AuditRow[];
    role: Role;
}

const AdminAuditPage: React.FC<AuditProps> = ({ rows, role }) => (
    <>
        <Head>
            <title>Audit log | C4T Admin</title>
            <meta name="robots" content="noindex" />
        </Head>
        <AdminShell
            title="Audit log"
            description="Enrollments, grading decisions, publication changes, role changes, and certificate issuance and revocation."
            active="audit"
            role={role}
        >
            {rows.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-white/20 bg-white/[0.03] p-8 text-center text-medium-grey">
                    No recorded actions yet.
                </p>
            ) : (
                <ul className="list-none space-y-2 pl-0">
                    {rows.map((row) => (
                        <li
                            key={row.id}
                            className="rounded-xl border border-white/10 bg-dark-grey-secondary p-4"
                        >
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <span className="font-mono text-sm font-bold text-white">
                                    {row.action}
                                </span>
                                <span className="text-xs text-medium-grey">
                                    {new Intl.DateTimeFormat(undefined, {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                    }).format(new Date(row.createdAt))}
                                </span>
                            </div>
                            <p className="mt-1 text-sm text-[#C7C3CE]">
                                {row.actor} → {row.targetType}{" "}
                                <span className="font-mono text-xs text-medium-grey">
                                    {row.targetId}
                                </span>
                            </p>
                            {row.metadata && (
                                <pre className="mt-2 overflow-x-auto rounded-lg bg-dark-grey-primary/50 p-2 text-xs text-medium-grey">
                                    {row.metadata}
                                </pre>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </AdminShell>
    </>
);

export const getServerSideProps = requireAdmin<AuditProps>(async ({ role }) => {
    const rows = await prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
        include: {
            actor: { select: { displayName: true, name: true } },
        },
    });

    return {
        props: {
            role,
            rows: rows.map((row) => ({
                id: row.id,
                action: row.action,
                targetType: row.targetType,
                targetId: row.targetId,
                actor: row.actor?.displayName || row.actor?.name || "System",
                createdAt: row.createdAt.toISOString(),
                metadata: row.metadata ? JSON.stringify(row.metadata) : null,
            })),
        },
    };
});

export default AdminAuditPage;
