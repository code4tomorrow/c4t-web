const sourceCurriculum = require("./source-curriculum");
const courseBlueprints = require("./course-blueprints");

const slugify = (value) =>
    value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

const sentenceList = (values) => {
    if (!values.length) return "the course ideas";
    if (values.length === 1) return values[0];
    return `${values.slice(0, -1).join(", ")}, and ${
        values[values.length - 1]
    }`;
};

const rubric = (prefix) => [
    {
        id: `${prefix}-understanding`,
        label: "Conceptual understanding",
        description:
            "Explains the relevant ideas accurately and connects decisions to evidence.",
        points: 30,
    },
    {
        id: `${prefix}-application`,
        label: "Working application",
        description:
            "Completes the required behavior or a faithful simulator-based equivalent.",
        points: 30,
    },
    {
        id: `${prefix}-testing`,
        label: "Testing and revision",
        description:
            "Tests normal and edge cases, records results, and improves the work.",
        points: 25,
    },
    {
        id: `${prefix}-communication`,
        label: "Communication and accessibility",
        description:
            "Documents choices clearly and provides an accessible explanation of important output.",
        points: 15,
    },
];

const assessment = ({
    id,
    type,
    title,
    instructions,
    topics,
    minutes = 25,
    passingScore = 80,
}) => ({
    id,
    type,
    title,
    instructions,
    estimatedMinutes: minutes,
    passingScore,
    maximumAttempts: null,
    sourceTopics: topics,
    rubric: rubric(id),
    feedbackPolicy:
        "Compare the result with every rubric criterion. Correct work receives a reason, and incomplete work receives a specific next step.",
    remediation:
        "Revisit the module explanation and worked example, repeat the simulator with a smaller case, then retry with new evidence.",
});

const interaction = ({ id, type, title, prompt, practice, application }) => ({
    id,
    type,
    title,
    prompt,
    instructions: [
        "Make a prediction and write down the reason before changing a control.",
        practice,
        "Change one input at a time, compare the result with the prediction, and record the first important difference.",
        application,
    ],
    successFeedback:
        "You used observable evidence and connected the result to the module ideas. Keep the trace or notes for the checkpoint.",
    retryFeedback:
        "Change only one variable, return to the worked example, and compare the first step where expected and actual behavior differ.",
    completionCondition:
        "Submit a prediction, run or trace at least two cases, and explain one result using evidence.",
    accessibleAlternative:
        "Use the text trace and keyboard controls. A written input/output table provides the same completion path as the visual view.",
});

