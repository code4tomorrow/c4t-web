import type { Course, CurriculumCoverageReport } from "./course-models";

export const courseRegistry: Course[];
export const coursesBySlug: Map<string, Course>;
export const getCourseBySlug: (slug: string) => Course | undefined;
export const curriculumCoverage: CurriculumCoverageReport;
