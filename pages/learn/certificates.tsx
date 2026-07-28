"use client";

import CourseBadge from "@components/Learning/CourseBadge";
import LearnerShell, {
    LearnerNavigationItem,
} from "@components/Learning/LearnerShell";
import { LearningProgressBar } from "@components/Learning/LearningProgress";
import { useLearningProgress } from "hooks/useLearningProgress";
import { toCourseCompletionPolicy } from "learning/course-policies";
import { courseRegistry } from "learning/course-registry";
import Head from "next/head";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import {
    calculateCertificateEligibility,
    learningItemKey,
} from "@utils/learning/state";
import type {
    CourseCompletionPolicy,
    LocalCertificate,
} from "@utils/learning/types";

const formatDate = (value: string) => {
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp)
        ? value
        : new Intl.DateTimeFormat(undefined, {
              month: "long",
              day: "numeric",
              year: "numeric",
          }).format(new Date(timestamp));
};

const printCertificate = (certificate: LocalCertificate) => {
    const popup = window.open("", "_blank", "width=1000,height=720");
    if (!popup) return false;
    popup.opener = null;
    popup.document.title = `${certificate.courseTitle} certificate`;

    const style = popup.document.createElement("style");
    style.textContent = `
        @page { size: landscape; margin: 0; }
        * { box-sizing: border-box; }
        body { margin: 0; background: #111111; color: #fff; font-family: Arial, sans-serif; }
        main { width: 11in; min-height: 8.5in; margin: 0 auto; padding: .55in; display: flex; }
        .frame { width: 100%; border: 4px solid #7892EE; padding: .55in; text-align: center; display: flex; flex-direction: column; justify-content: center; background: linear-gradient(145deg, #202124, #111111); }
        .eyebrow { color: #7892EE; font-size: 14px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; }
        h1 { margin: 18px 0 8px; font-size: 42px; }
        .lead { color: #c7c3ce; font-size: 18px; }
        .name { margin: 26px auto 8px; padding: 0 22px 10px; border-bottom: 2px solid #7892EE; font-size: 36px; font-weight: 700; }
        h2 { margin: 16px 0; font-size: 28px; }
        .meta { margin-top: 28px; color: #aaa4b2; font-size: 13px; line-height: 1.7; }
        .local { margin-top: 18px; color: #f8d58c; font-size: 12px; }
        @media print { body { background: #fff; } main { margin: 0; } }
    `;
    popup.document.head.appendChild(style);

    const main = popup.document.createElement("main");
    const frame = popup.document.createElement("section");
    frame.className = "frame";
    const add = (
        tag: keyof HTMLElementTagNameMap,
        text: string,
        className?: string
    ) => {
        const element = popup.document.createElement(tag);
        element.textContent = text;
        if (className) element.className = className;
        frame.appendChild(element);
    };
    add("p", "Code 4 Tomorrow", "eyebrow");
    add("h1", "Certificate of Course Completion");
    add("p", "This device-local learning record recognizes", "lead");
    add("p", certificate.learnerName, "name");
    add("p", "for completing", "lead");
    add("h2", certificate.courseTitle);
    add(
        "p",
        `Issued ${formatDate(certificate.issuedAt)} · Certificate ID: ${
            certificate.id
        }`,
        "meta"
    );
    add(
        "p",
        "Local certificate: stored on this device and not an externally verified credential.",
        "local"
    );
    main.appendChild(frame);
    popup.document.body.appendChild(main);
    popup.focus();
    window.setTimeout(() => popup.print(), 150);
    return true;
};

