import CourseBadge from "@components/Learning/CourseBadge";
import LearnerShell from "@components/Learning/LearnerShell";
import { buildLearnerNavigation } from "@components/Learning/learnerNavigation";
import { LearningProgressBar } from "@components/Learning/LearningProgress";
import type { LearningPath } from "learning/learning-paths";
import { learningPaths } from "learning/learning-paths";
import Head from "next/head";
import Link from "next/link";
import React, { useMemo } from "react";
import { requireAuth } from "lib/guards";
import { getLearnerSnapshot, type LearnerSnapshot } from "lib/learner";

type CourseStatus = "completed" | "in-progress" | "not-started";

interface PathCourseView {
    id: string;
    slug: string;
    title: string;
    summary: string;
    role: "core" | "foundation";
    hours: number;
    status: CourseStatus;
    percentage: number;
    capstone: string;
}

interface PathView {
    path: LearningPath;
    courses: PathCourseView[];
    completedCoreCount: number;
    percentage: number;
    nextCourse?: PathCourseView;
}

const statusMeta: Record<
    CourseStatus,
    { label: string; tone: "green" | "blue" | "grey"; mark: string }
> = {
    completed: { label: "Completed", tone: "green", mark: "✓" },
    "in-progress": { label: "In progress", tone: "blue", mark: "◐" },
    "not-started": { label: "Not started", tone: "grey", mark: "○" },
};

const buildPathView = (
    path: LearningPath,
    snapshot: LearnerSnapshot
): PathView => {
    const byCourseId = new Map(
        snapshot.courses.map((entry) => [entry.courseId, entry])
    );

    const courses: PathCourseView[] = path.courses.map(({ course, role }) => {
        const entry = byCourseId.get(course.id);
        const percentage = entry?.progress.percentage ?? 0;
        const status: CourseStatus =
            entry?.enrollment.status === "COMPLETED"
                ? "completed"
                : entry
                ? "in-progress"
                : "not-started";

        return {
            id: course.id,
            slug: course.slug,
            title: course.title,
            summary: course.summary,
            role,
            hours: course.estimatedTotalHours,
            status,
            percentage,
            capstone: course.finalAssessment.title,
        };
    });

    const coreCourses = courses.filter((course) => course.role === "core");
    const completedCoreCount = coreCourses.filter(
        (course) => course.status === "completed"
    ).length;

    return {
        path,
        courses,
        completedCoreCount,
        percentage: coreCourses.length
            ? Math.round((completedCoreCount / coreCourses.length) * 100)
            : 0,
        // Recommend the first unfinished course in sequence, preferring an
        // already-started one so learners are never pushed off a course
        // they are midway through.
        nextCourse:
            courses.find((course) => course.status === "in-progress") ||
            courses.find((course) => course.status === "not-started"),
    };
};

const PathCourseRow: React.FC<{
    course: PathCourseView;
    position: number;
    isLast: boolean;
}> = ({ course, position, isLast }) => {
    const meta = statusMeta[course.status];

    return (
        <li className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast && (
                <span
                    aria-hidden="true"
                    className="absolute left-[15px] top-9 bottom-0 w-px bg-white/10"
                />
            )}
            <span
                aria-hidden="true"
                className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-dark-grey-accent text-sm font-bold text-white"
            >
                {position}
            </span>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <Link
                        href={`/courses/${course.slug}`}
                        className="text-base font-bold text-white underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                    >
                        {course.title}
                    </Link>
                    <CourseBadge tone={meta.tone} icon={meta.mark}>
                        {meta.label}
                    </CourseBadge>
                    <CourseBadge
                        tone={course.role === "core" ? "purple" : "grey"}
                        description={
                            course.role === "core"
                                ? "Counts toward finishing this path."
                                : "Recommended preparation. You can skip it if you already have the skills."
                        }
                    >
                        {course.role === "core" ? "Required" : "Recommended"}
                    </CourseBadge>
                </div>

                <p className="mt-1.5 text-sm leading-6 text-[#C7C3CE]">
                    {course.summary}
                </p>

                <p className="mt-2 text-xs text-medium-grey">
                    ~{course.hours} hours · Capstone: {course.capstone}
                </p>

                {course.status !== "not-started" && (
                    <div className="mt-3 max-w-sm">
                        <LearningProgressBar
                            value={course.percentage}
                            label={`${course.title} progress`}
                        />
                    </div>
                )}
            </div>
        </li>
    );
};

