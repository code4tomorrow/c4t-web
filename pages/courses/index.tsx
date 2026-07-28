import CourseBadge, { CourseChipList } from "@components/Learning/CourseBadge";
import Footer from "@components/Footer";
import Navbar from "@components/Navbar";
import { graphQLClient } from "@utils/contentful";
import clsx from "clsx";
import config from "config";
import { gql } from "graphql-request";
import type { CourseLevel } from "learning/course-models";
import { courseRegistry } from "learning/course-registry";
import { learningPaths } from "learning/learning-paths";
import Head from "next/head";
import Link from "next/link";
import React, { useMemo, useState } from "react";

/**
 * Kept for the legacy Notion course renderer and card component. New online
 * modules use the richer Course model in learning/course-models.ts.
 */
export interface ICourse {
    title?: string;
    description?: string;
    learnMoreLink?: string;
    notionPageId?: string;
    notionSlug?: string;
    promotionalLabel?: {
        label: string;
        color?: string;
    };
    image?: {
        src: string;
    };
}

interface CourseSummary {
    id: string;
    order: number;
    slug: string;
    title: string;
    summary: string;
    level: CourseLevel;
    tags: string[];
    icon: string;
    accent: string;
    estimatedTotalHours: number;
    suggestedWeeks: number;
    moduleCount: number;
    lessonCount: number;
    assignmentCount: number;
    hasSimulator: boolean;
    isHardwareCourse: boolean;
    freeCompletionPromise: string;
}

interface PathSummary {
    slug: string;
    title: string;
    summary: string;
    icon: string;
    accent: string;
    courseCount: number;
    totalHours: number;
}

interface LegacyCourseLink {
    title: string;
    href: string;
}

interface CoursesProps {
    courses: CourseSummary[];
    paths: PathSummary[];
    legacyCourses: LegacyCourseLink[];
}

const levelLabels: Record<CourseLevel, string> = {
    "absolute-beginner": "Absolute beginner",
    beginner: "Beginner",
    "beginner-intermediate": "Beginner to intermediate",
    intermediate: "Intermediate",
    "advanced-intermediate": "Advanced intermediate",
    advanced: "Advanced",
};

const levelOrder: CourseLevel[] = [
    "absolute-beginner",
    "beginner",
    "beginner-intermediate",
    "intermediate",
    "advanced-intermediate",
    "advanced",
];

const iconGlyphs: Record<string, string> = {
    agent: "🛠️",
    antenna: "📡",
    blocks: "🧱",
    bolt: "⚡",
    brain: "🧠",
    browser: "🌐",
    chart: "📊",
    "chip-ai": "🧠",
    "cloud-gear": "☁️",
    database: "🗄️",
    eye: "👁️",
    flask: "🔬",
    gamepad: "🎮",
    "git-branch": "⑂",
    messages: "💬",
    microchip: "📟",
    network: "🕸️",
    nodes: "🔗",
    puzzle: "🧩",
    robot: "🤖",
    sliders: "🎛️",
    sparkles: "✨",
    terminal: "⌨️",
    toolbox: "🧰",
    wand: "🪄",
};

const getIconGlyph = (icon: string) =>
    iconGlyphs[icon.toLowerCase()] || (icon.length <= 3 ? icon : "⌘");