const lesson = ({ course, module, topics, phase, order, nextConnection }) => {
    const topicText = sentenceList(topics);
    const id = `${module.id}-${phase}`;
    const common = {
        id,
        slug: `${module.slug}-${phase}`,
        order,
        sourceTopics: topics,
        required: true,
        accessibilityAlternative:
            "All visual changes are also described in text. Complete the same task with the keyboard, a written trace, or an input/output table.",
        nextLessonConnection: nextConnection,
    };

    if (phase === "explore") {
        return {
            ...common,
            title: `Explore: ${module.title}`,
            objective: `Explain how ${topicText} work together in a concrete ${course.title} decision.`,
            estimatedMinutes: 25,
            motivatingScenario: module.scenario,
            explanation: `This lesson introduces ${topicText}. In the scenario, the important move is to separate what is known, what can change, what rule transforms an input, and what evidence would show that the result is correct. These concepts should not be memorized as isolated vocabulary. Use them as a connected model: name the current state, make one deliberate change, observe the result, and compare it with the goal and constraints. That process makes the reasoning testable, exposes assumptions, and creates a record another learner can review.`,
            workedExample: {
                title: `Reason through ${module.title.toLowerCase()}`,
                context: module.scenario,
                steps: [
                    `List the parts of the scenario connected to ${topicText}.`,
                    "Write one prediction and the evidence that would support or contradict it.",
                    module.practice,
                    "Compare the observed result with the prediction and identify the first meaningful difference.",
                ],
                result: `A reviewable explanation that connects ${topicText} to evidence instead of relying on a guess.`,
            },
            interaction: interaction({
                id: `${id}-interaction`,
                type: "prediction",
                title: `Predict the ${module.title.toLowerCase()} outcome`,
                prompt: module.scenario,
                practice: module.practice,
                application: module.application,
            }),
            practiceTask: module.practice,
            feedbackGuidance:
                "A strong response names the relevant input or state, applies a rule, and cites an observed result. If any link is missing, return to the worked trace.",
            checkpoint: {
                prompt: `Explain one relationship among ${topicText} and show it with a normal case plus an edge case.`,
                successCriteria: [
                    "Names the relevant inputs, state, rule, and intended result.",
                    "Uses evidence from at least two cases.",
                    "Explains why the evidence supports or challenges the prediction.",
                ],
                feedback:
                    "If both cases follow the stated rule and the explanation accounts for the difference, the concept is ready for guided practice.",
            },
            summary: `${module.title} becomes manageable when ${topicText} are connected through explicit state, rules, observations, and tests.`,
        };
    }

    if (phase === "practice") {
        return {
            ...common,
            title: `Guided lab: ${module.title}`,
            objective: `Practice ${topicText} with a repeatable, evidence-based procedure and the free course simulator.`,
            estimatedMinutes: 35,
            motivatingScenario: module.scenario,
            explanation: `Guided practice turns the module model into a procedure you can repeat. Work with ${topicText} by holding most conditions steady, changing one meaningful input, and recording the resulting state or output. The simulator is a concept model, so label its limitations and do not present modeled hardware, compute, or agent behavior as a physical or production measurement. The goal is to learn the reasoning pattern, check it against several cases, and know what additional evidence a real project would require.`,
            workedExample: {
                title: `Run a controlled ${module.title.toLowerCase()} comparison`,
                context: module.scenario,
                steps: [
                    "Choose a small baseline case and record its input, rule, and output.",
                    "Predict how one controlled change should affect the result.",
                    module.practice,
                    "Repeat with an edge case, then label what the simulator demonstrates and what it cannot prove.",
                ],
                result: `A comparison table with a baseline, one controlled change, an edge case, and an honest limitation statement.`,
            },
            interaction: interaction({
                id: `${id}-interaction`,
                type: module.interactionType,
                title: `${module.title} browser lab`,
                prompt: `Use the free lab to investigate ${topicText}.`,
                practice: module.practice,
                application: module.application,
            }),
            practiceTask: `${module.practice} Save an accessible text trace or table that another learner could follow.`,
            feedbackGuidance:
                "Correct work changes one factor at a time and explains the result. If several factors changed, reset to the baseline and rerun.",
            checkpoint: {
                prompt: `What changed, what stayed constant, and what evidence connects the result to ${topicText}?`,
                successCriteria: [
                    "Includes a baseline and at least one controlled comparison.",
                    "Records an observable output or trace.",
                    "States one limitation of the simulator or example.",
                ],
                feedback:
                    "A controlled comparison supports a causal explanation only within the modeled conditions; keep the limitation with your notes.",
            },
            summary: `A repeatable lab procedure makes ${topicText} visible and testable while keeping simulated evidence separate from real-world claims.`,
        };
    }

    return {
        ...common,
        title: `Apply and check: ${module.title}`,
        objective: `Apply ${topicText} independently, test the result, and defend a revision using the module rubric.`,
        estimatedMinutes: 30,
        motivatingScenario: module.scenario,
        explanation: `Independent application means making and defending your own choices. Use ${topicText} to plan a small solution for the scenario, define a success condition before building, and collect evidence from normal, boundary, and failure cases. When a result differs from the plan, locate the first divergence rather than changing several things at random. The finished work should show the original decision, the evidence, the revision, and the reason the revision is more reliable or understandable.`,
        workedExample: {
            title: `Turn evidence into a ${module.title.toLowerCase()} revision`,
            context: `${module.application} The review must connect each decision to reproducible evidence and an explicit success condition.`,
            steps: [
                "State a success condition and one likely failure before starting.",
                module.application,
                "Test a normal case, a boundary case, and a failure or misuse case.",
                "Choose one revision, rerun the same cases, and compare the evidence.",
            ],
            result: `A small applied solution with a test record and a justified improvement connected to ${topicText}.`,
        },
        interaction: interaction({
            id: `${id}-interaction`,
            type: "design-review",
            title: `Review a ${module.title.toLowerCase()} decision`,
            prompt: module.application,
            practice: module.practice,
            application: module.application,
        }),
        practiceTask: `${module.application} Include a success condition, three test cases, and one evidence-based revision.`,
        feedbackGuidance:
            "Use the rubric to check accuracy, application, testing, and communication. A vague claim needs a trace, measurement, or reproducible example.",
        checkpoint: {
            prompt: `Show that your application uses ${topicText} and explain the strongest evidence that it meets the success condition.`,
            successCriteria: [
                "Applies every listed topic in a connected solution.",
                "Includes normal, boundary, and failure evidence.",
                "Documents one revision and why it improved the result.",
            ],
            feedback:
                "Meeting all criteria prepares you for the graded module checkpoint. If a criterion is missing, use the remediation link before retrying.",
        },
        summary: `${module.title} is complete when the work applies ${topicText}, survives meaningful tests, and communicates evidence and limitations clearly.`,
    };
};