const PathCard: React.FC<{ view: PathView }> = ({ view }) => {
    const { path } = view;

    return (
        <article
            aria-labelledby={`${path.slug}-title`}
            className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-5 md:p-7"
        >
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                    <span
                        aria-hidden="true"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-2xl"
                        style={{ backgroundColor: `${path.accent}26` }}
                    >
                        {path.icon}
                    </span>
                    <h2
                        id={`${path.slug}-title`}
                        className="mt-3 text-2xl font-bold text-white"
                    >
                        {path.title}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[#C7C3CE]">
                        {path.summary}
                    </p>
                </div>

                <dl className="grid shrink-0 grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-1">
                    <div>
                        <dt className="text-xs uppercase tracking-wider text-medium-grey">
                            Total time
                        </dt>
                        <dd className="font-bold text-white">
                            ~{path.totalHours} hours
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs uppercase tracking-wider text-medium-grey">
                            Courses
                        </dt>
                        <dd className="font-bold text-white">
                            {path.coreCourseCount} required
                            {path.foundationCourseCount > 0 &&
                                ` · ${path.foundationCourseCount} recommended`}
                        </dd>
                    </div>
                </dl>
            </div>

            <p className="mt-4 rounded-xl border border-white/10 bg-dark-grey-accent px-4 py-3 text-sm leading-6 text-[#D6D3DC]">
                <span className="font-bold text-white">
                    You will finish able to:
                </span>{" "}
                {path.outcome}
            </p>

            <div className="mt-5">
                <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-brand-purple-secondary">
                    Your progress
                </h3>
                <div className="mt-2 max-w-md">
                    <LearningProgressBar
                        value={view.percentage}
                        label={`${path.title} path progress`}
                    />
                </div>
                <p className="mt-2 text-sm text-medium-grey">
                    {`${view.completedCoreCount} of ${path.coreCourseCount} required courses complete.`}
                </p>
                {view.nextCourse && (
                    <p className="mt-3 text-sm text-[#D6D3DC]">
                        <span className="font-bold text-white">
                            Recommended next:
                        </span>{" "}
                        <Link
                            href={`/courses/${view.nextCourse.slug}`}
                            className="text-brand-purple-secondary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                        >
                            {view.nextCourse.title}
                        </Link>
                    </p>
                )}
                {!view.nextCourse && (
                    <p className="mt-3 text-sm font-bold text-emerald-300">
                        🎉 You have completed every course in this path.
                    </p>
                )}
            </div>

            <div className="mt-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-brand-purple-secondary">
                    Skills you build
                </h3>
                <ul className="mt-2 flex flex-wrap gap-2">
                    {path.skills.map((skill) => (
                        <li key={skill}>
                            <CourseBadge tone="grey">{skill}</CourseBadge>
                        </li>
                    ))}
                </ul>
            </div>

            <details className="group mt-6 rounded-xl border border-white/10 bg-dark-grey-accent p-4">
                <summary className="cursor-pointer text-sm font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-brand-purple-secondary">
                    Course sequence ({path.courses.length} courses)
                </summary>
                <ol className="mt-4 list-none pl-0">
                    {view.courses.map((course, index) => (
                        <PathCourseRow
                            key={course.id}
                            course={course}
                            position={index + 1}
                            isLast={index === view.courses.length - 1}
                        />
                    ))}
                </ol>
            </details>
        </article>
    );
};

interface PathsProps {
    snapshot: LearnerSnapshot;
}

const LearningPathsPage: React.FC<PathsProps> = ({ snapshot }) => {
    const views = useMemo(
        () => learningPaths.map((path) => buildPathView(path, snapshot)),
        [snapshot]
    );

    const activeCourseCount = snapshot.courses.filter(
        (course) => course.enrollment.status === "ACTIVE"
    ).length;

    const navigation = buildLearnerNavigation({
        badges: snapshot.summary.badgeCount,
        certificates: snapshot.certificates.length,
    });

    return (
        <>
            <Head>
                <title>Learning Paths | C4T</title>
                <meta
                    name="description"
                    content="Follow a guided sequence of free Code 4 Tomorrow courses from first algorithm to secure multi-agent systems."
                />
                <meta name="robots" content="noindex" />
            </Head>
            <LearnerShell
                title="Learning paths"
                description="Each path is an ordered route through the catalog. Required courses define the path outcome; recommended courses are on-ramps you can skip if you already have the skills."
                navigation={navigation}
                activeItemId="paths"
            >
                <p className="mb-6 text-sm text-medium-grey">
                    {`You are enrolled in ${activeCourseCount} active ${
                        activeCourseCount === 1 ? "course" : "courses"
                    }. Every course below is free to complete end to end.`}
                </p>

                <div className="space-y-6">
                    {views.map((view) => (
                        <PathCard key={view.path.id} view={view} />
                    ))}
                </div>
            </LearnerShell>
        </>
    );
};

export const getServerSideProps = requireAuth<PathsProps>(
    async ({ userId }) => {
        const snapshot = await getLearnerSnapshot(userId);
        return {
            props: {
                snapshot: JSON.parse(
                    JSON.stringify(snapshot)
                ) as LearnerSnapshot,
            },
        };
    }
);

export default LearningPathsPage;
