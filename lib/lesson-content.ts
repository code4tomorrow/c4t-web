/**
 * A hand-written lesson, compiled by `npm run content` into
 * learning/lesson-content/<course-id>.json. Each course's file is its own
 * chunk, loaded only when one of its lessons is opened.
 */
export interface LessonTocEntry {
    id: string;
    text: string;
    level: number;
}

export interface LessonContentStats {
    videos: number;
    videoSeconds: number;
    diagrams: number;
    traces: number;
    charts: number;
    images: number;
    previews?: number;
    quizzes: number;
    code: number;
}

export interface LessonContentData {
    html: string;
    toc: LessonTocEntry[];
    minutes: number | null;
    stats: LessonContentStats | null;
}

type CompiledLesson =
    | string
    | {
          html: string;
          toc?: LessonTocEntry[];
          minutes?: number;
          stats?: LessonContentStats;
      };

export const loadLessonContent = async (
    courseId: string,
    contentKey: string | null
): Promise<LessonContentData | null> => {
    if (!contentKey) return null;
    try {
        const lessons: Record<string, CompiledLesson> = (
            await import(`learning/lesson-content/${courseId}.json`)
        ).default;
        const lesson = lessons[contentKey];
        if (!lesson) return null;
        if (typeof lesson === "string") {
            return { html: lesson, toc: [], minutes: null, stats: null };
        }
        return {
            html: lesson.html,
            toc: lesson.toc ?? [],
            minutes: lesson.minutes ?? null,
            stats: lesson.stats ?? null,
        };
    } catch {
        return null;
    }
};