const buildRequirements = (blueprint) => {
    const simulator = blueprint.simulators[0];
    const primary = blueprint.primaryTool;
    const requirements = [
        {
            id: `${blueprint.id}-requirement-primary`,
            category: primary.category,
            name: primary.name,
            required: true,
            reason: primary.description,
            freePath: {
                name: primary.name,
                description: primary.description,
                setupSteps: primary.setupSteps,
                verification: primary.verification,
                url: primary.url,
            },
            paidOptions: (primary.paidOptions || []).map((option) => ({
                ...option,
                required: false,
            })),
            accessibilityNotes:
                "Use keyboard controls and the text trace or written alternative when a visual or pointer interaction is not suitable.",
        },
    ];

    (blueprint.extraRequirements || []).forEach((extra, index) => {
        const isPhysical = extra.category === "hardware";
        requirements.push({
            id: `${blueprint.id}-requirement-extra-${index + 1}`,
            category: extra.category,
            name: extra.name,
            required: false,
            reason: extra.description,
            freePath: {
                name: isPhysical
                    ? simulator.name
                    : `${primary.name} guided alternative`,
                description: isPhysical
                    ? `${simulator.purpose} The physical equipment is optional.`
                    : `Use the built-in guided concept lab; native installation is an optional extension.`,
                setupSteps: [
                    `Open ${primary.name}.`,
                    isPhysical
                        ? `Select the simulated ${extra.name.toLowerCase()} pathway.`
                        : "Choose the browser-based guided pathway.",
                    `Complete this check: ${extra.verification}`,
                ],
                verification: extra.verification,
                url: primary.url,
            },
            paidOptions: (extra.paidOptions || []).map((option) => ({
                ...option,
                required: false,
            })),
            accessibilityNotes:
                "The simulator, supplied traces, and written tables cover the assessed concepts without handling physical parts.",
        });
    });

    return requirements;
};

