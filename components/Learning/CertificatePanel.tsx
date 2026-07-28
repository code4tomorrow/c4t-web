"use client";

import clsx from "clsx";
import React, { useState } from "react";
import { useCourseProgress } from "../../hooks/useLearningProgress";
import {
    CourseCompletionPolicy,
    LocalCertificate,
} from "@utils/learning/types";

export interface CertificatePanelProps {
    policy: CourseCompletionPolicy;
    learnerName: string;
    organizationName?: string;
    className?: string;
    onCertificateIssued?: (certificate: LocalCertificate) => void;
}

const escapeHtml = (value: string) =>
    value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

export const createCertificateDownload = (
    certificate: LocalCertificate,
    organizationName = "Code 4 Tomorrow"
) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Certificate - ${escapeHtml(certificate.courseTitle)}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 32px; background: #111111; color: #ffffff; font-family: Arial, sans-serif; }
    .certificate { width: min(100%, 1000px); min-height: 650px; margin: auto; padding: 64px; border: 10px solid #5A4CAD; outline: 2px solid #7892EE; outline-offset: -24px; display: grid; place-items: center; text-align: center; background: radial-gradient(circle at top, #292A32, #111111 65%); }
    .eyebrow { color: #7892EE; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; }
    h1 { margin: 20px 0 8px; font-size: clamp(42px, 7vw, 76px); }
    h2 { margin: 12px 0; font-size: clamp(28px, 4vw, 48px); color: #7892EE; }
    p { color: #d6d3df; font-size: 18px; line-height: 1.6; }
    .id { margin-top: 36px; color: #8C8796; font-size: 12px; overflow-wrap: anywhere; }
    .notice { margin-top: 16px; color: #f4d58d; font-size: 12px; }
    @media print { body { padding: 0; background: white; } .certificate { min-height: 100vh; width: 100%; } }
  </style>
</head>
<body>
  <main class="certificate">
    <div>
      <p class="eyebrow">${escapeHtml(organizationName)}</p>
      <h1>Certificate of Completion</h1>
      <p>This local learning record recognizes</p>
      <h2>${escapeHtml(certificate.learnerName)}</h2>
      <p>for completing <strong>${escapeHtml(
          certificate.courseTitle
      )}</strong></p>
      <p>Issued ${escapeHtml(
          new Intl.DateTimeFormat("en", {
              month: "long",
              day: "numeric",
              year: "numeric",
          }).format(new Date(certificate.issuedAt))
      )}</p>
      <p class="id">Local certificate ID: ${escapeHtml(certificate.id)}</p>
      <p class="notice">This certificate is generated from progress stored in one browser. It is not server-verified or independently verifiable.</p>
    </div>
  </main>
</body>
</html>`;

const CertificatePanel: React.FC<CertificatePanelProps> = ({
    policy,
    learnerName,
    organizationName = "Code 4 Tomorrow",
    className,
    onCertificateIssued,
}) => {
    const { state, actions, hydrated, certificateEligibility } =
        useCourseProgress(policy);
    const [message, setMessage] = useState("");
    const certificate = state.certificates[policy.courseId];

    const handleIssue = () => {
        const result = actions.issueCertificate(policy, learnerName);
        if (!result.ok || !result.certificate) {
            setMessage(
                result.error || "The local certificate could not be created."
            );
            return;
        }
        setMessage("Certificate created on this device.");
        onCertificateIssued?.(result.certificate);
    };

    const handleDownload = () => {
        if (!certificate) return;
        const blob = new Blob(
            [createCertificateDownload(certificate, organizationName)],
            { type: "text/html" }
        );
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `${certificate.courseId}-certificate.html`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.URL.revokeObjectURL(url);
        setMessage(
            "Certificate file downloaded. Open it to print or save as PDF."
        );
    };

    const buttonClass =
        "inline-flex min-h-[44px] items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-purple-secondary disabled:cursor-not-allowed disabled:opacity-50";

    if (!hydrated) {
        return (
            <div className="text-sm text-medium-grey" role="status">
                Checking completion saved on this device…
            </div>
        );
    }

    return (
        <section
            className={clsx("space-y-5", className)}
            aria-labelledby="certificate-heading"
        >
            <div>
                <h2
                    id="certificate-heading"
                    className="text-2xl font-bold text-white"
                >
                    Course certificate
                </h2>
                <p className="mt-1 max-w-3xl text-sm text-medium-grey">
                    This free certificate is created from progress in this
                    browser. It has no server verification, so export your
                    progress and certificate if you change devices.
                </p>
            </div>

            {!certificate && (
                <div className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-5">
                    <h3 className="font-bold text-white">
                        Completion checklist
                    </h3>
                    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                        {certificateEligibility.requirements.map(
                            (requirement) => (
                                <li
                                    key={requirement.code}
                                    className="flex items-start gap-2 rounded-lg bg-black/20 px-3 py-2"
                                >
                                    <span
                                        aria-hidden="true"
                                        className={
                                            requirement.met
                                                ? "text-green-300"
                                                : "text-medium-grey"
                                        }
                                    >
                                        {requirement.met ? "✓" : "○"}
                                    </span>
                                    <span>
                                        <span className="block text-sm font-semibold text-white">
                                            {requirement.label}
                                        </span>
                                        <span className="block text-xs text-medium-grey">
                                            {requirement.detail}
                                        </span>
                                    </span>
                                </li>
                            )
                        )}
                    </ul>
                    <button
                        type="button"
                        className={clsx(
                            buttonClass,
                            "mt-4 bg-gradient-to-b from-brand-purple-primary to-brand-purple-secondary text-white"
                        )}
                        onClick={handleIssue}
                        disabled={
                            !certificateEligibility.eligible ||
                            !learnerName.trim()
                        }
                    >
                        Create local certificate
                    </button>
                    {!learnerName.trim() && (
                        <p className="mt-2 text-xs text-amber-200">
                            Add a learner name before creating the certificate.
                        </p>
                    )}
                </div>
            )}

            {certificate && (
                <>
                    <article
                        data-learning-certificate
                        className="relative min-h-[480px] overflow-hidden rounded-2xl border-[8px] border-brand-purple-primary bg-dark-grey-secondary p-8 text-center outline outline-2 outline-offset-[-20px] outline-brand-purple-secondary sm:p-14"
                    >
                        <div className="flex min-h-[360px] flex-col items-center justify-center">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-purple-secondary">
                                {organizationName}
                            </p>
                            <h3 className="mt-5 text-3xl font-bold text-white sm:text-5xl">
                                Certificate of Completion
                            </h3>
                            <p className="mt-6 text-medium-grey">
                                This local learning record recognizes
                            </p>
                            <p className="mt-2 text-3xl font-bold text-brand-purple-secondary sm:text-4xl">
                                {certificate.learnerName}
                            </p>
                            <p className="mt-5 text-medium-grey">
                                for completing{" "}
                                <strong className="text-white">
                                    {certificate.courseTitle}
                                </strong>
                            </p>
                            <time
                                className="mt-4 text-sm text-medium-grey"
                                dateTime={certificate.issuedAt}
                            >
                                Issued{" "}
                                {new Intl.DateTimeFormat(undefined, {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                }).format(new Date(certificate.issuedAt))}
                            </time>
                            <p className="mt-8 max-w-xl break-all text-xs text-dim-grey">
                                Local certificate ID: {certificate.id}
                            </p>
                            <p className="mt-2 max-w-xl text-xs text-amber-200">
                                Generated from browser-local progress; not
                                independently verifiable.
                            </p>
                        </div>
                    </article>

                    <div
                        data-certificate-actions
                        className="flex flex-wrap gap-2"
                    >
                        <button
                            type="button"
                            className={clsx(
                                buttonClass,
                                "bg-brand-purple-primary text-white"
                            )}
                            onClick={() => window.print()}
                        >
                            Print / save as PDF
                        </button>
                        <button
                            type="button"
                            className={clsx(
                                buttonClass,
                                "border border-white/15 bg-white/5 text-white"
                            )}
                            onClick={handleDownload}
                        >
                            Download certificate file
                        </button>
                    </div>
                </>
            )}

            {message && (
                <p
                    className="text-sm text-medium-grey"
                    role="status"
                    aria-live="polite"
                >
                    {message}
                </p>
            )}

            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    [data-learning-certificate],
                    [data-learning-certificate] * {
                        visibility: visible !important;
                    }
                    [data-learning-certificate] {
                        position: absolute !important;
                        inset: 0 !important;
                        min-height: 100vh !important;
                        width: 100% !important;
                        border-radius: 0 !important;
                    }
                    [data-certificate-actions] {
                        display: none !important;
                    }
                }
            `}</style>
        </section>
    );
};

export default CertificatePanel;
