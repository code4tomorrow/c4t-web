#!/usr/bin/env node

const sourceCurriculum = require("../learning/source-curriculum");
const courseBlueprints = require("../learning/course-blueprints");
const {
    courseRegistry,
    curriculumCoverage,
} = require("../learning/build-course-registry");

const errors = [];
const fail = (message) => errors.push(message);
const placeholderPattern =
    /\b(lorem ipsum|coming soon|todo|tbd|placeholder|instructor should add)\b/i;

const requireText = (value, label, minimum = 20) => {
    if (typeof value !== "string" || value.trim().length < minimum) {
        fail(`${label} must contain at least ${minimum} characters.`);
        return;
    }
    if (placeholderPattern.test(value)) {
        fail(`${label} contains placeholder language.`);
    }
};

if (sourceCurriculum.length !== 25) {
    fail(`Expected 25 source courses; found ${sourceCurriculum.length}.`);
}
if (courseBlueprints.length !== 25) {
    fail(`Expected 25 authored blueprints; found ${courseBlueprints.length}.`);
}
if (courseRegistry.length !== 25) {
    fail(`Expected 25 built courses; found ${courseRegistry.length}.`);
}

const sourceIds = new Set(sourceCurriculum.map((course) => course.id));
const blueprintIds = new Set(courseBlueprints.map((course) => course.id));
const courseIds = new Set();
const courseSlugs = new Set();
const internalToolPaths = new Set();

sourceIds.forEach((id) => {
    if (!blueprintIds.has(id)) fail(`Source course ${id} has no blueprint.`);
});