const buildSetupModule = (courseBase, blueprint, requirements) => {
    const id = `${blueprint.id}-start-free`;
    const module = {
        id,
        slug: "start-here-free-setup",
        order: 1,
        kind: "setup",
        title: "Start here: requirements and free setup",
        overview: `Choose the $0 pathway for ${courseBase.title}, prepare the required browser tools, verify access, and review optional equipment and safety.`,
        outcomes: [
            "Identify what is required, what is optional, and how to complete the course for $0.",
            "Follow the setup walkthrough and pass the free-tool verification check.",
            "Explain privacy, accessibility, backup, and any optional hardware safety rules.",
        ],
        scenario:
            "You want to begin today with the device you already have and without entering a payment method.",
        practice:
            "Follow each free setup step, then record the verification result and one troubleshooting note.",
        application:
            "Create a short personal setup card listing the free path, backup method, accessibility preference, and optional extensions you will skip or use.",
        interactionType: "scenario",
    };

    const requirementSummary = requirements
        .map(
            (requirement) =>
                `${requirement.name}: ${
                    requirement.freePath.description
                } Steps: ${requirement.freePath.setupSteps.join(
                    " "
                )} Verification: ${requirement.freePath.verification}`
        )
        .join("\n\n");
    const safety = (blueprint.extraRequirements || [])
        .filter((item) => item.category === "hardware")
        .flatMap((item) => item.setupSteps);

    const lessons = [
        {
            id: `${id}-choose`,
            slug: "choose-your-free-path",
            order: 1,
            title: "Welcome and choose your free path",
            objective:
                "Identify every course requirement and select a complete $0 pathway before beginning.",
            estimatedMinutes: 15,
            motivatingScenario: module.scenario,
            explanation: `${blueprint.freeCompletionPromise} Required course work uses the free pathway first. Any physical device, subscription, hosted API, commercial cloud, GPU, or paid editor is an optional comparison only. The course page labels those choices separately so cost never becomes a completion condition. Your work can be kept in local files and learning progress can be exported from the dashboard.`,
            workedExample: {
                title: "Compare required and optional choices",
                context:
                    "A learner has a current browser but no paid accounts or course-specific equipment.",
                steps: [
                    "Read the requirement cards and locate the free option on each.",
                    "Ignore the collapsed optional paid section.",
                    "Select the included simulator when a physical or compute resource appears.",
                    "Confirm that every assessed outcome has a $0 route.",
                ],
                result: "The learner can start immediately without entering payment information or buying equipment.",
            },
            interaction: interaction({
                id: `${id}-choose-interaction`,
                type: "scenario",
                title: "Build your $0 course plan",
                prompt: blueprint.freeCompletionPromise,
                practice:
                    "Mark each free requirement and explain which simulator or guided alternative replaces optional equipment or services.",
                application:
                    "Write a one-paragraph access plan you can revisit if your device or connection changes.",
            }),
            practiceTask:
                "List the free tool, simulator, local backup method, and any optional paid or physical resource you do not need.",
            feedbackGuidance:
                "The plan is complete only when no required step depends on payment, a paid account, or physical equipment.",
            checkpoint: {
                prompt: "Can you point to a free option for every listed requirement?",
                successCriteria: [
                    "Names the primary free course tool.",
                    "Names the no-hardware or low-compute path when relevant.",
                    "States that paid alternatives are optional.",
                ],
                feedback:
                    "If one requirement still appears paid or physical-only, reopen its card and select the free simulator path.",
            },
            summary:
                "Every assessed activity in this course has a documented $0 path, and optional paid or physical extensions never affect completion.",
            nextLessonConnection:
                "Next, follow the exact setup steps and run a verification check.",
            accessibilityAlternative:
                "The entire access plan is available as text and every setup control is keyboard accessible.",
            sourceTopics: [],
            required: true,
        },
        {
            id: `${id}-setup`,
            slug: "free-tool-setup-walkthrough",
            order: 2,
            title: "Free tool setup walkthrough",
            objective:
                "Prepare the free course tools and demonstrate that the learning environment is ready.",
            estimatedMinutes: 25,
            motivatingScenario:
                "A setup is only useful when you can prove it works before a project deadline.",
            explanation: requirementSummary,
            workedExample: {
                title: "Verify one requirement at a time",
                context:
                    "A tool opens, but the learner has not confirmed that its controls and backups work.",
                steps: [
                    "Complete the first setup step and pause before continuing.",
                    "Use the keyboard to reach each interactive control.",
                    "Run the requirement's verification task.",
                    "Save or export a small local backup and record the result.",
                ],
                result: "A checked setup record that distinguishes opening a tool from successfully using it.",
            },
            interaction: interaction({
                id: `${id}-setup-interaction`,
                type: "simulator",
                title: "Run the setup check",
                prompt: primarySetupPrompt(blueprint),
                practice: module.practice,
                application: module.application,
            }),
            practiceTask: module.practice,
            feedbackGuidance:
                "If verification fails, repeat the smallest failing step, use the text alternative, and keep the exact observed message in your notes.",
            checkpoint: {
                prompt: "Show the verification result for every required free tool.",
                successCriteria: [
                    "Completes each listed setup step.",
                    "Runs each verification activity.",
                    "Creates a local backup or export.",
                ],
                feedback:
                    "A screenshot is optional; a text trace containing the input, action, and result is equally valid.",
            },
            summary:
                "The free learning environment is ready only after its controls, verification activity, and backup path have been tested.",
            nextLessonConnection:
                "Next, check accessibility, privacy, safety, and recovery before beginning core lessons.",
            accessibilityAlternative:
                "Use the written trace instead of screenshots and the keyboard instead of pointer controls.",
            sourceTopics: [],
            required: true,
        },
        {
            id: `${id}-safety`,
            slug: "accessibility-privacy-and-safety-check",
            order: 3,
            title: "Accessibility, privacy, safety, and troubleshooting",
            objective:
                "Choose accessible controls, protect private data, and apply safe recovery or optional hardware practices.",
            estimatedMinutes: 20,
            motivatingScenario:
                "A reliable setup anticipates inaccessible controls, lost files, unsafe physical extensions, and sensitive information before they become problems.",
            explanation: `Use only synthetic, public, or course-approved data. Never place secrets, personal records, private documents, production credentials, or unrestricted keys in a course tool. Export progress and project files regularly because guest progress is device-local. Use reduced motion and text traces where helpful. ${
                safety.length
                    ? `Physical work is optional. If you choose it: ${safety.join(
                          " "
                      )}`
                    : "No physical equipment is required for this course."
            }`,
            workedExample: {
                title: "Recover safely from a blocked setup",
                context:
                    "A learner cannot use a visual control and a project file was not backed up.",
                steps: [
                    "Switch to the keyboard and text-trace alternative.",
                    "Use synthetic data rather than a personal file.",
                    "Export learning progress and download the current project notes.",
                    "If physical equipment is optional, continue in simulation until the safety checklist is complete.",
                ],
                result: "A private, accessible, recoverable path that does not weaken the learning objective.",
            },
            interaction: interaction({
                id: `${id}-safety-interaction`,
                type: "scenario",
                title: "Access and safety decision check",
                prompt: "Choose the safest free response to an inaccessible control, missing backup, private dataset, or optional hardware task.",
                practice:
                    "Explain why the text/simulator/synthetic-data route preserves the objective.",
                application:
                    "Finish your personal setup card with recovery and safety steps.",
            }),
            practiceTask: module.application,
            feedbackGuidance:
                "A safe answer minimizes data, avoids secrets, keeps a backup, and uses simulation until optional physical work is properly supervised and checked.",
            checkpoint: {
                prompt: "What will you do if storage is cleared, a visual control is inaccessible, or optional physical work is unsafe?",
                successCriteria: [
                    "Names the export or local backup process.",
                    "Names a keyboard or text alternative.",
                    "Uses simulation rather than bypassing a safety check.",
                ],
                feedback:
                    "Keep this recovery plan with your course notes and update it when your device or access needs change.",
            },
            summary:
                "Accessible alternatives, data minimization, backups, and simulation are normal parts of the learning path—not exceptions.",
            nextLessonConnection:
                "Your setup is ready; the next module begins the course's first core concept.",
            accessibilityAlternative:
                "This lesson is text-first and can be completed without images, audio, drag-and-drop, or physical equipment.",
            sourceTopics: [],
            required: true,
        },
    ];

    return {
        id,
        slug: module.slug,
        order: module.order,
        kind: module.kind,
        title: module.title,
        overview: module.overview,
        outcomes: module.outcomes,
        lessons,
        checkpoint: assessment({
            id: `${id}-checkpoint`,
            type: "module-checkpoint",
            title: "Free setup readiness check",
            instructions:
                "Confirm the $0 path, verification result, backup process, accessibility alternative, privacy rule, and any optional hardware safety acknowledgement.",
            topics: [],
            minutes: 15,
            passingScore: 100,
        }),
        practicalApplication: module.application,
        reviewSupport:
            "Return to the exact requirement card that failed, use its text alternative, and repeat the verification before moving on.",
    };
};

