import type { Course, CourseModule, Lesson } from "learning/course-models";
import { courseRegistry } from "learning/course-registry";

const byId = new Map(courseRegistry.map((course) => [course.id, course]));
const bySlug = new Map(courseRegistry.map((course) => [course.slug, course]));

export const getCourseById = (courseId: string): Course | undefined =>
    byId.get(courseId);

export const getCourseBySlug = (slug: string): Course | undefined =>
    bySlug.get(slug);

export const allCourses = (): Course[] => courseRegistry;

export interface LessonLocation {
    course: Course;
    module: CourseModule;
    lesson: Lesson;
}

const lessonIndex = new Map<string, LessonLocation>();
courseRegistry.forEach((course) => {
    course.modules.forEach((module) => {
        module.lessons.forEach((lesson) => {
            lessonIndex.set(lesson.id, { course, module, lesson });
        });
    });
});

export const findLesson = (lessonId: string): LessonLocation | undefined =>
    lessonIndex.get(lessonId);

export interface AssessmentLocation {
    course: Course;
    kind: "checkpoint" | "assignment" | "final";
    id: string;
    title: string;
    passingScore: number;
    maxAttempts: number | null;
}

const assessmentIndex = new Map<string, AssessmentLocation>();
courseRegistry.forEach((course) => {
    course.modules.forEach((module) => {
        assessmentIndex.set(module.checkpoint.id, {
            course,
            kind: "checkpoint",
            id: module.checkpoint.id,
            title: module.checkpoint.title,
            passingScore: module.checkpoint.passingScore,
            maxAttempts: module.checkpoint.maximumAttempts,
        });
    });
    course.assignments.forEach((assignment) => {
        assessmentIndex.set(assignment.id, {
            course,
            kind: "assignment",
            id: assignment.id,
            title: assignment.title,
            passingScore: assignment.passingScore,
            maxAttempts: assignment.attempts,
        });
    });
    assessmentIndex.set(course.finalAssessment.id, {
        course,
        kind: "final",
        id: course.finalAssessment.id,
        title: course.finalAssessment.title,
        passingScore: course.finalAssessment.passingScore,
        maxAttempts: course.finalAssessment.maximumAttempts,
    });
});

export const findAssessment = (id: string): AssessmentLocation | undefined =>
    assessmentIndex.get(id);

/** True when the id belongs to the course, guarding against cross-course writes. */
export const assessmentBelongsToCourse = (id: string, courseId: string) =>
    assessmentIndex.get(id)?.course.id === courseId;

export const lessonBelongsToCourse = (lessonId: string, courseId: string) =>
    lessonIndex.get(lessonId)?.course.id === courseId;
