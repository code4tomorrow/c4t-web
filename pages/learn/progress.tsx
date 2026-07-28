import CourseBadge from "@components/Learning/CourseBadge";
import LearnerShell from "@components/Learning/LearnerShell";
import { buildLearnerNavigation } from "@components/Learning/learnerNavigation";
import { LearningProgressBar } from "@components/Learning/LearningProgress";
import { requireAuth } from "lib/guards";
import { getLearnerSnapshot, type LearnerSnapshot } from "lib/learner";
import Head from "next/head";
import Link from "next/link";
import React from "react";

interface ProgressProps {
    snapshot: LearnerSnapshot;
}

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
};

const paceTone = {
    ahead: "green",
    "on-track": "blue",
    behind: "amber",
    "not-started": "grey",
} as const;

const ProgressPage: React.FC<ProgressProps> = ({ snapshot }) => {
    const { courses, summary, weeklyActivity } = snapshot;

    const navigation = buildLearnerNavigation({
        badges: summary.badgeCount,
        certificates: snapshot.certificates.length,
    });

    const recent = weeklyActivity.slice(-14);
    const peak = Math.max(1, ...recent.map((day) => day.seconds));
    const totalRecent = recent.reduce((sum, day) => sum + day.seconds, 0);

    return (
        <>
            <Head>
                <title>Progress | C4T Learning</title>
                <meta name="robots" content="noindex" />
            </Head>
            <LearnerShell
                title="Progress"
                description="Every number here comes from work you actually completed and time you were actively engaged."
                activeItemId="progress"
                navigation={navigation}
            >
                <div className="space-y-8">
                    <section aria-labelledby="totals-title">
                        <h2
                            id="totals-title"
                            className="text-xl font-bold text-white"
                        >
                            Totals
                        </h2>
                        <dl className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {[
                                [
                                    "Active learning time",
                                    formatTime(summary.activeSeconds),
                                ],
                                [
                                    "Lessons completed",
                                    `${summary.completedLessons}`,
                                ],
                                [
                                    "Courses completed",
                                    `${summary.completedCourses}`,
                                ],
                                ["Points", `${summary.points}`],
                                [
                                    "Current streak",
                                    `${summary.currentStreak} days`,
                                ],
                                [
                                    "Longest streak",
                                    `${summary.longestStreak} days`,
                                ],
                                ["Badges", `${summary.badgeCount}`],
                                [
                                    "Certificates",
                                    `${snapshot.certificates.length}`,
                                ],
                            ].map(([label, value]) => (
                                <div
                                    key={label}
                                    className="rounded-xl border border-white/10 bg-dark-grey-secondary p-4"
                                >
                                    <dt className="text-xs uppercase tracking-wider text-medium-grey">
                                        {label}
                                    </dt>
                                    <dd className="mt-1 text-2xl font-bold text-white">
                                        {value}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </section>

                    <section aria-labelledby="activity-title">
                        <h2
                            id="activity-title"
                            className="text-xl font-bold text-white"
                        >
                            Last two weeks
                        </h2>
                        {/* Text equivalent, so the chart is never the only source. */}
                        <p className="mt-2 text-sm text-medium-grey">
                            {recent.length
                                ? `${formatTime(
                                      totalRecent
                                  )} of active learning across ${
                                      recent.filter((day) => day.seconds > 0)
                                          .length
                                  } active days.`
                                : "No activity recorded yet."}
                        </p>
                        {recent.length > 0 && (
                            <ul className="mt-4 flex h-32 list-none items-end gap-1.5 pl-0">
                                {recent.map((day) => (
                                    <li
                                        key={day.date}
                                        className="flex flex-1 flex-col items-center justify-end"
                                    >
                                        <span
                                            aria-hidden="true"
                                            className="w-full rounded-t bg-brand-purple-secondary/70"
                                            style={{
                                                height: `${Math.max(
                                                    2,
                                                    (day.seconds / peak) * 100
                                                )}%`,
                                            }}
                                        />
                                        <span className="sr-only">
                                            {day.date}:{" "}
                                            {formatTime(day.seconds)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <section aria-labelledby="courses-title">
                        <h2
                            id="courses-title"
                            className="text-xl font-bold text-white"
                        >
                            By course
                        </h2>
                        {courses.length === 0 ? (
                            <p className="mt-3 rounded-2xl border border-dashed border-white/20 bg-white/[0.03] p-6 text-sm text-medium-grey">
                                Enroll in a course to start building progress.{" "}
                                <Link
                                    href="/courses"
                                    className="text-brand-purple-secondary underline-offset-4 hover:underline"
                                >
                                    Browse courses
                                </Link>
                                .
                            </p>
                        ) : (
                            <div className="mt-3 space-y-3">
                                {courses.map((course) => (
                                    <article
                                        key={course.courseId}
                                        className="rounded-2xl border border-white/10 bg-dark-grey-secondary p-5"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <h3 className="font-bold text-white">
                                                <Link
                                                    href={`/courses/${course.slug}`}
                                                    className="underline-offset-4 hover:underline"
                                                >
                                                    {course.title}
                                                </Link>
                                            </h3>
                                            <CourseBadge
                                                tone={
                                                    paceTone[
                                                        course.pacing.status
                                                    ]
                                                }
                                            >
                                                {course.pacing.label}
                                            </CourseBadge>
                                        </div>
                                        <div className="mt-3 max-w-md">
                                            <LearningProgressBar
                                                value={
                                                    course.progress.percentage
                                                }
                                                label="Overall progress"
                                            />
                                        </div>
                                        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
                                            {[
                                                [
                                                    "Lessons",
                                                    `${course.progress.completedLessons}/${course.progress.totalLessons}`,
                                                ],
                                                [
                                                    "Checkpoints",
                                                    `${course.progress.passedCheckpoints}/${course.progress.totalCheckpoints}`,
                                                ],
                                                [
                                                    "Projects approved",
                                                    `${course.progress.approvedAssignments}/${course.progress.totalAssignments}`,
                                                ],
                                                [
                                                    "Checkpoint average",
                                                    course.progress
                                                        .checkpointAverage ===
                                                    null
                                                        ? "—"
                                                        : `${course.progress.checkpointAverage}%`,
                                                ],
                                            ].map(([label, value]) => (
                                                <div key={label}>
                                                    <dt className="text-xs uppercase tracking-wider text-medium-grey">
                                                        {label}
                                                    </dt>
                                                    <dd className="mt-0.5 font-bold text-white">
                                                        {value}
                                                    </dd>
                                                </div>
                                            ))}
                                        </dl>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </LearnerShell>
        </>
    );
};

export const getServerSideProps = requireAuth<ProgressProps>(
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

export default ProgressPage;