const primarySetupPrompt = (blueprint) =>
    `Use ${blueprint.primaryTool.name} to complete this verification: ${blueprint.primaryTool.verification}`;

const buildCoreModule = (courseBase, blueprintModule, topics, coreIndex) => {
    const slug = slugify(blueprintModule.title);
    const module = {
        ...blueprintModule,
        id: `${courseBase.id}-module-${coreIndex + 1}-${slug}`,
        slug,
        order: coreIndex + 2,
    };
    const lessons = [
        lesson({
            course: courseBase,
            module,
            topics,
            phase: "explore",
            order: 1,
            nextConnection: `Use the model in the guided ${module.title.toLowerCase()} lab.`,
        }),
        lesson({
            course: courseBase,
            module,
            topics,
            phase: "practice",
            order: 2,
            nextConnection: `Apply ${module.title.toLowerCase()} independently and prepare checkpoint evidence.`,
        }),
        lesson({
            course: courseBase,
            module,
            topics,
            phase: "apply",
            order: 3,
            nextConnection:
                coreIndex === 5
                    ? "Synthesize the course in the capstone module."
                    : "Carry this evidence into the next connected module.",
        }),
    ];

    return {
        id: module.id,
        slug,
        order: module.order,
        kind: "core",
        title: module.title,
        overview: `${module.scenario} This module connects ${sentenceList(
            topics
        )} through prediction, guided practice, independent application, and review.`,
        outcomes: [
            `Explain ${sentenceList(topics)} in the module scenario.`,
            module.practice,
            module.application,
        ],
        lessons,
        checkpoint: assessment({
            id: `${module.id}-checkpoint`,
            type: "module-checkpoint",
            title: `${module.title} checkpoint`,
            instructions: `Use a new case to demonstrate ${sentenceList(
                topics
            )}, include evidence from normal and edge cases, explain one incorrect path, and revise the result.`,
            topics,
        }),
        practicalApplication: module.application,
        reviewSupport:
            "Repeat the guided lab with a smaller input, use the text trace, and compare the first step where expected and actual behavior differ.",
    };
};

