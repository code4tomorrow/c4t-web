import type { Course } from "./course-models";
import type { CourseCompletionPolicy } from "../utils/learning/types";

export const toCourseCompletionPolicy = (
    course: Course
): CourseCompletionPolicy => {
    const projectIds = [
        ...course.assignments.map((assignment) => assignment.id),
        course.finalAssessment.id,
    ];

    return {
        courseId: course.id,
        courseTitle: course.title,
        requiredLessonIds: course.modules.flatMap((module) =>
            module.lessons
                .filter((lesson) => lesson.required)
                .map((lesson) => lesson.id)
        ),
        requiredLessonInteractionIds: Object.fromEntries(
            course.modules.flatMap((module) =>
                module.lessons
                    .filter((lesson) => lesson.required)
                    .map((lesson) => [lesson.id, [lesson.interaction.id]])
            )
        ),
        requiredQuizIds: course.modules.map((module) => module.checkpoint.id),
        requiredQuizPassingScores: Object.fromEntries(
            course.modules.map((module) => [
                module.checkpoint.id,
                module.checkpoint.passingScore,
            ])
        ),
        requiredAssignmentIds: projectIds,
        manuallyReviewedAssignmentIds: course.certificateRules
            .manualReviewsMustBeApproved
            ? projectIds
            : [],
        finalProjectAssignmentIds: [course.finalAssessment.id],
        safetyAcknowledgementIds: course.certificateRules
            .safetyAcknowledgementRequired
            ? [`${course.id}-safety`]
            : [],
        minimumQuizAverage: course.certificateRules.minimumQuizAverage,
        minimumFinalProjectScore: course.certificateRules.capstonePassingScore,
    };
};
