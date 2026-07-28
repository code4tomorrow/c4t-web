import CourseAttribution from "@components/Learning/CourseAttribution";
import FreeLabSimulator from "@components/Learning/FreeLabSimulator";
import { LearningProgressBar } from "@components/Learning/LearningProgress";
import ModuleLessonOutline from "@components/Learning/ModuleLessonOutline";
import type {
    FreeLabMode,
    ModuleOutlineItem,
} from "@components/Learning/types";
import useActiveLearningTime from "hooks/useActiveLearningTime";
import type { Course, CourseModule, Lesson } from "learning/course-models";
import { courseRegistry, getCourseBySlug } from "learning/course-registry";
import type { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, {
    useEffect,
    useMemo,
    useState,
    useSyncExternalStore,
} from "react";
import {
    getLearningServerSnapshot,
    getLearningStoreSnapshot,
    learningStoreActions,
    subscribeToLearningStore,
} from "utils/learning/store";
import { learningItemKey } from "utils/learning/state";

type LessonOutlineRecord = Pick<
    Lesson,
    "id" | "slug" | "title" | "estimatedMinutes" | "required"
> & {
    interactionId: string;
};

type LessonOutlineModule = Pick<
    CourseModule,
    "id" | "order" | "title" | "overview"
> & {
    lessons: LessonOutlineRecord[];
};

type LessonCourse = Pick<Course, "id" | "slug" | "title" | "tags"> & {
    modules: LessonOutlineModule[];
};

interface LessonPageProps {
    course: LessonCourse;
    moduleId: string;
    lesson: Lesson;
}

const getLabMode = (course: LessonCourse): FreeLabMode => {
    const searchable = `${course.slug} ${course.tags.join(" ")}`.toLowerCase();

    if (searchable.includes("micro:bit") || searchable.includes("microbit")) {
        return "microbit";
    }
    if (searchable.includes("raspberry") || searchable.includes("iot")) {
        return "gpio-iot";
    }
    if (searchable.includes("tinyml") || searchable.includes("edge ai")) {
        return "tinyml";
    }
    if (
        searchable.includes("electronics") ||
        searchable.includes("robotics") ||
        searchable.includes("hardware")
    ) {
        return "circuits";
    }
    if (searchable.includes("unity") || searchable.includes("game")) {
        return "unity-physics";
    }
    if (
        searchable.includes("agent") ||
        searchable.includes("mcp") ||
        searchable.includes("multi-agent")
    ) {
        return "agent-tools";
    }
    if (searchable.includes("git") || searchable.includes("github")) {
        return "git";
    }
    if (
        searchable.includes("machine learning") ||
        searchable.includes("data") ||
        searchable.includes("deep learning") ||
        searchable.includes("artificial intelligence") ||
        searchable.includes("nlp")
    ) {
        return "data-ml";
    }
    if (
        searchable.includes("html") ||
        searchable.includes("css") ||
        searchable.includes("javascript") ||
        searchable.includes("web")
    ) {
        return "web";
    }
    return "logic-code";
};

const getFlatLessons = (course: LessonCourse) =>
    course.modules.flatMap((module) =>
        module.lessons.map((lesson) => ({
            lesson,
            module,
        }))
    );

const toLessonCourse = (course: Course): LessonCourse => ({
    id: course.id,
    slug: course.slug,
    title: course.title,
    tags: course.tags,
    modules: course.modules.map((module) => ({
        id: module.id,
        order: module.order,
        title: module.title,
        overview: module.overview,
        lessons: module.lessons.map((lesson) => ({
            id: lesson.id,
            slug: lesson.slug,
            title: lesson.title,
            estimatedMinutes: lesson.estimatedMinutes,
            required: lesson.required,
            interactionId: lesson.interaction.id,
        })),
    })),
});

const LessonPage: React.FC<LessonPageProps> = ({
    course,
    moduleId,
    lesson,
}) => {
    const router = useRouter();
    const lessonId = lesson.id;
    const snapshot = useSyncExternalStore(
        subscribeToLearningStore,
        getLearningStoreSnapshot,
        getLearningServerSnapshot
    );
    const [practiceComplete, setPracticeComplete] = useState(false);
    const [reflection, setReflection] = useState("");

    const flatLessons = useMemo(() => getFlatLessons(course), [course]);
    const currentIndex = flatLessons.findIndex(
        ({ lesson }) => lesson.id === lessonId
    );
    const current = flatLessons[currentIndex];
    const currentModule = current?.module;
    const previous = flatLessons[currentIndex - 1];
    const next = flatLessons[currentIndex + 1];
    const progressKey = learningItemKey(course.id, lessonId);
    const lessonProgress = snapshot.state.lessonProgress[progressKey];
    const lessonComplete = Boolean(lessonProgress?.completedAt);
    const interactionComplete =
        practiceComplete ||
        Boolean(
            lessonProgress?.completedInteractionIds.includes(
                lesson.interaction.id
            )
        );
    const canCompleteLesson = lessonComplete || interactionComplete;
    const completedLessons = flatLessons.filter(({ lesson: item }) =>
        Boolean(
            snapshot.state.lessonProgress[learningItemKey(course.id, item.id)]
                ?.completedAt &&
                snapshot.state.lessonProgress[
                    learningItemKey(course.id, item.id)
                ]?.completedInteractionIds.includes(item.interactionId)
        )
    ).length;
    const progressPercent = flatLessons.length
        ? (completedLessons / flatLessons.length) * 100
        : 0;

    useActiveLearningTime({
        courseId: course.id,
        lessonId,
        enabled: Boolean(currentModule),
    });

    useEffect(() => {
        learningStoreActions.enroll({ courseId: course.id });
        learningStoreActions.setResumePosition({
            courseId: course.id,
            moduleId,
            lessonId,
        });
    }, [course.id, lessonId, moduleId]);

    useEffect(() => {
        setPracticeComplete(false);
        setReflection("");
    }, [lessonId]);

    if (!currentModule) {
        return null;
    }

    const outline: ModuleOutlineItem[] = course.modules.map((module) => ({
        id: module.id,
        title: module.title,
        description: module.overview,
        initiallyExpanded: module.id === currentModule.id,
        lessons: module.lessons.map((item) => {
            const itemProgress =
                snapshot.state.lessonProgress[
                    learningItemKey(course.id, item.id)
                ];
            return {
                id: item.id,
                title: item.title,
                estimatedMinutes: item.estimatedMinutes,
                required: item.required,
                status:
                    itemProgress?.completedAt &&
                    itemProgress.completedInteractionIds.includes(
                        item.interactionId
                    )
                        ? ("complete" as const)
                        : item.id === lesson.id
                        ? ("in-progress" as const)
                        : ("not-started" as const),
                href: `/learn/courses/${course.slug}/lessons/${item.slug}`,
            };
        }),
    }));

    const completeInteraction = () => {
        setPracticeComplete(true);
        learningStoreActions.completeInteraction({
            courseId: course.id,
            moduleId,
            lessonId,
            interactionId: lesson.interaction.id,
        });
    };

    const completeLesson = async () => {
        if (!canCompleteLesson) return;
        learningStoreActions.setLessonCompletion({
            courseId: course.id,
            moduleId,
            lessonId,
            completed: true,
        });
        if (next) {
            await router.push(
                `/learn/courses/${course.slug}/lessons/${next.lesson.slug}`
            );
        }
    };

    const labMode = getLabMode(course);

    return (
        <div className="min-h-screen w-full bg-dark-grey-primary text-white">
            <Head>
                <title>{`${lesson.title} · ${course.title} | C4T`}</title>
                <meta name="robots" content="noindex" />
            </Head>

            <header className="sticky top-0 z-40 border-b border-white/10 bg-dark-grey-primary/95 px-4 py-3 backdrop-blur sm:px-6">
                <div className="mx-auto flex max-w-screen-2xl items-center gap-4">
                    <Link
                        href={`/courses/${course.slug}`}
                        className="shrink-0 rounded-lg px-2 py-2 text-sm font-bold text-[#D6D3DC] outline-none hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                    >
                        <span aria-hidden="true">←</span>{" "}
                        <span className="hidden sm:inline">
                            Course overview
                        </span>
                        <span className="sm:hidden">Back</span>
                    </Link>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-medium-grey">
                            {course.title}
                        </p>
                        <LearningProgressBar
                            value={progressPercent}
                            label="Course progress"
                            showValue
                            compact
                        />
                    </div>
                    <Link
                        href="/learn/dashboard"
                        className="hidden min-h-[40px] shrink-0 items-center rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-[#D6D3DC] outline-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-brand-purple-secondary sm:inline-flex"
                    >
                        Dashboard
                    </Link>
                </div>
            </header>

            <div className="mx-auto grid w-full max-w-screen-2xl lg:grid-cols-[340px_minmax(0,1fr)]">
                <aside className="hidden border-r border-white/10 p-4 lg:block">
                    <div className="sticky top-24">
                        <ModuleLessonOutline
                            modules={outline}
                            currentLessonId={lesson.id}
                            showDescriptions={false}
                            title="Course lessons"
                        />
                        <p className="mt-3 px-2 text-xs leading-5 text-medium-grey">
                            Progress is stored locally on this device. You can
                            learn without creating an account.
                        </p>
                    </div>
                </aside>

                <main className="min-w-0 px-4 py-8 sm:px-7 lg:px-10 lg:py-10">
                    <article className="mx-auto max-w-4xl">
                        <header className="border-b border-white/10 pb-7">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-purple-secondary">
                                Module {currentModule.order} · Lesson{" "}
                                {lesson.order}
                            </p>
                            <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
                                {lesson.title}
                            </h1>
                            <p className="mt-4 text-base leading-7 text-[#C7C3CE]">
                                {lesson.objective}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-medium-grey">
                                <span>{lesson.estimatedMinutes} minutes</span>
                                <span aria-hidden="true">·</span>
                                <span>
                                    {lessonComplete
                                        ? "Completed"
                                        : "In progress"}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span>$0 tools required</span>
                            </div>
                        </header>

                        <section
                            aria-labelledby="challenge-heading"
                            className="mt-8 rounded-2xl border border-brand-purple-secondary/40 bg-brand-purple-secondary/[0.08] p-5 sm:p-7"
                        >
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-purple-secondary">
                                Start with a challenge
                            </p>
                            <h2
                                id="challenge-heading"
                                className="mt-2 text-2xl font-bold"
                            >
                                Predict before you explore
                            </h2>
                            <p className="mt-3 text-base leading-7 text-[#D6D3DC]">
                                {lesson.motivatingScenario}
                            </p>
                        </section>

                        <section
                            aria-labelledby="explanation-heading"
                            className="mt-10"
                        >
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-purple-secondary">
                                Core idea
                            </p>
                            <h2
                                id="explanation-heading"
                                className="mt-2 text-2xl font-bold"
                            >
                                Understand the concept
                            </h2>
                            <p className="mt-4 whitespace-pre-line text-base leading-8 text-[#D6D3DC]">
                                {lesson.explanation}
                            </p>
                        </section>

                        <section
                            aria-labelledby="example-heading"
                            className="mt-10 rounded-2xl border border-white/10 bg-dark-grey-secondary p-5 sm:p-7"
                        >
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
                                Worked example
                            </p>
                            <h2
                                id="example-heading"
                                className="mt-2 text-2xl font-bold"
                            >
                                {lesson.workedExample.title}
                            </h2>
                            <p className="mt-3 text-sm leading-7 text-[#C7C3CE]">
                                {lesson.workedExample.context}
                            </p>
                            <ol className="mt-5 space-y-3">
                                {lesson.workedExample.steps.map(
                                    (step, index) => (
                                        <li
                                            key={`${lesson.id}-step-${index}`}
                                            className="flex gap-3 text-sm leading-7 text-[#D6D3DC]"
                                        >
                                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-purple-primary/25 font-bold text-[#D8D3FF]">
                                                {index + 1}
                                            </span>
                                            <span>{step}</span>
                                        </li>
                                    )
                                )}
                            </ol>
                            <p className="mt-5 rounded-xl bg-dark-grey-primary/50 p-4 text-sm leading-7 text-white">
                                <strong>Result:</strong>{" "}
                                {lesson.workedExample.result}
                            </p>
                        </section>

                        <section
                            aria-labelledby="lab-heading"
                            className="mt-10"
                        >
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-purple-secondary">
                                Guided practice
                            </p>
                            <h2
                                id="lab-heading"
                                className="mt-2 text-2xl font-bold"
                            >
                                {lesson.interaction.title}
                            </h2>
                            <p className="mt-3 text-base leading-7 text-[#D6D3DC]">
                                {lesson.interaction.prompt}
                            </p>
                            <ol className="mt-4 list-inside list-decimal space-y-2 text-sm leading-7 text-[#C7C3CE]">
                                {lesson.interaction.instructions.map(
                                    (instruction) => (
                                        <li key={instruction}>{instruction}</li>
                                    )
                                )}
                            </ol>
                            <FreeLabSimulator
                                className="mt-6"
                                mode={labMode}
                                onComplete={completeInteraction}
                            />
                            <div
                                className="mt-4 min-h-[24px] text-sm"
                                aria-live="polite"
                            >
                                {interactionComplete && (
                                    <p className="text-emerald-200">
                                        {lesson.interaction.successFeedback}
                                    </p>
                                )}
                            </div>
                        </section>

                        <section
                            aria-labelledby="practice-heading"
                            className="mt-10 rounded-2xl border border-white/10 bg-dark-grey-secondary p-5 sm:p-7"
                        >
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-purple-secondary">
                                Independent practice
                            </p>
                            <h2
                                id="practice-heading"
                                className="mt-2 text-2xl font-bold"
                            >
                                Apply it yourself
                            </h2>
                            <p className="mt-3 text-base leading-7 text-[#D6D3DC]">
                                {lesson.practiceTask}
                            </p>
                            <label className="mt-5 block text-sm font-bold text-white">
                                What did you try, observe, or change?
                                <textarea
                                    value={reflection}
                                    onChange={(event) =>
                                        setReflection(event.target.value)
                                    }
                                    rows={5}
                                    className="mt-2 w-full rounded-xl border border-white/15 bg-dark-grey-primary p-3 font-normal leading-6 text-white outline-none placeholder:text-dim-grey focus:border-brand-purple-secondary focus:ring-2 focus:ring-brand-purple-secondary/30"
                                    placeholder="Write a short reflection for yourself. Nothing is uploaded."
                                />
                            </label>
                            <p className="mt-3 text-xs leading-5 text-medium-grey">
                                Your reflection stays in this page and is never
                                sent to a server. Copy it into your project
                                notes if you want to keep it.
                            </p>
                        </section>

                        <section
                            aria-labelledby="checkpoint-heading"
                            className="mt-10 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.06] p-5 sm:p-7"
                        >
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
                                Checkpoint
                            </p>
                            <h2
                                id="checkpoint-heading"
                                className="mt-2 text-2xl font-bold"
                            >
                                Confirm your understanding
                            </h2>
                            <p className="mt-3 text-base leading-7 text-[#D6D3DC]">
                                {lesson.checkpoint.prompt}
                            </p>
                            <ul className="mt-4 space-y-2">
                                {lesson.checkpoint.successCriteria.map(
                                    (criterion) => (
                                        <li
                                            key={criterion}
                                            className="flex gap-3 text-sm leading-7 text-[#D6D3DC]"
                                        >
                                            <span
                                                aria-hidden="true"
                                                className="text-emerald-300"
                                            >
                                                ✓
                                            </span>
                                            <span>{criterion}</span>
                                        </li>
                                    )
                                )}
                            </ul>
                            <p className="mt-4 text-sm leading-7 text-emerald-100">
                                {lesson.checkpoint.feedback}
                            </p>
                        </section>

                        <section
                            aria-labelledby="summary-heading"
                            className="mt-10"
                        >
                            <h2
                                id="summary-heading"
                                className="text-2xl font-bold"
                            >
                                Lesson summary
                            </h2>
                            <p className="mt-3 text-base leading-8 text-[#D6D3DC]">
                                {lesson.summary}
                            </p>
                            <p className="mt-3 text-sm leading-7 text-medium-grey">
                                <strong className="text-[#D6D3DC]">
                                    Coming next:
                                </strong>{" "}
                                {lesson.nextLessonConnection}
                            </p>
                            <details className="mt-5 rounded-xl border border-white/10 bg-dark-grey-secondary">
                                <summary className="min-h-[44px] cursor-pointer px-4 py-3 font-semibold outline-none focus-visible:ring-2 focus-visible:ring-brand-purple-secondary">
                                    Accessible alternative and review support
                                </summary>
                                <p className="border-t border-white/10 px-4 py-4 text-sm leading-7 text-[#C7C3CE]">
                                    {lesson.accessibilityAlternative}{" "}
                                    {lesson.feedbackGuidance}
                                </p>
                            </details>
                        </section>

                        <div className="mt-10 flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                            {previous ? (
                                <Link
                                    href={`/learn/courses/${course.slug}/lessons/${previous.lesson.slug}`}
                                    className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-white/15 px-5 py-3 text-sm font-bold outline-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                                >
                                    ← Previous lesson
                                </Link>
                            ) : (
                                <Link
                                    href={`/courses/${course.slug}`}
                                    className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-white/15 px-5 py-3 text-sm font-bold outline-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-brand-purple-secondary"
                                >
                                    ← Course overview
                                </Link>
                            )}
                            <button
                                type="button"
                                onClick={completeLesson}
                                disabled={!canCompleteLesson}
                                className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-gradient-to-b from-brand-purple-primary to-brand-purple-secondary px-5 py-3 text-sm font-bold outline-none hover:brightness-110 focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100"
                            >
                                {!canCompleteLesson
                                    ? "Complete the lab to continue"
                                    : lessonComplete
                                    ? next
                                        ? "Continue to next lesson →"
                                        : "Course lessons complete ✓"
                                    : next
                                    ? "Complete & continue →"
                                    : "Complete final lesson ✓"}
                            </button>
                        </div>
                        {!canCompleteLesson && (
                            <p className="mt-3 text-right text-xs leading-5 text-amber-200">
                                Run the guided concept lab above once to unlock
                                lesson completion. No account, payment, or
                                physical equipment is required.
                            </p>
                        )}

                        <CourseAttribution className="mt-8" />
                    </article>
                </main>
            </div>
        </div>
    );
};

export const getStaticPaths: GetStaticPaths = async () => ({
    paths: courseRegistry.flatMap((course) =>
        course.modules.flatMap((module) =>
            module.lessons.map((lesson) => ({
                params: {
                    courseSlug: course.slug,
                    lessonSlug: lesson.slug,
                },
            }))
        )
    ),
    fallback: false,
});

export const getStaticProps: GetStaticProps<LessonPageProps> = async ({
    params,
}) => {
    const course = getCourseBySlug(String(params?.courseSlug || ""));
    const lessonSlug = String(params?.lessonSlug || "");
    const match = course
        ? course.modules
              .flatMap((module) =>
                  module.lessons.map((lesson) => ({ module, lesson }))
              )
              .find(({ lesson }) => lesson.slug === lessonSlug)
        : undefined;

    if (!course || !match) {
        return { notFound: true };
    }

    return {
        props: {
            course: toLessonCourse(course),
            moduleId: match.module.id,
            lesson: match.lesson,
        },
    };
};

export default LessonPage;