const buildCapstoneModule = (courseBase, blueprint) => {
    const id = `${courseBase.id}-capstone`;
    const topics = courseBase.sourceTopics;
    const module = {
        id,
        slug: "capstone-reflection-and-next-steps",
        order: 8,
        kind: "capstone",
        title: "Capstone, reflection, and next steps",
        overview: blueprint.capstone.brief,
        outcomes: [
            "Plan the capstone against its rubric and free completion path.",
            "Build, test, document, and revise the capstone.",
            "Reflect on evidence, limitations, responsible use, and next steps.",
        ],
    };
    const deliverables = blueprint.capstone.deliverables;
    const base = {
        course: courseBase,
        module: {
            ...module,
            scenario: blueprint.capstone.brief,
            practice: `Turn the rubric into a checklist for ${sentenceList(
                deliverables
            )}.`,
            application: `Complete ${blueprint.capstone.title} using the free course pathway.`,
            interactionType: "design-review",
        },
        topics,
    };
    const lessons = [
        {
            ...lesson({
                ...base,
                phase: "explore",
                order: 1,
                nextConnection:
                    "Build the smallest complete version and test it.",
            }),
            title: `Plan: ${blueprint.capstone.title}`,
            objective:
                "Translate the capstone brief and rubric into a safe, free, testable project plan.",
        },
        {
            ...lesson({
                ...base,
                phase: "practice",
                order: 2,
                nextConnection:
                    "Review the evidence, revise the work, and prepare the final reflection.",
            }),
            title: `Build and test: ${blueprint.capstone.title}`,
            objective:
                "Build the capstone through the free path and collect evidence for every deliverable.",
        },
        {
            ...lesson({
                ...base,
                phase: "apply",
                order: 3,
                nextConnection:
                    "Submit the final assessment, review certificate eligibility, and choose the next course.",
            }),
            title: "Reflect, communicate, and continue",
            objective:
                "Evaluate the capstone honestly, communicate limitations and responsible-use decisions, and identify a next learning step.",
        },
    ];

    return {
        ...module,
        lessons,
        checkpoint: assessment({
            id: `${id}-checkpoint`,
            type: "capstone",
            title: blueprint.capstone.title,
            instructions: `${
                blueprint.capstone.brief
            } Required deliverables: ${sentenceList(deliverables)}.`,
            topics,
            minutes: 180,
        }),
        practicalApplication: blueprint.capstone.brief,
        reviewSupport:
            "Build the smallest passing version first, test one rubric criterion at a time, and use the simulator or supplied synthetic assets when physical or expensive resources are unavailable.",
    };
};

