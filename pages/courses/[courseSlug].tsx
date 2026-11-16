import CourseAttribution from "@components/Learning/CourseAttribution";
import CourseBadge from "@components/Learning/CourseBadge";
import ModuleLessonOutline from "@components/Learning/ModuleLessonOutline";
import RequirementsSetup from "@components/Learning/RequirementsSetup";
import type {
    CourseRequirement as SetupRequirement,
    FreeSetupPath,
    ModuleOutlineItem,
} from "@components/Learning/types";
import Footer from "@components/Footer";
import Navbar from "@components/Navbar";
import type {
    AppliedAssignment,
    Assessment,
    Course,
    CourseLevel,
    CourseModule,
    CourseRequirement,
    Lesson,
    PacingTemplate,
} from "learning/course-models";
import { courseRegistry, getCourseBySlug } from "learning/course-registry";
import { getPathsForCourse } from "learning/learning-paths";
import TermRegistration from "@components/Learning/TermRegistration";
import { accountsEnabled } from "lib/platform";
import { getTermPhase, type TermPhase } from "@utils/sessionSchedule";
import type { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import React from "react";
import EnrollButton from "@components/Learning/EnrollButton";

type CourseOverviewLesson = Pick<
    Lesson,
    "id" | "slug" | "title" | "objective" | "estimatedMinutes" | "required"
> & {
    interactionId: string;
};

type CourseOverviewModule = Pick<CourseModule, "id" | "title" | "overview"> & {
    lessons: CourseOverviewLesson[];
};

type CourseOverview = Pick<
    Course,
    | "id"
    | "order"
    | "slug"
    | "title"
    | "summary"
    | "description"
    | "level"
    | "prerequisites"
    | "learningOutcomes"
    | "estimatedTotalHours"
    | "suggestedWeeks"
    | "visualTreatment"
    | "requirements"
    | "simulators"
    | "contentSummary"
    | "freeCompletionPromise"
    | "certificateRules"
> & {
    modules: CourseOverviewModule[];
    assignments: Array<
        Pick<AppliedAssignment, "id" | "title" | "brief" | "freeCompletionPath">
    >;
    finalAssessment: Pick<Assessment, "title" | "instructions">;
    pacing: Array<
        Pick<PacingTemplate, "id" | "type" | "suggestedWeeks" | "weeklyHours">
    >;
    recommendedPriorCourses: Array<{ slug: string; title: string }>;
    /** null for self-paced courses. */
    live: {
        term: string;
        termLabel: string;
        format: string;
        meets: string;
        starts: string;
        weeks: number;
        minutesPerClass: number;
        /** Registration phase when the page was built; the client re-checks. */
        phase: TermPhase;
        classTools: Array<{ name: string; url: string; note: string }>;
        weeklyPlan: Array<{ week: number; title: string; topics: string[] }>;
        continueWith: { slug: string; title: string } | null;
    } | null;
    paths: Array<{
        slug: string;
        title: string;
        summary: string;
        icon: string;
        position: number;
        courseCount: number;
    }>;
};

interface CoursePageProps {
    course: CourseOverview;
    /** False when an administrator has not published this course yet. */
    enrollable: boolean;
    /** False on a deployment without a database (see lib/platform). */
    accountsOn: boolean;
}

const levelLabels: Record<CourseLevel, string> = {
    "absolute-beginner": "Absolute beginner",
    beginner: "Beginner",
    "beginner-intermediate": "Beginner to intermediate",
    intermediate: "Intermediate",
    "advanced-intermediate": "Advanced intermediate",
    advanced: "Advanced",
};

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

const getFirstLessonHref = (course: CourseOverview) => {
    const firstLesson = course.modules[0]?.lessons[0];
    return firstLesson
        ? `/learn/courses/${course.slug}/lessons/${firstLesson.slug}`
        : `/courses/${course.slug}`;
};

/** Which courses each downloadable starter file belongs to. */
const STARTER_ASSETS: Array<{
    href: string;
    label: string;
    description: string;
    courseIds: string[];
}> = [
    {
        href: "/learning-assets/python/garden_report.py",
        label: "Python project starter",
        description:
            "A small standard-library CSV application with clearly marked extension tasks.",
        courseIds: ["course-03", "course-04", "course-05"],
    },
    {
        href: "/learning-assets/web/index.html",
        label: "Accessible web starter",
        description:
            "A responsive HTML, CSS, and JavaScript project using fixed local data.",
        courseIds: ["course-06", "course-07"],
    },
    {
        href: "/learning-assets/sql/community-lab.sql",
        label: "SQLite practice database",
        description:
            "Original schema, synthetic seed rows, constraints, and review queries.",
        courseIds: [
            "course-11",
            "course-13",
            "course-17",
            "course-22",
            "course-23",
        ],
    },
    {
        href: "/learning-assets/hardware/sensor-trace.csv",
        label: "Simulated hardware sensor trace",
        description:
            "Synthetic device readings for no-hardware analysis and replay.",
        courseIds: ["course-09", "course-10", "course-17", "course-18"],
    },
    {
        href: "/learning-assets/ml/evaluation-fixture.json",
        label: "ML evaluation fixture",
        description:
            "Fixed, synthetic classification, retrieval, research, and deployment values.",
        courseIds: [
            "course-13",
            "course-14",
            "course-15",
            "course-16",
            "course-17",
            "course-18",
            "course-19",
            "course-20",
            "course-21",
            "course-22",
            "course-23",
            "course-29",
        ],
    },
    {
        href: "/learning-assets/datasets/community-garden-observations.csv",
        label: "Synthetic classification dataset",
        description:
            "Invented garden observations with a health label, for practicing splits, pipelines, and metrics.",
        courseIds: ["course-29"],
    },
    {
        href: "/learning-assets/agents/evaluation-task.json",
        label: "Bounded agent evaluation task",
        description:
            "A fictional repository task with deterministic checks and no credentials.",
        courseIds: ["course-24", "course-25"],
    },
    {
        href: "/learning-assets/agents/evaluation-trace.json",
        label: "Recorded safe agent trace",
        description:
            "A simulated multi-agent trace that blocks an unsafe action.",
        courseIds: ["course-24", "course-25"],
    },
];

const getStarterAssets = (course: CourseOverview) => [
    {
        href: "/learning-assets/README.md",
        label: "Starter pack guide & licenses",
        description:
            "See what each original synthetic dataset, fixture, and starter file contains.",
    },
    ...STARTER_ASSETS.filter((asset) =>
        asset.courseIds.includes(course.id)
    ).map(({ href, label, description }) => ({ href, label, description })),
];

/**
 * Requirements that pointed at the retired browser concept simulators are not
 * shown; the remaining ones keep their real setup steps and links.
 */
const isRetiredLab = (requirement: CourseRequirement) =>
    Boolean(requirement.freePath.url?.startsWith("/learn/tools/")) &&
    requirement.required;

const visibleRequirements = (course: CourseOverview) =>
    course.requirements
        .filter((requirement) => !isRetiredLab(requirement))
        .map((requirement) =>
            requirement.freePath.url?.startsWith("/learn/tools/")
                ? {
                      ...requirement,
                      freePath: { ...requirement.freePath, url: undefined },
                  }
                : requirement
        );

const toSetupRequirement = (
    requirement: CourseRequirement
): SetupRequirement => {
    return {
        id: requirement.id,
        name: requirement.name,
        purpose: requirement.reason,
        required: requirement.required,
        freeOption: {
            name: requirement.freePath.name,
            description: `${requirement.freePath.description} ${requirement.accessibilityNotes}`,
            steps: requirement.freePath.setupSteps,
            link: requirement.freePath.url
                ? {
                      label: `Open ${requirement.freePath.name}`,
                      href: requirement.freePath.url,
                  }
                : undefined,
        },
        paidOptions: requirement.paidOptions.map((option) => ({
            name: option.name,
            description: option.description,
            priceNote: "Optional only—never required for course completion.",
        })),
    };
};

const buildFreeSetupPath = (course: CourseOverview): FreeSetupPath => {
    const requirementSteps = visibleRequirements(course).flatMap(
        (requirement) =>
            requirement.freePath.setupSteps.map((description, index) => ({
                id: `${requirement.id}-step-${index + 1}`,
                title:
                    index === 0
                        ? `Set up ${requirement.freePath.name}`
                        : `${requirement.name}: step ${index + 1}`,
                description,
                estimatedMinutes: 5,
                link:
                    index === 0 && requirement.freePath.url
                        ? {
                              label: `Open ${requirement.freePath.name}`,
                              href: requirement.freePath.url,
                          }
                        : undefined,
            }))
    );

    return {
        title: "Your complete $0 setup",
        costLabel: "$0 required",
        summary: course.freeCompletionPromise,
        steps: [
            {
                id: `${course.id}-choose-path`,
                title: "Choose the free learning path",
                description:
                    "Everything required for this course is free. Paid software, APIs, cloud credits, GPUs, and physical equipment are optional.",
                estimatedMinutes: 2,
            },
            ...requirementSteps,
            {
                id: `${course.id}-verify`,
                title: "Run the setup check",
                description: visibleRequirements(course)
                    .map(
                        (requirement) =>
                            `${requirement.name}: ${requirement.freePath.verification}`
                    )
                    .join(" "),
                estimatedMinutes: 5,
            },
        ],
    };
};

const buildOutline = (course: CourseOverview): ModuleOutlineItem[] =>
    course.modules.map((module, moduleIndex) => ({
        id: module.id,
        title: module.title,
        description: module.overview,
        initiallyExpanded: moduleIndex === 0,
        lessons: module.lessons.map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            description: lesson.objective,
            estimatedMinutes: lesson.estimatedMinutes,
            required: lesson.required,
            status: "not-started",
            href: `/learn/courses/${course.slug}/lessons/${lesson.slug}`,
        })),
    }));

