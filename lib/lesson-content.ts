/**
 * HTML for a hand-written lesson, compiled by `npm run content` into
 * learning/lesson-content/<course-id>.json. Each course's file is its own
 * chunk, loaded only when one of its lessons is opened.
 */
export const loadLessonHtml = async (
    courseId: string,
    contentKey: string | null
): Promise<string | null> => {
    if (!contentKey) return null;
    try {
        const lessons: Record<string, string> = (
            await import(`learning/lesson-content/${courseId}.json`)
        ).default;
        return lessons[contentKey] ?? null;
    } catch {
        return null;
    }
};
