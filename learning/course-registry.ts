import type { Course, CurriculumCoverageReport } from "./course-models";
import {
    courseRegistry as builtCourseRegistry,
    coursesBySlug as builtCoursesBySlug,
    curriculumCoverage as builtCurriculumCoverage,
} from "./build-course-registry";

export const courseRegistry: Course[] = builtCourseRegistry;

export const coursesBySlug: ReadonlyMap<string, Course> = builtCoursesBySlug;

export const getCourseBySlug = (slug: string): Course | undefined =>
    coursesBySlug.get(slug);

export const curriculumCoverage: CurriculumCoverageReport =
    builtCurriculumCoverage;
