import CourseBadge, { CourseChipList } from "@components/Learning/CourseBadge";
import Footer from "@components/Footer";
import Navbar from "@components/Navbar";
import clsx from "clsx";
import TermRegistration from "@components/Learning/TermRegistration";
import { getTermPhase, type TermPhase } from "@utils/sessionSchedule";
import type { CourseLevel } from "learning/course-models";
import { courseRegistry } from "learning/course-registry";
import { learningPaths } from "learning/learning-paths";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";

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
    isHardwareCourse: boolean;
    freeCompletionPromise: string;
    /** Videos and step-throughs in the hand-written lessons, when written. */
    media: { videos: number; traces: number; quizQuestions: number } | null;
    live: {
        term: string;
        termLabel: string;
        meets: string;
        starts: string;
        weeks: number;
        minutesPerClass: number;
    } | null;
}

interface LiveTerm {
    term: string;
    termLabel: string;
    /** Registration phase when the page was built; the client re-checks. */
    phase: TermPhase;
    starts: string;
    weeks: number;
    minutesPerClass: number;
    courses: CourseSummary[];
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

interface CoursesProps {
    /** Self-paced catalog. Live classes are listed under their term instead. */
    courses: CourseSummary[];
    liveTerms: LiveTerm[];
    paths: PathSummary[];
}

const SELF_PACED_TAB = "self-paced";

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
    phone: "📱",
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
        ...(course.media?.videos
            ? [
                  {
                      id: "videos",
                      label: `${course.media.videos} videos`,
                      tone: "green" as const,
                  },
              ]
            : []),
        ...(course.media?.traces
            ? [
                  {
                      id: "traces",
                      label: `${course.media.traces} step-throughs`,
                      tone: "green" as const,
                  },
              ]
            : []),
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
                            ? "Physical hardware is optional for this course."
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

/** 90 -> "1.5-hour" */
const formatClassLength = (minutes: number) => `${minutes / 60}-hour`;

const LiveClassCard: React.FC<{ course: CourseSummary }> = ({ course }) => {
    const live = course.live;
    if (!live) return null;

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
                        <CourseBadge tone="green">Free</CourseBadge>
                        <CourseBadge tone="purple">Live online</CourseBadge>
                    </div>
                </div>

                <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-brand-purple-secondary">
                    {live.termLabel} · {levelLabels[course.level]}
                </p>
                <h3 className="mt-2 text-xl font-bold leading-tight text-white">
                    {course.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#C7C3CE]">
                    {course.summary}
                </p>

                <dl className="mt-5 space-y-2 rounded-xl border border-white/10 bg-dark-grey-primary/40 p-4 text-sm">
                    <div className="flex gap-3">
                        <dt className="w-16 shrink-0 text-medium-grey">
                            Meets
                        </dt>
                        <dd className="font-semibold text-white">
                            {live.meets}
                        </dd>
                    </div>
                    <div className="flex gap-3">
                        <dt className="w-16 shrink-0 text-medium-grey">
                            Length
                        </dt>
                        <dd className="font-semibold text-white">
                            {live.weeks} weeks ·{" "}
                            {formatClassLength(live.minutesPerClass)} class
                        </dd>
                    </div>
                    <div className="flex gap-3">
                        <dt className="w-16 shrink-0 text-medium-grey">
                            Starts
                        </dt>
                        <dd className="font-semibold text-white">
                            {live.starts}
                        </dd>
                    </div>
                </dl>

                <div className="mt-auto pt-6">
                    <Link
                        href={`/courses/${course.slug}`}
                        className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-gradient-to-b from-brand-purple-primary to-brand-purple-secondary px-4 py-3 text-sm font-bold text-white outline-none transition group-hover:brightness-110 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dark-grey-secondary"
                    >
                        See the week-by-week curriculum
                        <span aria-hidden="true" className="ml-2">
                            →
                        </span>
                    </Link>
                </div>
            </div>
        </article>
    );
};

const Courses: React.FC<CoursesProps> = ({ courses, liveTerms, paths }) => {
    const router = useRouter();
    const tabs = useMemo(
        () => [
            {
                id: SELF_PACED_TAB,
                label: "Self-paced courses",
                count: courses.length,
            },
            ...liveTerms.map((term) => ({
                id: term.term,
                label: `${term.termLabel} live classes`,
                count: term.courses.length,
            })),
        ],
        [courses.length, liveTerms]
    );
    const [activeTab, setActiveTab] = useState(SELF_PACED_TAB);

    // The page is static, so ?tab= is only readable after hydration. A link
    // such as /courses?tab=fall-2026 opens straight onto that term.
    useEffect(() => {
        if (!router.isReady) return;
        const requested = router.query.tab;
        if (
            typeof requested === "string" &&
            tabs.some((tab) => tab.id === requested)
        ) {
            setActiveTab(requested);
        }
    }, [router.isReady, router.query.tab, tabs]);

    const selectTab = (tabId: string) => {
        setActiveTab(tabId);
        router.replace(
            {
                pathname: router.pathname,
                query: tabId === SELF_PACED_TAB ? {} : { tab: tabId },
            },
            undefined,
            { shallow: true, scroll: false }
        );
    };

    const handleTabKeyDown = (event: React.KeyboardEvent, index: number) => {
        const offset =
            event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
        if (!offset) return;
        event.preventDefault();
        const next = tabs[(index + offset + tabs.length) % tabs.length];
        selectTab(next.id);
        document.getElementById(`courses-tab-${next.id}`)?.focus();
    };

    const activeTerm = liveTerms.find((term) => term.term === activeTab);
    const liveCourseCount = liveTerms.reduce(
        (total, term) => total + term.courses.length,
        0
    );

    const [query, setQuery] = useState("");
    const [level, setLevel] = useState<"all" | CourseLevel>("all");
    const [access, setAccess] = useState<"all" | "hardware">("all");

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
                    content={`Explore ${courses.length} free self-paced Code 4 Tomorrow courses and ${liveCourseCount} live classes. Every course includes a free setup path and no required paid tools.`}
                />
            </Head>
            <Navbar />

            <main className="mx-auto w-full max-w-screen-2xl flex-1 px-4 pb-20 pt-8 sm:px-6 lg:px-10">
                <section className="overflow-hidden rounded-3xl border border-white/10 bg-dark-grey-secondary px-5 py-10 sm:px-10 lg:px-14">
                    <div className="max-w-4xl">
                        <CourseBadge tone="green">
                            {courses.length} self-paced courses
                            {liveCourseCount
                                ? ` · ${liveCourseCount} live classes`
                                : ""}{" "}
                            · always free
                        </CourseBadge>
                        <h1 className="mt-5 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                            Learn by building,{" "}
                            <span className="text-brand-purple-secondary">
                                without a paywall.
                            </span>
                        </h1>
                        <p className="mt-5 max-w-3xl text-base leading-7 text-[#C7C3CE] sm:text-lg">
                            Every course starts with a setup module that walks
                            you through installing free tools. Nothing in any
                            course requires paying for software, hardware, or
                            cloud services.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            {process.env.NEXT_PUBLIC_ACCOUNTS_ENABLED !==
                                "false" && (
                                <Link
                                    href="/learn/dashboard"
                                    className="inline-flex min-h-[44px] items-center rounded-xl bg-gradient-to-b from-brand-purple-primary to-brand-purple-secondary px-5 py-3 text-sm font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-white"
                                >
                                    Open my learning dashboard
                                </Link>
                            )}
                            <a
                                href="#catalog"
                                className="inline-flex min-h-[44px] items-center rounded-xl border border-white/15 px-5 py-3 text-sm font-bold text-white outline-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                            >
                                Browse all courses
                            </a>
                        </div>
                    </div>
                </section>

                <div
                    role="tablist"
                    aria-label="Course formats"
                    className="mt-12 flex flex-wrap gap-2 border-b border-white/10"
                >
                    {tabs.map((tab, index) => {
                        const selected = tab.id === activeTab;
                        return (
                            <button
                                key={tab.id}
                                id={`courses-tab-${tab.id}`}
                                type="button"
                                role="tab"
                                aria-selected={selected}
                                aria-controls={`courses-panel-${tab.id}`}
                                tabIndex={selected ? 0 : -1}
                                onClick={() => selectTab(tab.id)}
                                onKeyDown={(event) =>
                                    handleTabKeyDown(event, index)
                                }
                                className={clsx(
                                    "-mb-px min-h-[44px] rounded-t-xl border-b-2 px-4 py-2.5 text-sm font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-brand-purple-secondary",
                                    selected
                                        ? "border-brand-purple-secondary text-white"
                                        : "border-transparent text-medium-grey hover:text-white"
                                )}
                            >
                                {tab.label}
                                <span
                                    className={clsx(
                                        "ml-2 rounded-full px-2 py-0.5 text-xs",
                                        selected
                                            ? "bg-brand-purple-secondary/20 text-[#DCE4FF]"
                                            : "bg-white/5"
                                    )}
                                >
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {activeTerm && (
                    <section
                        id={`courses-panel-${activeTerm.term}`}
                        role="tabpanel"
                        aria-labelledby={`courses-tab-${activeTerm.term}`}
                        className="mt-8"
                    >
                        <div className="flex flex-col gap-5 rounded-2xl border border-brand-purple-secondary/30 bg-brand-purple-secondary/[0.06] p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
                            <div className="max-w-3xl">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-purple-secondary">
                                    {activeTerm.termLabel} session
                                </p>
                                <h2 className="mt-2 text-3xl font-bold text-white">
                                    Free live classes with C4T teachers
                                </h2>
                                <p className="mt-3 text-sm leading-6 text-[#D6D3DC] sm:text-base">
                                    Each class meets online once a week for{" "}
                                    {activeTerm.minutesPerClass / 60} hours, for{" "}
                                    {activeTerm.weeks} weeks. Starts:{" "}
                                    {activeTerm.starts}. Every week also has
                                    lessons and practice here, so you can review
                                    or catch up between classes.
                                </p>
                            </div>
                            <TermRegistration
                                key={activeTerm.term}
                                term={activeTerm.term}
                                termLabel={activeTerm.termLabel}
                                initialPhase={activeTerm.phase}
                                label={`Register for ${activeTerm.termLabel}`}
                            />
                        </div>
                        <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                            {activeTerm.courses.map((course) => (
                                <LiveClassCard
                                    key={course.id}
                                    course={course}
                                />
                            ))}
                        </div>
                    </section>
                )}

                <div
                    id={`courses-panel-${SELF_PACED_TAB}`}
                    role="tabpanel"
                    aria-labelledby={`courses-tab-${SELF_PACED_TAB}`}
                    hidden={activeTab !== SELF_PACED_TAB}
                >
                    <section
                        id="catalog"
                        aria-labelledby="catalog-title"
                        className="mt-8"
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
                                    <span className="mb-1.5 block">
                                        Free tools
                                    </span>
                                    <select
                                        value={access}
                                        onChange={(event) =>
                                            setAccess(
                                                event.target
                                                    .value as typeof access
                                            )
                                        }
                                        className="min-h-[44px] w-full rounded-xl border border-white/15 bg-dark-grey-secondary px-3 py-2 text-white outline-none focus:border-brand-purple-secondary focus:ring-2 focus:ring-brand-purple-secondary/40"
                                    >
                                        <option value="all">
                                            All free pathways
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
                                    Try a broader search or reset the level and
                                    tool filters.
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
                            Each path is an ordered route through the catalog,
                            from the first course to a capstone project.
                            Recommended prior courses are advisory — you can
                            always jump straight in.
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
                </div>
            </main>
            <Footer />
        </div>
    );
};

export async function getStaticProps() {
    const allCourses: CourseSummary[] = courseRegistry
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
            isHardwareCourse: course.requirements.some(
                (requirement) => requirement.category === "hardware"
            ),
            freeCompletionPromise: course.freeCompletionPromise,
            media: course.contentSummary
                ? {
                      videos: course.contentSummary.videos,
                      traces: course.contentSummary.traces,
                      quizQuestions: course.contentSummary.quizQuestions,
                  }
                : null,
            live: course.liveSession
                ? {
                      term: course.liveSession.term,
                      termLabel: course.liveSession.termLabel,
                      meets: course.liveSession.meets,
                      starts: course.liveSession.starts,
                      weeks: course.liveSession.weeks,
                      minutesPerClass: course.liveSession.minutesPerClass,
                  }
                : null,
        }))
        .sort((a, b) => a.order - b.order);

    const liveTerms: LiveTerm[] = [];
    allCourses
        .filter((course) => course.live)
        .forEach((course) => {
            const live = course.live!;
            let term = liveTerms.find((item) => item.term === live.term);
            if (!term) {
                term = {
                    term: live.term,
                    termLabel: live.termLabel,
                    phase: getTermPhase(live.term),
                    starts: live.starts,
                    weeks: live.weeks,
                    minutesPerClass: live.minutesPerClass,
                    courses: [],
                };
                liveTerms.push(term);
            }
            term.courses.push(course);
        });
    const courses = allCourses.filter((course) => !course.live);

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
            liveTerms,
            paths,
        },
        // Rebuilt hourly so registration opening/closing reaches the HTML;
        // the register button also re-checks the date in the browser.
        revalidate: 60 * 60,
    };
}

export default Courses;