const CourseCatalogCard: React.FC<{ course: CourseSummary }> = ({ course }) => {
    const chips = [
        {
            id: "modules",
            label: `${course.moduleCount} modules`,
            tone: "purple" as const,
        },
        {
            id: "lessons",
            label: `${course.lessonCount} lessons`,
            tone: "grey" as const,
        },
        {
            id: "time",
            label: `${course.estimatedTotalHours} hours`,
            tone: "blue" as const,
        },
    ];

    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-dark-grey-secondary shadow-[0_16px_45px_rgba(0,0,0,0.2)] transition duration-200 hover:-translate-y-1 hover:border-brand-purple-secondary/60 motion-reduce:transform-none">
            <div
                className="h-1.5 w-full"
                style={{ backgroundColor: course.accent }}
                aria-hidden="true"
            />
            <div className="flex h-full flex-col p-5">
                <div className="flex items-start justify-between gap-4">
                    <span
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-dark-grey-accent text-2xl"
                        aria-hidden="true"
                    >
                        {getIconGlyph(course.icon)}
                    </span>
                    <div className="flex flex-wrap justify-end gap-2">
                        <CourseBadge tone="green">$0 required</CourseBadge>
                        {course.hasSimulator && (
                            <CourseBadge tone="blue">
                                Free simulator
                            </CourseBadge>
                        )}
                    </div>
                </div>

                <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-brand-purple-secondary">
                    Course {course.order}
                </p>
                <h2 className="mt-2 text-xl font-bold leading-tight text-white">
                    {course.title}
                </h2>
                <p className="mt-3 line-clamp-4 text-sm leading-6 text-[#C7C3CE]">
                    {course.summary}
                </p>

                <div className="mt-4">
                    <CourseChipList items={chips} />
                </div>

                <div className="mt-auto pt-6">
                    <p className="mb-4 text-xs leading-5 text-medium-grey">
                        {course.isHardwareCourse
                            ? "Complete every activity with the included browser simulator—physical hardware is optional."
                            : course.freeCompletionPromise}
                    </p>
                    <Link
                        href={`/courses/${course.slug}`}
                        className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-gradient-to-b from-brand-purple-primary to-brand-purple-secondary px-4 py-3 text-sm font-bold text-white outline-none transition group-hover:brightness-110 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dark-grey-secondary"
                    >
                        Explore course
                        <span aria-hidden="true" className="ml-2">
                            →
                        </span>
                    </Link>
                </div>
            </div>
        </article>
    );
};