const buildCourse = (source, blueprint) => {
    const courseBase = {
        id: source.id,
        order: source.order,
        title: source.title,
        slug: blueprint.slug,
        sourceTopics: [...source.topics],
    };
    const requirements = buildRequirements(blueprint);
    const setupModule = buildSetupModule(courseBase, blueprint, requirements);

    let topicOffset = 0;
    const coreModules = blueprint.coreModules.map((module, index) => {
        const topics = source.topics.slice(
            topicOffset,
            topicOffset + module.topicCount
        );
        topicOffset += module.topicCount;
        return buildCoreModule(courseBase, module, topics, index);
    });
    if (topicOffset !== source.topics.length) {
        throw new Error(
            `${source.id}: core module topicCounts add up to ${topicOffset}, but the source curriculum lists ${source.topics.length} topics.`
        );
    }

    const partialCourse = {
        ...courseBase,
        version: "1.0.0",
        status: "ready-for-review",
        summary: blueprint.summary,
        description: blueprint.description,
        intendedAudience: blueprint.audience,
        level: blueprint.level,
        prerequisites: blueprint.prerequisites,
        recommendedPriorCourses: blueprint.recommendedPriorCourses,
        learningOutcomes: blueprint.outcomes,
        estimatedTotalHours: blueprint.weeks * blueprint.weeklyHours,
        weeklyCommitmentHours: blueprint.weeklyHours,
        suggestedWeeks: blueprint.weeks,
        tags: blueprint.tags,
        visualTreatment: {
            icon: blueprint.icon,
            accent: blueprint.accent,
            alt: `${source.title} course symbol`,
        },
        requirements,
        simulators: blueprint.simulators.map((item) => ({
            ...item,
            noHardwareRequired: true,
            keyboardAccessible: true,
            screenReaderSummary: `${item.name} exposes every modeled control and result in text and can be completed with the keyboard.`,
        })),
        freeCompletionPromise: blueprint.freeCompletionPromise,
        liveSession: blueprint.liveSession
            ? {
                  ...blueprint.liveSession,
                  classTools: blueprint.liveSession.classTools.map(
                      (item) => ({ ...item })
                  ),
              }
            : null,
        sourceTopics: [...source.topics],
    };
    const capstoneModule = buildCapstoneModule(partialCourse, blueprint);
    const modules = [setupModule, ...coreModules, capstoneModule];

    const assignments = blueprint.assignments.map((item, index) => {
        const relatedModules = item.moduleOrders.map(
            (order) => coreModules[order - 1]
        );
        return {
            id: `${source.id}-assignment-${index + 1}-${slugify(item.title)}`,
            title: item.title,
            brief: item.brief,
            estimatedMinutes: 120,
            relatedModuleIds: relatedModules.map((module) => module.id),
            sourceTopics: relatedModules.flatMap(
                (module) => module.lessons[0].sourceTopics
            ),
            passingScore: 80,
            attempts: null,
            rubric: rubric(
                `${source.id}-assignment-${index + 1}-${slugify(item.title)}`
            ),
            freeCompletionPath: `${blueprint.freeCompletionPromise} Submit a project file, text trace, screenshots with descriptions, or equivalent simulator evidence.`,
        };
    });

    const finalAssessment = assessment({
        id: `${source.id}-final-assessment`,
        type: "capstone",
        title: blueprint.capstone.title,
        instructions: `${blueprint.capstone.brief} Deliverables: ${sentenceList(
            blueprint.capstone.deliverables
        )}.`,
        topics: source.topics,
        minutes: 240,
        passingScore: 80,
    });

    const sourceTopicCoverage = source.topics.map((topic) => {
        const module = coreModules.find((item) =>
            item.lessons[0].sourceTopics.includes(topic)
        );
        const lessonItem = module.lessons[0];
        return {
            courseId: source.id,
            sourceTopic: topic,
            moduleId: module.id,
            lessonId: lessonItem.id,
            activityId: lessonItem.interaction.id,
            stages: ["introduced", "practiced", "assessed", "applied"],
            completionStatus: "complete",
        };
    });

    return {
        ...partialCourse,
        modules,
        assignments,
        finalAssessment,
        pacing: [
            {
                id: `${source.id}-self-paced`,
                type: "self-paced",
                estimatedTotalHours: partialCourse.estimatedTotalHours,
                weeklyHours: blueprint.weeklyHours,
                suggestedWeeks: blueprint.weeks,
                releasePlan: modules.map(
                    (module) =>
                        `Complete ${module.title} after the prior required module.`
                ),
                catchUpGuidance:
                    "Resume with the latest incomplete lesson, use review support, and adjust the target date without losing access.",
                finalProjectWindow:
                    "Reserve the final 20% of the suggested schedule for the capstone and revision.",
            },
            blueprint.liveSession
                ? {
                      // One core module per live class, with setup before the
                      // first class and the capstone after the last.
                      id: `${source.id}-weekly`,
                      type: "weekly",
                      estimatedTotalHours: partialCourse.estimatedTotalHours,
                      weeklyHours: blueprint.weeklyHours,
                      suggestedWeeks: blueprint.weeks,
                      releasePlan: [
                          `Before week 1: ${setupModule.title}`,
                          ...coreModules.map(
                              (module, index) =>
                                  `Week ${index + 1} live class: ${
                                      module.title
                                  }`
                          ),
                          `After week ${blueprint.weeks}: ${capstoneModule.title}`,
                      ],
                      catchUpGuidance:
                          "Missed a class? Every week's lessons stay open here, so work through that module before the next class and bring questions to your instructor.",
                      finalProjectWindow:
                          "Plan the capstone during the last two weeks and present it after the final class.",
                  }
                : {
                      id: `${source.id}-weekly`,
                      type: "weekly",
                      estimatedTotalHours: partialCourse.estimatedTotalHours,
                      weeklyHours: blueprint.weeklyHours,
                      suggestedWeeks: blueprint.weeks,
                      releasePlan: modules.map(
                          (module, index) =>
                              `Week ${Math.min(index + 1, blueprint.weeks)}: ${
                                  module.title
                              }`
                      ),
                      catchUpGuidance:
                          "Previously released work remains available. Complete the setup and current prerequisite module before joining the newest release.",
                      finalProjectWindow:
                          "The last scheduled week prioritizes capstone testing, feedback, revision, and reflection.",
                  },
        ],
        certificateRules: {
            requiredLessonCompletionPercent: 100,
            requiredAssignmentsSubmitted: true,
            minimumQuizAverage: 80,
            capstonePassingScore: 80,
            manualReviewsMustBeApproved: true,
            safetyAcknowledgementRequired: (
                blueprint.extraRequirements || []
            ).some((item) => item.category === "hardware"),
            retryPolicy:
                "Checkpoints and automated work allow unlimited learning retries. Manually reviewed work may be revised until it meets the rubric.",
        },
        attribution: {
            creator: "Zafir Shamsi",
            displayText: "Course created by Zafir Shamsi.",
        },
        sourceTopicCoverage,
    };
};

const blueprintsById = new Map(
    courseBlueprints.map((course) => [course.id, course])
);

const courseRegistry = sourceCurriculum.map((source) => {
    const blueprint = blueprintsById.get(source.id);
    if (!blueprint) {
        throw new Error(`Missing course blueprint for ${source.id}`);
    }
    return buildCourse(source, blueprint);
});

const coursesBySlug = new Map(
    courseRegistry.map((course) => [course.slug, course])
);

const curriculumCoverage = {
    schemaVersion: "1.0",
    generatedFrom: "learning/source-curriculum.js",
    courseCount: courseRegistry.length,
    topicCount: courseRegistry.reduce(
        (total, course) => total + course.sourceTopics.length,
        0
    ),
    courses: courseRegistry.map((course) => ({
        courseId: course.id,
        courseSlug: course.slug,
        courseTitle: course.title,
        topics: course.sourceTopicCoverage,
    })),
};

module.exports = {
    courseRegistry,
    coursesBySlug,
    getCourseBySlug: (slug) => coursesBySlug.get(slug),
    curriculumCoverage,
};