const CertificatesPage: React.FC = () => {
    const { state, actions, hydrated, summary } = useLearningProgress();
    const [learnerName, setLearnerName] = useState(
        Object.values(state.certificates)[0]?.learnerName || ""
    );
    const [message, setMessage] = useState("");
    const [safetyConfirmed, setSafetyConfirmed] = useState<
        Record<string, boolean>
    >({});

    const courses = useMemo(
        () =>
            courseRegistry
                .filter(
                    (course) =>
                        Boolean(state.enrollments[course.id]) ||
                        Boolean(state.certificates[course.id])
                )
                .map((course) => {
                    const policy = toCourseCompletionPolicy(course);
                    return {
                        course,
                        policy,
                        eligibility: calculateCertificateEligibility(
                            state,
                            policy
                        ),
                        certificate: state.certificates[course.id],
                    };
                }),
        [state]
    );

    const navigation: LearnerNavigationItem[] = [
        {
            id: "dashboard",
            label: "Dashboard",
            href: "/learn/dashboard",
            icon: "⌂",
        },
        { id: "courses", label: "Courses", href: "/courses", icon: "⌘" },
        {
            id: "assignments",
            label: "Assignments",
            href: "/learn/assignments",
            icon: "✓",
        },
        {
            id: "progress",
            label: "Progress",
            href: "/learn/progress",
            icon: "↗",
        },
        {
            id: "achievements",
            label: "Achievements",
            href: "/learn/achievements",
            icon: "★",
            badge: summary.badgeCount || undefined,
        },
        {
            id: "certificates",
            label: "Certificates",
            href: "/learn/certificates",
            icon: "◇",
            badge: Object.keys(state.certificates).length || undefined,
        },
    ];

    const issueCertificate = (
        policy: CourseCompletionPolicy,
        courseTitle: string
    ) => {
        const result = actions.issueCertificate(policy, learnerName);
        setMessage(
            result.ok
                ? `${courseTitle} certificate created locally. Export a progress backup to preserve it.`
                : result.error || "The certificate could not be created."
        );
    };

    return (
        <>
            <Head>
                <title>Certificates | C4T Learning</title>
                <meta
                    name="description"
                    content="Check course-completion eligibility and print certificates stored locally on this device."
                />
                <meta name="robots" content="noindex" />
            </Head>
            <LearnerShell
                title="Certificates"
                description="Check every completion requirement, create an eligible local certificate, and print a copy."
                activeItemId="certificates"
                navigation={navigation}
            >
                <aside className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/[0.07] p-4 text-sm leading-6 text-amber-100">
                    <strong>Device-local certificate:</strong> no account or
                    payment is required. These certificates are private learning
                    records stored in this browser, not externally verified
                    credentials. Export a backup before clearing browser data.
                </aside>

                {!hydrated ? (
                    <div
                        role="status"
                        className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-6 text-medium-grey"
                    >
                        Checking certificate eligibility…
                    </div>
                ) : !courses.length ? (
                    <div className="rounded-2xl border border-dashed border-white/20 bg-white/[0.03] p-8 text-center">
                        <h2 className="text-xl font-bold text-white">
                            No certificate paths yet
                        </h2>
                        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-medium-grey">
                            Start a free course. Its eligibility checklist will
                            appear here immediately.
                        </p>
                        <Link
                            href="/courses"
                            className="mt-4 inline-flex min-h-[44px] items-center rounded-xl bg-brand-purple-primary px-5 py-2 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                        >
                            Browse free courses
                        </Link>
                    </div>
                ) : (
                    <>
                        <section className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-5">
                            <label
                                htmlFor="certificate-name"
                                className="block max-w-xl text-sm font-semibold text-white"
                            >
                                Name to display on new certificates
                                <input
                                    id="certificate-name"
                                    value={learnerName}
                                    onChange={(event) =>
                                        setLearnerName(event.target.value)
                                    }
                                    autoComplete="name"
                                    maxLength={100}
                                    placeholder="Your name"
                                    className="mt-2 h-12 w-full rounded-xl border border-white/15 bg-dark-grey-primary px-3 text-white outline-none placeholder:text-dim-grey focus:border-brand-purple-secondary focus:ring-2 focus:ring-brand-purple-secondary/30"
                                />
                            </label>
                            <p className="mt-2 text-xs leading-5 text-medium-grey">
                                The name stays in this browser and is only
                                included in certificates you create.
                            </p>
                        </section>

                        {message && (
                            <p
                                role="status"
                                aria-live="polite"
                                className="mt-4 rounded-xl border border-brand-purple-secondary/30 bg-brand-purple-secondary/[0.07] p-3 text-sm text-[#DCE4FF]"
                            >
                                {message}
                            </p>
                        )}

                        <div className="mt-6 grid gap-5 xl:grid-cols-2">
                            {courses.map(
                                ({
                                    course,
                                    policy,
                                    eligibility,
                                    certificate,
                                }) => {
                                    const metCount =
                                        eligibility.requirements.filter(
                                            (requirement) => requirement.met
                                        ).length;
                                    const percent = Math.round(
                                        (metCount /
                                            eligibility.requirements.length) *
                                            100
                                    );
                                    const safetyId =
                                        policy.safetyAcknowledgementIds?.[0];
                                    const safetyMet =
                                        !safetyId ||
                                        Boolean(
                                            state.safetyAcknowledgements[
                                                learningItemKey(
                                                    course.id,
                                                    safetyId
                                                )
                                            ]
                                        );

                                    return (
                                        <article
                                            key={course.id}
                                            className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-5"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-purple-secondary">
                                                        Course certificate
                                                    </p>
                                                    <h2 className="mt-2 text-xl font-bold text-white">
                                                        {course.title}
                                                    </h2>
                                                </div>
                                                <CourseBadge
                                                    tone={
                                                        certificate ||
                                                        eligibility.eligible
                                                            ? "green"
                                                            : "grey"
                                                    }
                                                >
                                                    {certificate
                                                        ? "Issued"
                                                        : eligibility.eligible
                                                        ? "Eligible"
                                                        : "In progress"}
                                                </CourseBadge>
                                            </div>

                                            <div className="mt-5">
                                                <LearningProgressBar
                                                    value={percent}
                                                    label="Eligibility requirements"
                                                />
                                            </div>
                                            <ul className="mt-4 space-y-2">
                                                {eligibility.requirements.map(
                                                    (requirement) => (
                                                        <li
                                                            key={
                                                                requirement.code
                                                            }
                                                            className="flex items-start gap-3 rounded-xl bg-dark-grey-primary/35 p-3 text-sm"
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
                                                            <span>
                                                                <strong className="text-white">
                                                                    {
                                                                        requirement.label
                                                                    }
                                                                </strong>
                                                                <span className="mt-0.5 block text-xs leading-5 text-medium-grey">
                                                                    {
                                                                        requirement.detail
                                                                    }
                                                                </span>
                                                            </span>
                                                        </li>
                                                    )
                                                )}
                                            </ul>

                                            {safetyId && !safetyMet && (
                                                <div className="mt-4 rounded-xl border border-amber-500/35 bg-amber-500/[0.06] p-4">
                                                    <label className="flex items-start gap-3 text-sm leading-6 text-amber-100">
                                                        <input
                                                            type="checkbox"
                                                            checked={Boolean(
                                                                safetyConfirmed[
                                                                    course.id
                                                                ]
                                                            )}
                                                            onChange={(event) =>
                                                                setSafetyConfirmed(
                                                                    (
                                                                        current
                                                                    ) => ({
                                                                        ...current,
                                                                        [course.id]:
                                                                            event
                                                                                .target
                                                                                .checked,
                                                                    })
                                                                )
                                                            }
                                                            className="mt-1 h-5 w-5 shrink-0 accent-[#7892EE]"
                                                        />
                                                        <span>
                                                            I understand that
                                                            physical hardware is
                                                            optional, simulated
                                                            work is the complete
                                                            free path, and any
                                                            physical work must
                                                            follow the exact
                                                            component and board
                                                            documentation,
                                                            power-off wiring
                                                            practices, and
                                                            qualified
                                                            adult/instructor
                                                            guidance.
                                                        </span>
                                                    </label>
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        <Link
                                                            href={`/courses/${course.slug}`}
                                                            className="inline-flex min-h-[44px] items-center rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-[#D6D3DC] outline-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                                                        >
                                                            Review course safety
                                                            setup
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                !safetyConfirmed[
                                                                    course.id
                                                                ]
                                                            }
                                                            onClick={() => {
                                                                actions.acknowledgeSafety(
                                                                    course.id,
                                                                    safetyId
                                                                );
                                                                setMessage(
                                                                    `${course.title} safety acknowledgement saved locally.`
                                                                );
                                                            }}
                                                            className="min-h-[44px] rounded-xl border border-amber-500/40 px-4 py-2 text-sm font-semibold text-amber-100 outline-none hover:bg-amber-500/10 focus-visible:ring-2 focus-visible:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
                                                        >
                                                            Save safety
                                                            acknowledgement
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {certificate ? (
                                                <section className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.07] p-4">
                                                    <p className="text-sm font-bold text-white">
                                                        {
                                                            certificate.learnerName
                                                        }
                                                    </p>
                                                    <p className="mt-1 text-xs text-emerald-100">
                                                        Issued{" "}
                                                        {formatDate(
                                                            certificate.issuedAt
                                                        )}
                                                    </p>
                                                    <p className="mt-2 break-all text-[11px] text-medium-grey">
                                                        ID: {certificate.id}
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (
                                                                !printCertificate(
                                                                    certificate
                                                                )
                                                            ) {
                                                                setMessage(
                                                                    "Allow pop-ups to open the printable certificate."
                                                                );
                                                            }
                                                        }}
                                                        className="mt-4 min-h-[44px] rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white outline-none hover:bg-emerald-500 focus-visible:ring-2 focus-visible:ring-white"
                                                    >
                                                        Print certificate
                                                    </button>
                                                </section>
                                            ) : (
                                                <div className="mt-5 flex flex-wrap gap-2">
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            !eligibility.eligible ||
                                                            !learnerName.trim()
                                                        }
                                                        onClick={() =>
                                                            issueCertificate(
                                                                policy,
                                                                course.title
                                                            )
                                                        }
                                                        className="min-h-[44px] rounded-xl bg-brand-purple-primary px-4 py-2 text-sm font-semibold text-white outline-none hover:bg-brand-purple-secondary focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-40"
                                                    >
                                                        Create local certificate
                                                    </button>
                                                    <Link
                                                        href="/learn/assignments"
                                                        className="inline-flex min-h-[44px] items-center rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-[#D6D3DC] outline-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                                                    >
                                                        Review requirements
                                                    </Link>
                                                </div>
                                            )}
                                        </article>
                                    );
                                }
                            )}
                        </div>
                    </>
                )}
            </LearnerShell>
        </>
    );
};

export default CertificatesPage;