const Courses: React.FC<CoursesProps> = ({ courses, paths, legacyCourses }) => {
    const [query, setQuery] = useState("");
    const [level, setLevel] = useState<"all" | CourseLevel>("all");
    const [access, setAccess] = useState<"all" | "simulator" | "hardware">(
        "all"
    );

    const filteredCourses = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return courses.filter((course) => {
            const matchesQuery =
                !normalizedQuery ||
                [
                    course.title,
                    course.summary,
                    ...course.tags,
                    levelLabels[course.level],
                ].some((value) =>
                    value.toLowerCase().includes(normalizedQuery)
                );
            const matchesLevel = level === "all" || course.level === level;
            const matchesAccess =
                access === "all" ||
                (access === "simulator" && course.hasSimulator) ||
                (access === "hardware" && course.isHardwareCourse);
            return matchesQuery && matchesLevel && matchesAccess;
        });
    }, [access, courses, level, query]);

    return (
        <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-dark-grey-primary">
            <Head>
                <title>Free Online Coding Courses | C4T</title>
                <meta
                    name="description"
                    content="Explore 25 complete Code 4 Tomorrow courses. Every course includes a free setup path, browser-based alternatives, and no required paid tools."
                />
            </Head>
            <Navbar />

            <main className="mx-auto w-full max-w-screen-2xl flex-1 px-4 pb-20 pt-8 sm:px-6 lg:px-10">
                <section className="overflow-hidden rounded-3xl border border-white/10 bg-dark-grey-secondary px-5 py-10 sm:px-10 lg:px-14">
                    <div className="max-w-4xl">
                        <CourseBadge tone="green">
                            25 courses · always free to complete
                        </CourseBadge>
                        <h1 className="mt-5 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                            Learn by building,{" "}
                            <span className="text-brand-purple-secondary">
                                without a paywall.
                            </span>
                        </h1>
                        <p className="mt-5 max-w-3xl text-base leading-7 text-[#C7C3CE] sm:text-lg">
                            Every course starts with a guided requirements and
                            setup module. You will always find a complete free
                            path—including browser simulators when hardware,
                            cloud compute, GPUs, or paid AI APIs would otherwise
                            be needed.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link
                                href="/learn/dashboard"
                                className="inline-flex min-h-[44px] items-center rounded-xl bg-gradient-to-b from-brand-purple-primary to-brand-purple-secondary px-5 py-3 text-sm font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-white"
                            >
                                Open my learning dashboard
                            </Link>
                            <a
                                href="#catalog"
                                className="inline-flex min-h-[44px] items-center rounded-xl border border-white/15 px-5 py-3 text-sm font-bold text-white outline-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                            >
                                Browse all courses
                            </a>
                        </div>
                    </div>
                </section>

                <section
                    id="catalog"
                    aria-labelledby="catalog-title"
                    className="mt-12"
                >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-purple-secondary">
                                Course catalog
                            </p>
                            <h2
                                id="catalog-title"
                                className="mt-2 text-3xl font-bold text-white"
                            >
                                Choose your next skill
                            </h2>
                            <p
                                className="mt-2 text-sm text-medium-grey"
                                aria-live="polite"
                            >
                                Showing {filteredCourses.length} of{" "}
                                {courses.length} courses
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            <label className="text-sm font-semibold text-[#D6D3DC]">
                                <span className="mb-1.5 block">
                                    Search courses
                                </span>
                                <input
                                    value={query}
                                    onChange={(event) =>
                                        setQuery(event.target.value)
                                    }
                                    type="search"
                                    placeholder="Python, AI, hardware…"
                                    className="min-h-[44px] w-full rounded-xl border border-white/15 bg-dark-grey-secondary px-3 py-2 text-white outline-none placeholder:text-dim-grey focus:border-brand-purple-secondary focus:ring-2 focus:ring-brand-purple-secondary/40"
                                />
                            </label>

                            <label className="text-sm font-semibold text-[#D6D3DC]">
                                <span className="mb-1.5 block">Level</span>
                                <select
                                    value={level}
                                    onChange={(event) =>
                                        setLevel(
                                            event.target.value as
                                                | "all"
                                                | CourseLevel
                                        )
                                    }
                                    className="min-h-[44px] w-full rounded-xl border border-white/15 bg-dark-grey-secondary px-3 py-2 text-white outline-none focus:border-brand-purple-secondary focus:ring-2 focus:ring-brand-purple-secondary/40"
                                >
                                    <option value="all">All levels</option>
                                    {levelOrder.map((value) => (
                                        <option key={value} value={value}>
                                            {levelLabels[value]}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="text-sm font-semibold text-[#D6D3DC]">
                                <span className="mb-1.5 block">Free tools</span>
                                <select
                                    value={access}
                                    onChange={(event) =>
                                        setAccess(
                                            event.target.value as typeof access
                                        )
                                    }
                                    className="min-h-[44px] w-full rounded-xl border border-white/15 bg-dark-grey-secondary px-3 py-2 text-white outline-none focus:border-brand-purple-secondary focus:ring-2 focus:ring-brand-purple-secondary/40"
                                >
                                    <option value="all">
                                        All free pathways
                                    </option>
                                    <option value="simulator">
                                        Includes simulator
                                    </option>
                                    <option value="hardware">
                                        Hardware courses
                                    </option>
                                </select>
                            </label>
                        </div>
                    </div>

                    {filteredCourses.length ? (
                        <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                            {filteredCourses.map((course) => (
                                <CourseCatalogCard
                                    key={course.id}
                                    course={course}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="mt-7 rounded-2xl border border-dashed border-white/15 bg-dark-grey-secondary p-8 text-center">
                            <h3 className="text-xl font-bold text-white">
                                No courses match those filters
                            </h3>
                            <p className="mt-2 text-sm text-medium-grey">
                                Try a broader search or reset the level and tool
                                filters.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setQuery("");
                                    setLevel("all");
                                    setAccess("all");
                                }}
                                className={clsx(
                                    "mt-5 min-h-[44px] rounded-xl border border-brand-purple-secondary px-4 py-2 text-sm font-bold text-white",
                                    "outline-none hover:bg-brand-purple-secondary/10 focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                                )}
                            >
                                Reset filters
                            </button>
                        </div>
                    )}
                </section>

                <section
                    aria-labelledby="paths-title"
                    className="mt-14 rounded-3xl border border-white/10 bg-dark-grey-secondary px-5 py-8 sm:px-8"
                >
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-purple-secondary">
                        Not sure where to start?
                    </p>
                    <h2
                        id="paths-title"
                        className="mt-2 text-3xl font-bold text-white"
                    >
                        Follow a learning path
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[#C7C3CE]">
                        Each path is an ordered route through the catalog, from
                        the first course to a capstone project. Recommended
                        prior courses are advisory — you can always jump
                        straight in.
                    </p>

                    <ul className="mt-6 grid list-none gap-4 pl-0 sm:grid-cols-2 xl:grid-cols-3">
                        {paths.map((path) => (
                            <li key={path.slug}>
                                <Link
                                    href="/learn/paths"
                                    className="group flex h-full flex-col rounded-2xl border border-white/10 bg-dark-grey-primary/40 p-5 outline-none transition hover:border-white/25 focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                                >
                                    <span
                                        aria-hidden="true"
                                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-xl"
                                        style={{
                                            backgroundColor: `${path.accent}26`,
                                        }}
                                    >
                                        {path.icon}
                                    </span>
                                    <span className="mt-3 text-lg font-bold text-white">
                                        {path.title}
                                    </span>
                                    <span className="mt-2 text-sm leading-6 text-[#C7C3CE]">
                                        {path.summary}
                                    </span>
                                    <span className="mt-auto pt-4 text-xs text-medium-grey">
                                        {path.courseCount} courses · ~
                                        {path.totalHours} hours
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>

                {legacyCourses.length > 0 && (
                    <section
                        aria-labelledby="library-title"
                        className="mt-14 rounded-3xl border border-white/10 bg-dark-grey-secondary px-5 py-8 sm:px-8"
                    >
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-purple-secondary">
                            Also available
                        </p>
                        <h2
                            id="library-title"
                            className="mt-2 text-3xl font-bold text-white"
                        >
                            C4T course library
                        </h2>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#C7C3CE]">
                            Reference material and curriculum notes from Code 4
                            Tomorrow&apos;s instructor-led classes. These
                            complement the self-paced courses above.
                        </p>

                        <ul className="mt-6 grid list-none gap-3 pl-0 sm:grid-cols-2 xl:grid-cols-3">
                            {legacyCourses.map((course) => (
                                <li key={course.href}>
                                    <Link
                                        href={course.href}
                                        className="flex min-h-[44px] items-center gap-3 rounded-xl border border-white/10 bg-dark-grey-primary/40 px-4 py-3 text-sm font-semibold text-white outline-none transition hover:border-white/25 focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                                    >
                                        <span
                                            aria-hidden="true"
                                            className="text-medium-grey"
                                        >
                                            ↗
                                        </span>
                                        {course.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </main>
            <Footer />
        </div>
    );
};

/**
 * The instructor-led library lives in Contentful/Notion. It is fetched
 * defensively so a credential or upstream outage degrades to hiding the
 * section rather than failing the whole catalog build.
 */
async function getLegacyCourseLinks(): Promise<LegacyCourseLink[]> {
    try {
        const response = await graphQLClient.request(
            gql`
                query ($preview: Boolean) {
                    courseCollection(preview: $preview) {
                        items {
                            title
                            learnMoreLink
                            notionSlug
                            notionPageId
                        }
                    }
                }
            `,
            { preview: config.contentful.preview }
        );

        const items: ICourse[] = response?.courseCollection?.items || [];

        return items
            .map((course) => {
                // Mirrors <Course />: the human-readable Notion slug is only
                // resolvable from the built sitemap, so development falls back
                // to the raw page id.
                const notionLink =
                    process.env.NODE_ENV === "development"
                        ? course.notionPageId
                        : course.notionSlug;
                const href = notionLink
                    ? `/courses/${notionLink}/`
                    : course.learnMoreLink;

                return href && course.title
                    ? { title: course.title, href }
                    : null;
            })
            .filter((link): link is LegacyCourseLink => Boolean(link));
    } catch (error) {
        console.warn(
            "Skipping the instructor-led course library on /courses:",
            error instanceof Error ? error.message : error
        );
        return [];
    }
}

export async function getStaticProps() {
    const courses: CourseSummary[] = courseRegistry
        .map((course) => ({
            id: course.id,
            order: course.order,
            slug: course.slug,
            title: course.title,
            summary: course.summary,
            level: course.level,
            tags: course.tags,
            icon: course.visualTreatment.icon,
            accent: course.visualTreatment.accent,
            estimatedTotalHours: course.estimatedTotalHours,
            suggestedWeeks: course.suggestedWeeks,
            moduleCount: course.modules.length,
            lessonCount: course.modules.reduce(
                (total, module) => total + module.lessons.length,
                0
            ),
            assignmentCount: course.assignments.length,
            hasSimulator: course.simulators.length > 0,
            isHardwareCourse: course.requirements.some(
                (requirement) => requirement.category === "hardware"
            ),
            freeCompletionPromise: course.freeCompletionPromise,
        }))
        .sort((a, b) => a.order - b.order);

    const paths: PathSummary[] = learningPaths.map((path) => ({
        slug: path.slug,
        title: path.title,
        summary: path.summary,
        icon: path.icon,
        accent: path.accent,
        courseCount: path.courses.length,
        totalHours: path.totalHours,
    }));

    return {
        props: {
            courses,
            paths,
            legacyCourses: await getLegacyCourseLinks(),
        },
        // Refresh the instructor-led library without a redeploy.
        revalidate: 60 * 15,
    };
}

export default Courses;