const toCourseOverview = (course: Course): CourseOverview => ({
    id: course.id,
    order: course.order,
    slug: course.slug,
    title: course.title,
    summary: course.summary,
    description: course.description,
    level: course.level,
    prerequisites: course.prerequisites,
    learningOutcomes: course.learningOutcomes,
    estimatedTotalHours: course.estimatedTotalHours,
    suggestedWeeks: course.suggestedWeeks,
    visualTreatment: course.visualTreatment,
    requirements: course.requirements,
    simulators: course.simulators,
    contentSummary: course.contentSummary,
    freeCompletionPromise: course.freeCompletionPromise,
    certificateRules: course.certificateRules,
    modules: course.modules.map((module) => ({
        id: module.id,
        title: module.title,
        overview: module.overview,
        lessons: module.lessons.map((lesson) => ({
            id: lesson.id,
            slug: lesson.slug,
            title: lesson.title,
            objective: lesson.objective,
            estimatedMinutes: lesson.estimatedMinutes,
            required: lesson.required,
            interactionId: lesson.interaction.id,
        })),
    })),
    assignments: course.assignments.map((assignment) => ({
        id: assignment.id,
        title: assignment.title,
        brief: assignment.brief,
        freeCompletionPath: assignment.freeCompletionPath,
    })),
    finalAssessment: {
        title: course.finalAssessment.title,
        instructions: course.finalAssessment.instructions,
    },
    pacing: course.pacing.map((pacing) => ({
        id: pacing.id,
        type: pacing.type,
        suggestedWeeks: pacing.suggestedWeeks,
        weeklyHours: pacing.weeklyHours,
    })),
    recommendedPriorCourses: course.recommendedPriorCourses
        .map((courseId) => courseRegistry.find((item) => item.id === courseId))
        .filter((item): item is Course => Boolean(item))
        .map((item) => ({ slug: item.slug, title: item.title })),
    live: course.liveSession
        ? {
              term: course.liveSession.term,
              termLabel: course.liveSession.termLabel,
              format: course.liveSession.format,
              meets: course.liveSession.meets,
              starts: course.liveSession.starts,
              weeks: course.liveSession.weeks,
              minutesPerClass: course.liveSession.minutesPerClass,
              phase: getTermPhase(course.liveSession.term),
              classTools: course.liveSession.classTools,
              weeklyPlan: course.modules
                  .filter((module) => module.kind === "core")
                  .map((module, index) => ({
                      week: index + 1,
                      title: module.title,
                      topics: module.lessons[0].sourceTopics,
                  })),
              continueWith: (() => {
                  const next = courseRegistry.find(
                      (item) => item.id === course.liveSession?.continueWith
                  );
                  return next ? { slug: next.slug, title: next.title } : null;
              })(),
          }
        : null,
    paths: getPathsForCourse(course.id).map((path) => ({
        slug: path.slug,
        title: path.title,
        summary: path.summary,
        icon: path.icon,
        position:
            path.courses.findIndex((item) => item.course.id === course.id) + 1,
        courseCount: path.courses.length,
    })),
});

