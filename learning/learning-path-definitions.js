/**
 * Ordered learning paths through the 25-course self-paced catalog. Live
 * classes (courses with a liveSession) are deliberately not part of any path.
 *
 * Kept as CommonJS (like source-curriculum.js and course-blueprints.js) so the
 * Node curriculum validator can enforce path invariants without a TypeScript
 * build step. learning/learning-paths.ts wraps this with typed helpers.
 *
 * Courses are referenced by stable course id so reordering or re-slugging a
 * course never silently drops it from a path. `core` courses define the path
 * outcome and count toward path completion; `foundation` courses are the
 * recommended on-ramps from the curriculum progression and never block a
 * learner who already has the skills.
 */
const learningPathDefinitions = [
    {
        id: "path-coding-foundations",
        slug: "coding-foundations",
        title: "Coding Foundations",
        summary:
            "Start from zero and finish able to design, write, and debug real programs.",
        outcome:
            "Design an algorithm, build a Scratch game, and ship a tested object-oriented Python application.",
        icon: "🧭",
        accent: "#7C5CFF",
        skills: [
            "Problem decomposition",
            "Sequences, loops, and conditions",
            "Event-driven programming",
            "Python fundamentals",
            "Collections and file storage",
            "Classes and software design",
            "Unit testing",
        ],
        steps: [
            { courseId: "course-01", role: "core" },
            { courseId: "course-02", role: "core" },
            { courseId: "course-03", role: "core" },
            { courseId: "course-04", role: "core" },
            { courseId: "course-05", role: "core" },
        ],
    },
    {
        id: "path-web-and-software",
        slug: "web-and-software-development",
        title: "Web and Software Development",
        summary:
            "Build accessible websites, add interactivity, collaborate with Git, and back it all with an API.",
        outcome:
            "Ship a responsive multi-page site, an interactive browser app, and a database-backed API you documented and tested.",
        icon: "🌐",
        accent: "#2FA8FF",
        skills: [
            "Semantic HTML and CSS layout",
            "Accessibility and responsive design",
            "DOM, events, and async JavaScript",
            "Version control and code review",
            "REST APIs and SQL",
            "Validation and error handling",
        ],
        steps: [
            { courseId: "course-06", role: "core" },
            { courseId: "course-07", role: "core" },
            { courseId: "course-08", role: "core" },
            { courseId: "course-11", role: "core" },
        ],
    },
    {
        id: "path-hardware-and-robotics",
        slug: "hardware-and-robotics",
        title: "Hardware and Robotics",
        summary:
            "Go from first LED to a connected, sensing, machine-learning device — every step has a browser simulator.",
        outcome:
            "Build (or fully simulate) a micro:bit network, a robot, an IoT monitor, and an on-device ML classifier.",
        icon: "🤖",
        accent: "#FF8A3D",
        skills: [
            "Electrical safety",
            "Inputs, outputs, and sensors",
            "Motor control and state machines",
            "Linux, GPIO, and MQTT",
            "Time-series data",
            "Model quantization and edge inference",
        ],
        steps: [
            { courseId: "course-09", role: "core" },
            { courseId: "course-10", role: "core" },
            { courseId: "course-17", role: "core" },
            { courseId: "course-18", role: "core" },
        ],
    },
    {
        id: "path-game-development",
        slug: "game-development",
        title: "Game Development",
        summary:
            "Build the programming foundation a game engine assumes, then design and publish a complete game.",
        outcome:
            "Publish a playable 2D or 3D game with physics, UI, audio, enemy logic, and saved progress.",
        icon: "🎮",
        accent: "#FF5C8A",
        skills: [
            "Computational thinking",
            "Programming fundamentals",
            "C# scripting",
            "Physics and collision",
            "Level and UI design",
            "Save systems and publishing",
        ],
        steps: [
            { courseId: "course-01", role: "foundation" },
            { courseId: "course-03", role: "foundation" },
            { courseId: "course-12", role: "core" },
        ],
    },
    {
        id: "path-data-and-ai",
        slug: "data-and-artificial-intelligence",
        title: "Data and Artificial Intelligence",
        summary:
            "Learn to read data honestly, then train, evaluate, and interrogate machine-learning models.",
        outcome:
            "Produce a reproducible analysis, a rigorous multi-model comparison, a vision model, and a grounded question-answering system.",
        icon: "🧠",
        accent: "#38D39F",
        skills: [
            "pandas and visualization",
            "Bias, fairness, and responsible use",
            "scikit-learn workflows",
            "Evaluation metrics and error analysis",
            "Neural networks and computer vision",
            "Embeddings, retrieval, and hallucination checks",
        ],
        steps: [
            { courseId: "course-13", role: "core" },
            { courseId: "course-14", role: "core" },
            { courseId: "course-15", role: "core" },
            { courseId: "course-16", role: "core" },
            { courseId: "course-19", role: "core" },
            { courseId: "course-20", role: "core" },
            { courseId: "course-21", role: "core" },
        ],
    },
    {
        id: "path-research-and-production-ai",
        slug: "research-and-production-ai",
        title: "Research and Production AI",
        summary:
            "Take models out of the notebook — into reproducible science and into monitored production systems.",
        outcome:
            "Reproduce a published result with documented uncertainty, then deploy and monitor an inference service locally.",
        icon: "🔬",
        accent: "#B487FF",
        skills: [
            "Experimental design and baselines",
            "Confidence intervals and ablations",
            "Reproducible notebooks",
            "Containers and deployment",
            "Drift detection and rollbacks",
            "Cost and incident analysis",
        ],
        steps: [
            { courseId: "course-22", role: "core" },
            { courseId: "course-23", role: "core" },
        ],
    },
    {
        id: "path-agentic-systems",
        slug: "agentic-systems",
        title: "Agentic Systems",
        summary:
            "Build tool-using AI agents that are auditable, permission-bounded, and evaluated against adversaries.",
        outcome:
            "Ship a sandboxed coding agent and a secure multi-agent system you attacked, measured, and improved.",
        icon: "🛠️",
        accent: "#FFC24B",
        skills: [
            "Git workflows and code review",
            "APIs and backend services",
            "Deployment and monitoring",
            "Tool schemas and MCP",
            "Permission boundaries and approvals",
            "Prompt-injection and reward-hacking defense",
            "Deterministic and model-based graders",
        ],
        steps: [
            { courseId: "course-08", role: "foundation" },
            { courseId: "course-11", role: "foundation" },
            { courseId: "course-23", role: "foundation" },
            { courseId: "course-24", role: "core" },
            { courseId: "course-25", role: "core" },
        ],
    },
];

module.exports = learningPathDefinitions;
