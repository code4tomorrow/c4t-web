import { accountsEnabled } from "lib/platform";
import Footer from "@components/Footer";
import Navbar from "@components/Navbar";
import prisma from "lib/prisma";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import React from "react";

interface VerifyProps {
    certificateId: string;
    result:
        | {
              status: "valid" | "revoked";
              learnerName: string;
              courseTitle: string;
              completionDate: string;
              learningHours: number;
              revokedReason: string | null;
          }
        | { status: "not-found" };
}

const formatDate = (value: string) =>
    new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
    }).format(new Date(value));

const VerifyCertificatePage: React.FC<VerifyProps> = ({
    certificateId,
    result,
}) => {
    const valid = result.status === "valid";
    const revoked = result.status === "revoked";

    return (
        <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-dark-grey-primary">
            <Head>
                <title>{`Verify certificate ${certificateId} | C4T`}</title>
                <meta
                    name="description"
                    content="Verify the authenticity of a Code 4 Tomorrow certificate of completion."
                />
                {/* Verification results are per-certificate; keep them out of search. */}
                <meta name="robots" content="noindex" />
            </Head>
            <Navbar />

            <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-purple-secondary">
                    Certificate verification
                </p>

                <div
                    className={`mt-4 rounded-2xl border p-6 sm:p-8 ${
                        valid
                            ? "border-emerald-500/40 bg-emerald-500/[0.07]"
                            : revoked
                            ? "border-amber-500/40 bg-amber-500/[0.07]"
                            : "border-white/15 bg-dark-grey-secondary"
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <span
                            aria-hidden="true"
                            className={`flex h-11 w-11 items-center justify-center rounded-full text-xl ${
                                valid
                                    ? "bg-emerald-500/20 text-emerald-200"
                                    : revoked
                                    ? "bg-amber-500/20 text-amber-200"
                                    : "bg-white/10 text-medium-grey"
                            }`}
                        >
                            {valid ? "✓" : revoked ? "!" : "?"}
                        </span>
                        <h1 className="text-2xl font-bold text-white sm:text-3xl">
                            {valid
                                ? "Valid certificate"
                                : revoked
                                ? "Certificate revoked"
                                : "Certificate not found"}
                        </h1>
                    </div>

                    {result.status === "not-found" ? (
                        <p className="mt-4 text-sm leading-6 text-[#C7C3CE]">
                            No certificate matches the ID{" "}
                            <span className="font-mono text-white">
                                {certificateId}
                            </span>
                            . Check the ID for typos, or scan the QR code on the
                            certificate again.
                        </p>
                    ) : (
                        <>
                            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                                {[
                                    ["Learner", result.learnerName],
                                    ["Course", result.courseTitle],
                                    [
                                        "Completed",
                                        formatDate(result.completionDate),
                                    ],
                                    [
                                        "Learning hours",
                                        `About ${result.learningHours} hours`,
                                    ],
                                    ["Issued by", "Code 4 Tomorrow"],
                                    ["Certificate ID", certificateId],
                                ].map(([label, value]) => (
                                    <div key={label}>
                                        <dt className="text-xs uppercase tracking-wider text-medium-grey">
                                            {label}
                                        </dt>
                                        <dd className="mt-1 font-semibold text-white">
                                            {value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>

                            {revoked && (
                                <p className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100">
                                    <strong>
                                        This certificate is no longer valid.
                                    </strong>
                                    {result.revokedReason
                                        ? ` Reason: ${result.revokedReason}`
                                        : ""}
                                </p>
                            )}

                            <p className="mt-6 text-xs leading-5 text-medium-grey">
                                This page confirms that Code 4 Tomorrow issued
                                this certificate. It does not disclose the
                                learner&apos;s email address, account details,
                                or coursework.
                            </p>
                        </>
                    )}
                </div>

                <Link
                    href="/courses"
                    className="mt-8 inline-flex min-h-[44px] items-center rounded-xl border border-white/15 px-5 py-3 text-sm font-bold text-white outline-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                >
                    Explore free C4T courses
                </Link>
            </main>
            <Footer />
        </div>
    );
};

export const getServerSideProps: GetServerSideProps<VerifyProps> = async ({
    params,
    res,
}) => {
    const certificateId = String(params?.certificateId || "");

    // Verification pages are public but must never be cached with learner data.
    res.setHeader("Cache-Control", "no-store");

    // No database means no certificates have been issued here yet.
    if (!accountsEnabled()) return { notFound: true };

    const certificate = await prisma.certificate.findUnique({
        where: { id: certificateId },
        select: {
            learnerName: true,
            courseTitle: true,
            issuedAt: true,
            learningHours: true,
            revokedAt: true,
            revokedReason: true,
        },
    });

    if (!certificate) {
        return {
            props: { certificateId, result: { status: "not-found" } },
        };
    }

    return {
        props: {
            certificateId,
            result: {
                status: certificate.revokedAt ? "revoked" : "valid",
                learnerName: certificate.learnerName,
                courseTitle: certificate.courseTitle,
                completionDate: certificate.issuedAt.toISOString(),
                learningHours: certificate.learningHours,
                revokedReason: certificate.revokedReason,
            },
        },
    };
};

export default VerifyCertificatePage;
