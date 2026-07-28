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

const getStarterAssets = (course: CourseOverview) => {
    const assets = [
        {
            href: "/learning-assets/README.md",
            label: "Starter pack guide & licenses",
            description:
                "See what each original synthetic dataset, fixture, and starter file contains.",
        },
    ];

    if ([3, 4, 5].includes(course.order)) {
        assets.push({
            href: "/learning-assets/python/garden_report.py",
            label: "Python project starter",
            description:
                "A small standard-library CSV application with clearly marked extension tasks.",
        });
    }
    if ([6, 7].includes(course.order)) {
        assets.push({
            href: "/learning-assets/web/index.html",
            label: "Accessible web starter",
            description:
                "A responsive HTML, CSS, and JavaScript project using fixed local data.",
        });
    }
    if ([11, 13, 17, 22, 23].includes(course.order)) {
        assets.push({
            href: "/learning-assets/sql/community-lab.sql",
            label: "SQLite practice database",
            description:
                "Original schema, synthetic seed rows, constraints, and review queries.",
        });
    }
    if ([9, 10, 17, 18].includes(course.order)) {
        assets.push({
            href: "/learning-assets/hardware/sensor-trace.csv",
            label: "Simulated hardware sensor trace",
            description:
                "Synthetic device readings for no-hardware analysis and replay.",
        });
    }
    if (course.order >= 13 && course.order <= 23) {
        assets.push({
            href: "/learning-assets/ml/evaluation-fixture.json",
            label: "ML evaluation fixture",
            description:
                "Fixed, synthetic classification, retrieval, research, and deployment values.",
        });
    }
    if (course.order >= 24) {
        assets.push({
            href: "/learning-assets/agents/evaluation-task.json",
            label: "Bounded agent evaluation task",
            description:
                "A fictional repository task with deterministic checks and no credentials.",
        });
        assets.push({
            href: "/learning-assets/agents/evaluation-trace.json",
            label: "Recorded safe agent trace",
            description:
                "A simulated multi-agent trace that blocks an unsafe action.",
        });
    }

    return assets;
};

const toSetupRequirement = (
    requirement: CourseRequirement,
    course: CourseOverview
): SetupRequirement => {
    const simulator =
        requirement.category === "hardware" ||
        requirement.category === "compute"
            ? course.simulators[0]
            : undefined;

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
        simulator: simulator
            ? {
                  name: simulator.name,
                  description: `${simulator.purpose} No hardware is required.`,
              }
            : undefined,
    };
};

const buildFreeSetupPath = (course: CourseOverview): FreeSetupPath => {
    const requirementSteps = course.requirements.flatMap((requirement) =>
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
                    "Use the browser-based tools and simulations throughout this course. Paid software, APIs, cloud credits, GPUs, and physical equipment are optional.",
                estimatedMinutes: 2,
            },
            ...requirementSteps,
            {
                id: `${course.id}-verify`,
                title: "Run the setup check",
                description: course.requirements
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

const CoursePage: React.FC<CoursePageProps> = ({ course }) => {
    const software = course.requirements
        .filter((requirement) =>
            ["browser", "software", "compute", "dataset"].includes(
                requirement.category
            )
        )
        .map((requirement) => toSetupRequirement(requirement, course));
    const hardware = course.requirements
        .filter((requirement) => requirement.category === "hardware")
        .map((requirement) => toSetupRequirement(requirement, course));
    const accounts = course.requirements
        .filter((requirement) => requirement.category === "account")
        .map((requirement) => toSetupRequirement(requirement, course));
    const firstLessonHref = getFirstLessonHref(course);
    const starterAssets = getStarterAssets(course);
    const lessonCount = course.modules.reduce(
        (total, module) => total + module.lessons.length,
        0
    );
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
                                {course.simulators.length > 0 && (
                                    <CourseBadge tone="purple">
                                        Browser simulator included
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
                                        Course {course.order}
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
                                        {course.estimatedTotalHours} hours
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-medium-grey">Pace</dt>
                                    <dd className="mt-1 font-bold text-white">
                                        {course.suggestedWeeks} weeks
                                    </dd>
                                </div>
                            </dl>
                            <EnrollButton
                                courseId={course.id}
                                courseSlug={course.slug}
                                firstLessonHref={firstLessonHref}
                                className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-gradient-to-b from-brand-purple-primary to-brand-purple-secondary px-4 py-3 text-center text-sm font-bold text-white outline-none hover:brightness-110 focus-visible:ring-2 focus-visible:ring-white disabled:opacity-60"
                            />
                            <p className="mt-3 text-center text-xs leading-5 text-medium-grey">
                                Always free — no payment method, ever. A free
                                account saves your progress across devices.
                            </p>
                        </aside>
                    </div>
                </section>

                <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
                    <div className="space-y-8">
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
                                credentials, or secrets. Dataset fixtures are
                                CC0 and starter code is MIT licensed.
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

export const getStaticProps: GetStaticProps<CoursePageProps> = async ({
    params,
}) => {
    const course = getCourseBySlug(String(params?.courseSlug || ""));

    if (!course) {
        return { notFound: true };
    }

    return {
        props: {
            course: toCourseOverview(course),
        },
    };
};

export default CoursePage;