const LiveClassDetails: React.FC<{ course: CourseOverview }> = ({ course }) => {
    const live = course.live;
    if (!live) return null;

    return (
        <section
            aria-labelledby="live-class-title"
            className="rounded-2xl border border-brand-purple-secondary/40 bg-brand-purple-secondary/[0.06] p-5 sm:p-7"
        >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-purple-secondary">
                        {live.termLabel} · {live.format}
                    </p>
                    <h2
                        id="live-class-title"
                        className="mt-2 text-2xl font-bold text-white"
                    >
                        Class schedule
                    </h2>
                    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                        <div>
                            <dt className="text-medium-grey">Meets</dt>
                            <dd className="mt-1 font-bold text-white">
                                {live.meets}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-medium-grey">Length</dt>
                            <dd className="mt-1 font-bold text-white">
                                {live.weeks} weeks · {live.minutesPerClass / 60}{" "}
                                hours per class
                            </dd>
                        </div>
                        <div>
                            <dt className="text-medium-grey">Starts</dt>
                            <dd className="mt-1 font-bold text-white">
                                {live.starts}
                            </dd>
                        </div>
                    </dl>
                </div>
                <TermRegistration
                    term={live.term}
                    termLabel={live.termLabel}
                    initialPhase={live.phase}
                    label="Register for this class"
                />
            </div>

            <h3 className="mt-7 font-bold text-white">Week by week</h3>
            <ol className="mt-3 grid gap-3 md:grid-cols-2">
                {live.weeklyPlan.map((week) => (
                    <li
                        key={week.week}
                        className="rounded-xl border border-white/10 bg-dark-grey-primary/40 p-4"
                    >
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-purple-secondary">
                            Week {week.week}
                        </p>
                        <p className="mt-1 font-bold text-white">
                            {week.title}
                        </p>
                        <ul className="mt-2 space-y-1 text-sm leading-6 text-[#C7C3CE]">
                            {week.topics.map((topic) => (
                                <li key={topic} className="flex gap-2">
                                    <span aria-hidden="true">•</span>
                                    {topic}
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ol>
            <p className="mt-3 text-sm leading-6 text-[#C7C3CE]">
                Before the first class, finish the free setup module. After the
                last class, you&apos;ll complete and present the capstone
                project.
            </p>

            <h3 className="mt-7 font-bold text-white">
                Free tools you&apos;ll use in class
            </h3>
            <ul className="mt-3 grid gap-3 md:grid-cols-2">
                {live.classTools.map((item) => {
                    const external = item.url.startsWith("http");
                    return (
                        <li
                            key={item.name}
                            className="rounded-xl border border-white/10 bg-dark-grey-primary/40 p-4"
                        >
                            {external ? (
                                <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-bold text-brand-purple-secondary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                                >
                                    {item.name}
                                    <span className="sr-only">
                                        {" "}
                                        (opens in a new tab)
                                    </span>
                                </a>
                            ) : (
                                <Link
                                    href={item.url}
                                    className="font-bold text-brand-purple-secondary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                                >
                                    {item.name}
                                </Link>
                            )}
                            <p className="mt-1 text-sm leading-6 text-[#C7C3CE]">
                                {item.note}
                            </p>
                        </li>
                    );
                })}
            </ul>

            {live.continueWith && (
                <p className="mt-6 text-sm leading-6 text-[#D6D3DC]">
                    <strong className="text-white">After the class:</strong>{" "}
                    keep going at your own pace with{" "}
                    <Link
                        href={`/courses/${live.continueWith.slug}`}
                        className="font-bold text-brand-purple-secondary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                    >
                        {live.continueWith.title}
                    </Link>
                    .
                </p>
            )}
        </section>
    );
};

const CoursePage: React.FC<CoursePageProps> = ({
    course,
    enrollable,
    accountsOn,
}) => {
    const software = visibleRequirements(course)
        .filter((requirement) =>
            ["browser", "software", "compute", "dataset"].includes(
                requirement.category
            )
        )
        .map((requirement) => toSetupRequirement(requirement));
    const hardware = visibleRequirements(course)
        .filter((requirement) => requirement.category === "hardware")
        .map((requirement) => toSetupRequirement(requirement));
    const accounts = visibleRequirements(course)
        .filter((requirement) => requirement.category === "account")
        .map((requirement) => toSetupRequirement(requirement));
    const firstLessonHref = getFirstLessonHref(course);

    const lessonCount = course.modules.reduce(
        (total, module) => total + module.lessons.length,
        0
    );
    const summary = course.contentSummary;
    const fullyWritten = Boolean(
        summary && summary.lessonsWritten >= lessonCount
    );
    // Rewritten courses teach with their own lessons; the old shared
    // starter files belong to the generated versions.
    const starterAssets = fullyWritten ? [] : getStarterAssets(course);
    const inside = summary
        ? [
              { value: summary.lessonsWritten, label: "hand-written lessons" },
              { value: summary.videos, label: "videos" },
              { value: summary.traces, label: "step-through animations" },
              {
                  value: summary.visuals,
                  label: "diagrams, charts & live previews",
              },
              { value: summary.quizQuestions, label: "quiz questions" },
              { value: summary.codeExamples, label: "code examples" },
          ].filter((item) => item.value > 0)
        : [];
    // Public page: the outline shows structure only. Per-learner status lives
    // behind the sign-in wall on the lesson player and dashboard.
    const outline = buildOutline(course);

    return (
        <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-dark-grey-primary">
            <Head>
                <title>{`${course.title} | Free C4T Course`}</title>
                <meta name="description" content={course.summary} />
                <link
                    rel="canonical"
                    href={`https://www.code4tomorrow.org/courses/${course.slug}`}
                />
            </Head>
            <Navbar />

            <main className="mx-auto w-full max-w-screen-2xl flex-1 px-4 pb-16 pt-8 sm:px-6 lg:px-10">
                <nav aria-label="Breadcrumb" className="mb-5">
                    <ol className="flex flex-wrap items-center gap-2 text-sm text-medium-grey">
                        <li>
                            <Link
                                href="/courses"
                                className="rounded outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                            >
                                Courses
                            </Link>
                        </li>
                        <li aria-hidden="true">/</li>
                        {course.live && (
                            <>
                                <li>
                                    <Link
                                        href={`/courses?tab=${course.live.term}`}
                                        className="rounded outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                                    >
                                        {course.live.termLabel} live classes
                                    </Link>
                                </li>
                                <li aria-hidden="true">/</li>
                            </>
                        )}
                        <li aria-current="page" className="text-[#D6D3DC]">
                            {course.title}
                        </li>
                    </ol>
                </nav>

                <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-dark-grey-secondary p-5 sm:p-8 lg:p-10">
                    <div
                        className="absolute inset-x-0 top-0 h-1.5"
                        style={{
                            backgroundColor: course.visualTreatment.accent,
                        }}
                        aria-hidden="true"
                    />
                    <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <CourseBadge tone="green">
                                    Complete for free
                                </CourseBadge>
                                <CourseBadge tone="blue">
                                    {levelLabels[course.level]}
                                </CourseBadge>
                                {course.live && (
                                    <CourseBadge tone="amber">
                                        {course.live.termLabel} ·{" "}
                                        {course.live.format}
                                    </CourseBadge>
                                )}
                            </div>
                            <div className="mt-5 flex items-start gap-4">
                                <span
                                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-dark-grey-accent text-3xl"
                                    aria-hidden="true"
                                >
                                    {getIconGlyph(course.visualTreatment.icon)}
                                </span>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-purple-secondary">
                                        {course.live
                                            ? `${course.live.termLabel} live class`
                                            : `Course ${course.order}`}
                                    </p>
                                    <h1 className="mt-1 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                                        {course.title}
                                    </h1>
                                </div>
                            </div>
                            <p className="mt-5 max-w-4xl text-base leading-7 text-[#D6D3DC] sm:text-lg">
                                {course.description}
                            </p>
                            <p className="mt-4 max-w-3xl rounded-xl border border-emerald-500/30 bg-emerald-500/[0.07] p-4 text-sm leading-6 text-emerald-100">
                                <strong>Free completion promise:</strong>{" "}
                                {course.freeCompletionPromise}
                            </p>
                            {inside.length > 0 && (
                                <div className="mt-6">
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-medium-grey">
                                        What&apos;s inside
                                    </p>
                                    <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                        {inside.map((item) => (
                                            <li
                                                key={item.label}
                                                className="rounded-2xl border border-white/10 bg-dark-grey-primary/40 px-4 py-3"
                                            >
                                                <span className="block text-2xl font-extrabold text-white">
                                                    {item.value}
                                                </span>
                                                <span className="text-xs font-semibold leading-5 text-medium-grey">
                                                    {item.label}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <aside className="rounded-2xl border border-white/10 bg-dark-grey-primary/40 p-5">
                            <h2 className="text-lg font-bold text-white">
                                Course at a glance
                            </h2>
                            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <dt className="text-medium-grey">
                                        Modules
                                    </dt>
                                    <dd className="mt-1 font-bold text-white">
                                        {course.modules.length}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-medium-grey">
                                        Lessons
                                    </dt>
                                    <dd className="mt-1 font-bold text-white">
                                        {lessonCount}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-medium-grey">Time</dt>
                                    <dd className="mt-1 font-bold text-white">
                                        {fullyWritten && summary
                                            ? `${Math.max(
                                                  1,
                                                  Math.round(
                                                      summary.minutes / 60
                                                  )
                                              )} hours`
                                            : `${course.estimatedTotalHours} hours`}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-medium-grey">Pace</dt>
                                    <dd className="mt-1 font-bold text-white">
                                        {course.suggestedWeeks} weeks
                                    </dd>
                                </div>
                            </dl>
                            {!accountsOn ? (
                                <>
                                    <Link
                                        href={firstLessonHref}
                                        className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-gradient-to-b from-brand-purple-primary to-brand-purple-secondary px-4 py-3 text-center text-sm font-bold text-white outline-none hover:brightness-110 focus-visible:ring-2 focus-visible:ring-white"
                                    >
                                        Start reading
                                        <span
                                            aria-hidden="true"
                                            className="ml-2"
                                        >
                                            →
                                        </span>
                                    </Link>
                                    <p className="mt-3 text-center text-xs leading-5 text-medium-grey">
                                        <strong className="text-amber-100">
                                            Account access coming soon.
                                        </strong>{" "}
                                        Every lesson is open to read now. Saved
                                        progress and certificates start once
                                        accounts open.
                                        {course.live &&
                                            " To join the live class, use Register in the schedule below."}
                                    </p>
                                </>
                            ) : enrollable ? (
                                <>
                                    <EnrollButton
                                        courseId={course.id}
                                        courseSlug={course.slug}
                                        firstLessonHref={firstLessonHref}
                                        className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-gradient-to-b from-brand-purple-primary to-brand-purple-secondary px-4 py-3 text-center text-sm font-bold text-white outline-none hover:brightness-110 focus-visible:ring-2 focus-visible:ring-white disabled:opacity-60"
                                    />
                                    <p className="mt-3 text-center text-xs leading-5 text-medium-grey">
                                        Always free — no payment method, ever. A
                                        free account saves your progress across
                                        devices.
                                    </p>
                                </>
                            ) : (
                                <div className="mt-6 rounded-xl border border-amber-500/40 bg-amber-500/[0.07] p-4 text-center">
                                    <p className="text-sm font-bold text-amber-100">
                                        Not open for enrollment yet
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-amber-100/80">
                                        The full syllabus is below. This course
                                        opens once C4T staff publish it.
                                    </p>
                                </div>
                            )}
                        </aside>
                    </div>
                </section>

                <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
                    <div className="space-y-8">
                        {course.live && <LiveClassDetails course={course} />}

                        <RequirementsSetup
                            courseTitle={course.title}
                            freePath={buildFreeSetupPath(course)}
                            software={software}
                            hardware={hardware}
                            accounts={accounts}
                        />

                        <section className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-5 sm:p-7">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-purple-secondary">
                                What you will be able to do
                            </p>
                            <h2 className="mt-2 text-2xl font-bold text-white">
                                Learning outcomes
                            </h2>
                            <ul className="mt-5 grid gap-3 md:grid-cols-2">
                                {course.learningOutcomes.map((outcome) => (
                                    <li
                                        key={outcome}
                                        className="flex gap-3 rounded-xl border border-white/10 bg-dark-grey-primary/30 p-4 text-sm leading-6 text-[#D6D3DC]"
                                    >
                                        <span
                                            aria-hidden="true"
                                            className="text-emerald-300"
                                        >
                                            ✓
                                        </span>
                                        <span>{outcome}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {starterAssets.length > 0 && (
                            <section className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-5 sm:p-7">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-purple-secondary">
                                            Included downloads
                                        </p>
                                        <h2 className="mt-2 text-2xl font-bold text-white">
                                            Free starter assets
                                        </h2>
                                    </div>
                                    <CourseBadge tone="green">
                                        Original · synthetic · licensed
                                    </CourseBadge>
                                </div>
                                <p className="mt-3 text-sm leading-6 text-[#C7C3CE]">
                                    These small files contain no personal data,
                                    credentials, or secrets. Dataset fixtures
                                    are CC0 and starter code is MIT licensed.
                                </p>
                                <div className="mt-5 grid gap-3 md:grid-cols-2">
                                    {starterAssets.map((asset) => (
                                        <a
                                            key={asset.href}
                                            href={asset.href}
                                            className="rounded-xl border border-white/10 bg-dark-grey-primary/30 p-4 outline-none hover:border-brand-purple-secondary/60 hover:bg-brand-purple-secondary/[0.06] focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                                        >
                                            <span className="font-bold text-white">
                                                {asset.label}
                                            </span>
                                            <span className="mt-1 block text-sm leading-6 text-medium-grey">
                                                {asset.description}
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            </section>
                        )}

                        <section className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-5 sm:p-7">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-purple-secondary">
                                        Build real work
                                    </p>
                                    <h2 className="mt-2 text-2xl font-bold text-white">
                                        Assignments &amp; capstone
                                    </h2>
                                </div>
                                <CourseBadge tone="green">
                                    Free tools accepted
                                </CourseBadge>
                            </div>
                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                                {course.assignments.map((assignment) => (
                                    <article
                                        key={assignment.id}
                                        className="rounded-xl border border-white/10 bg-dark-grey-primary/30 p-4"
                                    >
                                        <h3 className="font-bold text-white">
                                            {assignment.title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-6 text-[#C7C3CE]">
                                            {assignment.brief}
                                        </p>
                                        <p className="mt-3 text-xs leading-5 text-emerald-200">
                                            {assignment.freeCompletionPath}
                                        </p>
                                    </article>
                                ))}
                            </div>
                            <div className="mt-4 rounded-xl border border-brand-purple-secondary/40 bg-brand-purple-secondary/[0.07] p-5">
                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-purple-secondary">
                                    Final assessment
                                </p>
                                <h3 className="mt-2 text-lg font-bold text-white">
                                    {course.finalAssessment.title}
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-[#D6D3DC]">
                                    {course.finalAssessment.instructions}
                                </p>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-5 sm:p-7">
                            <h2 className="text-2xl font-bold text-white">
                                Prerequisites &amp; pacing
                            </h2>
                            <div className="mt-5 grid gap-5 md:grid-cols-2">
                                <div>
                                    <h3 className="font-bold text-white">
                                        Skills assumed
                                    </h3>
                                    <ul className="mt-3 space-y-2 text-sm leading-6 text-[#C7C3CE]">
                                        {course.prerequisites.map(
                                            (prerequisite) => (
                                                <li
                                                    key={prerequisite}
                                                    className="flex gap-2"
                                                >
                                                    <span aria-hidden="true">
                                                        •
                                                    </span>
                                                    {prerequisite}
                                                </li>
                                            )
                                        )}
                                    </ul>

                                    <h3 className="mt-5 font-bold text-white">
                                        Recommended prior courses
                                    </h3>
                                    {course.recommendedPriorCourses.length ===
                                    0 ? (
                                        <p className="mt-3 text-sm leading-6 text-[#C7C3CE]">
                                            None — this course is a starting
                                            point.
                                        </p>
                                    ) : (
                                        <>
                                            <ul className="mt-3 space-y-2 text-sm leading-6">
                                                {course.recommendedPriorCourses.map(
                                                    (prior) => (
                                                        <li key={prior.slug}>
                                                            <Link
                                                                href={`/courses/${prior.slug}`}
                                                                className="text-brand-purple-secondary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                                                            >
                                                                {prior.title}
                                                            </Link>
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                            <p className="mt-3 text-xs leading-5 text-medium-grey">
                                                These are advisory, not locks.
                                                If you already have the skills
                                                listed above, enroll directly.
                                            </p>
                                        </>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">
                                        Choose your pace
                                    </h3>
                                    <ul className="mt-3 space-y-2 text-sm leading-6 text-[#C7C3CE]">
                                        {course.pacing.map((pacing) => (
                                            <li key={pacing.id}>
                                                <strong className="capitalize text-white">
                                                    {pacing.type.replace(
                                                        "-",
                                                        " "
                                                    )}
                                                    :
                                                </strong>{" "}
                                                {pacing.suggestedWeeks} weeks at{" "}
                                                {pacing.weeklyHours} hours per
                                                week
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {course.paths.length > 0 && (
                                <div className="mt-6 border-t border-white/10 pt-5">
                                    <h3 className="font-bold text-white">
                                        Part of{" "}
                                        {course.paths.length === 1
                                            ? "this learning path"
                                            : "these learning paths"}
                                    </h3>
                                    <ul className="mt-3 space-y-3">
                                        {course.paths.map((path) => (
                                            <li
                                                key={path.slug}
                                                className="text-sm leading-6"
                                            >
                                                <Link
                                                    href="/learn/paths"
                                                    className="font-bold text-brand-purple-secondary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                                                >
                                                    {path.icon} {path.title}
                                                </Link>
                                                <span className="text-medium-grey">
                                                    {" "}
                                                    · step {
                                                        path.position
                                                    } of {path.courseCount}
                                                </span>
                                                <p className="text-[#C7C3CE]">
                                                    {path.summary}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </section>
                    </div>

                    <aside className="xl:sticky xl:top-6 xl:self-start">
                        <ModuleLessonOutline
                            modules={outline}
                            title="Complete course outline"
                        />
                        <section className="mt-5 rounded-2xl border border-white/10 bg-dark-grey-secondary p-5">
                            <h2 className="font-bold text-white">
                                Certificate requirements
                            </h2>
                            <ul className="mt-3 space-y-2 text-sm leading-6 text-[#C7C3CE]">
                                <li>Complete all required lessons.</li>
                                <li>Submit both applied assignments.</li>
                                <li>
                                    Earn at least{" "}
                                    {course.certificateRules.minimumQuizAverage}
                                    % across checkpoints.
                                </li>
                                <li>
                                    Pass the capstone with{" "}
                                    {
                                        course.certificateRules
                                            .capstonePassingScore
                                    }
                                    % or higher.
                                </li>
                                {course.certificateRules
                                    .safetyAcknowledgementRequired && (
                                    <li>
                                        Complete the hardware safety
                                        acknowledgement.
                                    </li>
                                )}
                            </ul>
                        </section>
                    </aside>
                </div>

                <CourseAttribution className="mt-8" />
            </main>
            <Footer />
        </div>
    );
};

export const getStaticPaths: GetStaticPaths = async () => ({
    paths: courseRegistry.map((course) => ({
        params: { courseSlug: course.slug },
    })),
    fallback: false,
});

/**
 * Publication status for every course, in one query.
 *
 * getStaticProps runs once per course, so reading each course's row separately
 * meant one round-trip to a remote database per course on every build — the
 * slowest part of the build by far. The promise is shared for a short window,
 * so a build fetches the set once and every page awaits the same result.
 *
 * The window must stay short: on a warm serverless instance this module
 * outlives many ISR regenerations, and a cache that never expired would pin
 * the first status it read, hiding publish/unpublish changes from /admin.
 */
const PUBLISH_STATUS_TTL_MS = 30_000;
let publishedCourseIds: {
    fetchedAt: number;
    value: Promise<Set<string> | null>;
} | null = null;

const getPublishedCourseIds = () => {
    if (
        !publishedCourseIds ||
        Date.now() - publishedCourseIds.fetchedAt > PUBLISH_STATUS_TTL_MS
    ) {
        publishedCourseIds = {
            fetchedAt: Date.now(),
            value: (async () => {
                try {
                    const { listPublishedCourseIds } = await import(
                        "lib/learner"
                    );
                    return await listPublishedCourseIds();
                } catch (error) {
                    // No database reachable (e.g. a preview build without
                    // DATABASE_URL). Returning null means "unknown", and
                    // callers stay optimistic — enrolment is still authorised
                    // server-side, so the worst case is a clear error on click.
                    console.warn(
                        "Could not read course publish status:",
                        error instanceof Error ? error.message : error
                    );
                    return null;
                }
            })(),
        };
    }
    return publishedCourseIds.value;
};

export const getStaticProps: GetStaticProps<CoursePageProps> = async ({
    params,
}) => {
    const course = getCourseBySlug(String(params?.courseSlug || ""));

    if (!course) {
        return { notFound: true };
    }

    const accountsOn = accountsEnabled();
    const published = accountsOn ? await getPublishedCourseIds() : null;

    return {
        props: {
            course: toCourseOverview(course),
            enrollable: published ? published.has(course.id) : true,
            accountsOn,
        },
        revalidate: 60,
    };
};

export default CoursePage;
