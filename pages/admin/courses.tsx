import AdminShell from "@components/Learning/AdminShell";
import CourseBadge from "@components/Learning/CourseBadge";
import type { CourseStatus, Role } from "@prisma/client";
import { allCourses } from "lib/courses";
import { requireAuth } from "lib/guards";
import { getAllCourseSettings } from "lib/learner";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";

interface CourseRow {
    id: string;
    slug: string;
    title: string;
    modules: number;
    lessons: number;
    status: CourseStatus;
    enrollments: number;
}

interface CoursesProps {
    courses: CourseRow[];
    role: Role;
}

const statusTone: Record<CourseStatus, "green" | "blue" | "amber" | "grey"> = {
    PUBLISHED: "green",
    REVIEW: "blue",
    DRAFT: "amber",
    ARCHIVED: "grey",
};

const AdminCoursesPage: React.FC<CoursesProps> = ({ courses, role }) => {
    const router = useRouter();
    const [busy, setBusy] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const setStatus = async (courseId: string, status: CourseStatus) => {
        setBusy(courseId);
        setError(null);
        try {
            const response = await fetch("/api/admin/course-settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ courseId, status }),
            });
            const body = await response.json();
            if (!response.ok) throw new Error(body.error || "Update failed.");
            router.replace(router.asPath);
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Something went wrong."
            );
        } finally {
            setBusy(null);
        }
    };

    const publishedCount = courses.filter(
        (course) => course.status === "PUBLISHED"
    ).length;

    return (
        <>
            <Head>
                <title>Courses | C4T Admin</title>
                <meta name="robots" content="noindex" />
            </Head>
            <AdminShell
                title="Courses"
                description="Only published courses accept enrollment. Lesson content is authored in version control under learning/ and validated in CI; publication state and thresholds live here."
                active="courses"
                role={role}
            >
                <p className="mb-4 text-sm text-medium-grey" aria-live="polite">
                    {publishedCount} of {courses.length} courses are published.
                </p>

                {error && (
                    <p
                        role="alert"
                        className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100"
                    >
                        {error}
                    </p>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] border-collapse text-sm">
                        <caption className="sr-only">
                            All courses with publication status and actions
                        </caption>
                        <thead>
                            <tr className="border-b border-white/15 text-left text-xs uppercase tracking-wider text-medium-grey">
                                <th scope="col" className="py-3 pr-4">
                                    Course
                                </th>
                                <th scope="col" className="py-3 pr-4">
                                    Content
                                </th>
                                <th scope="col" className="py-3 pr-4">
                                    Learners
                                </th>
                                <th scope="col" className="py-3 pr-4">
                                    Status
                                </th>
                                <th scope="col" className="py-3">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map((course) => (
                                <tr
                                    key={course.id}
                                    className="border-b border-white/5"
                                >
                                    <th
                                        scope="row"
                                        className="py-3 pr-4 text-left font-semibold text-white"
                                    >
                                        <Link
                                            href={`/courses/${course.slug}`}
                                            className="underline-offset-4 hover:underline"
                                        >
                                            {course.title}
                                        </Link>
                                    </th>
                                    <td className="py-3 pr-4 text-medium-grey">
                                        {course.modules} modules ·{" "}
                                        {course.lessons} lessons
                                    </td>
                                    <td className="py-3 pr-4 text-medium-grey">
                                        {course.enrollments}
                                    </td>
                                    <td className="py-3 pr-4">
                                        <CourseBadge
                                            tone={statusTone[course.status]}
                                        >
                                            {course.status}
                                        </CourseBadge>
                                    </td>
                                    <td className="py-3">
                                        <div className="flex flex-wrap gap-2">
                                            {course.status !== "PUBLISHED" && (
                                                <button
                                                    type="button"
                                                    disabled={
                                                        busy === course.id
                                                    }
                                                    onClick={() =>
                                                        setStatus(
                                                            course.id,
                                                            "PUBLISHED"
                                                        )
                                                    }
                                                    className="min-h-[40px] rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white outline-none hover:bg-emerald-500 focus-visible:ring-2 focus-visible:ring-white disabled:opacity-60"
                                                >
                                                    Publish
                                                </button>
                                            )}
                                            {course.status === "PUBLISHED" && (
                                                <button
                                                    type="button"
                                                    disabled={
                                                        busy === course.id
                                                    }
                                                    onClick={() =>
                                                        setStatus(
                                                            course.id,
                                                            "REVIEW"
                                                        )
                                                    }
                                                    className="min-h-[40px] rounded-lg border border-amber-500/50 px-3 py-1.5 text-xs font-bold text-amber-100 outline-none hover:bg-amber-500/10 focus-visible:ring-2 focus-visible:ring-amber-300 disabled:opacity-60"
                                                >
                                                    Unpublish
                                                </button>
                                            )}
                                            {course.status !== "ARCHIVED" &&
                                                course.enrollments === 0 && (
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            busy === course.id
                                                        }
                                                        onClick={() => {
                                                            if (
                                                                window.confirm(
                                                                    `Archive "${course.title}"? Learners will no longer be able to enroll.`
                                                                )
                                                            ) {
                                                                setStatus(
                                                                    course.id,
                                                                    "ARCHIVED"
                                                                );
                                                            }
                                                        }}
                                                        className="min-h-[40px] rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-medium-grey outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-brand-purple-secondary disabled:opacity-60"
                                                    >
                                                        Archive
                                                    </button>
                                                )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </AdminShell>
        </>
    );
};

export const getServerSideProps = requireAuth<CoursesProps>(
    async ({ role }) => {
        const [settings, counts] = await Promise.all([
            getAllCourseSettings(),
            // One grouped query rather than one per course.
            (
                await import("lib/prisma")
            ).default.enrollment.groupBy({
                by: ["courseId"],
                _count: { _all: true },
            }),
        ]);

        const countByCourse = new Map(
            counts.map((row) => [row.courseId, row._count._all])
        );

        return {
            props: {
                role,
                courses: allCourses().map((course) => ({
                    id: course.id,
                    slug: course.slug,
                    title: course.title,
                    modules: course.modules.length,
                    lessons: course.modules.reduce(
                        (total, module) => total + module.lessons.length,
                        0
                    ),
                    status: settings.get(course.id)?.status ?? "REVIEW",
                    enrollments: countByCourse.get(course.id) ?? 0,
                })),
            },
        };
    },
    { roles: ["CONTENT_EDITOR", "ADMIN"] }
);

export default AdminCoursesPage;
