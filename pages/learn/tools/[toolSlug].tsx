import CourseBadge from "@components/Learning/CourseBadge";
import FreeLabSimulator from "@components/Learning/FreeLabSimulator";
import type { FreeLabMode } from "@components/Learning/types";
import Footer from "@components/Footer";
import Navbar from "@components/Navbar";
import { courseRegistry } from "learning/course-registry";
import type { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import React, { useState } from "react";

interface ToolCourse {
    id: string;
    slug: string;
    title: string;
}

interface ToolPageProps {
    toolSlug: string;
    title: string;
    description: string;
    mode: FreeLabMode;
    courses: ToolCourse[];
}

const toolMode = (slug: string): FreeLabMode => {
    if (slug.includes("microbit")) {
        return "microbit";
    }
    if (slug.includes("tinyml") || slug.includes("edge")) {
        return "tinyml";
    }
    if (
        slug.includes("robot") ||
        slug.includes("circuit") ||
        slug.includes("electronics")
    ) {
        return "circuits";
    }
    if (
        slug.includes("gpio") ||
        slug.includes("iot") ||
        slug.includes("raspberry")
    ) {
        return "gpio-iot";
    }
    if (slug.includes("git") || slug.includes("collaboration")) {
        return "git";
    }
    if (
        slug.includes("unity") ||
        slug.includes("game") ||
        slug.includes("physics")
    ) {
        return "unity-physics";
    }
    if (
        slug.includes("agent") ||
        slug.includes("mcp") ||
        slug.includes("harness") ||
        slug.includes("tool")
    ) {
        return "agent-tools";
    }
    if (
        slug.includes("data") ||
        slug.includes("model") ||
        slug.includes("ml") ||
        slug.includes("mlops") ||
        slug.includes("ai-") ||
        slug.startsWith("ai") ||
        slug.includes("deep-learning") ||
        slug.includes("nlp") ||
        slug.includes("retrieval") ||
        slug.includes("vision") ||
        slug.includes("language") ||
        slug.includes("research")
    ) {
        return "data-ml";
    }
    if (
        slug.includes("web") ||
        slug.includes("javascript") ||
        slug.includes("html") ||
        slug.includes("backend") ||
        slug.includes("api")
    ) {
        return "web";
    }
    return "logic-code";
};

const humanize = (slug: string) =>
    slug
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");

const ToolPage: React.FC<ToolPageProps> = ({
    toolSlug,
    title,
    description,
    mode,
    courses,
}) => {
    const [completionMessage, setCompletionMessage] = useState("");

    return (
        <div className="flex min-h-screen w-full flex-col bg-dark-grey-primary">
            <Head>
                <title>{`${title} | Free C4T Concept Simulator`}</title>
                <meta
                    name="description"
                    content={`${description} This free C4T browser concept simulator uses guided controls and requires no account or physical equipment.`}
                />
            </Head>
            <Navbar />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-8 sm:px-6">
                <nav aria-label="Breadcrumb">
                    <ol className="flex flex-wrap gap-2 text-sm text-medium-grey">
                        <li>
                            <Link
                                href="/courses"
                                className="rounded outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                            >
                                Courses
                            </Link>
                        </li>
                        <li aria-hidden="true">/</li>
                        <li aria-current="page" className="text-[#D6D3DC]">
                            {title}
                        </li>
                    </ol>
                </nav>

                <header className="mt-6 rounded-3xl border border-white/10 bg-dark-grey-secondary p-6 sm:p-9">
                    <div className="flex flex-wrap gap-2">
                        <CourseBadge tone="green">$0 required</CourseBadge>
                        <CourseBadge tone="blue">
                            No account required
                        </CourseBadge>
                        <CourseBadge tone="purple">
                            No hardware required
                        </CourseBadge>
                    </div>
                    <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-brand-purple-secondary">
                        C4T free concept simulator
                    </p>
                    <h1 className="mt-2 text-3xl font-bold text-white sm:text-5xl">
                        {title}
                    </h1>
                    <p className="mt-4 max-w-3xl text-base leading-7 text-[#D6D3DC]">
                        {description}
                    </p>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-emerald-200">
                        This free concept simulator supports guided prediction,
                        comparison, and reflection. It does not execute code,
                        train models, run databases, create repositories, or
                        replace full project software. The course&apos;s
                        always-free pathway also explains how to create project
                        files with freely installable or open tools; paid
                        services and physical hardware remain optional.
                    </p>
                </header>

                <FreeLabSimulator
                    className="mt-8"
                    mode={mode}
                    title={title}
                    description={description}
                    onComplete={(completion) =>
                        setCompletionMessage(
                            `Concept simulation complete: ${completion.outcome}. You can change the controls and try again.`
                        )
                    }
                />
                <p
                    className="mt-4 min-h-[24px] text-sm text-emerald-200"
                    aria-live="polite"
                >
                    {completionMessage}
                </p>

                <section className="mt-8 rounded-2xl border border-white/10 bg-dark-grey-secondary p-5 sm:p-7">
                    <h2 className="text-xl font-bold text-white">
                        Courses using this free concept lab
                    </h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {courses.map((course) => (
                            <Link
                                key={course.id}
                                href={`/courses/${course.slug}`}
                                className="rounded-xl border border-white/10 bg-dark-grey-primary/30 p-4 font-semibold text-white outline-none hover:border-brand-purple-secondary/60 hover:bg-brand-purple-secondary/[0.06] focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                            >
                                {course.title}
                                <span
                                    aria-hidden="true"
                                    className="ml-2 text-brand-purple-secondary"
                                >
                                    →
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>

                <p className="mt-6 text-center text-xs leading-5 text-medium-grey">
                    Lab ID: {toolSlug}. The guided controls run in your browser;
                    this page does not execute course code or connect to
                    external hardware, model, database, or deployment services.
                </p>
            </main>
            <Footer />
        </div>
    );
};

const getToolEntries = () => {
    const entries = new Map<
        string,
        {
            toolSlug: string;
            title: string;
            description: string;
            mode: FreeLabMode;
            courses: ToolCourse[];
        }
    >();

    courseRegistry.forEach((course) => {
        course.requirements.forEach((requirement) => {
            const url = requirement.freePath.url;
            if (!url?.startsWith("/learn/tools/")) return;
            const slug = url.split("/").filter(Boolean).pop();
            if (!slug) return;

            const existing = entries.get(slug);
            const courseSummary = {
                id: course.id,
                slug: course.slug,
                title: course.title,
            };
            if (existing) {
                if (!existing.courses.some((item) => item.id === course.id)) {
                    existing.courses.push(courseSummary);
                }
                return;
            }

            const simulator = course.simulators[0];
            entries.set(slug, {
                toolSlug: slug,
                title:
                    simulator?.name ||
                    requirement.freePath.name ||
                    humanize(slug),
                description:
                    simulator?.purpose || requirement.freePath.description,
                mode: toolMode(slug),
                courses: [courseSummary],
            });
        });
    });

    return entries;
};

export const getStaticPaths: GetStaticPaths = async () => ({
    paths: Array.from(getToolEntries().keys()).map((toolSlug) => ({
        params: { toolSlug },
    })),
    fallback: false,
});

export const getStaticProps: GetStaticProps<ToolPageProps> = async ({
    params,
}) => {
    const toolSlug = String(params?.toolSlug || "");
    const entry = getToolEntries().get(toolSlug);

    if (!entry) {
        return { notFound: true };
    }

    return { props: entry };
};

export default ToolPage;
