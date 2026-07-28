#!/usr/bin/env node

const fs = require("fs");
const ts = require("typescript");

require.extensions[".ts"] = (module, filename) => {
    const source = fs.readFileSync(filename, "utf8");
    const output = ts.transpileModule(source, {
        compilerOptions: {
            esModuleInterop: true,
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2020,
        },
    }).outputText;
    module._compile(output, filename);
};

const learningState = require("../utils/learning/state.ts");
const { toCourseCompletionPolicy } = require("../learning/course-policies.ts");
const { courseRegistry } = require("../learning/build-course-registry.js");

const fail = (message) => {
    throw new Error(message);
};

const now = "2026-07-28T12:00:00.000Z";
const empty = learningState.createEmptyLearningState({
    deviceId: "validation-device",
    now,
});
const serialized = learningState.serializeLearningData(empty);

if (!learningState.parseLearningData(serialized).ok) {
    fail("A valid exported learning state was rejected.");
}

const malformed = JSON.parse(serialized);
malformed.lessonProgress["course-01::lesson-01"] = {
    courseId: "course-01",
    lessonId: "lesson-01",
    startedAt: now,
    updatedAt: now,
    activeSeconds: 0,
    completedInteractionIds: {},
};
if (learningState.parseLearningData(JSON.stringify(malformed)).ok) {
    fail("A malformed interaction record was accepted.");
}

const nonLocalCertificate = JSON.parse(serialized);
nonLocalCertificate.certificates["course-01"] = {
    id: "certificate-1",
    courseId: "course-01",
    courseTitle: "Course",
    learnerName: "Learner",
    issuedAt: now,
    localOnly: false,
};
if (learningState.parseLearningData(JSON.stringify(nonLocalCertificate)).ok) {
    fail("A non-local certificate record was accepted.");
}

if (
    learningState.parseLearningData(
        " ".repeat(learningState.MAX_LEARNING_BACKUP_BYTES + 1)
    ).ok
) {
    fail("An oversized learning backup was accepted.");
}

const course = courseRegistry[0];
const policy = toCourseCompletionPolicy(course);
let progress = learningState.enrollInCourse(
    empty,
    { courseId: course.id },
    now
);

course.modules.forEach((module) => {
    module.lessons.forEach((lesson) => {
        progress = learningState.completeLessonInteraction(
            progress,
            {
                courseId: course.id,
                moduleId: module.id,
                lessonId: lesson.id,
                interactionId: lesson.interaction.id,
            },
            now
        );
        progress = learningState.setLessonCompletion(
            progress,
            {
                courseId: course.id,
                moduleId: module.id,
                lessonId: lesson.id,
                completed: true,
            },
            now
        );
    });
});

course.modules.forEach((module) => {
    const score = module.kind === "setup" ? 80 : module.checkpoint.passingScore;
    progress = learningState.recordQuizAttempt(
        progress,
        {
            courseId: course.id,
            quizId: module.checkpoint.id,
            score,
            maxScore: 100,
            passed: score >= module.checkpoint.passingScore,
        },
        now
    );
});

[...course.assignments, course.finalAssessment].forEach((assignment) => {
    progress = learningState.recordAssignmentAttempt(
        progress,
        {
            courseId: course.id,
            assignmentId: assignment.id,
            status: "approved",
            score: 100,
            maxScore: 100,
            passed: true,
        },
        now
    );
});

if (learningState.calculateCertificateEligibility(progress, policy).eligible) {
    fail("An 80% setup checkpoint incorrectly satisfied its 100% threshold.");
}

const setupCheckpoint = course.modules[0].checkpoint;
progress = learningState.recordQuizAttempt(
    progress,
    {
        courseId: course.id,
        quizId: setupCheckpoint.id,
        score: 100,
        maxScore: 100,
        passed: true,
    },
    now
);

if (!learningState.calculateCertificateEligibility(progress, policy).eligible) {
    fail("A fully completed course was not certificate eligible.");
}

const completed = learningState.markCourseCompleted(progress, policy, now);
if (completed.enrollments[course.id]?.status !== "completed") {
    fail("Eligible course completion did not update enrollment status.");
}

console.log(
    "Learning-state validation passed: safe backups, interaction-gated lessons, checkpoint thresholds, and completion status."
);
