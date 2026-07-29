import type { Role } from "@prisma/client";
import CourseBadge from "@components/Learning/CourseBadge";
import LearnerShell from "@components/Learning/LearnerShell";
import { buildLearnerNavigation } from "@components/Learning/learnerNavigation";
import { LearningProgressBar } from "@components/Learning/LearningProgress";
import { publicBaseUrl } from "lib/certificates";
import { requireAuth } from "lib/guards";
import { getLearnerSnapshot, type LearnerSnapshot } from "lib/learner";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";

interface CertificatesProps {
    role: Role;
    snapshot: LearnerSnapshot;
    baseUrl: string;
}

const CertificatesPage: React.FC<CertificatesProps> = ({
    role,
    snapshot,
    baseUrl,
}) => {
    const router = useRouter();
    const [claiming, setClaiming] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState<string | null>(null);

    const earned = snapshot.certificates;
    const earnedCourseIds = new Set(earned.map((item) => item.courseId));
    const claimable = snapshot.courses.filter(
        (course) =>
            course.eligibility.eligible && !earnedCourseIds.has(course.courseId)
    );
    const inProgress = snapshot.courses.filter(
        (course) =>
            !course.eligibility.eligible &&
            !earnedCourseIds.has(course.courseId)
    );

    const navigation = buildLearnerNavigation({
        role,
        badges: snapshot.summary.badgeCount,
        certificates: earned.length,
    });

    const claim = async (courseId: string) => {
        setClaiming(courseId);
        setError(null);
        setMessage(null);
        try {
            const response = await fetch("/api/learn/certificate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ courseId }),
            });
            const body = await response.json();
            if (!response.ok) {
                throw new Error(
                    body.error || "Could not issue the certificate."
                );
            }
            setMessage(
                `Certificate ${body.certificate.id} issued. Download it below.`
            );
            router.replace(router.asPath);
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Something went wrong."
            );
        } finally {
            setClaiming(null);
        }
    };

    const copyLink = async (certificateId: string) => {
        const url = `${baseUrl}/certificate/verify/${certificateId}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(certificateId);
            window.setTimeout(() => setCopied(null), 2500);
        } catch {
            setError("Could not copy. Select and copy the link manually.");
        }
    };

    return (
        <>
            <Head>
                <title>Certificates | C4T Learning</title>
                <meta name="robots" content="noindex" />
            </Head>
            <LearnerShell
                title="Certificates"
                description="Certificates are issued only after the server re-checks every completion requirement. Each one has a unique ID and a public verification page."
                activeItemId="certificates"
                navigation={navigation}
            >
                {message && (
                    <p
                        role="status"
                        aria-live="polite"
                        className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.07] p-4 text-sm text-emerald-100"
                    >
                        {message}
                    </p>
                )}
                {error && (
                    <p
                        role="alert"
                        className="mb-5 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100"
                    >
                        {error}
                    </p>
                )}

                <div className="space-y-8">
                    {claimable.length > 0 && (
                        <section aria-labelledby="claimable-title">
                            <h2
                                id="claimable-title"
                                className="text-xl font-bold text-white"
                            >
                                Ready to claim
                            </h2>
                            <div className="mt-3 space-y-3">
                                {claimable.map((course) => (
                                    <article
                                        key={course.courseId}
                                        className="rounded-2xl border border-emerald-500/40 bg-emerald-500/[0.07] p-5"
                                    >
                                        <h3 className="text-lg font-bold text-white">
                                            {course.title}
                                        </h3>
                                        <p className="mt-2 text-sm text-emerald-100">
                                            Every requirement is met and your
                                            work has been approved.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                claim(course.courseId)
                                            }
                                            disabled={
                                                claiming === course.courseId
                                            }
                                            className="mt-4 min-h-[48px] rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white outline-none hover:bg-emerald-500 focus-visible:ring-2 focus-visible:ring-white disabled:opacity-60"
                                        >
                                            {claiming === course.courseId
                                                ? "Issuing…"
                                                : "Issue my certificate"}
                                        </button>
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}

                    <section aria-labelledby="earned-title">
                        <h2
                            id="earned-title"
                            className="text-xl font-bold text-white"
                        >
                            Your certificates
                        </h2>
                        {earned.length === 0 ? (
                            <p className="mt-3 rounded-2xl border border-dashed border-white/20 bg-white/[0.03] p-6 text-sm leading-6 text-medium-grey">
                                No certificates yet. Finish a course&apos;s
                                lessons, checkpoints, and projects — once an
                                instructor approves your work, you can issue one
                                here.
                            </p>
                        ) : (
                            <div className="mt-3 space-y-3">
                                {earned.map((certificate) => (
                                    <article
                                        key={certificate.id}
                                        className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-5"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <h3 className="text-lg font-bold text-white">
                                                    {certificate.courseTitle}
                                                </h3>
                                                <p className="mt-1 font-mono text-xs text-medium-grey">
                                                    {certificate.id}
                                                </p>
                                            </div>
                                            <CourseBadge
                                                tone={
                                                    certificate.revokedAt
                                                        ? "amber"
                                                        : "green"
                                                }
                                            >
                                                {certificate.revokedAt
                                                    ? "Revoked"
                                                    : "Valid"}
                                            </CourseBadge>
                                        </div>

                                        {certificate.revokedAt ? (
                                            <p className="mt-3 text-sm text-amber-100">
                                                This certificate was revoked and
                                                can no longer be downloaded.
                                            </p>
                                        ) : (
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                <a
                                                    href={`/api/certificates/${certificate.id}/download`}
                                                    className="inline-flex min-h-[44px] items-center rounded-xl bg-brand-purple-primary px-4 py-2 text-sm font-bold text-white outline-none hover:bg-brand-purple-secondary focus-visible:ring-2 focus-visible:ring-white"
                                                >
                                                    Download PDF
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        copyLink(certificate.id)
                                                    }
                                                    className="inline-flex min-h-[44px] items-center rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-[#D6D3DC] outline-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                                                >
                                                    {copied === certificate.id
                                                        ? "Link copied ✓"
                                                        : "Copy verification link"}
                                                </button>
                                                <Link
                                                    href={`/certificate/verify/${certificate.id}`}
                                                    className="inline-flex min-h-[44px] items-center rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-[#D6D3DC] outline-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                                                >
                                                    View public page
                                                </Link>
                                            </div>
                                        )}
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>

                    {inProgress.length > 0 && (
                        <section aria-labelledby="progress-title">
                            <h2
                                id="progress-title"
                                className="text-xl font-bold text-white"
                            >
                                Working toward
                            </h2>
                            <div className="mt-3 space-y-3">
                                {inProgress.map((course) => (
                                    <article
                                        key={course.courseId}
                                        className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-5"
                                    >
                                        <h3 className="font-bold text-white">
                                            {course.title}
                                        </h3>
                                        <div className="mt-3 max-w-sm">
                                            <LearningProgressBar
                                                value={
                                                    course.progress.percentage
                                                }
                                                label="Course progress"
                                            />
                                        </div>
                                        <ul className="mt-4 space-y-2">
                                            {course.eligibility.requirements.map(
                                                (requirement) => (
                                                    <li
                                                        key={requirement.code}
                                                        className="flex items-start gap-2 text-sm leading-6"
                                                    >
                                                        <span
                                                            aria-hidden="true"
                                                            className={
                                                                requirement.met
                                                                    ? "text-emerald-300"
                                                                    : "text-medium-grey"
                                                            }
                                                        >
                                                            {requirement.met
                                                                ? "✓"
                                                                : "○"}
                                                        </span>
                                                        <span
                                                            className={
                                                                requirement.met
                                                                    ? "text-[#C7C3CE]"
                                                                    : "text-white"
                                                            }
                                                        >
                                                            {requirement.label}
                                                            <span className="text-medium-grey">
                                                                {" "}
                                                                —{" "}
                                                                {
                                                                    requirement.detail
                                                                }
                                                            </span>
                                                        </span>
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </LearnerShell>
        </>
    );
};

export const getServerSideProps = requireAuth<CertificatesProps>(
    async ({ userId, role }) => {
        const snapshot = await getLearnerSnapshot(userId);
        return {
            props: {
                role,
                snapshot: JSON.parse(
                    JSON.stringify(snapshot)
                ) as LearnerSnapshot,
                baseUrl: publicBaseUrl(),
            },
        };
    }
);

export default CertificatesPage;