courseRegistry.forEach((course, courseIndex) => {
    const prefix = `${course.id} (${course.title})`;
    const source = sourceCurriculum.find((item) => item.id === course.id);

    if (courseIds.has(course.id)) fail(`Duplicate course id: ${course.id}.`);
    courseIds.add(course.id);
    if (courseSlugs.has(course.slug)) {
        fail(`Duplicate course slug: ${course.slug}.`);
    }
    courseSlugs.add(course.slug);
    if (course.order !== courseIndex + 1) {
        fail(
            `${prefix} has order ${course.order}; expected ${courseIndex + 1}.`
        );
    }
    if (!source) {
        fail(`${prefix} is not present in the canonical source curriculum.`);
        return;
    }
    if (course.title !== source.title) {
        fail(`${prefix} does not preserve the canonical course title.`);
    }

    requireText(course.summary, `${prefix} summary`, 60);
    requireText(course.description, `${prefix} description`, 120);
    requireText(course.intendedAudience, `${prefix} intended audience`, 40);
    requireText(
        course.freeCompletionPromise,
        `${prefix} free completion promise`,
        60
    );
    if (!course.learningOutcomes.length) {
        fail(`${prefix} has no learning outcomes.`);
    }
    if (!course.prerequisites.length) {
        fail(`${prefix} must explicitly state prerequisites or "None".`);
    }

    if (course.attribution.creator !== "Zafir Shamsi") {
        fail(`${prefix} has the wrong creator attribution.`);
    }
    if (course.attribution.displayText !== "Course created by Zafir Shamsi.") {
        fail(`${prefix} has the wrong attribution display text.`);
    }

    if (course.modules.length !== 8) {
        fail(`${prefix} must have exactly 8 meaningful modules.`);
    }
    const setup = course.modules[0];
    const capstone = course.modules[course.modules.length - 1];
    if (
        setup?.kind !== "setup" ||
        !/start here|requirements|setup/i.test(setup.title)
    ) {
        fail(`${prefix} must begin with a requirements/free-setup module.`);
    }
    if (capstone?.kind !== "capstone") {
        fail(`${prefix} must end with a capstone/reflection module.`);
    }

    const moduleIds = new Set();
    const lessonIds = new Set();
    course.modules.forEach((module, moduleIndex) => {
        const modulePrefix = `${prefix} / ${module.title}`;
        if (moduleIds.has(module.id)) {
            fail(`${modulePrefix} has a duplicate module id.`);
        }
        moduleIds.add(module.id);
        if (module.order !== moduleIndex + 1) {
            fail(`${modulePrefix} has an incorrect module order.`);
        }
        requireText(module.overview, `${modulePrefix} overview`, 80);
        requireText(
            module.practicalApplication,
            `${modulePrefix} practical application`,
            30
        );
        requireText(module.reviewSupport, `${modulePrefix} review support`, 40);
        if (module.outcomes.length < 3) {
            fail(`${modulePrefix} needs at least three outcomes.`);
        }
        if (module.lessons.length !== 3) {
            fail(`${modulePrefix} must contain exactly three lessons.`);
        }
        if (!module.checkpoint || module.checkpoint.passingScore <= 0) {
            fail(`${modulePrefix} lacks a graded checkpoint.`);
        }
        if (module.checkpoint.rubric.length < 3) {
            fail(`${modulePrefix} checkpoint lacks a substantive rubric.`);
        }

        module.lessons.forEach((lesson, lessonIndex) => {
            const lessonPrefix = `${modulePrefix} / ${lesson.title}`;
            if (lessonIds.has(lesson.id)) {
                fail(`${lessonPrefix} has a duplicate lesson id.`);
            }
            lessonIds.add(lesson.id);
            if (lesson.order !== lessonIndex + 1) {
                fail(`${lessonPrefix} has an incorrect lesson order.`);
            }
            if (!lesson.required) {
                fail(
                    `${lessonPrefix} must be required in the initial curriculum.`
                );
            }
            if (lesson.estimatedMinutes < 10) {
                fail(`${lessonPrefix} has an unrealistically short estimate.`);
            }
            requireText(lesson.objective, `${lessonPrefix} objective`, 40);
            requireText(
                lesson.motivatingScenario,
                `${lessonPrefix} motivating scenario`,
                60
            );
            requireText(lesson.explanation, `${lessonPrefix} explanation`, 240);
            requireText(
                lesson.workedExample.context,
                `${lessonPrefix} worked-example context`,
                50
            );
            if (lesson.workedExample.steps.length < 3) {
                fail(
                    `${lessonPrefix} worked example needs at least three steps.`
                );
            }
            requireText(
                lesson.practiceTask,
                `${lessonPrefix} practice task`,
                40
            );
            requireText(
                lesson.feedbackGuidance,
                `${lessonPrefix} feedback`,
                50
            );
            requireText(lesson.summary, `${lessonPrefix} summary`, 60);
            requireText(
                lesson.nextLessonConnection,
                `${lessonPrefix} next connection`,
                30
            );
            requireText(
                lesson.accessibilityAlternative,
                `${lessonPrefix} accessible alternative`,
                40
            );
            if (
                !lesson.interaction ||
                lesson.interaction.instructions.length < 3
            ) {
                fail(`${lessonPrefix} lacks a substantive interaction.`);
            }
            if (lesson.checkpoint.successCriteria.length < 3) {
                fail(
                    `${lessonPrefix} checkpoint needs three success criteria.`
                );
            }
        });
    });

    if (course.assignments.length < 2) {
        fail(`${prefix} must contain at least two applied assignments.`);
    }
    course.assignments.forEach((assignment) => {
        requireText(
            assignment.brief,
            `${prefix} assignment "${assignment.title}" brief`,
            60
        );
        requireText(
            assignment.freeCompletionPath,
            `${prefix} assignment "${assignment.title}" free path`,
            60
        );
        if (!assignment.relatedModuleIds.length) {
            fail(`${prefix} assignment "${assignment.title}" has no modules.`);
        }
        if (assignment.rubric.length < 3) {
            fail(`${prefix} assignment "${assignment.title}" lacks a rubric.`);
        }
    });
    if (
        course.finalAssessment.type !== "capstone" ||
        course.finalAssessment.rubric.length < 3
    ) {
        fail(`${prefix} lacks a complete final assessment/capstone.`);
    }

    const pacingTypes = new Set(course.pacing.map((item) => item.type));
    if (!pacingTypes.has("self-paced") || !pacingTypes.has("weekly")) {
        fail(`${prefix} must include self-paced and weekly pacing templates.`);
    }
    if (
        course.certificateRules.requiredLessonCompletionPercent !== 100 ||
        course.certificateRules.minimumQuizAverage < 80 ||
        course.certificateRules.capstonePassingScore < 80
    ) {
        fail(`${prefix} has incomplete certificate eligibility rules.`);
    }

    if (!course.requirements.length) {
        fail(`${prefix} has no requirements/setup records.`);
    }
    course.requirements.forEach((requirement) => {
        const requirementPrefix = `${prefix} requirement "${requirement.name}"`;
        requireText(requirement.reason, `${requirementPrefix} reason`, 30);
        requireText(
            requirement.freePath.description,
            `${requirementPrefix} free-path description`,
            30
        );
        requireText(
            requirement.freePath.verification,
            `${requirementPrefix} verification`,
            20
        );
        if (requirement.freePath.setupSteps.length < 3) {
            fail(`${requirementPrefix} needs at least three setup steps.`);
        }
        requirement.paidOptions.forEach((option) => {
            if (option.required !== false) {
                fail(`${requirementPrefix} has a paid option marked required.`);
            }
        });
        if (requirement.freePath.url?.startsWith("/learn/tools/")) {
            if (internalToolPaths.has(requirement.freePath.url)) {
                // A simulator may be referenced by an optional companion
                // requirement in the same course, which is intentional.
                const first = course.requirements.find(
                    (item) => item.freePath.url === requirement.freePath.url
                );
                if (first?.id === requirement.id) {
                    fail(
                        `${requirementPrefix} duplicates an internal tool path across courses.`
                    );
                }
            } else {
                internalToolPaths.add(requirement.freePath.url);
            }
        }
    });

    const hardwareRequirements = course.requirements.filter(
        (requirement) => requirement.category === "hardware"
    );
    if (hardwareRequirements.length) {
        if (!course.simulators.length) {
            fail(`${prefix} has hardware but no no-hardware simulator.`);
        }
        if (!course.certificateRules.safetyAcknowledgementRequired) {
            fail(`${prefix} hardware safety acknowledgement is not required.`);
        }
    }
    course.simulators.forEach((simulator) => {
        if (
            simulator.noHardwareRequired !== true ||
            simulator.keyboardAccessible !== true
        ) {
            fail(
                `${prefix} simulator "${simulator.name}" is not free/accessibly configured.`
            );
        }
        if (!simulator.capabilities.length || !simulator.limitations.length) {
            fail(
                `${prefix} simulator "${simulator.name}" needs capabilities and limitations.`
            );
        }
    });

    const sourceTopics = new Set(source.topics);
    const mappedTopics = new Set(
        course.sourceTopicCoverage.map((item) => item.sourceTopic)
    );
    if (mappedTopics.size !== sourceTopics.size) {
        fail(
            `${prefix} maps ${mappedTopics.size}/${sourceTopics.size} source topics.`
        );
    }
    sourceTopics.forEach((topic) => {
        if (!mappedTopics.has(topic)) {
            fail(`${prefix} has an unmapped source topic: "${topic}".`);
        }
    });
    course.sourceTopicCoverage.forEach((coverage) => {
        if (!sourceTopics.has(coverage.sourceTopic)) {
            fail(
                `${prefix} maps an unknown source topic: "${coverage.sourceTopic}".`
            );
        }
        if (!moduleIds.has(coverage.moduleId)) {
            fail(
                `${prefix} coverage references missing module ${coverage.moduleId}.`
            );
        }
        if (!lessonIds.has(coverage.lessonId)) {
            fail(
                `${prefix} coverage references missing lesson ${coverage.lessonId}.`
            );
        }
        for (const stage of [
            "introduced",
            "practiced",
            "assessed",
            "applied",
        ]) {
            if (!coverage.stages.includes(stage)) {
                fail(
                    `${prefix} topic "${coverage.sourceTopic}" lacks ${stage} coverage.`
                );
            }
        }
        if (coverage.completionStatus !== "complete") {
            fail(`${prefix} topic "${coverage.sourceTopic}" is not complete.`);
        }
    });
});

