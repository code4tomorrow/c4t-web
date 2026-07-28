import type { Course } from "./course-models";
import { courseRegistry } from "./course-registry";
import learningPathDefinitions from "./learning-path-definitions";
import type {
    LearningPathDefinition,
    PathCourseRole,
} from "./learning-path-definitions";

export type {
    LearningPathDefinition,
    LearningPathStep,
    PathCourseRole,
} from "./learning-path-definitions";

export interface LearningPathCourse {
    role: PathCourseRole;
    course: Course;
}

export interface LearningPath extends Omit<LearningPathDefinition, "steps"> {
    courses: LearningPathCourse[];
    coreCourseCount: number;
    foundationCourseCount: number;
    totalHours: number;
    totalWeeks: number;
    capstones: Array<{ courseId: string; courseTitle: string; title: string }>;
}

const coursesById = new Map(
    courseRegistry.map((course) => [course.id, course])
);

const buildPath = (definition: LearningPathDefinition): LearningPath => {
    const courses = definition.steps.map((step) => {
        const course = coursesById.get(step.courseId);
        if (!course) {
            throw new Error(
                `Learning path "${definition.slug}" references unknown course "${step.courseId}".`
            );
        }
        return { role: step.role, course };
    });

    return {
        ...definition,
        courses,
        coreCourseCount: courses.filter((item) => item.role === "core").length,
        foundationCourseCount: courses.filter(
            (item) => item.role === "foundation"
        ).length,
        totalHours: courses.reduce(
            (total, item) => total + item.course.estimatedTotalHours,
            0
        ),
        totalWeeks: courses.reduce(
            (total, item) => total + item.course.suggestedWeeks,
            0
        ),
        capstones: courses
            .filter((item) => item.role === "core")
            .map((item) => ({
                courseId: item.course.id,
                courseTitle: item.course.title,
                title: item.course.finalAssessment.title,
            })),
    };
};

export const learningPaths: LearningPath[] =
    learningPathDefinitions.map(buildPath);

export const learningPathsBySlug: ReadonlyMap<string, LearningPath> = new Map(
    learningPaths.map((path) => [path.slug, path])
);

export const getLearningPathBySlug = (slug: string): LearningPath | undefined =>
    learningPathsBySlug.get(slug);

/** Every path a course belongs to, used to cross-link course detail pages. */
export const getPathsForCourse = (courseId: string): LearningPath[] =>
    learningPaths.filter((path) =>
        path.courses.some((item) => item.course.id === courseId)
    );