if (curriculumCoverage.courseCount !== 25) {
    fail("Coverage report does not contain 25 courses.");
}
const canonicalTopicCount = sourceCurriculum.reduce(
    (total, course) => total + course.topics.length,
    0
);
if (curriculumCoverage.topicCount !== canonicalTopicCount) {
    fail(
        `Coverage report contains ${curriculumCoverage.topicCount}/${canonicalTopicCount} topics.`
    );
}
if (internalToolPaths.size !== 24) {
    fail(
        `Expected 24 unique internal free-tool paths plus Scratch; found ${internalToolPaths.size}.`
    );
}

if (errors.length) {
    console.error(
        `Curriculum validation failed with ${errors.length} error(s):`
    );
    errors.forEach((error, index) =>
        console.error(`${String(index + 1).padStart(3, " ")}. ${error}`)
    );
    process.exit(1);
}

const lessonCount = courseRegistry.reduce(
    (total, course) =>
        total +
        course.modules.reduce(
            (moduleTotal, module) => moduleTotal + module.lessons.length,
            0
        ),
    0
);

console.log(
    `Curriculum validation passed: ${courseRegistry.length} courses, ${lessonCount} lessons, ${curriculumCoverage.topicCount} mapped topics, ${internalToolPaths.size} internal free labs.`
);
