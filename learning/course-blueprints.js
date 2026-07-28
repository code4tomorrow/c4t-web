const moduleBlueprint = (
    title,
    topicCount,
    scenario,
    practice,
    application,
    interactionType
) => ({
    title,
    topicCount,
    scenario,
    practice,
    application,
    interactionType,
});

const tool = (
    name,
    category,
    description,
    setupSteps,
    verification,
    url,
    paidOptions = []
) => ({
    name,
    category,
    description,
    setupSteps,
    verification,
    url,
    paidOptions,
});

const simulator = (id, name, purpose, capabilities, limitations) => ({
    id,
    name,
    purpose,
    capabilities,
    limitations,
});

const assignment = (title, brief, moduleOrders) => ({
    title,
    brief,
    moduleOrders,
});

const capstone = (title, brief, deliverables) => ({
    title,
    brief,
    deliverables,
});

const blueprints = [
    {
        id: "course-01",
        slug: "computational-thinking-and-coding-logic",
        level: "absolute-beginner",
        weeks: 6,
        weeklyHours: 3,
        summary:
            "Learn to decompose problems, design precise algorithms, trace decisions, and debug logic without needing prior coding experience.",
        description:
            "A hands-on introduction to the reasoning patterns behind every programming language. Learners solve everyday and visual problems before expressing solutions as sequences, loops, decisions, searches, and testable algorithms.",
        audience:
            "First-time coders and learners who want a stronger problem-solving foundation before choosing a programming language.",
        prerequisites: ["None"],
        recommendedPriorCourses: [],
        outcomes: [
            "Turn an unclear problem into goals, inputs, constraints, and testable steps.",
            "Use sequence, repetition, state, and decisions to describe algorithms.",
            "Trace behavior and repair logical errors using evidence.",
            "Compare multiple valid solutions for clarity and efficiency.",
        ],
        tags: ["foundations", "algorithms", "logic", "debugging"],
        icon: "puzzle",
        accent: "#7892EE",
        primaryTool: tool(
            "C4T Algorithm Playground",
            "software",
            "A browser-based workspace for arranging steps, tracing mazes, building decision trees, and comparing algorithms.",
            [
                "Open the playground in a current browser.",
                "Turn on reduced motion or the text-only trace if animation is distracting.",
                "Run the welcome maze and reset it once.",
            ],
            "Complete the welcome maze and explain one state change.",
            "/learn/tools/algorithm-playground"
        ),
        simulators: [
            simulator(
                "algorithm-playground",
                "Algorithm Playground",
                "Make sequence, branching, loops, searching, and sorting visible without requiring code.",
                [
                    "Keyboard step ordering",
                    "Maze tracing",
                    "Decision-tree construction",
                    "Loop and sorting traces",
                ],
                [
                    "Uses small teaching examples rather than measuring production algorithm performance.",
                ]
            ),
        ],
        freeCompletionPromise:
            "The always-free pathway combines guided browser concept simulations with learner-created planning files. The simulator does not execute code or replace project software.",
        coreModules: [
            moduleBlueprint(
                "Frame and decompose a problem",
                4,
                "A community center needs a fair process for assigning shared computers when more learners arrive than expected.",
                "Separate the computer-allocation problem into goals, inputs, constraints, and reusable steps.",
                "Write an instruction set another learner can follow without asking what you meant.",
                "ordering"
            ),
            moduleBlueprint(
                "Build precise sequences and algorithms",
                5,
                "A delivery robot must move through a room using only literal instructions and observable state.",
                "Arrange, test, and revise plain-language steps with explicit inputs and outputs.",
                "Create an unambiguous state-based algorithm for the robot route.",
                "code-trace"
            ),
            moduleBlueprint(
                "Find patterns and control repetition",
                4,
                "A school is printing hundreds of name labels and the manual instructions repeat the same work.",
                "Replace copied steps with counting and condition-controlled loops.",
                "Model a repeated classroom process and justify the stopping rule.",
                "visualizer"
            ),
            moduleBlueprint(
                "Make decisions and handle edge cases",
                5,
                "A library kiosk must decide whether a book can be borrowed under several interacting rules.",
                "Build Boolean conditions and follow every branch of a decision tree.",
                "Design a borrowing decision tree that handles missing cards, limits, and exceptions.",
                "diagram"
            ),
            moduleBlueprint(
                "Predict, test, and debug logic",
                4,
                "An alarm routine behaves correctly most days but fails on weekends and holidays.",
                "Trace expected and actual state, isolate the first divergence, and repair the responsible rule.",
                "Produce a small test table that proves a corrected routine handles normal and edge cases.",
                "debugging"
            ),
            moduleBlueprint(
                "Compare algorithms in action",
                5,
                "Two teams propose different maze, sorting, searching, and puzzle strategies for the same challenge.",
                "Run both strategies on identical inputs and record steps, correctness, and trade-offs.",
                "Recommend an algorithm for a stated constraint and defend the choice with trace evidence.",
                "simulator"
            ),
        ],
        assignments: [
            assignment(
                "Everyday algorithm repair",
                "Audit a flawed everyday procedure, expose ambiguous steps and edge cases, then submit a tested revision.",
                [2, 4]
            ),
            assignment(
                "Strategy comparison lab",
                "Compare two maze, search, or sort strategies using the same inputs and an evidence table.",
                [5, 6]
            ),
        ],
        capstone: capstone(
            "Design and defend a complete algorithm",
            "Create and test an algorithm for a maze, puzzle, sorting task, or real-world process, then explain its inputs, outputs, sequence, decisions, repetition, edge cases, and results.",
            [
                "Plain-language algorithm",
                "Visual trace or decision diagram",
                "Normal and edge-case test results",
                "Comparison with one alternative",
                "Reflection on revisions",
            ]
        ),
    },
    {
        id: "course-02",
        slug: "creative-coding-with-scratch",
        level: "beginner",
        weeks: 8,
        weeklyHours: 3,
        summary:
            "Create animated stories and increasingly challenging games with Scratch events, variables, clones, collisions, and reusable blocks.",
        description:
            "Learners use Scratch as a visual programming studio, moving from coordinates and events to reusable game systems. Every concept is practiced in a remixable browser project and culminates in a documented multi-level game.",
        audience:
            "Young creators and visual learners who want to build games and stories without typing-heavy syntax.",
        prerequisites: ["Comfort following multi-step instructions"],
        recommendedPriorCourses: ["course-01"],
        outcomes: [
            "Navigate the Scratch stage and predict sprite movement with coordinates.",
            "Coordinate behavior with events, messages, variables, loops, and conditions.",
            "Build reusable systems with custom blocks and clones.",
            "Test and tune a multi-level interactive game.",
        ],
        tags: ["scratch", "games", "animation", "creative-coding"],
        icon: "sparkles",
        accent: "#F4A261",
        primaryTool: tool(
            "Scratch browser editor",
            "software",
            "The free Scratch editor runs in a browser and can save projects locally without an account.",
            [
                "Open the Scratch editor and choose your preferred interface language.",
                "Create a blank project and delete or keep the starter sprite.",
                "Use File > Save to your computer so work remains available without an account.",
            ],
            "Move a sprite ten steps, run the project, and save the project file locally.",
            "https://scratch.mit.edu/projects/editor/"
        ),
        simulators: [
            simulator(
                "scratch-stage-lab",
                "Scratch Stage Lab",
                "Practice coordinates, event order, collision, variables, and clones even when the external editor is unavailable.",
                [
                    "Coordinate prediction",
                    "Block ordering",
                    "Event trace",
                    "Collision and clone state",
                ],
                [
                    "Teaches the required behavior but does not reproduce every Scratch block or sharing feature.",
                ]
            ),
        ],
        freeCompletionPromise:
            "The verified Scratch browser editor supports learner-created project files, while the C4T page adds guided concept practice. No paid option is required.",
        coreModules: [
            moduleBlueprint(
                "Navigate the stage and place sprites",
                2,
                "A story scene needs characters to enter from precise places and change appearance at the right moment.",
                "Predict coordinates, choose costumes, and arrange stage layers for a short scene.",
                "Build a two-character entrance whose positions work at every stage boundary.",
                "visualizer"
            ),
            moduleBlueprint(
                "Coordinate events and messages",
                1,
                "Several sprites must react to a start button without depending on an unreliable fixed delay.",
                "Trace green-flag, click, key, and broadcast event order.",
                "Replace timing guesses with broadcasts that coordinate a scene.",
                "code-trace"
            ),
            moduleBlueprint(
                "Create rules, scores, and motion",
                2,
                "An arcade game needs movement, a score, and fair rules for what happens at the edge.",
                "Experiment with variables, conditions, loops, animation timing, sound, and effects.",
                "Implement a responsive scoring loop with clear player feedback.",
                "simulator"
            ),
            moduleBlueprint(
                "Detect collisions and player actions",
                1,
                "A player sprite passes through obstacles and sometimes disappears beyond the stage.",
                "Trace collision checks and repair boundary behavior.",
                "Create a collision system with visible feedback and a predictable reset.",
                "debugging"
            ),
            moduleBlueprint(
                "Reuse behavior and manage objects",
                1,
                "A game needs many moving targets, but copying scripts makes every change error-prone.",
                "Turn repeated behavior into custom blocks and reason about cloned object state.",
                "Build a managed wave of cloned objects using one reusable behavior.",
                "ordering"
            ),
            moduleBlueprint(
                "Design stories, levels, and adaptive challenge",
                2,
                "Playtesters enjoy the first minute of a game but lose interest because difficulty never changes.",
                "Storyboard states, trace quiz or arcade rules, and tune challenge from playtest evidence.",
                "Build a level transition that changes speed, rules, or support based on player progress.",
                "design-review"
            ),
        ],
        assignments: [
            assignment(
                "Animated interactive scene",
                "Create a coordinated scene with costumes, motion, sound, messages, and one meaningful player choice.",
                [2, 3]
            ),
            assignment(
                "Collision and clone challenge",
                "Build a small arcade loop with boundaries, scoring, reusable behavior, and cloned targets.",
                [4, 5]
            ),
        ],
        capstone: capstone(
            "Multi-level Scratch game",
            "Build a polished game with start and end states, instructions, progress, collisions, sound or animation, a custom block, a clone, and increasing or adaptive difficulty.",
            [
                "Playable Scratch project file",
                "At least two game states or levels",
                "Reusable custom block and cloned object",
                "Playtest notes and fixes",
                "Learner-written design explanation",
            ]
        ),
    },
    {
        id: "course-03",
        slug: "beginner-python",
        level: "beginner",
        weeks: 8,
        weeklyHours: 4,
        summary:
            "Write and debug Python programs with variables, input, decisions, loops, functions, validation, and clear output.",
        description:
            "A practical first programming course built around short learner-created programs. Learners predict behavior in the concept simulator, then use course instructions and a freely installable or open Python tool to create files, interpret errors, and combine core structures.",
        audience:
            "New programmers ready to move from visual logic or pseudocode into a typed programming language.",
        prerequisites: ["No Python experience required"],
        recommendedPriorCourses: ["course-01"],
        outcomes: [
            "Run Python safely and explain how values move through a program.",
            "Use data types, input, formatting, arithmetic, and comparisons.",
            "Control behavior with decisions and loops.",
            "Organize, validate, and debug a complete function-based application.",
        ],
        tags: ["python", "programming", "debugging", "text-apps"],
        icon: "terminal",
        accent: "#4B8BBE",
        primaryTool: tool(
            "C4T Python Lab",
            "software",
            "A guided Python concept simulator for predictions and traces; it does not execute Python, provide starter files, or run tests.",
            [
                "Open the Python Lab and run the hello program.",
                "Change the displayed name and run it again.",
                "Download the source file so you know how to keep a local backup.",
            ],
            "Run a program that prints your chosen greeting with no errors.",
            "/learn/tools/python-lab"
        ),
        simulators: [
            simulator(
                "python-execution-tracer",
                "Python Execution Tracer",
                "Show variables, branches, loops, calls, output, and errors one step at a time.",
                [
                    "Variable state table",
                    "Branch highlighting",
                    "Loop stepping",
                    "Function call frames",
                ],
                [
                    "Supports the beginner subset taught in this course rather than every Python package.",
                ]
            ),
        ],
        freeCompletionPromise:
            "The always-free pathway combines guided browser concept simulations with learner-created Python files made in a freely installable or open tool. The C4T page does not execute Python.",
        coreModules: [
            moduleBlueprint(
                "Run programs and track values",
                2,
                "A welcome kiosk must remember a visitor name and whether this is their first visit.",
                "Run short programs and update a variable-state table after each line.",
                "Create a clear welcome program using appropriately typed values.",
                "code-trace"
            ),
            moduleBlueprint(
                "Work with text, numbers, input, and output",
                2,
                "A club sign-up tool must collect readable answers and print a correctly formatted confirmation.",
                "Transform strings and numbers, collect input, and format a confirmation.",
                "Build an input-and-output flow that labels every response clearly.",
                "code-editor"
            ),
            moduleBlueprint(
                "Calculate and make decisions",
                2,
                "A ticket calculator must compute a total and apply the correct rule for each visitor.",
                "Combine arithmetic, comparisons, and if/elif/else branches, then test boundaries.",
                "Create a decision table and code that agrees for every listed case.",
                "prediction"
            ),
            moduleBlueprint(
                "Repeat work with loops",
                2,
                "A quiz should ask several questions and keep trying when an answer is invalid.",
                "Trace for and while loops, identify stopping conditions, and prevent infinite repetition.",
                "Implement a validated repeated prompt and a counted score loop.",
                "visualizer"
            ),
            moduleBlueprint(
                "Package behavior in functions",
                1,
                "A calculator repeats the same conversion logic in several places.",
                "Write focused functions with clear names, inputs, and returned results.",
                "Refactor repeated calculation into reusable functions and call them from a menu.",
                "code-editor"
            ),
            moduleBlueprint(
                "Read errors and assemble applications",
                1,
                "A text game crashes only after an unusual answer and the error message points into unfamiliar code.",
                "Interpret tracebacks, reproduce the failure, isolate the cause, and retest the repair.",
                "Combine input, validation, functions, decisions, and loops into a resilient mini-application.",
                "debugging"
            ),
        ],
        assignments: [
            assignment(
                "Calculator and quiz pair",
                "Build a validated calculator and a scored quiz, each organized around small functions and readable output.",
                [3, 5]
            ),
            assignment(
                "Loop-driven word game",
                "Create a word or number game with repeated turns, validation, a stopping condition, and useful error messages.",
                [4, 6]
            ),
        ],
        capstone: capstone(
            "Complete text-based Python application",
            "Build a calculator, quiz, game, or text adventure that uses input, output, variables, conditions, loops, functions, validation, and clear error handling.",
            [
                "Runnable Python source",
                "Documented user flow",
                "Normal and edge-case tests",
                "Helpful validation and errors",
                "Reflection on one debugging decision",
            ]
        ),
    },
    {
        id: "course-04",
        slug: "python-projects-and-problem-solving",
        level: "beginner-intermediate",
        weeks: 8,
        weeklyHours: 4,
        summary:
            "Build larger Python command-line projects using collections, files, JSON, reusable functions, validation, dependencies, and systematic debugging.",
        description:
            "Learners move beyond isolated syntax into project design. They model information with collections, transform text, persist data, organize dependencies, test repairs, and produce dependable command-line tools.",
        audience:
            "Python learners who can already write basic conditions, loops, and functions.",
        prerequisites: [
            "Variables, conditions, loops, and basic Python functions",
        ],
        recommendedPriorCourses: ["course-03"],
        outcomes: [
            "Choose and manipulate suitable Python collections.",
            "Design functions with useful parameters and return values.",
            "Read, validate, update, and safely persist text and JSON data.",
            "Plan, debug, and test a multi-feature command-line project.",
        ],
        tags: ["python", "projects", "json", "files", "testing"],
        icon: "toolbox",
        accent: "#3776AB",
        primaryTool: tool(
            "C4T Python Project Lab",
            "software",
            "A guided project-structure concept simulator. Learners create Python, JSON, and test files with a freely installable or open tool outside the page.",
            [
                "Open the project lab and inspect the provided files panel.",
                "Run the collection warm-up and open its generated JSON file.",
                "Download and reopen the project archive to verify backups.",
            ],
            "Run a script that writes and rereads a valid JSON record.",
            "/learn/tools/python-project-lab"
        ),
        simulators: [
            simulator(
                "python-data-workbench",
                "Python Data Workbench",
                "Visualize collections, file changes, JSON structure, nested iteration, and test outcomes.",
                [
                    "Collection inspector",
                    "File-structure reasoning",
                    "JSON tree",
                    "Nested-loop trace",
                    "Test-design prompt",
                ],
                [
                    "The virtual file system is resettable and is not a substitute for secure production storage.",
                ]
            ),
        ],
        freeCompletionPromise:
            "The always-free pathway combines guided concept simulations with learner-created Python, JSON, and test files made in freely installable or open tools. The C4T page does not execute them.",
        coreModules: [
            moduleBlueprint(
                "Model and transform information",
                2,
                "A study planner must store courses, unique tags, ordered tasks, and quick lookups.",
                "Compare collection behavior and perform targeted string transformations.",
                "Design the planner's in-memory data model and justify each collection choice.",
                "visualizer"
            ),
            moduleBlueprint(
                "Control nested logic and function boundaries",
                2,
                "A report generator processes groups of records but mixes calculation and printing in one deeply nested loop.",
                "Trace nested branches and separate work into parameterized functions with returned values.",
                "Refactor the report pipeline into testable stages.",
                "code-trace"
            ),
            moduleBlueprint(
                "Persist text and JSON safely",
                2,
                "An expense tracker loses every record when the program closes.",
                "Read, write, inspect, and recover file and JSON data without silently corrupting it.",
                "Add durable storage with an explicit schema and safe missing-file behavior.",
                "data-lab"
            ),
            moduleBlueprint(
                "Organize libraries and validate input",
                2,
                "A shared script works on one computer but fails elsewhere and accepts impossible menu choices.",
                "Separate standard-library imports, document dependencies, and validate input at system boundaries.",
                "Produce a repeatable setup note and a validation layer for a command-line tool.",
                "debugging"
            ),
            moduleBlueprint(
                "Debug with evidence",
                1,
                "An inventory update occasionally changes the wrong item, but adding print statements makes the output confusing.",
                "Reproduce defects with minimal cases, form a hypothesis, and use focused checks or tests.",
                "Introduce or identify a defect in learner-created code and submit the failing and passing evidence.",
                "debugging"
            ),
            moduleBlueprint(
                "Design complete command-line projects",
                1,
                "A useful idea has grown into a collection of disconnected functions without a clear user flow.",
                "Turn requirements into commands, data operations, errors, and testable acceptance criteria.",
                "Create the architecture and one vertical feature slice for a complete CLI project.",
                "design-review"
            ),
        ],
        assignments: [
            assignment(
                "Persistent flash-card system",
                "Build guided add, list, quiz, search, and JSON persistence features with validation and tests.",
                [3, 4]
            ),
            assignment(
                "Expense and inventory mini-versions",
                "Implement focused versions of an expense tracker and inventory updater to compare data models and error handling.",
                [5, 6]
            ),
        ],
        capstone: capstone(
            "Persistent Python productivity tool",
            "Complete a flash-card system, expense tracker, or inventory application with JSON storage, multiple functions, validation, collections, search or updates, errors, and tests.",
            [
                "Runnable multi-feature project",
                "Persistent file or JSON schema",
                "Search, filter, or update workflow",
                "Automated tests for important logic",
                "Setup and usage documentation",
            ]
        ),
    },
    {
        id: "course-05",
        slug: "object-oriented-python-and-software-design",
        level: "intermediate",
        weeks: 10,
        weeklyHours: 5,
        summary:
            "Design maintainable Python software with classes, composition, interfaces, type hints, custom errors, modules, tests, and deliberate refactoring.",
        description:
            "This course uses evolving applications to connect object-oriented syntax with design decisions. Learners visualize state, compare composition and inheritance, define stable interfaces, test behavior, and document a larger refactor.",
        audience:
            "Python programmers ready to organize growing applications into maintainable components.",
        prerequisites: [
            "Collections, files, functions, validation, and Python project structure",
        ],
        recommendedPriorCourses: ["course-04"],
        outcomes: [
            "Model responsibilities with classes, objects, state, and constructors.",
            "Choose composition or inheritance using explicit trade-offs.",
            "Define typed interfaces and domain-specific exceptions.",
            "Refactor a multi-module application with unit-test protection.",
        ],
        tags: ["python", "oop", "software-design", "testing", "refactoring"],
        icon: "blocks",
        accent: "#6C63FF",
        primaryTool: tool(
            "C4T Python Design Studio",
            "software",
            "A guided object-design concept simulator; learner-created Python and test files are made with freely installable or open tools outside the page.",
            [
                "Open the studio and instantiate the provided Counter class.",
                "Step through one method call in the object-state view.",
                "Run the starter unit test and download the project.",
            ],
            "Explain how one method call changes object state and passes its test.",
            "/learn/tools/python-design-studio"
        ),
        simulators: [
            simulator(
                "object-design-lab",
                "Object Design Lab",
                "Connect class diagrams, live object state, calls, exceptions, and tests.",
                [
                    "Object-state visualizer",
                    "Class relationship diagram",
                    "Exception-flow trace",
                    "Test result explorer",
                ],
                [
                    "Diagrams intentionally show only relationships relevant to the current exercise.",
                ]
            ),
        ],
        freeCompletionPromise:
            "The always-free pathway combines guided design simulations with learner-created Python and test files made in freely installable or open tools. The C4T page does not run an IDE or tests.",
        coreModules: [
            moduleBlueprint(
                "Model objects and evolving state",
                2,
                "A library application needs to distinguish book records from individual borrowable copies.",
                "Identify responsibilities, create instances, and trace attributes and methods over time.",
                "Model books and copies without duplicating or confusing their state.",
                "visualizer"
            ),
            moduleBlueprint(
                "Construct objects and choose relationships",
                2,
                "A delivery application must reuse vehicle behavior while supporting bicycles, vans, and route planners.",
                "Write constructors and compare inheritance with composition against change scenarios.",
                "Choose and diagram a relationship model that avoids fragile coupling.",
                "diagram"
            ),
            moduleBlueprint(
                "Protect interfaces and express intent",
                2,
                "A bank-account class lets callers change balances directly and accepts values with unclear types.",
                "Design a small public interface, protect invariants, and repair inaccurate type hints.",
                "Create a typed account interface that makes invalid operations difficult.",
                "design-review"
            ),
            moduleBlueprint(
                "Handle failures and organize modules",
                2,
                "A booking application mixes validation, storage, and user messages while catching every error the same way.",
                "Trace exceptions, define domain errors, and move responsibilities into coherent modules.",
                "Build an error boundary between domain behavior and the command-line interface.",
                "code-trace"
            ),
            moduleBlueprint(
                "Build reusable components and tests",
                2,
                "Several projects need the same date-range and identifier logic, but copying it causes inconsistent fixes.",
                "Extract a focused component and write unit tests for behavior and edge cases.",
                "Publish a small reusable module with a documented interface and test suite.",
                "code-editor"
            ),
            moduleBlueprint(
                "Refactor a larger application",
                2,
                "A working application has long functions, duplicated state rules, and changes that repeatedly break old features.",
                "Use characterization tests, responsibility maps, and small refactoring steps.",
                "Produce a before-and-after design comparison backed by passing tests.",
                "debugging"
            ),
        ],
        assignments: [
            assignment(
                "Class design and relationship review",
                "Model a small domain, submit a class diagram, and justify composition or inheritance for each relationship.",
                [2, 3]
            ),
            assignment(
                "Test-protected modular refactor",
                "Split a learner-created Python program into typed modules, add custom errors, and protect behavior with unit tests.",
                [4, 6]
            ),
        ],
        capstone: capstone(
            "Object-oriented Python application",
            "Build or refactor a substantial application using multiple classes, clear responsibilities, justified relationships, type hints, custom exceptions, modules, reusable components, tests, and a design document.",
            [
                "Multi-module Python application",
                "Class and responsibility diagram",
                "Typed public interfaces",
                "Custom exception strategy",
                "Passing unit tests and design rationale",
            ]
        ),
    },
    {
        id: "course-06",
        slug: "web-development-with-html-and-css",
        level: "beginner",
        weeks: 8,
        weeklyHours: 4,
        summary:
            "Build semantic, accessible, responsive multi-page websites with HTML, CSS, Flexbox, Grid, forms, and strong visual hierarchy.",
        description:
            "Learners use guided layout and accessibility simulations, then create HTML and CSS project files with a freely installable or open editor outside the page. Each module connects document meaning, layout mechanics, responsive decisions, typography, and accessibility.",
        audience:
            "Beginners who want to create websites and understand how browsers turn files into usable pages.",
        prerequisites: ["No web-development experience required"],
        recommendedPriorCourses: ["course-01"],
        outcomes: [
            "Explain the browser request-and-render process at a practical level.",
            "Author meaningful HTML structures, links, media, tables, and forms.",
            "Control layout with the cascade, box model, Flexbox, and Grid.",
            "Deliver an accessible responsive website with reusable styles.",
        ],
        tags: ["html", "css", "web", "accessibility", "responsive-design"],
        icon: "browser",
        accent: "#E34F26",
        primaryTool: tool(
            "C4T Web Lab",
            "software",
            "A browser HTML/CSS editor with separate files, a sandboxed preview, DOM outline, responsive controls, and accessibility checks.",
            [
                "Open the web lab and inspect index.html and styles.css.",
                "Change the main heading and background color.",
                "Run the keyboard and heading-order checks, then download the files.",
            ],
            "Preview a changed page at phone and desktop widths with a logical heading outline.",
            "/learn/tools/web-lab"
        ),
        simulators: [
            simulator(
                "responsive-layout-lab",
                "Responsive Layout Lab",
                "Inspect DOM structure, boxes, Flexbox, Grid, width changes, and accessibility issues.",
                [
                    "DOM tree",
                    "Box-model inspector",
                    "Flexbox and Grid controls",
                    "Responsive viewport",
                    "Accessibility repair mode",
                ],
                [
                    "Preview approximates common browsers but final projects should still be checked in more than one browser when available.",
                ]
            ),
        ],
        freeCompletionPromise:
            "The always-free pathway combines responsive-layout concept simulations with learner-created HTML and CSS files made in a freely installable or open editor. A domain and paid host are optional.",
        coreModules: [
            moduleBlueprint(
                "Understand browsers and structure documents",
                2,
                "A browser receives a page whose content appears but has no meaningful structure for navigation tools.",
                "Trace a simplified browser request and assemble a valid document skeleton.",
                "Create a structured page whose title, language, head, and body have clear purposes.",
                "diagram"
            ),
            moduleBlueprint(
                "Write semantic content and forms",
                2,
                "A community event page must present navigation, media, schedules, and registration fields accessibly.",
                "Choose semantic elements and label links, images, tables, and form controls.",
                "Build an event article and form that remain understandable without CSS.",
                "code-editor"
            ),
            moduleBlueprint(
                "Control selectors, cascade, and boxes",
                2,
                "A card looks different on each page because overlapping rules and spacing assumptions conflict.",
                "Predict selector results and inspect content, padding, border, and margin.",
                "Repair the card with a small reusable rule set and explain the winning declarations.",
                "visualizer"
            ),
            moduleBlueprint(
                "Arrange layouts with Flexbox and Grid",
                2,
                "A dashboard needs one-dimensional toolbars and a two-dimensional card area.",
                "Manipulate alignment, wrapping, tracks, gaps, and placement in layout playgrounds.",
                "Choose Flexbox and Grid where each best expresses the intended relationship.",
                "simulator"
            ),
            moduleBlueprint(
                "Adapt layouts and remove barriers",
                2,
                "A portfolio works with a mouse on a laptop but becomes unreadable and unreachable on a phone or keyboard.",
                "Test widths, zoom, focus order, contrast, alternatives, and interaction targets.",
                "Repair a page so content and actions work by keyboard at phone, tablet, and desktop widths.",
                "design-review"
            ),
            moduleBlueprint(
                "Shape hierarchy and connect pages",
                2,
                "Several individually styled pages feel unrelated and make visitors lose their place.",
                "Compare type scales, spacing, reusable navigation, and shared styles.",
                "Assemble a consistent multi-page site with clear location and hierarchy.",
                "design-review"
            ),
        ],
        assignments: [
            assignment(
                "Semantic article and accessible form",
                "Create an article page and registration form with meaningful structure, labels, validation guidance, and keyboard flow.",
                [2, 5]
            ),
            assignment(
                "Responsive card landing page",
                "Build a multi-section landing page using the box model, Flexbox, Grid, responsive rules, and deliberate typography.",
                [3, 6]
            ),
        ],
        capstone: capstone(
            "Responsive multi-page website",
            "Build a coherent website with semantic structure, accessible navigation, responsive layout, forms, images, reusable styles, keyboard support, and phone, tablet, and desktop behavior.",
            [
                "Multiple linked HTML pages",
                "Shared responsive stylesheet",
                "Accessible form and navigation",
                "Viewport and keyboard test record",
                "Design and content rationale",
            ]
        ),
    },
    {
        id: "course-07",
        slug: "interactive-web-development-with-javascript",
        level: "beginner-intermediate",
        weeks: 10,
        weeklyHours: 4,
        summary:
            "Turn static pages into reliable browser applications with JavaScript, DOM updates, events, validation, storage, APIs, async work, and explicit state.",
        description:
            "Learners use guided execution and event-flow concept simulations, then create JavaScript project files with freely installable or open tools outside the page. Projects combine state, asynchronous design, responsive interfaces, and robust errors.",
        audience:
            "HTML/CSS learners and beginning programmers ready to build complete client-side applications.",
        prerequisites: [
            "Semantic HTML, basic CSS, variables, conditions, loops, and functions",
        ],
        recommendedPriorCourses: ["course-03", "course-06"],
        outcomes: [
            "Represent browser application data with functions, arrays, and objects.",
            "Update the DOM safely in response to events and validated input.",
            "Persist local state and handle timers and asynchronous operations.",
            "Build a responsive application with loading, empty, success, and error states.",
        ],
        tags: ["javascript", "dom", "apis", "browser-apps"],
        icon: "bolt",
        accent: "#F7DF1E",
        primaryTool: tool(
            "C4T JavaScript Web Lab",
            "software",
            "A guided browser-behavior concept simulator. It does not execute HTML, CSS, or JavaScript, call APIs, persist application storage, or run tests.",
            [
                "Open the lab and run the starter button example.",
                "Inspect the console and event timeline after one click.",
                "Reset, restore, and download the starter project.",
            ],
            "Make a button update visible text and pass the provided interaction test.",
            "/learn/tools/javascript-lab"
        ),
        simulators: [
            simulator(
                "browser-state-lab",
                "Browser State Lab",
                "Visualize JavaScript execution, DOM changes, events, local storage, and asynchronous timelines.",
                [
                    "Execution trace",
                    "DOM sandbox",
                    "Event flow",
                    "Storage inspector",
                    "Mock API timeline",
                ],
                [
                    "Mock API data is deterministic and does not represent live third-party availability.",
                ]
            ),
        ],
        freeCompletionPromise:
            "The always-free pathway combines guided browser-behavior simulations with learner-created JavaScript files made in freely installable or open tools. The C4T page does not execute code, store app data, or call APIs.",
        coreModules: [
            moduleBlueprint(
                "Model behavior with JavaScript",
                2,
                "A reading list must calculate progress and summarize items stored in different categories.",
                "Trace variables, function calls, arrays, and objects through small transformations.",
                "Create a data model and summary function for the reading list.",
                "code-trace"
            ),
            moduleBlueprint(
                "Control flow and update the DOM",
                2,
                "A filter panel has correct data but never updates the visible result cards.",
                "Connect loops and decisions to DOM selection, creation, and text or attribute changes.",
                "Render filtered data without replacing unrelated page content.",
                "code-editor"
            ),
            moduleBlueprint(
                "Respond to events and validate forms",
                2,
                "A sign-up form submits incomplete data and gives keyboard users no useful feedback.",
                "Trace event propagation, prevent invalid submission, and associate messages with fields.",
                "Build an accessible validated form with clear success and repair states.",
                "debugging"
            ),
            moduleBlueprint(
                "Manage time and local persistence",
                2,
                "A habit timer loses progress on refresh and creates overlapping intervals after repeated starts.",
                "Control timer lifecycle and inspect serialized browser storage.",
                "Create a resumable timer or tracker with reset and corrupted-data recovery.",
                "simulator"
            ),
            moduleBlueprint(
                "Fetch data and reason about async work",
                2,
                "A dashboard displays stale information because several requests finish in an unexpected order.",
                "Build requests, follow promise and async/await timelines, and distinguish loading from failure.",
                "Render learner-created static sample data with explicit loading, empty, success, and error states.",
                "visualizer"
            ),
            moduleBlueprint(
                "Coordinate application state and errors",
                2,
                "A browser game duplicates state across the DOM and JavaScript, causing the score to disagree after restart.",
                "Choose one source of truth, define transitions, and handle invalid or unavailable data.",
                "Implement a complete state-driven feature and prove its recovery behavior.",
                "design-review"
            ),
        ],
        assignments: [
            assignment(
                "Validated quiz application",
                "Build a keyboard-friendly quiz with data-driven questions, scoring, feedback, and a restartable state.",
                [2, 3]
            ),
            assignment(
                "Persistent async dashboard",
                "Create a dashboard or habit tracker with local storage, learner-created static sample data, and complete loading and error states.",
                [4, 5]
            ),
        ],
        capstone: capstone(
            "Complete interactive browser application",
            "Build a quiz, dashboard, game, or habit tracker using DOM updates, events, arrays or objects, validation, persistent local state, an asynchronous operation, robust states, and responsive design.",
            [
                "Learner-created web application and test evidence",
                "Persistent state and reset behavior",
                "Async loading and failure handling",
                "Visible and hidden test results",
                "Accessibility and responsive test notes",
            ]
        ),
    },
    {
        id: "course-08",
        slug: "git-github-and-collaborative-development",
        level: "beginner-intermediate",
        weeks: 7,
        weeklyHours: 3,
        summary:
            "Practice version history, branches, pull requests, review, conflicts, documentation, licenses, releases, and CI through guided concepts and learner-created local project files.",
        description:
            "A collaboration course that treats Git concepts as observable state changes. Learners use a visual local repository simulator before optionally repeating workflows on GitHub, so account access never blocks completion.",
        audience:
            "Learners with a small coding project who want a safe, structured introduction to collaborative development.",
        prerequisites: ["A small text or code project to version"],
        recommendedPriorCourses: ["course-03", "course-06"],
        outcomes: [
            "Create understandable commits and navigate repository history.",
            "Use branches, merges, pull requests, issues, and review feedback.",
            "Resolve conflicts without discarding another contributor's work.",
            "Document, license, release, and automatically check a shared project.",
        ],
        tags: ["git", "github", "collaboration", "ci", "open-source"],
        icon: "git-branch",
        accent: "#A78BFA",
        primaryTool: tool(
            "C4T Git Collaboration Simulator",
            "software",
            "A guided branch-and-merge concept simulator. It does not create a repository, commits, issues, pull requests, reviews, or CI runs.",
            [
                "Open the concept simulator and review its modeled branch values.",
                "Predict the merge result, change the overlap level, and inspect the explanation.",
                "Create separate commit, review, and automated-check design files with a freely installable or open tool.",
            ],
            "Merge a passing simulated pull request and identify both parent histories.",
            "/learn/tools/git-simulator"
        ),
        simulators: [
            simulator(
                "git-collaboration-simulator",
                "Git Collaboration Simulator",
                "Provide a safe local equivalent for history, branches, reviews, conflicts, issues, releases, and CI.",
                [
                    "Commit graph",
                    "Branch and merge operations",
                    "Pull-request review",
                    "Conflict editor",
                    "CI workflow runner",
                ],
                [
                    "Does not publish work publicly or reproduce every hosting-provider feature.",
                ]
            ),
        ],
        freeCompletionPromise:
            "The always-free pathway combines branch-and-merge concept simulations with learner-created patch, review, and documentation files. A hosted repository account is optional and is not listed as a paid option.",
        coreModules: [
            moduleBlueprint(
                "Create useful version history",
                2,
                "A team receives a project folder named final-final-2 and cannot tell what changed or why.",
                "Build a commit sequence and critique messages for scope, intent, and reversibility.",
                "Turn a sequence of file changes into a readable repository history.",
                "visualizer"
            ),
            moduleBlueprint(
                "Develop with branches and pull requests",
                2,
                "Two features must progress without putting unfinished work on the shared main branch.",
                "Create branches, compare diffs, open a pull request, and trace the merge result.",
                "Deliver one scoped feature through a reviewable branch workflow.",
                "simulator"
            ),
            moduleBlueprint(
                "Plan and review shared work",
                2,
                "A vague task and a rushed approval lead to a change that solves the wrong problem.",
                "Improve issues, organize a project board, and leave specific evidence-based review comments.",
                "Move a task from issue definition through revision and approval.",
                "design-review"
            ),
            moduleBlueprint(
                "Resolve conflicts and document decisions",
                2,
                "Two contributors edit the same configuration and an automatic merge cannot preserve both intentions.",
                "Interpret conflict markers, combine intent, test the result, and update clear README guidance.",
                "Resolve a simulated conflict without losing either required behavior.",
                "debugging"
            ),
            moduleBlueprint(
                "Choose licenses and prepare releases",
                1,
                "A project is public but potential users do not know what reuse is permitted or what changed between versions.",
                "Compare license scenarios and write a tagged release with a focused changelog.",
                "Package a small project release with explicit permissions and user-facing changes.",
                "scenario"
            ),
            moduleBlueprint(
                "Automate checks and contribute safely",
                2,
                "A shared project repeatedly merges formatting and test failures that could have been caught earlier.",
                "Read a workflow, diagnose a failed check, and follow contribution rules end to end.",
                "Complete a safe contribution that passes automated checks and responds to review.",
                "debugging"
            ),
        ],
        assignments: [
            assignment(
                "Reviewable branch workflow",
                "Create an issue, branch, commits, pull request, and evidence-based review response in the simulator.",
                [2, 3]
            ),
            assignment(
                "Conflict, docs, and release repair",
                "Resolve a conflict, improve documentation, select a license, and prepare a tagged changelog.",
                [4, 5]
            ),
        ],
        capstone: capstone(
            "Safe open-source contribution workflow",
            "Use a learner-created local practice repository and accompanying review files to rehearse an issue, branch, commits, pull request, review response, conflict resolution, documentation update, and automated-check design.",
            [
                "Learner-created local repository and review evidence",
                "Readable commit history",
                "Resolved review and conflict evidence",
                "Updated README and license rationale",
                "Passing automated workflow",
            ]
        ),
    },
    {
        id: "course-09",
        slug: "hardware-lab-microbit-inventions",
        level: "beginner",
        weeks: 8,
        weeklyHours: 3,
        summary:
            "Invent with virtual or physical micro:bits using inputs, LEDs, motion, sound, radio, sensor data, MakeCode, and MicroPython.",
        description:
            "A safety-first hardware course with equal physical and simulated paths. Learners test event-driven programs against a virtual device, then may transfer the same logic to optional hardware without changing the completion requirements.",
        audience:
            "Beginning makers who want to connect code with sensing, displays, sound, and communication.",
        prerequisites: ["Basic sequences, loops, and conditions"],
        recommendedPriorCourses: ["course-01", "course-03"],
        outcomes: [
            "Follow safe setup and verify virtual or physical inputs and outputs.",
            "Program displays, buttons, touch, motion, compass, and sound.",
            "Exchange radio messages and collect interpretable sensor data.",
            "Test and document a connected invention in simulation or hardware.",
        ],
        tags: ["hardware", "microbit", "makecode", "micropython", "simulation"],
        icon: "microchip",
        accent: "#00A4EF",
        primaryTool: tool(
            "C4T Virtual micro:bit Lab",
            "software",
            "A browser simulator for the LED grid, buttons, touch, motion, compass, sound, radio, and sensor data.",
            [
                "Open the virtual board and read the labeled safety and control guide.",
                "Run the LED smile program and activate button A with mouse or keyboard.",
                "Download the program and simulator state as a backup.",
            ],
            "Display an icon and trigger a second output from a virtual button.",
            "/learn/tools/microbit-lab"
        ),
        extraRequirements: [
            tool(
                "Physical micro:bit kit",
                "hardware",
                "Optional equipment for transferring learner-created programs to a real board; guided concept simulations and project-file alternatives are available when hardware is unavailable.",
                [
                    "Use only an undamaged board and approved USB or battery power.",
                    "Disconnect power before changing external connections.",
                    "Keep liquids and conductive loose objects away from the board.",
                ],
                "Complete the safety checklist before any optional physical test.",
                undefined,
                [
                    {
                        name: "micro:bit board and accessories",
                        description:
                            "Optional physical experience; never required for course completion.",
                    },
                ]
            ),
        ],
        simulators: [
            simulator(
                "microbit-lab",
                "Virtual micro:bit Lab",
                "Explore micro:bit event and state concepts without claiming to run a micro:bit program or device network.",
                [
                    "5x5 LED designer",
                    "Buttons and touch",
                    "Accelerometer and compass controls",
                    "Sound output",
                    "Multi-device radio messages",
                    "Sensor charts",
                ],
                [
                    "Simulated readings are controlled teaching data and do not capture physical noise or calibration differences.",
                ]
            ),
        ],
        freeCompletionPromise:
            "The always-free pathway combines guided micro:bit event simulations with learner-created program and design files made in freely installable or open tools. Physical hardware is optional.",
        coreModules: [
            moduleBlueprint(
                "Work safely with inputs and outputs",
                2,
                "A wearable badge must react to a visitor while staying safe and predictable during setup.",
                "Complete the safety check and map physical or virtual controls to observable outputs.",
                "Create and test an input-to-output specification before writing the full program.",
                "simulator"
            ),
            moduleBlueprint(
                "Design displays and button interactions",
                2,
                "A pocket reaction game needs readable LED states and fair button timing.",
                "Draw LED frames, trace button events, and test touch behavior with a keyboard alternative.",
                "Build the display and input loop for a reaction game.",
                "visualizer"
            ),
            moduleBlueprint(
                "Sense motion, direction, and sound",
                2,
                "A step counter and navigation aid must interpret noisy movement and direction while giving useful feedback.",
                "Explore accelerometer and compass values and pair thresholds with sound or display cues.",
                "Calibrate a simulated motion interaction and explain false triggers.",
                "simulator"
            ),
            moduleBlueprint(
                "Communicate and compare coding modes",
                2,
                "Two badges must exchange short messages even though their programs are written in different editor styles.",
                "Send radio messages and compare equivalent MakeCode and MicroPython event logic.",
                "Implement a reliable sender and receiver with a shared message format.",
                "code-trace"
            ),
            moduleBlueprint(
                "Build event-driven device behavior",
                1,
                "A device misses inputs because its code waits in a long sequence instead of responding to events.",
                "Trace competing events and redesign blocking behavior as short handlers.",
                "Create a state diagram for a responsive device and implement its transitions.",
                "diagram"
            ),
            moduleBlueprint(
                "Collect data and connect inventions",
                2,
                "Several simulated devices must measure conditions, exchange readings, and reveal a useful pattern.",
                "Record timestamped sensor values, chart them, and validate radio packets.",
                "Build a connected logger or messenger with visible delivery and data evidence.",
                "data-lab"
            ),
        ],
        assignments: [
            assignment(
                "Reaction game and step counter",
                "Build and test two focused inventions using LEDs, events, motion, scoring, and calibration.",
                [2, 3]
            ),
            assignment(
                "Radio messenger and sensor logger",
                "Create paired-device messaging and a charted sensor log with validation and failure feedback.",
                [4, 6]
            ),
        ],
        capstone: capstone(
            "Connected micro:bit invention network",
            "Create a physical or fully simulated network with inputs, outputs, events, data, radio messaging, testing, safety notes, and design documentation.",
            [
                "Two or more communicating virtual or physical devices",
                "Input, output, and state specification",
                "Recorded sensor or message data",
                "Safety and test checklist",
                "Design explanation and iteration notes",
            ]
        ),
    },
    {
        id: "course-10",
        slug: "hardware-lab-electronics-and-robotics",
        level: "beginner-intermediate",
        weeks: 10,
        weeklyHours: 4,
        summary:
            "Design and debug safe simulated or physical circuits, sensors, motors, state machines, feedback systems, and mobile robots.",
        description:
            "Learners explore electricity and robotics through simplified circuit and control concept models, then create their own diagrams, logic, and test files. Optional components extend the experience; the browser page is not a breadboard, robot world, or physical safety validator.",
        audience:
            "Makers with basic programming logic who want to understand circuits, sensing, motors, and robot behavior.",
        prerequisites: ["Conditions, loops, and event-driven logic"],
        recommendedPriorCourses: ["course-09"],
        outcomes: [
            "Apply electrical safety and reason about voltage, current, and resistance.",
            "Lay out and diagnose breadboard input and output circuits.",
            "Control sensors and motors with state-based logic.",
            "Test and improve a simulated or physical mobile robot.",
        ],
        tags: ["hardware", "electronics", "robotics", "circuits", "simulation"],
        icon: "robot",
        accent: "#EF476F",
        primaryTool: tool(
            "C4T Circuit and Robot Lab",
            "software",
            "A keyboard-accessible concept simulator for modeled LED current and robot-control decisions. It does not reproduce a breadboard, component tester, motor controller, or robot.",
            [
                "Open the circuit lab and complete its power-off wiring tutorial.",
                "Connect the virtual resistor and LED using the guided net list.",
                "Power the simulation and use the fault panel to confirm safe current.",
            ],
            "Produce a safely powered LED circuit and identify the current-limiting component.",
            "/learn/tools/robotics-lab"
        ),
        extraRequirements: [
            tool(
                "Electronics and robot parts",
                "hardware",
                "Optional breadboard, low-voltage components, sensors, motors, and controller for physical experiments.",
                [
                    "Use only low-voltage educational components with adult or instructor supervision where appropriate.",
                    "Disconnect power before rewiring and never short a battery or power rail.",
                    "Secure moving parts and keep fingers, hair, and loose clothing away from motors.",
                ],
                "Pass the circuit and motion safety acknowledgement before optional hardware work.",
                undefined,
                [
                    {
                        name: "Educational electronics kit",
                        description:
                            "Optional tactile practice; the virtual lab covers all assessed outcomes.",
                    },
                ]
            ),
        ],
        simulators: [
            simulator(
                "robotics-circuit-lab",
                "Circuit and Robot Lab",
                "Provide no-hardware circuit construction, sensor experiments, motors, feedback, and robot testing.",
                [
                    "Breadboard net-list view",
                    "Component identification",
                    "Voltage and resistance checks",
                    "Sensor-value controls",
                    "Motor and state-machine simulator",
                    "Obstacle and line-following arenas",
                ],
                [
                    "Does not model heat, component tolerances, battery discharge, or mechanical friction with laboratory precision.",
                ]
            ),
        ],
        freeCompletionPromise:
            "The always-free pathway combines modeled circuit and robot-control scenarios with learner-created design and logic files. Physical components are optional, and the simulator is not a wiring or safety authority.",
        coreModules: [
            moduleBlueprint(
                "Reason safely about electricity",
                2,
                "A prototype LED overheats because a team connected it directly across a supply without checking limits.",
                "Apply the power-off checklist and compare voltage, current, and resistance in safe virtual circuits.",
                "Choose a safe circuit arrangement and explain what each quantity predicts.",
                "simulator"
            ),
            moduleBlueprint(
                "Lay out breadboards and basic components",
                2,
                "A breadboard diagram looks connected, but hidden rail and row relationships leave the circuit open.",
                "Trace nets and place LEDs, buttons, buzzers, and potentiometers with correct polarity.",
                "Design a controllable alert circuit and diagnose a fault in a learner-created circuit diagram.",
                "diagram"
            ),
            moduleBlueprint(
                "Interpret signals and sensor readings",
                2,
                "A greenhouse controller must distinguish a digital switch from changing light, moisture, and temperature readings.",
                "Sample analog and digital signals, calibrate sensor ranges, and identify unreliable thresholds.",
                "Design a multi-sensor decision table with safe default behavior.",
                "data-lab"
            ),
            moduleBlueprint(
                "Drive motors safely",
                2,
                "A controller pin cannot safely power a motor and the robot needs direction as well as speed.",
                "Trace servo and DC motor commands through a motor driver and test stop behavior.",
                "Implement forward, reverse, turn, and emergency-stop commands in simulation.",
                "simulator"
            ),
            moduleBlueprint(
                "Model state and feedback",
                2,
                "A robot oscillates between turning left and right because each sensor reading triggers an immediate unrelated reaction.",
                "Build a state machine and visualize how feedback changes control output over time.",
                "Create stable search, follow, avoid, and stop states with transition evidence.",
                "visualizer"
            ),
            moduleBlueprint(
                "Test and iterate robot behavior",
                1,
                "A robot succeeds on one trial but fails when lighting, distance, or starting position changes.",
                "Write a varied test plan, capture failures, and change one design variable at a time.",
                "Improve simulated obstacle or line following and document the evidence behind each revision.",
                "debugging"
            ),
        ],
        assignments: [
            assignment(
                "Sensor and motor subsystem",
                "Design a safe circuit that reads a simulated sensor and controls motor or servo behavior through a driver.",
                [3, 4]
            ),
            assignment(
                "State-machine fault lab",
                "Repair unstable robot logic, add safe transitions, and demonstrate behavior under varied sensor inputs.",
                [5, 6]
            ),
        ],
        capstone: capstone(
            "Obstacle-avoiding or line-following robot",
            "Build or simulate a robot with circuit design, sensor logic, motor control, explicit states, a safety checklist, varied tests, and an iteration report.",
            [
                "Circuit and signal design",
                "Sensor calibration evidence",
                "Motor and state-control implementation",
                "Safety checklist and test plan",
                "Iteration report with before-and-after results",
            ]
        ),
    },
    {
        id: "course-11",
        slug: "databases-apis-and-backend-development",
        level: "intermediate",
        weeks: 10,
        weeklyHours: 5,
        summary:
            "Build a validated database-backed web API using HTTP, REST, JSON, Python routes, relational SQL, authentication basics, and useful errors.",
        description:
            "Guided browser concept simulations help learners reason about requests, routes, queries, and responses. Applied work is completed in learner-created API, SQL, and test files using freely installable or open tools outside the page.",
        audience:
            "Python and web learners ready to understand the server and data layers behind browser applications.",
        prerequisites: [
            "Python functions",
            "HTML/CSS",
            "JavaScript events and fetch",
        ],
        recommendedPriorCourses: ["course-03", "course-06", "course-07"],
        outcomes: [
            "Explain client-server exchanges and construct correct HTTP requests.",
            "Design REST routes and structured JSON responses.",
            "Model relational data and write safe SQL queries.",
            "Deliver a validated, protected, tested database-backed application.",
        ],
        tags: ["backend", "api", "http", "sql", "python"],
        icon: "database",
        accent: "#38BDF8",
        primaryTool: tool(
            "C4T Local API and SQL Lab",
            "software",
            "A guided HTTP and SQL concept simulator. It does not host requests, execute Python or SQL, provide a database, or run API tests.",
            [
                "Open the lab and send GET /health to the local practice service.",
                "Inspect the status, headers, and JSON body.",
                "Run SELECT name FROM items against the resettable sample database.",
            ],
            "Return a valid health response and one read-only SQL result.",
            "/learn/tools/backend-lab"
        ),
        simulators: [
            simulator(
                "local-api-sql-lab",
                "Local API and SQL Lab",
                "Practice network and database behavior without deploying a public server.",
                [
                    "HTTP request builder",
                    "Route and status matcher",
                    "JSON validator",
                    "SQL query reasoning prompt",
                    "Relationship diagram",
                    "Authentication-flow trace",
                ],
                [
                    "Local authentication examples teach boundaries but are not a production identity provider.",
                ]
            ),
        ],
        freeCompletionPromise:
            "The always-free pathway combines HTTP and data concept simulations with learner-created API, SQL, and test files made in freely installable or open tools. The C4T page does not run servers, SQL, or tests.",
        coreModules: [
            moduleBlueprint(
                "Trace clients, servers, and HTTP",
                2,
                "A browser reports a failure, but the team cannot tell whether the request, server, or response is responsible.",
                "Construct requests and label method, URL, headers, status, and body in an exchange trace.",
                "Diagnose a failed exchange and propose the correct status and response.",
                "diagram"
            ),
            moduleBlueprint(
                "Design REST and JSON contracts",
                2,
                "A task application uses inconsistent routes and response shapes that force every client to guess.",
                "Match resources to methods and edit JSON against an explicit contract.",
                "Design a predictable REST interface with success and failure examples.",
                "scenario"
            ),
            moduleBlueprint(
                "Create Python routes and methods",
                2,
                "A local service must support reading and creating records without mixing routing and business logic.",
                "Implement route handlers and trace how URL and method selection reaches code.",
                "Build two resource endpoints with separated validation and response logic.",
                "code-editor"
            ),
            moduleBlueprint(
                "Model relational data with SQL",
                2,
                "A club database repeats member details in every event row and produces contradictory updates.",
                "Normalize tables, draw relationships, and run filtered joins against safe sample data.",
                "Design and query a relational schema for members and events.",
                "data-lab"
            ),
            moduleBlueprint(
                "Protect actions and validate boundaries",
                2,
                "A request can edit another user's record because the server checks that someone signed in but not what they own.",
                "Trace authentication and authorization separately and reject malformed or unauthorized input.",
                "Add protected actions with ownership checks and structured validation errors.",
                "diagram"
            ),
            moduleBlueprint(
                "Connect the full application",
                2,
                "A browser interface, API, and database work separately but fail to communicate useful errors as one system.",
                "Follow data from form to request, validation, query, response, and rendered state.",
                "Deliver a tested vertical feature with loading, success, empty, and failure behavior.",
                "debugging"
            ),
        ],
        assignments: [
            assignment(
                "Relational API design",
                "Design tables, relationships, routes, sample JSON, validation rules, and status behavior for a small service.",
                [2, 4]
            ),
            assignment(
                "Protected CRUD feature",
                "Implement and test create, read, update, and delete behavior with protected actions and helpful failures.",
                [3, 5]
            ),
        ],
        capstone: capstone(
            "Database-backed web application",
            "Build a browser application with a documented API, CRUD operations, relational data, validation, protected actions, error handling, and automated API tests.",
            [
                "Relational schema and seed data",
                "Documented REST API",
                "Protected validated CRUD behavior",
                "Browser interface with complete states",
                "Automated API tests",
            ]
        ),
    },
    {
        id: "course-12",
        slug: "game-development-with-unity",
        level: "intermediate",
        weeks: 12,
        weeklyHours: 5,
        summary:
            "Design the systems for a complete game using guided concept simulations and learner-created planning and code files, with optional locally installed Unity workflows.",
        description:
            "Because a full Unity editor does not run in the learning page, the always-free path uses guided concept simulations and learner-created planning and C# files made with freely installable or open tools. Running the project in a locally installed Unity editor is optional and subject to Unity's current terms.",
        audience:
            "Programmers interested in the systems and production workflow behind complete 2D or 3D games.",
        prerequisites: [
            "Variables, functions, conditions, loops, and object-based programming concepts",
        ],
        recommendedPriorCourses: ["course-03", "course-05"],
        outcomes: [
            "Organize game behavior with scenes, objects, components, prefabs, and C#.",
            "Implement movement, collision, camera, animation, UI, and audio systems.",
            "Design enemy state and levels around clear player feedback.",
            "Test save designs and prepare either an optional local game build or a learner-created project package with code, system plans, and test evidence.",
        ],
        tags: ["unity", "csharp", "games", "physics", "level-design"],
        icon: "gamepad",
        accent: "#94A3B8",
        primaryTool: tool(
            "C4T Game Systems Lab",
            "software",
            "A browser game sandbox for scenes, components, C# traces, vectors, collisions, cameras, enemy states, levels, audio cues, and save data.",
            [
                "Open the systems lab and inspect the player object's components.",
                "Change a movement vector and run the short scene.",
                "Reset the scene and export its configuration.",
            ],
            "Move the player to a target and identify the component responsible for collision.",
            "/learn/tools/game-systems-lab"
        ),
        simulators: [
            simulator(
                "game-systems-lab",
                "Game Systems Lab",
                "Teach and assess Unity-relevant game systems entirely in the browser.",
                [
                    "Scene and component graph",
                    "C# code exercises",
                    "Movement and physics world",
                    "Camera and animation comparisons",
                    "Enemy state machines",
                    "Level critique and save-state inspector",
                ],
                [
                    "It does not claim to compile a native Unity project or reproduce the complete Unity editor.",
                ]
            ),
        ],
        freeCompletionPromise:
            "The always-free pathway combines game-system concept simulations with learner-created design and C# files made in freely installable or open tools. Running Unity and publishing a native build are optional.",
        coreModules: [
            moduleBlueprint(
                "Compose scenes, objects, and reusable behavior",
                2,
                "A level contains repeated hazards that drift apart because each copy was configured by hand.",
                "Inspect scene hierarchies, attach focused components, and compare instances created from a prefab definition.",
                "Design a reusable hazard system and show how one change reaches each instance.",
                "diagram"
            ),
            moduleBlueprint(
                "Script movement with C#",
                2,
                "Player movement feels inconsistent because input, speed, and frame timing are mixed without a vector model.",
                "Complete C# behavior and manipulate movement vectors under different frame steps.",
                "Implement predictable movement with explicit input and speed limits.",
                "code-editor"
            ),
            moduleBlueprint(
                "Control physics, collision, and cameras",
                2,
                "A character tunnels through a wall while the camera creates motion sickness during sudden turns.",
                "Compare collider and body settings and evaluate camera follow strategies.",
                "Tune a short traversal scene with stable collision and readable camera motion.",
                "simulator"
            ),
            moduleBlueprint(
                "Communicate through animation, UI, and audio",
                3,
                "Players cannot tell when they take damage, earn progress, pause, or complete an objective.",
                "Connect state changes to animation, interface, and audio feedback without duplicating game rules.",
                "Build a feedback layer that remains understandable with audio muted.",
                "design-review"
            ),
            moduleBlueprint(
                "Design enemies and levels",
                2,
                "An enemy always charges directly at the player and levels add obstacles without teaching or testing a skill.",
                "Build enemy states and critique a level's teaching, challenge, rest, and recovery sequence.",
                "Create an enemy encounter and level plan with observable transitions.",
                "visualizer"
            ),
            moduleBlueprint(
                "Save, test, build, and publish",
                2,
                "A game appears complete until restarting erases progress and a build behaves differently from the editor plan.",
                "Define save data, test corrupted or missing state, and walk through a repeatable build checklist.",
                "Produce a release candidate or simulation package with testing and publishing documentation.",
                "debugging"
            ),
        ],
        assignments: [
            assignment(
                "Movement and collision prototype",
                "Create a tested scene configuration with player controls, collision rules, camera behavior, and accessible feedback.",
                [2, 3]
            ),
            assignment(
                "Enemy encounter and level slice",
                "Design an enemy state machine and a short level that teaches, tests, and escalates one mechanic.",
                [4, 5]
            ),
        ],
        capstone: capstone(
            "Complete game production package",
            "Build and publish a Unity game when an appropriate local installation is available, or submit learner-created C# files, system designs, test plans, and concept-simulation evidence covering controls, physics, camera, UI, audio, animation, enemy or obstacle logic, levels or a full loop, and saved progress.",
            [
                "Optional native build or learner-created system and code files",
                "Scene, component, and state documentation",
                "Player, physics, camera, and feedback systems",
                "Save and failure recovery evidence",
                "Testing and release notes",
            ]
        ),
    },
    {
        id: "course-13",
        slug: "data-science-and-visualization",
        level: "intermediate",
        weeks: 9,
        weeklyHours: 4,
        summary:
            "Clean, explore, summarize, visualize, and communicate CSV or JSON data with NumPy, pandas, Matplotlib, reproducible notebooks, and careful claims.",
        description:
            "Learners use guided data concept simulations and create their own analysis files with freely installable or open tools. The course emphasizes transparent cleaning, correct summaries, appropriate chart choices, bias, correlation limits, reproducibility, and accessible reporting.",
        audience:
            "Python learners who want to answer practical questions with data and communicate evidence responsibly.",
        prerequisites: ["Python collections, functions, files, and JSON"],
        recommendedPriorCourses: ["course-04"],
        outcomes: [
            "Inspect data types and load documented CSV and JSON datasets.",
            "Clean, filter, group, and summarize data reproducibly.",
            "Create accessible visualizations suited to the question and data.",
            "Discuss sampling, bias, correlation limits, and uncertainty in a polished report.",
        ],
        tags: [
            "data-science",
            "pandas",
            "numpy",
            "matplotlib",
            "visualization",
        ],
        icon: "chart",
        accent: "#22C55E",
        primaryTool: tool(
            "C4T Browser Data Notebook",
            "compute",
            "A guided data concept simulator. It does not provide Python, notebook packages, datasets, saved outputs, or executable cells.",
            [
                "Open the concept simulator and review its modeled table scenario.",
                "Change a value and compare the resulting explanation.",
                "Use course instructions to create a separate analysis file and data dictionary in a freely installable or open tool.",
            ],
            "Record one table interpretation and a labeled chart plan for learner-selected non-sensitive data.",
            "/learn/tools/data-notebook"
        ),
        simulators: [
            simulator(
                "data-exploration-lab",
                "Data Exploration Lab",
                "Provide table, cleaning, grouping, statistics, and chart-choice interactions without heavy compute.",
                [
                    "Table and type explorer",
                    "Missing-data repair",
                    "Group and filter builder",
                    "Summary interpretation",
                    "Chart and bias critique",
                ],
                [
                    "Datasets are intentionally small and do not demonstrate distributed-data performance.",
                ]
            ),
        ],
        freeCompletionPromise:
            "The always-free pathway combines data concept simulations with learner-created analysis files made in freely installable or open tools and learner-selected non-sensitive data. The C4T page does not run notebooks.",
        coreModules: [
            moduleBlueprint(
                "Inspect tables and portable data",
                2,
                "A survey arrives as CSV and JSON exports whose columns look numeric but contain inconsistent text.",
                "Inspect rows, data types, delimiters, keys, and a data dictionary before calculating.",
                "Write a defensible loading and type-conversion plan.",
                "data-lab"
            ),
            moduleBlueprint(
                "Compute with NumPy and pandas",
                2,
                "A team repeats manual calculations across thousands of values and loses the connection between rows and labels.",
                "Compare array operations with labeled DataFrame operations on the same data.",
                "Build a concise transformation pipeline and verify its shape and types.",
                "code-editor"
            ),
            moduleBlueprint(
                "Clean and organize observations",
                2,
                "Missing, duplicated, and impossible values change a neighborhood analysis depending on silent defaults.",
                "Classify data issues, choose explicit repairs, and filter or group records with an audit trail.",
                "Produce a cleaning log and a reproducible grouped result.",
                "debugging"
            ),
            moduleBlueprint(
                "Summarize and visualize responsibly",
                2,
                "A single average and a dramatic chart hide an important difference between two groups.",
                "Interpret summary statistics and select a Matplotlib chart with honest scales and labels.",
                "Create multiple views that reveal distribution as well as a headline comparison.",
                "visualizer"
            ),
            moduleBlueprint(
                "Limit claims and investigate bias",
                2,
                "Two variables move together in a sample, and a report incorrectly claims one causes the other for everyone.",
                "Separate correlation from causal evidence and audit who or what the data excludes.",
                "Revise an overconfident claim with limitations and a sampling-bias analysis.",
                "scenario"
            ),
            moduleBlueprint(
                "Reproduce and present findings",
                2,
                "A polished dashboard cannot be rebuilt because its hidden manual steps and chart filters were never recorded.",
                "Organize a notebook from question through data, cleaning, analysis, charts, and conclusions.",
                "Produce an accessible dashboard or report whose figures can be regenerated.",
                "design-review"
            ),
        ],
        assignments: [
            assignment(
                "Data cleaning and summary audit",
                "Clean a documented dataset, explain every decision, and compare summary results before and after repair.",
                [3, 4]
            ),
            assignment(
                "Responsible visualization brief",
                "Create and critique multiple charts, including accessible text summaries and limits on interpretation.",
                [4, 5]
            ),
        ],
        capstone: capstone(
            "Reproducible data investigation",
            "Produce a documented dataset analysis with cleaning, exploration, summary statistics, multiple appropriate visualizations, bias and limitation discussion, a notebook, and a polished dashboard or report.",
            [
                "Documented dataset and provenance",
                "Reproducible cleaning and analysis notebook",
                "Statistical summaries and accessible visualizations",
                "Bias, correlation, and limitation discussion",
                "Polished dashboard or report",
            ]
        ),
    },
    {
        id: "course-14",
        slug: "ai-and-machine-learning-foundations",
        level: "beginner",
        weeks: 7,
        weeklyHours: 3,
        summary:
            "Understand what AI and machine learning can and cannot do through classification, regression, clustering, generation, data splits, uncertainty, bias, privacy, and use-case decisions.",
        description:
            "A code-optional foundation that makes model behavior visible with small interactive datasets. Learners compare AI approaches, investigate confidence and failure, and use a responsible decision framework before recommending AI for a real problem.",
        audience:
            "Curious beginners, educators, and future builders who need durable AI literacy before using model-development tools.",
        prerequisites: ["None"],
        recommendedPriorCourses: ["course-01"],
        outcomes: [
            "Distinguish AI, machine learning, and common task families.",
            "Explain features, labels, training, inference, and data splits.",
            "Interpret confidence as uncertainty rather than guaranteed correctness.",
            "Evaluate bias, privacy, misinformation, human oversight, and non-AI alternatives.",
        ],
        tags: ["ai", "machine-learning", "ethics", "data-literacy"],
        icon: "brain",
        accent: "#8B5CF6",
        primaryTool: tool(
            "C4T AI Concepts Lab",
            "software",
            "A free deterministic browser lab for classification boundaries, regression, clustering, data splits, confidence, bias, and suitability decisions.",
            [
                "Open the lab and sort the welcome examples by task family.",
                "Move one point in the classification explorer and observe the boundary.",
                "Read the uncertainty note and reset the model.",
            ],
            "Correctly identify a task family and describe one way its result can fail.",
            "/learn/tools/ai-concepts-lab"
        ),
        simulators: [
            simulator(
                "ai-concepts-lab",
                "AI Concepts Lab",
                "Explore foundational model behavior with inspectable calculations and no external model API.",
                [
                    "Task-family sorter",
                    "Classification and regression explorer",
                    "Clustering view",
                    "Dataset split simulator",
                    "Confidence and bias cases",
                ],
                [
                    "Toy models reveal concepts but cannot predict the reliability of a production system.",
                ]
            ),
        ],
        freeCompletionPromise:
            "The always-free pathway uses guided AI concept simulations and learner-created analysis files. It does not call a model API or require an account, API key, GPU, or paid chatbot.",
        coreModules: [
            moduleBlueprint(
                "Distinguish AI systems and task families",
                2,
                "A school calls every automated feature AI even when some are fixed rules and others learn from examples.",
                "Classify examples as rules, AI, or machine learning and match tasks to classification, regression, clustering, or generation.",
                "Create a plain-language task map for a proposed student-support tool.",
                "ordering"
            ),
            moduleBlueprint(
                "Represent examples with features and labels",
                2,
                "A recycling sorter sees color and weight during training but must make a prediction on a new object.",
                "Choose defensible features and labels and trace the difference between training and inference.",
                "Design an example record and explain what the model knows at prediction time.",
                "scenario"
            ),
            moduleBlueprint(
                "Split data and reason about networks",
                2,
                "A model appears perfect because it is evaluated on the same examples it memorized.",
                "Allocate train, validation, and test data and manipulate a conceptual neural-network flow.",
                "Create a split plan that protects an honest final evaluation.",
                "visualizer"
            ),
            moduleBlueprint(
                "Interpret uncertainty and fairness",
                2,
                "A high confidence score is treated as proof while errors fall disproportionately on one group.",
                "Compare confidence with observed outcomes and inspect performance across relevant groups.",
                "Write an uncertainty and fairness warning for a decision interface.",
                "data-lab"
            ),
            moduleBlueprint(
                "Protect privacy and consent",
                1,
                "A team collects faces and voices because they may be useful later, without explaining retention or alternatives.",
                "Identify necessary data, consent choices, access, retention, and safer minimization options.",
                "Create a privacy-respecting data plan with a nonparticipation path.",
                "scenario"
            ),
            moduleBlueprint(
                "Recognize misinformation and decide whether AI fits",
                2,
                "A realistic generated video and an automated proposal promise impact without reliable verification or human appeal.",
                "Assess deepfake clues and limits, then compare AI with simpler rules or human processes.",
                "Use a suitability framework to recommend, constrain, or reject an AI use case.",
                "design-review"
            ),
        ],
        assignments: [
            assignment(
                "Model behavior and uncertainty brief",
                "Explain a selected AI task, its data flow, confidence limits, likely errors, and a fair evaluation plan.",
                [2, 4]
            ),
            assignment(
                "Responsible AI case review",
                "Audit privacy, consent, bias, misinformation, and human-oversight risks in a proposed system.",
                [5, 6]
            ),
        ],
        capstone: capstone(
            "AI use-case recommendation",
            "Analyze a proposed AI use case and recommend whether and how to proceed based on the problem, data, risks, bias, privacy, confidence, oversight, safer alternatives, and uncertainty.",
            [
                "Clear problem and stakeholder definition",
                "AI and non-AI option comparison",
                "Data, bias, privacy, and confidence analysis",
                "Human oversight and appeal plan",
                "Evidence-based final recommendation",
            ]
        ),
    },
    {
        id: "course-15",
        slug: "build-your-own-ml-model-without-code",
        level: "beginner",
        weeks: 8,
        weeklyHours: 3,
        summary:
            "Plan consent-respecting image, sound, or pose data; explore class balance, confidence, and errors with guided concepts; and document an optional learner-managed model workflow.",
        description:
            "A privacy-conscious model-design course with guided class-balance, confidence, and error simulations. Learners create their own dataset plans and project files; the page does not collect camera or microphone input or train a model.",
        audience:
            "Beginners who understand basic AI concepts and want to reason through an end-to-end model workflow without programming.",
        prerequisites: [
            "Classification, features, labels, confidence, and test-data concepts",
        ],
        recommendedPriorCourses: ["course-14"],
        outcomes: [
            "Define useful classes and collect balanced, consent-respecting examples.",
            "Explain a small-model training and testing workflow and interpret confidence cautiously.",
            "Plan unseen-example tests and distinguish false positives from false negatives in modeled cases.",
            "Improve a learner-created data plan and connect modeled outputs or an optional learner-managed model to an interactive application.",
        ],
        tags: ["machine-learning", "no-code", "browser-ml", "responsible-ai"],
        icon: "wand",
        accent: "#EC4899",
        primaryTool: tool(
            "C4T Model Workflow Concept Lab",
            "compute",
            "A guided class-balance, confidence, and error concept simulator. It does not collect media, supply datasets, train a model, or execute an application.",
            [
                "Open the concept simulator and enter class-balance values for a learner-created, consent-respecting dataset plan.",
                "Predict how a class-balance change could affect evaluation.",
                "Record a modeled confidence result and one possible error case.",
            ],
            "Record a modeled classification outcome and identify one possible error case.",
            "/learn/tools/browser-model-studio"
        ),
        simulators: [
            simulator(
                "browser-model-studio",
                "Model Workflow Concept Lab",
                "Explore simplified class-balance, confidence, confusion, improvement, and app-integration decisions without paid compute or personal sensors.",
                [
                    "Learner-entered class counts",
                    "Class-balance controls",
                    "Deterministic confidence illustration",
                    "Error and confusion prompts",
                    "Website-integration design prompt",
                ],
                [
                    "No model or dataset is loaded or run; the deterministic values do not establish real-world safety or generalization.",
                ]
            ),
        ],
        freeCompletionPromise:
            "The always-free pathway combines model-training concept simulations with learner-created dataset plans and project files. The C4T page does not collect media or train a model; cameras, microphones, cloud training, and paid tools are optional.",
        coreModules: [
            moduleBlueprint(
                "Collect examples and define classes",
                2,
                "A gesture controller has unclear class boundaries and accidentally records people who did not agree to participate.",
                "Define observable classes and compare learner-selected approved non-sensitive data with consent-based local collection.",
                "Create a collection plan with consent, deletion, and synthetic-data alternatives.",
                "scenario"
            ),
            moduleBlueprint(
                "Balance data and train in the browser",
                2,
                "One class has ten times more examples, so the model learns to predict it most of the time.",
                "Adjust class representation and compare local training runs with controlled settings.",
                "Train or simulate two dataset versions and record why their behavior differs.",
                "simulator"
            ),
            moduleBlueprint(
                "Interpret confidence and unseen tests",
                2,
                "A model assigns a large score to a familiar example but behaves unpredictably under a new background.",
                "Inspect confidence distributions and reserve genuinely unseen examples.",
                "Write a test protocol that avoids using test results to silently retrain.",
                "data-lab"
            ),
            moduleBlueprint(
                "Diagnose error types and repair data",
                2,
                "A recycling sorter rejects recyclable objects and accepts some trash, with different consequences for each error.",
                "Label false positives and negatives and connect error patterns to missing or misleading examples.",
                "Propose and test a focused data improvement rather than merely adding random samples.",
                "debugging"
            ),
            moduleBlueprint(
                "Export a model responsibly",
                1,
                "A downloaded model file has no class labels, version, limitations, or evidence explaining how it was produced.",
                "Package labels, preprocessing assumptions, evaluation notes, and a lightweight model card.",
                "Create a reusable export bundle or equivalent simulated artifact with clear limits.",
                "design-review"
            ),
            moduleBlueprint(
                "Connect predictions to an application",
                1,
                "A web game reacts to every unstable prediction, causing rapid unintended actions.",
                "Map predictions to interface state with thresholds, smoothing, fallback controls, and visible uncertainty.",
                "Build an integration flow that remains usable when predictions are absent or wrong.",
                "simulator"
            ),
        ],
        assignments: [
            assignment(
                "Balanced dataset and test plan",
                "Create or select an approved dataset, document classes and consent, rebalance it, and reserve unseen tests.",
                [1, 3]
            ),
            assignment(
                "Error-driven model improvement",
                "Analyze false positives and negatives, make one targeted dataset change, and compare results honestly.",
                [4, 5]
            ),
        ],
        capstone: capstone(
            "No-code interactive ML prototype",
            "Build a gesture controller, sound classifier, or recycling sorter using approved data, training or simulation, unseen tests, documented errors, data improvement, and application integration.",
            [
                "Approved or synthetic dataset documentation",
                "Balanced classes and training record",
                "Unseen test and confusion evidence",
                "Targeted improvement comparison",
                "Interactive application with fallback controls",
            ]
        ),
    },
    {
        id: "course-16",
        slug: "beginner-machine-learning-with-python",
        level: "intermediate",
        weeks: 10,
        weeklyHours: 5,
        summary:
            "Build reproducible scikit-learn pipelines, compare KNN, linear and logistic regression, and decision trees, and evaluate predictions with suitable metrics.",
        description:
            "A Python ML course using guided concept simulations and learner-created notebook or script files in freely installable or open tools. Learners identify features and targets, protect test data, preprocess consistently, diagnose overfitting, and justify a comparative recommendation.",
        audience:
            "Python and data learners ready to train, evaluate, and compare classical machine-learning models.",
        prerequisites: [
            "Python projects",
            "DataFrame basics",
            "Foundational AI vocabulary",
        ],
        recommendedPriorCourses: ["course-04", "course-13", "course-14"],
        outcomes: [
            "Construct an end-to-end scikit-learn workflow with protected test data.",
            "Train and interpret KNN, regression, and decision-tree models.",
            "Calculate and choose classification and regression metrics.",
            "Diagnose overfitting and recommend a model from comparative evidence.",
        ],
        tags: ["python", "scikit-learn", "machine-learning", "evaluation"],
        icon: "nodes",
        accent: "#F59E0B",
        primaryTool: tool(
            "C4T CPU ML Notebook",
            "compute",
            "A guided ML concept simulator. It does not provide Python, scikit-learn, datasets, notebook execution, model training, or saved outputs.",
            [
                "Open the concept simulator and identify its modeled feature, boundary, and prediction.",
                "Change the modeled sample and record how the explanation changes.",
                "Use course instructions to create a separate ML analysis file in a freely installable or open tool.",
            ],
            "Document a leak-resistant split and baseline plan in a learner-created project file.",
            "/learn/tools/ml-notebook"
        ),
        simulators: [
            simulator(
                "classical-ml-lab",
                "Classical ML Lab",
                "Visualize splits, neighbors, regression, tree paths, confusion matrices, and overfitting with small deterministic data.",
                [
                    "Feature-target picker",
                    "Split-ratio experiment",
                    "KNN neighbor map",
                    "Regression and probability views",
                    "Tree path trace",
                    "Metric and overfitting dashboard",
                ],
                [
                    "Small datasets prioritize understanding and do not benchmark production-scale performance.",
                ]
            ),
        ],
        freeCompletionPromise:
            "The always-free pathway combines ML concept simulations with learner-created Python and analysis files made in freely installable or open tools. The C4T page does not run notebooks or train models.",
        coreModules: [
            moduleBlueprint(
                "Organize workflows, features, and targets",
                2,
                "A prediction notebook mixes identifiers, outcomes, and input columns without recording what will be available at inference time.",
                "Trace a scikit-learn workflow and classify candidate columns as features, target, metadata, or leakage.",
                "Create a reproducible data-to-prediction workflow diagram.",
                "diagram"
            ),
            moduleBlueprint(
                "Split and preprocess data",
                2,
                "A preprocessing step learns from all rows before the test split and makes evaluation look better than it is.",
                "Experiment with split ratios and fit transformations only on training data.",
                "Build a preprocessing flow that can be applied consistently to unseen examples.",
                "simulator"
            ),
            moduleBlueprint(
                "Learn from neighbors and lines",
                2,
                "A learner needs to choose between predicting a category from nearby cases and predicting a numeric trend.",
                "Manipulate KNN neighborhoods and a linear regression line while recording changed predictions.",
                "Train, visualize, and explain one classification and one numeric model.",
                "visualizer"
            ),
            moduleBlueprint(
                "Estimate probabilities and follow trees",
                2,
                "A yes-or-no prediction needs an interpretable probability and a rule path that can be inspected.",
                "Explore logistic probabilities and trace examples through decision-tree splits.",
                "Compare how a logistic model and tree represent the same decision problem.",
                "code-trace"
            ),
            moduleBlueprint(
                "Evaluate predictions with suitable metrics",
                2,
                "A model with high accuracy misses most rare positive cases that matter to the project.",
                "Calculate confusion-matrix counts and compare accuracy, precision, recall, and F1 under different costs.",
                "Choose metrics and thresholds from the use case rather than a single headline score.",
                "data-lab"
            ),
            moduleBlueprint(
                "Diagnose fit and compare models",
                3,
                "A complex model scores perfectly on training data but performs worse than a simple baseline on unseen examples.",
                "Compare train and test patterns, identify overfitting or underfitting, and review multiple models consistently.",
                "Produce an evidence table and justified final model recommendation.",
                "debugging"
            ),
        ],
        assignments: [
            assignment(
                "Preprocessing and baseline notebook",
                "Build a leak-resistant split and preprocessing workflow, then compare a baseline with one trained model.",
                [1, 2]
            ),
            assignment(
                "Metric and error analysis",
                "Calculate confusion metrics, inspect errors, diagnose fit, and recommend a threshold or model change.",
                [5, 6]
            ),
        ],
        capstone: capstone(
            "Classical model comparison",
            "Compare at least three models on one documented dataset using protected train-test separation, preprocessing, multiple metrics, error analysis, an overfitting discussion, and a justified recommendation.",
            [
                "Documented dataset and preprocessing",
                "Protected train-test workflow",
                "At least three trained models",
                "Multiple appropriate metrics and error analysis",
                "Fit diagnosis and final recommendation",
            ]
        ),
    },
    {
        id: "course-17",
        slug: "hardware-lab-raspberry-pi-and-internet-of-things",
        level: "intermediate",
        weeks: 10,
        weeklyHours: 5,
        summary:
            "Design a secure IoT system with simulated or physical GPIO, sensors, Python control, time-series data, MQTT, dashboards, remote actions, authentication, and credential safety.",
        description:
            "Guided GPIO, sensor-threshold, and messaging concept simulations remove the hardware barrier to learning core relationships. Learners create Python, dashboard, architecture, and security files with freely installable or open tools; the page does not run Linux, GPIO, or MQTT.",
        audience:
            "Python and hardware learners ready to connect devices, networks, dashboards, and security decisions.",
        prerequisites: [
            "Python fundamentals and hardware input/output concepts",
        ],
        recommendedPriorCourses: ["course-03", "course-09", "course-10"],
        outcomes: [
            "Navigate a safe Linux workspace and map Raspberry Pi GPIO.",
            "Read simulated sensors and control outputs with Python.",
            "Publish time-series data through local MQTT and a dashboard.",
            "Protect device control with authentication, credential handling, and failure states.",
        ],
        tags: [
            "hardware",
            "raspberry-pi",
            "iot",
            "mqtt",
            "security",
            "simulation",
        ],
        icon: "antenna",
        accent: "#C51A4A",
        primaryTool: tool(
            "C4T Pi and IoT Concept Lab",
            "software",
            "A browser Linux shell, GPIO board, sensor stream, local MQTT broker, dashboard builder, and device-security simulator.",
            [
                "Open the guided IoT concept simulator and review its sensor and threshold assumptions.",
                "Change the modeled reading and predict the GPIO state.",
                "Record a local MQTT-style message design in a learner-created project file.",
            ],
            "Show one GPIO state and one authenticated local message in the virtual dashboard.",
            "/learn/tools/iot-lab"
        ),
        extraRequirements: [
            tool(
                "Raspberry Pi and electronics",
                "hardware",
                "Optional Pi, safe low-voltage sensors, and outputs for physical transfer work.",
                [
                    "Power down before changing GPIO wiring.",
                    "Confirm pin numbering, voltage, and component limits before connection.",
                    "Never expose device credentials or a classroom device directly to the public internet.",
                ],
                "Pass the GPIO and network-safety checklist before optional physical deployment.",
                undefined,
                [
                    {
                        name: "Raspberry Pi starter setup",
                        description:
                            "Optional physical extension; learners without hardware use guided concept simulations and create equivalent architecture, code, and test files.",
                    },
                ]
            ),
        ],
        simulators: [
            simulator(
                "gpio-iot-lab",
                "Pi and IoT Concept Lab",
                "Provide hardware, operating-system, messaging, dashboard, and security practice with no physical device or cloud.",
                [
                    "Linux command exercises",
                    "GPIO and sensor simulator",
                    "Output and motor states",
                    "Time-series chart",
                    "Local MQTT topics",
                    "Dashboard and authentication flows",
                ],
                [
                    "The local network model does not reproduce radio interference, electrical faults, or internet-scale delivery.",
                ]
            ),
        ],
        freeCompletionPromise:
            "The always-free pathway combines GPIO, sensor, and messaging concept simulations with learner-created Python, dashboard, and architecture files. The C4T page does not run Linux, GPIO, or MQTT; hardware and cloud accounts are optional.",
        coreModules: [
            moduleBlueprint(
                "Prepare Linux and GPIO safely",
                2,
                "A device setup guide assumes commands and pin numbers are interchangeable, risking overwritten files and damaged components.",
                "Practice safe shell navigation and identify GPIO purpose, numbering, voltage, and power state.",
                "Create a verified setup checklist for virtual or optional physical work.",
                "simulator"
            ),
            moduleBlueprint(
                "Read sensors and control outputs",
                2,
                "An environmental station must turn status lights or a motor from Python without blocking future readings.",
                "Read changing sensor inputs and issue bounded output commands with clear safe defaults.",
                "Design a sensor-to-output controller and test its logic in learner-created project files.",
                "code-editor"
            ),
            moduleBlueprint(
                "Collect and transmit time-series data",
                2,
                "Individual readings are useful, but the project must reveal trends and survive a temporary network interruption.",
                "Timestamp, buffer, chart, and send data while simulating connection loss.",
                "Create a local-first data pipeline with retry and duplicate handling.",
                "data-lab"
            ),
            moduleBlueprint(
                "Exchange MQTT messages and build dashboards",
                2,
                "Several devices publish ambiguous topics and a dashboard cannot tell which location or unit a value belongs to.",
                "Design topic names and payloads, then bind messages to labeled dashboard states.",
                "Build a local dashboard with live, stale, missing, and invalid-data indicators.",
                "simulator"
            ),
            moduleBlueprint(
                "Control devices with trustworthy identity",
                2,
                "A remote control endpoint accepts any message from anyone who knows a topic name.",
                "Separate device identity, user authorization, message validation, and audit evidence.",
                "Add an authenticated control flow with deny-by-default behavior.",
                "diagram"
            ),
            moduleBlueprint(
                "Store credentials and design the whole system",
                2,
                "A working prototype includes a password in source code and lacks a plan for sensor, network, or dashboard failure.",
                "Move secrets to a protected configuration model and threat-model the complete IoT path.",
                "Produce a resilient architecture with credential rotation and explicit failure behavior.",
                "design-review"
            ),
        ],
        assignments: [
            assignment(
                "Local sensor and MQTT pipeline",
                "Read simulated sensor data, buffer and publish it locally, then visualize fresh and stale states.",
                [3, 4]
            ),
            assignment(
                "Secure remote control review",
                "Implement or diagram device authentication, protected control, credential storage, and an audit trail.",
                [5, 6]
            ),
        ],
        capstone: capstone(
            "Secure IoT monitoring system",
            "Build a virtual or physical smart greenhouse, weather station, or environmental monitor with sensors, collection, networking, dashboard, device authentication, protected credentials, failure states, and documentation.",
            [
                "Sensor and output implementation",
                "Time-series collection and local messaging",
                "Accessible monitoring dashboard",
                "Authentication and credential plan",
                "Failure tests and system documentation",
            ]
        ),
    },
    {
        id: "course-18",
        slug: "hardware-lab-tinyml-and-edge-ai",
        level: "intermediate",
        weeks: 10,
        weeklyHours: 5,
        summary:
            "Evaluate and design TinyML systems with sensor windows, classification, quantization, constrained memory, latency, deployment, accuracy, power, and local-inference privacy.",
        description:
            "Learners use guided edge-budget concept simulations and learner-created deployment and evaluation files. The page supplies no model or sensor stream and produces no physical measurements; hardware remains optional.",
        audience:
            "ML and IoT learners interested in deploying useful models under real device constraints.",
        prerequisites: [
            "ML evaluation basics, Python, and IoT data flow concepts",
        ],
        recommendedPriorCourses: ["course-14", "course-16", "course-17"],
        outcomes: [
            "Choose between cloud and edge inference from system constraints.",
            "Prepare sensor windows for time-series, image, or audio classification.",
            "Measure quantization, memory, latency, accuracy, and power trade-offs.",
            "Document a private and testable constrained-device deployment plan.",
        ],
        tags: ["hardware", "tinyml", "edge-ai", "quantization", "simulation"],
        icon: "chip-ai",
        accent: "#14B8A6",
        primaryTool: tool(
            "C4T TinyML Edge Simulator",
            "compute",
            "A guided edge-budget concept simulator. It does not supply sensor streams or models, quantize or deploy a model, or produce physical latency and power measurements.",
            [
                "Open the edge concept simulator and enter a modeled size, confidence value, and device budget.",
                "Enter a modeled size and device budget and predict whether it fits.",
                "Change confidence or the budget and compare the deterministic explanation.",
            ],
            "Explain one measured trade-off between model size, speed, and accuracy.",
            "/learn/tools/tinyml-lab"
        ),
        extraRequirements: [
            tool(
                "TinyML-capable development board",
                "hardware",
                "Optional board and sensor for repeating deployment and measurements physically.",
                [
                    "Follow the board's low-voltage and power guidance.",
                    "Use only manufacturer-provided or otherwise trusted firmware and disconnect before rewiring.",
                    "Treat simulated measurements as estimates and label physical measurements separately.",
                ],
                "Complete the board-specific safety and measurement checklist before optional deployment.",
                undefined,
                [
                    {
                        name: "Edge AI development board",
                        description:
                            "Optional physical extension; the always-free assessment uses guided concept results and learner-created evaluation files.",
                    },
                ]
            ),
        ],
        simulators: [
            simulator(
                "tinyml-edge-lab",
                "TinyML Edge Simulator",
                "Explore simplified device-budget and confidence decisions without claiming to deploy or measure a physical board.",
                [
                    "Sensor-window explorer",
                    "Image, audio, and time-series examples",
                    "Quantization comparison",
                    "Memory budget",
                    "Latency and power estimates",
                    "Accuracy and privacy worksheet",
                ],
                [
                    "Latency and power are modeled estimates and must not be reported as physical measurements.",
                ]
            ),
        ],
        freeCompletionPromise:
            "The always-free pathway combines edge-budget concept simulations with learner-created deployment and evaluation files. The C4T page does not supply or run models, and modeled values are not physical measurements; boards, GPUs, and cloud services are optional.",
        coreModules: [
            moduleBlueprint(
                "Choose edge or cloud inference",
                2,
                "A wildlife monitor has limited connectivity, strict battery needs, and images that should not leave the site.",
                "Compare latency, network, update, privacy, and compute constraints for edge and cloud designs.",
                "Produce a justified placement decision and fallback behavior.",
                "scenario"
            ),
            moduleBlueprint(
                "Prepare sensor windows and task types",
                2,
                "A continuous motion stream has no obvious boundary between examples used for training and inference.",
                "Segment sensor windows and compare time-series and image classification representations.",
                "Create a labeled windowing plan with overlap and leakage checks.",
                "visualizer"
            ),
            moduleBlueprint(
                "Handle audio and quantize models",
                2,
                "An audio classifier exceeds device storage even though its desktop accuracy is acceptable.",
                "Inspect audio features and compare full-precision and quantized model behavior.",
                "Choose a quantization option from measured size and error changes.",
                "simulator"
            ),
            moduleBlueprint(
                "Budget memory, processing, and latency",
                2,
                "A model fits in storage but runs out of working memory and misses a real-time response deadline.",
                "Allocate flash, runtime memory, operations, and latency in a constrained budget.",
                "Produce a device-fit table with explicit safety margin.",
                "data-lab"
            ),
            moduleBlueprint(
                "Plan deployment and measure accuracy",
                2,
                "A desktop test score is reused as evidence after deployment even though sensor placement and sampling changed.",
                "Design a deployment checklist and specify how predictions would be compared with labeled physical or lawfully obtained traces.",
                "Design an on-device evaluation with honest simulated or measured labels.",
                "design-review"
            ),
            moduleBlueprint(
                "Balance power and privacy",
                2,
                "Continuous sensing drains a battery while sending raw data creates an avoidable privacy risk.",
                "Model duty cycles and compare raw-data transfer with local inference and minimal events.",
                "Recommend an operating policy that balances lifetime, responsiveness, and privacy.",
                "simulator"
            ),
        ],
        assignments: [
            assignment(
                "Quantization and device-budget study",
                "Compare full and quantized models against accuracy, flash, memory, latency, and power limits.",
                [3, 4]
            ),
            assignment(
                "Edge deployment and privacy plan",
                "Design a deployment checklist, test protocol, duty cycle, and local-data policy for a learner-selected device scenario.",
                [5, 6]
            ),
        ],
        capstone: capstone(
            "Constrained edge-AI device plan",
            "Design a gesture detector, wildlife monitor, or smart safety device using a learner-created or lawfully obtained model, deployment plan, simulated or physical accuracy, latency, memory, power, and privacy analysis.",
            [
                "Sensor and model selection",
                "Quantization and device-budget evidence",
                "Deployment and evaluation procedure",
                "Accuracy, latency, memory, and power results",
                "Privacy and limitation analysis",
            ]
        ),
    },
    {
        id: "course-19",
        slug: "intermediate-machine-learning-and-model-evaluation",
        level: "advanced-intermediate",
        weeks: 12,
        weeklyHours: 5,
        summary:
            "Build rigorous ML comparisons with feature engineering, pipelines, cross-validation, tuning, imbalance handling, ensembles, leakage checks, calibration, interpretation, and sliced error analysis.",
        description:
            "This CPU-conscious course replaces one-shot model scores with reproducible evaluation. Learners assemble pipelines, visualize resampling and search, identify leakage, inspect calibration and interpretation, and make recommendations that survive slice-based error analysis.",
        audience:
            "Classical ML practitioners ready to improve the reliability of model selection and reporting.",
        prerequisites: [
            "A complete scikit-learn workflow and familiarity with classification metrics",
        ],
        recommendedPriorCourses: ["course-16"],
        outcomes: [
            "Engineer features and preprocessing inside reproducible pipelines.",
            "Use cross-validation and constrained hyperparameter search correctly.",
            "Address imbalance and compare ensembles without data leakage.",
            "Evaluate calibration, interpretation, and error slices before recommending a model.",
        ],
        tags: [
            "machine-learning",
            "evaluation",
            "pipelines",
            "cross-validation",
            "interpretability",
        ],
        icon: "sliders",
        accent: "#7C3AED",
        primaryTool: tool(
            "C4T Model Evaluation Notebook",
            "compute",
            "A guided evaluation concept simulator. It does not provide a notebook, datasets, search execution, model runs, or cached outputs.",
            [
                "Open the concept simulator and inspect its modeled decision boundary.",
                "Change the modeled sample or boundary and record the explanation.",
                "Create a separate pipeline and search plan with a freely installable or open tool.",
            ],
            "Report a cross-validated baseline with its variation across folds.",
            "/learn/tools/model-evaluation-lab"
        ),
        simulators: [
            simulator(
                "model-evaluation-lab",
                "Model Evaluation Lab",
                "Visualize pipelines, folds, searches, imbalance, ensembles, leakage, calibration, interpretation, and errors.",
                [
                    "Pipeline assembly",
                    "Cross-validation folds",
                    "Search-space comparison",
                    "Class and resampling controls",
                    "Leakage detector",
                    "Calibration and interpretation plots",
                    "Slice error dashboard",
                ],
                [
                    "Bounded teaching searches do not identify universally optimal production parameters.",
                ]
            ),
        ],
        freeCompletionPromise:
            "The always-free pathway combines evaluation concept simulations with learner-created pipeline and report files made in freely installable or open tools. The C4T page does not run searches, notebooks, or models.",
        coreModules: [
            moduleBlueprint(
                "Engineer features inside pipelines",
                2,
                "A model notebook manually creates features before each run, producing inconsistent train and inference behavior.",
                "Design useful features and place numerical and categorical transformations into a single fitted pipeline.",
                "Build a reproducible feature and preprocessing graph with named outputs.",
                "diagram"
            ),
            moduleBlueprint(
                "Estimate performance with cross-validation",
                2,
                "A model recommendation changes whenever a different random train-test split is chosen.",
                "Visualize folds, preserve groups or time order where needed, and summarize variation rather than only a mean.",
                "Choose and justify a validation strategy for a structured dataset.",
                "visualizer"
            ),
            moduleBlueprint(
                "Tune without exhausting resources",
                2,
                "An enormous parameter grid wastes compute while repeated peeking at validation results encourages overfitting.",
                "Compare bounded grid and randomized search spaces under a fixed CPU budget.",
                "Run or inspect a reproducible search and explain its stopping and selection rules.",
                "simulator"
            ),
            moduleBlueprint(
                "Handle imbalance and combine models",
                2,
                "A rare-event classifier predicts the majority class while a simple accuracy score hides the failure.",
                "Compare weighting and resampling inside validation, then inspect how ensemble voting changes errors.",
                "Design an imbalance strategy and ensemble baseline without contaminating evaluation.",
                "data-lab"
            ),
            moduleBlueprint(
                "Compare forests, boosting, and leakage risks",
                3,
                "A boosted model looks exceptional because a timestamp-derived feature indirectly reveals the future outcome.",
                "Compare tree ensembles and audit feature creation, preprocessing, and splits for leakage.",
                "Produce a leakage checklist and corrected comparison for random forest and gradient boosting.",
                "debugging"
            ),
            moduleBlueprint(
                "Calibrate, interpret, and analyze errors",
                3,
                "Two models rank examples similarly, but their probabilities, subgroup failures, and explanations lead to different decisions.",
                "Inspect reliability curves, model interpretations, and error slices with uncertainty and caveats.",
                "Write a rigorous recommendation grounded in calibration, interpretation, and actionable error analysis.",
                "data-lab"
            ),
        ],
        assignments: [
            assignment(
                "Pipeline and validation audit",
                "Create a reproducible pipeline, choose cross-validation, and identify potential leakage before tuning.",
                [1, 2]
            ),
            assignment(
                "Imbalance, calibration, and slice report",
                "Compare imbalance strategies and model families, then evaluate calibration and error slices.",
                [4, 6]
            ),
        ],
        capstone: capstone(
            "Rigorous model-comparison report",
            "Deliver a reproducible comparison with cross-validation, bounded tuning, imbalance handling, leakage checks, calibration, interpretation, error analysis, recommendation, and limitations.",
            [
                "Reproducible feature and pipeline code",
                "Cross-validation and search evidence",
                "Imbalance and leakage analysis",
                "Calibration, interpretation, and error slices",
                "Final recommendation with limitations",
            ]
        ),
    },
    {
        id: "course-20",
        slug: "deep-learning-and-computer-vision",
        level: "advanced",
        weeks: 12,
        weeklyHours: 6,
        summary:
            "Understand and evaluate neural networks, optimization, CNNs, augmentation, transfer learning, detection, segmentation, tracking, GPU trade-offs, and responsible computer vision.",
        description:
            "A reduced-compute course using guided tensor, boundary, and trade-off concept simulations plus learner-created experiment files. Learners design experiments and analyze model evidence with freely installable or open tools; the page does not provide models or training traces.",
        audience:
            "Experienced Python and ML learners ready to study deep-learning mechanics and computer-vision evaluation.",
        prerequisites: [
            "Rigorous classical ML evaluation and strong Python fundamentals",
        ],
        recommendedPriorCourses: ["course-19"],
        outcomes: [
            "Trace tensor shapes, layers, activations, losses, gradients, and training loops.",
            "Design and evaluate CNN, augmentation, and transfer-learning experiments.",
            "Compare classification, detection, and segmentation outputs.",
            "Document resource use, errors, limitations, and responsible-use constraints.",
        ],
        tags: [
            "deep-learning",
            "computer-vision",
            "cnn",
            "transfer-learning",
            "responsible-ai",
        ],
        icon: "eye",
        accent: "#06B6D4",
        primaryTool: tool(
            "C4T Deep Learning Visual Lab",
            "compute",
            "A guided deep-learning concept simulator. It does not provide pretrained features, annotations, models, executable tensor operations, or saved training curves.",
            [
                "Open the concept simulator and review the modeled feature and boundary.",
                "Change one modeled value and record the deterministic explanation.",
                "Use course instructions to create a separate tensor-shape or training-curve analysis file.",
            ],
            "Correctly trace a layer shape and diagnose one pattern in a saved training curve.",
            "/learn/tools/deep-learning-lab"
        ),
        simulators: [
            simulator(
                "deep-learning-visual-lab",
                "Deep Learning Visual Lab",
                "Make neural optimization and vision operations inspectable without expensive training.",
                [
                    "Tensor and layer shapes",
                    "Activation and loss explorers",
                    "Gradient and backpropagation traces",
                    "Convolution and augmentation previews",
                    "Transfer comparison",
                    "Detection and segmentation annotation",
                    "Training-curve diagnosis",
                ],
                [
                    "Saved traces and tiny models teach analysis but are not evidence of large-model performance.",
                ]
            ),
        ],
        freeCompletionPromise:
            "The always-free pathway combines neural-network concept simulations with learner-created experiment and model-card files. The C4T page does not provide checkpoints or train models; GPU hardware and paid compute are optional.",
        coreModules: [
            moduleBlueprint(
                "Trace tensors, layers, and activations",
                2,
                "An image batch reaches a dense layer with an incompatible shape and a saturated activation stops useful change.",
                "Calculate tensor shapes and compare how activation choices transform layer outputs.",
                "Repair a small network diagram and explain each resulting shape.",
                "visualizer"
            ),
            moduleBlueprint(
                "Connect losses, gradients, and backpropagation",
                2,
                "A network changes parameters but the loss rises because the update direction and scale are wrong.",
                "Explore a loss surface, follow gradient descent, and trace derivatives backward through a tiny graph.",
                "Choose a stable update and explain how blame reaches an earlier parameter.",
                "simulator"
            ),
            moduleBlueprint(
                "Build and diagnose training loops",
                2,
                "A training script reports only its last batch and hides whether validation performance improves.",
                "Order forward, loss, backward, update, evaluation, and logging steps and inspect saved curves.",
                "Write pseudocode and monitoring criteria for a reproducible training loop.",
                "ordering"
            ),
            moduleBlueprint(
                "Learn visual features with CNNs and augmentation",
                2,
                "A classifier memorizes background position and fails when objects move or lighting changes.",
                "Manipulate convolution kernels and preview transformations that preserve labels.",
                "Design a CNN and augmentation plan tied to plausible variation rather than random distortion.",
                "simulator"
            ),
            moduleBlueprint(
                "Adapt pretrained models for vision tasks",
                3,
                "A small labeled dataset cannot support training a large network from scratch, and the product needs locations rather than only image labels.",
                "Compare frozen and fine-tuned features and annotate classification, detection, and segmentation targets.",
                "Choose a transfer and output strategy for a stated dataset and resource budget.",
                "design-review"
            ),
            moduleBlueprint(
                "Track experiments, resources, and evaluation",
                3,
                "The best reported run cannot be reproduced and ignores GPU use, subgroup errors, and deployment limitations.",
                "Compare experiment records, CPU/GPU trade-offs, metrics, error examples, and model-card claims.",
                "Produce a transparent evaluation with resource and responsible-use analysis.",
                "data-lab"
            ),
        ],
        assignments: [
            assignment(
                "Optimization and training diagnosis",
                "Trace a small network design, plan a training-loop repair, and diagnose learner-created or openly licensed example loss and validation curves.",
                [2, 3]
            ),
            assignment(
                "Transfer-learning experiment plan",
                "Design an augmentation, transfer, tracking, and evaluation plan for a small vision dataset.",
                [4, 6]
            ),
        ],
        capstone: capstone(
            "Responsible computer-vision model study",
            "Build or analyze a custom vision model using a documented dataset, architecture, augmentation, training and validation, experiment tracking, errors, metrics, resources, a model card, and responsible-use limitations.",
            [
                "Documented dataset and task",
                "Architecture and augmentation rationale",
                "Training record or learner-created or lawfully obtained trace analysis",
                "Metrics and concrete error analysis",
                "Resource discussion and model card",
            ]
        ),
    },
    {
        id: "course-21",
        slug: "natural-language-processing-and-generative-ai",
        level: "advanced",
        weeks: 12,
        weeklyHours: 5,
        summary:
            "Explore tokenization, embeddings, classification, entities, transformers, attention, prompts, structured output, retrieval, hallucination checks, adaptation, evaluation, and responsible deployment.",
        description:
            "A provider-independent NLP course centered on guided token, context, retrieval, and grounding concepts plus learner-created project files. Learners may use a local tool outside the page, but the C4T simulator does not provide models, documents, embeddings, or generated output.",
        audience:
            "ML learners ready to build and evaluate text systems, including retrieval-grounded generative applications.",
        prerequisites: [
            "Python ML workflows and model-evaluation fundamentals",
        ],
        recommendedPriorCourses: ["course-16", "course-19"],
        outcomes: [
            "Inspect tokenization, embeddings, similarity, classification, and entity labels.",
            "Explain transformers, attention, tokens, and context limits.",
            "Validate prompts and structured outputs against explicit schemas.",
            "Build and evaluate a privacy-aware grounded document question-answering system.",
        ],
        tags: ["nlp", "generative-ai", "transformers", "rag", "evaluation"],
        icon: "messages",
        accent: "#6366F1",
        primaryTool: tool(
            "C4T Local NLP and Retrieval Lab",
            "compute",
            "A guided NLP and retrieval concept simulator. It does not create embeddings, ingest or chunk documents, retrieve passages, call a model, generate responses, or validate schemas.",
            [
                "Open the concept simulator and enter a short, non-sensitive example sentence.",
                "Compare two learner-entered vector examples using the guided similarity concept.",
                "Trace a learner-created retrieval example without uploading a personal document.",
            ],
            "Return one grounded answer with a matching source passage and valid structured fields.",
            "/learn/tools/nlp-retrieval-lab",
            [
                {
                    name: "Commercial language-model API",
                    description:
                        "Optional comparison only; never required and never used with private course documents.",
                },
            ]
        ),
        simulators: [
            simulator(
                "nlp-retrieval-lab",
                "Local NLP and Retrieval Lab",
                "Explore simplified text, context, retrieval, and grounding decisions without an external model account.",
                [
                    "Tokenization explorer",
                    "Embedding similarity",
                    "Classification and entity labeling",
                    "Attention and context budget",
                    "Prompt and schema comparison",
                    "Chunking and retrieval ranking",
                    "Citation and hallucination checks",
                ],
                [
                    "The page supplies no generative output or local model; learners evaluate examples they create or obtain through their chosen project tools.",
                ]
            ),
        ],
        freeCompletionPromise:
            "The always-free pathway combines NLP and retrieval concept simulations with learner-created prompt, document, and evaluation files. The C4T page does not supply documents, embeddings, or model output and does not call a paid API.",
        coreModules: [
            moduleBlueprint(
                "Prepare text and represent meaning",
                2,
                "A search system treats punctuation variants as unrelated while also merging words whose meanings differ by context.",
                "Compare tokenization choices and inspect word and sentence embedding neighborhoods.",
                "Design a preprocessing and representation plan for a small document collection.",
                "visualizer"
            ),
            moduleBlueprint(
                "Measure similarity and label text",
                2,
                "A support inbox needs topic labels and similar-case retrieval, but a single keyword produces misleading matches.",
                "Compare semantic similarity with classification decisions and inspect concrete errors.",
                "Build a labeled evaluation set for a local text triage task.",
                "data-lab"
            ),
            moduleBlueprint(
                "Extract entities and inspect transformers",
                2,
                "A document pipeline must identify people, places, and dates while preserving the context that changes their meaning.",
                "Label entity spans and follow tokens through a conceptual transformer architecture.",
                "Create an extraction record with uncertainty and a review path.",
                "diagram"
            ),
            moduleBlueprint(
                "Reason about attention and context budgets",
                2,
                "A long policy document exceeds a model's context and important definitions are dropped silently.",
                "Inspect attention views cautiously and allocate tokens among instructions, evidence, and output.",
                "Build a context budget that states what will be truncated or retrieved.",
                "simulator"
            ),
            moduleBlueprint(
                "Design prompts, schemas, and retrieval grounding",
                3,
                "A fluent response ignores requested fields and invents a source that was never retrieved.",
                "Compare prompts, validate structured output, chunk documents, and rank evidence.",
                "Produce a grounded answer object whose claims link to retrieved passages.",
                "debugging"
            ),
            moduleBlueprint(
                "Detect failure and evaluate adaptation choices",
                3,
                "A prototype is declared accurate after a few impressive demos without hallucination tests, privacy review, or a comparison to retrieval and adapters.",
                "Audit unsupported claims and compare prompting, retrieval, fine-tuning, and adapter trade-offs.",
                "Design an evaluation dataset, privacy controls, and deployment limits.",
                "design-review"
            ),
        ],
        assignments: [
            assignment(
                "Text representation and labeling lab",
                "Build a small tokenization, similarity, classification, and entity-label evaluation with documented errors.",
                [1, 3]
            ),
            assignment(
                "Grounded answer evaluator",
                "Use learner-selected non-sensitive documents to plan chunks, rank passages, validate an answer structure, and score citation support and hallucinations.",
                [5, 6]
            ),
        ],
        capstone: capstone(
            "Grounded document question-answering system",
            "Build a local document workflow with ingestion, chunking, retrieval, grounded answers, citations, structured output, hallucination checks, evaluation data, privacy safeguards, and documented limits.",
            [
                "Safe document ingestion and chunking",
                "Inspectable retrieval and ranking",
                "Grounded structured answers with citations",
                "Hallucination and evaluation dataset",
                "Privacy, limitations, and fallback behavior",
            ]
        ),
    },
    {
        id: "course-22",
        slug: "machine-learning-for-scientific-research",
        level: "advanced",
        weeks: 12,
        weeklyHours: 5,
        summary:
            "Turn research questions into reproducible ML experiments with literature context, dataset provenance, baselines, controls, uncertainty, ablations, sensitivity checks, leakage prevention, and scientific reporting.",
        description:
            "Learners select an accessible result and data source, then create a CPU-conscious reproduction plan and project files with freely installable or open tools. The emphasis is on claims, controls, provenance, uncertainty, reproducibility, and honest partial reproduction.",
        audience:
            "Advanced ML learners who want to use models as careful scientific instruments rather than demonstration generators.",
        prerequisites: [
            "Rigorous model evaluation, Python notebooks, and basic statistics",
        ],
        recommendedPriorCourses: ["course-19"],
        outcomes: [
            "Translate a research question into a falsifiable hypothesis and literature-grounded plan.",
            "Audit dataset provenance and design controls and baselines.",
            "Quantify uncertainty and plan ablations, sensitivity, and leakage checks.",
            "Reproduce a result and report evidence, discrepancies, and limitations scientifically.",
        ],
        tags: ["research", "machine-learning", "reproducibility", "statistics"],
        icon: "flask",
        accent: "#0EA5E9",
        primaryTool: tool(
            "C4T Reproducible Research Notebook",
            "compute",
            "A guided scientific-evidence concept simulator. It does not provide a notebook, papers, datasets, experiment templates, or reference runs.",
            [
                "Open the concept simulator and review its research-design scenario.",
                "Inspect a learner-created dataset provenance card.",
                "Create a baseline table from the learner's selected accessible data and freely installable or open tools.",
            ],
            "State a testable hypothesis and reproduce one documented baseline value within the stated tolerance.",
            "/learn/tools/research-notebook"
        ),
        simulators: [
            simulator(
                "scientific-evidence-lab",
                "Scientific Evidence Lab",
                "Practice hypothesis, provenance, controls, intervals, ablations, leakage, reproduction, and claim review.",
                [
                    "Research-question critique",
                    "Source and provenance audit",
                    "Experiment design board",
                    "Confidence-interval explorer",
                    "Ablation planner",
                    "Leakage and claim checker",
                ],
                [
                    "Guided prompts support method review but do not provide papers, datasets, experiment runs, or a substitute for reading the cited work.",
                ]
            ),
        ],
        freeCompletionPromise:
            "The always-free pathway combines scientific-method simulations with learner-created protocols, notebooks, and reports made in freely installable or open tools using learner-selected accessible sources. The C4T page does not provide datasets or run experiments.",
        coreModules: [
            moduleBlueprint(
                "Frame questions and review evidence",
                2,
                "A broad claim that AI improves science cannot be tested because its population, intervention, comparison, and outcome are undefined.",
                "Rewrite questions as testable hypotheses and compare source relevance and strength.",
                "Create a focused research question with a literature-context table.",
                "design-review"
            ),
            moduleBlueprint(
                "Audit datasets and experimental design",
                2,
                "A public dataset is convenient, but its collection process and connection to the target population are unknown.",
                "Trace provenance, licensing, measurement, sampling, exclusions, and experimental factors.",
                "Produce a dataset card and controlled experimental design.",
                "scenario"
            ),
            moduleBlueprint(
                "Establish baselines and reproducibility",
                2,
                "A complex method is reported without a simple comparison and cannot be rerun from the notebook state.",
                "Choose meaningful controls and record environment, seeds, data versions, and executable steps.",
                "Reproduce a baseline from a clean notebook run.",
                "code-editor"
            ),
            moduleBlueprint(
                "Quantify uncertainty",
                2,
                "Two reported means differ, but their variation and plausible ranges are omitted.",
                "Interpret statistical uncertainty and confidence intervals without treating them as guarantees.",
                "Add an uncertainty estimate and plain-language interpretation to a result.",
                "data-lab"
            ),
            moduleBlueprint(
                "Test components, sensitivity, and leakage",
                2,
                "A result may depend on one component, preprocessing choice, or leaked future information.",
                "Plan ablations, vary defensible assumptions, inspect error sensitivity, and audit leakage paths.",
                "Run or design a controlled ablation and sensitivity table.",
                "debugging"
            ),
            moduleBlueprint(
                "Reproduce and report scientific results",
                3,
                "A partial reproduction differs from the paper and the team is tempted to hide the discrepancy as a failed project.",
                "Compare methods and results, investigate discrepancies, and separate observations from claims.",
                "Write a transparent report explaining what reproduced, what did not, and why uncertainty remains.",
                "design-review"
            ),
        ],
        assignments: [
            assignment(
                "Research and provenance protocol",
                "Submit a testable hypothesis, focused literature table, dataset provenance audit, baseline, and controlled design.",
                [1, 3]
            ),
            assignment(
                "Uncertainty and ablation study",
                "Analyze confidence intervals, plan or execute an ablation, test sensitivity, and document leakage checks.",
                [4, 5]
            ),
        ],
        capstone: capstone(
            "Published-result reproduction study",
            "Reproduce or partially reproduce an accessible result with research context, provenance, method, baseline, controls, uncertainty, ablation or sensitivity, errors, a reproducible notebook, results, limits, and a scientific report.",
            [
                "Research question and literature context",
                "Dataset provenance and controlled method",
                "Baseline, uncertainty, and ablation evidence",
                "Reproducible notebook and result comparison",
                "Scientific report with discrepancies and limitations",
            ]
        ),
    },
    {
        id: "course-23",
        slug: "production-ml-cloud-deployment-and-mlops",
        level: "advanced",
        weeks: 12,
        weeklyHours: 6,
        summary:
            "Package, version, deploy, monitor, and recover ML services using local containers and simulations for batch, real-time, registries, pipelines, CI/CD, drift, canaries, costs, and incidents.",
        description:
            "A production-oriented course using guided MLOps concept simulations and learner-created service, container, monitoring, and incident files made with freely installable or open tools. The page does not run a service, container, registry, pipeline, or deployment.",
        audience:
            "Backend and ML practitioners preparing to operate reliable model-backed services.",
        prerequisites: [
            "Backend APIs, containers or command-line basics, and rigorous ML evaluation",
        ],
        recommendedPriorCourses: ["course-11", "course-19"],
        outcomes: [
            "Package batch and real-time model inference behind stable interfaces.",
            "Version models and data and assemble testable training or delivery pipelines.",
            "Use CI/CD, monitoring, drift evidence, canaries, and rollback safely.",
            "Analyze reliability, security, cost, performance, and incident response.",
        ],
        tags: [
            "mlops",
            "deployment",
            "containers",
            "monitoring",
            "reliability",
        ],
        icon: "cloud-gear",
        accent: "#0284C7",
        primaryTool: tool(
            "C4T Local MLOps Lab",
            "software",
            "A guided MLOps concept simulator. It does not run a service, validate a container, host a registry, execute CI, monitor traffic, or deploy a model.",
            [
                "Open the concept simulator and inspect its modeled service scenario.",
                "Change the available controls and record the decision trace.",
                "Create a separate service, container, registry, or monitoring design file with a freely installable or open tool.",
            ],
            "Document a health-check and model-version plan in a learner-created project file.",
            "/learn/tools/mlops-lab",
            [
                {
                    name: "Commercial cloud platform",
                    description:
                        "Optional comparison outside the C4T site; it may require an account or incur charges and is never part of the always-free path.",
                },
            ]
        ),
        extraRequirements: [
            tool(
                "Local container runtime",
                "software",
                "Optional learner-managed software for running project files outside the guided concept simulator.",
                [
                    "Complete the guided container-design concept activity first.",
                    "If installing a runtime, follow its official instructions for your operating system.",
                    "Use only learner-created or trusted local files and do not expose the service publicly.",
                ],
                "Submit the container design file or optional learner-run local health-check evidence requested by the assignment.",
                undefined
            ),
        ],
        simulators: [
            simulator(
                "local-mlops-lab",
                "Local MLOps Lab",
                "Provide registry, pipeline, deployment, monitoring, drift, rollback, cost, and incident exercises without cloud resources.",
                [
                    "Service architecture and container checks",
                    "Batch and real-time queues",
                    "Model registry and versions",
                    "Pipeline and CI design prompt",
                    "Latency, failure, and drift dashboard",
                    "Canary, rollback, cost, and incident scenarios",
                ],
                [
                    "Infrastructure behavior is simulated and does not establish readiness for a specific production provider.",
                ]
            ),
        ],
        freeCompletionPromise:
            "The always-free pathway combines MLOps concept simulations with learner-created service, container, monitoring, and incident files made in freely installable or open tools. The C4T page does not run or deploy services; paid cloud resources are optional.",
        coreModules: [
            moduleBlueprint(
                "Package inference as a service",
                2,
                "A notebook model works for its author but has no stable request contract, health signal, or repeatable environment.",
                "Separate model loading from request handling and validate a minimal container specification.",
                "Package a small local inference service with health and version endpoints.",
                "diagram"
            ),
            moduleBlueprint(
                "Choose deployment and inference modes",
                2,
                "A nightly scoring workload is forced through an expensive always-on API while an interactive request waits in a batch queue.",
                "Compare local and cloud deployment constraints and route workloads to batch or real-time paths.",
                "Design a deployment topology with explicit latency, volume, privacy, and failure assumptions.",
                "scenario"
            ),
            moduleBlueprint(
                "Version models, data, and registry records",
                2,
                "An incident report names model latest, but nobody can identify its training data, code, metrics, or predecessor.",
                "Link immutable model versions with data, code, evaluation, stage, and lineage metadata.",
                "Create a registry promotion record that can be reproduced and rolled back.",
                "simulator"
            ),
            moduleBlueprint(
                "Automate pipelines and integration checks",
                2,
                "A training pipeline runs steps in the wrong order and publishes artifacts even after tests fail.",
                "Build a dependency graph and debug CI checks for data, code, model, and service contracts.",
                "Create a fail-closed local pipeline from validation through candidate registration.",
                "debugging"
            ),
            moduleBlueprint(
                "Deploy continuously and monitor behavior",
                3,
                "A new model passes offline tests but increases tail latency and failures for live requests.",
                "Compare delivery strategies and interpret latency, errors, availability, data changes, and model drift.",
                "Define service objectives, alerts, drift review, and an evidence-gated release.",
                "data-lab"
            ),
            moduleBlueprint(
                "Roll back, optimize, and respond to incidents",
                3,
                "A canary degrades a key slice while responders lack a rollback trigger, cost boundary, or clear owner.",
                "Run canary and rollback decisions, estimate resource cost, and follow a structured incident timeline.",
                "Produce a secure rollback plan and post-incident improvement record.",
                "simulator"
            ),
        ],
        assignments: [
            assignment(
                "Versioned local inference service",
                "Package a tested service with health checks, immutable model identity, and batch or real-time rationale.",
                [1, 3]
            ),
            assignment(
                "Monitoring and deployment game day",
                "Interpret latency, failures, and drift, then execute a simulated canary decision, rollback, and incident review.",
                [5, 6]
            ),
        ],
        capstone: capstone(
            "Production-style ML application",
            "Deploy locally and monitor a packaged, container-compatible inference service with versioned model, automated workflow, health checks, logs, latency and failure monitoring, drift plan, rollback, cost and performance analysis, and security documentation.",
            [
                "Packaged local inference service",
                "Versioned model and automated checks",
                "Health, logging, latency, and failure evidence",
                "Drift, canary, and rollback plans",
                "Cost, performance, and security analysis",
            ]
        ),
    },
    {
        id: "course-24",
        slug: "agentic-coding-mcp-and-tool-using-ai",
        level: "advanced",
        weeks: 10,
        weeklyHours: 5,
        summary:
            "Design and supervise coding-agent workflows with repository exploration, plans, diffs, tests, tool schemas, MCP, APIs, permissions, approvals, and defenses against prompt injection and untrusted output.",
        description:
            "The always-free experience uses guided agent-workflow concept simulations and learner-created task, schema, permission, and evaluation files. The page does not provide a model, repository, tools, test runner, or sandbox; optional models are used outside the site.",
        audience:
            "Experienced developers who want to use or build tool-using coding agents without surrendering review, security, or accountability.",
        prerequisites: [
            "Git collaboration, backend APIs, testing, and command-line development",
        ],
        recommendedPriorCourses: ["course-08", "course-11", "course-23"],
        outcomes: [
            "Distinguish assistant and autonomous behavior and write bounded engineering tasks.",
            "Inspect repositories, critique plans and diffs, and require test evidence.",
            "Design validated tools and understand MCP client-server boundaries.",
            "Enforce permissions, approvals, and defenses against untrusted instructions and outputs.",
        ],
        tags: ["agents", "coding-agents", "mcp", "tool-calling", "security"],
        icon: "agent",
        accent: "#A855F7",
        primaryTool: tool(
            "C4T Deterministic Agent Sandbox",
            "compute",
            "A guided agent-policy concept simulator. It does not provide a repository, model, tools, MCP connection, attacks, diffs, approvals, or test output.",
            [
                "Open the concept simulator and review its modeled risk and permission values.",
                "Predict the approval decision, change the values, and inspect the explanatory trace.",
                "Create a separate task, permission, and evidence file with a freely installable or open tool.",
            ],
            "Identify one unnecessary permission and one piece of evidence needed before accepting a change.",
            "/learn/tools/agent-sandbox",
            [
                {
                    name: "Paid hosted model API",
                    description:
                        "Optional provider comparison using the learner's own approved key; never required or stored by the course.",
                },
                {
                    name: "Hosted coding-agent subscription",
                    description:
                        "Optional interface comparison after completing the provider-independent sandbox workflow.",
                },
            ]
        ),
        extraRequirements: [
            tool(
                "Optional local language model",
                "compute",
                "Optional learner-managed model software outside the site; the always-free path uses guided concepts and learner-created design files without model inference.",
                [
                    "Complete the guided concept activities first.",
                    "If using a local model, connect it only to a learner-created bounded project outside the C4T page.",
                    "Keep network and file permissions at the exercise minimum.",
                ],
                "Document the learner-created evaluation and permission boundaries; local-model results are optional comparison data.",
                undefined
            ),
        ],
        simulators: [
            simulator(
                "agent-workflow-sandbox",
                "Deterministic Agent Sandbox",
                "Explore simplified coding-agent risk, verification, permission, approval, and adversarial decisions without a model service.",
                [
                    "Task and prompt editor",
                    "Repository exploration trace",
                    "Plan and diff review",
                    "Test-failure diagnosis",
                    "Tool-schema and function-call validation",
                    "MCP architecture messages",
                    "Permission and approval builder",
                    "Prompt-injection and malicious-output cases",
                ],
                [
                    "Scripted model decisions are intentionally reproducible and do not represent every behavior of a live model.",
                ]
            ),
        ],
        freeCompletionPromise:
            "The always-free pathway combines agent-workflow concept simulations with learner-created task, tool-schema, permission, diff-review, and evaluation files. The C4T page does not provide a repository, model, tools, or test runner; paid model access is optional.",
        coreModules: [
            moduleBlueprint(
                "Scope assistants, agents, and engineering tasks",
                3,
                "A vague request to improve the app gives an automated coding system no boundary, acceptance test, or stopping condition.",
                "Classify autonomy levels, inspect available tools, and rewrite work as a bounded engineering task.",
                "Create a task contract with scope, constraints, evidence, and forbidden actions.",
                "design-review"
            ),
            moduleBlueprint(
                "Explore repositories and critique plans",
                2,
                "An agent proposes a framework rewrite before reading repository instructions, routes, or tests.",
                "Follow a read-only exploration trace and challenge unsupported plan assumptions.",
                "Produce a minimal evidence-based plan for a sandbox issue.",
                "code-trace"
            ),
            moduleBlueprint(
                "Review changes and verification evidence",
                2,
                "A convincing summary claims success even though the diff touches unrelated files and the test command failed.",
                "Review generated diffs and diagnose test, lint, and type-check output.",
                "Approve, request revision, or reject a change using line-specific evidence.",
                "design-review"
            ),
            moduleBlueprint(
                "Design tool calls and MCP connections",
                3,
                "A broadly typed tool accepts arbitrary commands and an MCP client treats server text as trusted instructions.",
                "Define narrow schemas, validate function calls, trace MCP client-server messages, and constrain API or database adapters.",
                "Build a provider-neutral tool contract with validated inputs and bounded outputs.",
                "diagram"
            ),
            moduleBlueprint(
                "Enforce permissions and approval points",
                2,
                "A low-risk documentation change inherits production credentials, writable system paths, and unsupervised deployment access.",
                "Design least-privilege file, process, network, secret, and human-approval boundaries.",
                "Create a permission manifest and approval flow for a coding task.",
                "simulator"
            ),
            moduleBlueprint(
                "Defend safe agent workflows",
                3,
                "A repository document and a tool response attempt to redirect the agent into exposing secrets and bypassing review.",
                "Identify prompt injection, quarantine untrusted output, verify claims, and preserve an auditable workflow.",
                "Complete a red-team scenario without granting unsafe authority or accepting unsupported results.",
                "debugging"
            ),
        ],
        assignments: [
            assignment(
                "Tool schema and approval design",
                "Specify narrow coding-agent tools, permission boundaries, validation, approval points, and audit evidence.",
                [4, 5]
            ),
            assignment(
                "Adversarial diff-review exercise",
                "Inspect a repository, critique a plan and diff, diagnose checks, and resist injected instructions in content and tool output.",
                [2, 6]
            ),
        ],
        capstone: capstone(
            "Safe sandboxed coding agent",
            "Build or configure an agent that inspects a sandbox repository, plans, makes scoped edits, runs checks, reviews its diff, respects permissions, requires sensitive-action approval, handles untrusted content, and produces an auditable report.",
            [
                "Bounded task and repository exploration",
                "Scoped plan, edit, and diff evidence",
                "Tests, lint, and type-check results",
                "Permission and approval enforcement",
                "Injection handling and auditable final report",
            ]
        ),
    },
    {
        id: "course-25",
        slug: "custom-agent-harnesses-evaluations-and-multi-agent-systems",
        level: "advanced",
        weeks: 14,
        weeklyHours: 6,
        summary:
            "Engineer secure agent runtimes, sandboxes, traces, evaluations, graders, routing, multi-agent roles, loop controls, approvals, rollbacks, adversarial tests, and measurable improvement cycles.",
        description:
            "An advanced engineering capstone using guided runtime and orchestration concept simulations plus learner-created harness, trace, grader-design, routing, and security files. The page does not provide a runtime, repository, model, grader, sandbox, or execution fixture.",
        audience:
            "Advanced engineers prepared to build, attack, measure, and improve custom agent systems rather than only prompt an existing product.",
        prerequisites: [
            "Safe tool-using agents, MLOps reliability, Git workflows, and software testing",
        ],
        recommendedPriorCourses: ["course-23", "course-24"],
        outcomes: [
            "Implement an observe-plan-act-verify runtime with bounded tools, context, recovery, and traces.",
            "Sandbox execution and enforce file, process, time, and network policy.",
            "Build deterministic and carefully justified model-based evaluations resilient to gaming.",
            "Coordinate supervised agents with routing, loop controls, human approvals, rollback, and security evidence.",
        ],
        tags: [
            "agent-harness",
            "evaluation",
            "multi-agent",
            "sandboxing",
            "security",
        ],
        icon: "network",
        accent: "#D946EF",
        primaryTool: tool(
            "C4T Local Agent Harness Lab",
            "compute",
            "A guided agent-harness concept simulator. It does not run an agent, sandbox code, provide a repository or model, call tools, record real traces, grade work, or coordinate agents.",
            [
                "Open the concept simulator and review its modeled risk, permission, and verification values.",
                "Predict the policy decision, change one value, and inspect the explanatory trace.",
                "Create separate harness, trace, and grader-design files with a freely installable or open tool.",
            ],
            "Document a bounded learner-created task with a proposed trace, deterministic grading rule, and stop condition.",
            "/learn/tools/agent-harness-lab",
            [
                {
                    name: "Paid model API",
                    description:
                        "Optional learner-managed benchmark outside the C4T site; credentials and cost limits remain the learner's responsibility.",
                },
                {
                    name: "Hosted evaluation platform",
                    description:
                        "Optional reporting comparison outside the C4T site; it is never part of the always-free path.",
                },
            ]
        ),
        extraRequirements: [
            tool(
                "Optional local model runtime",
                "compute",
                "Optional learner-managed model software for a project outside the C4T page; guided concepts and design files remain the always-free path.",
                [
                    "Begin with the guided policy concept simulation.",
                    "Connect a local model only through a learner-created bounded adapter outside the C4T page.",
                    "Set explicit token, time, process, file, and network budgets.",
                ],
                "Define deterministic learner-created checks before treating any local-model comparison as valid.",
                undefined
            ),
        ],
        simulators: [
            simulator(
                "multi-agent-harness-lab",
                "Local Agent Harness Lab",
                "Explore simplified runtime, sandbox-policy, trace-design, evaluation, routing, coordination, approval, and rollback decisions without hosted models.",
                [
                    "Observe-plan-act-verify runtime",
                    "Tool-schema validator",
                    "Context and memory budget",
                    "Sandbox permission builder",
                    "Timeout and retry policy",
                    "Trace and audit inspector",
                    "Deterministic and model-based grader design prompt",
                    "Hidden-test and reward-hacking lab",
                    "Routing and multi-agent message flow",
                    "Loop, approval, and rollback controls",
                ],
                [
                    "The page does not run a mock or live model; deterministic control values illustrate policy relationships only.",
                ]
            ),
        ],
        freeCompletionPromise:
            "The always-free pathway combines multi-agent concept simulations with learner-created harness, trace, grader-design, routing, and security files. The C4T page does not provide a runtime, repository, model, grader, or sandbox; paid model and evaluation services are optional.",
        coreModules: [
            moduleBlueprint(
                "Build the runtime loop and tools",
                4,
                "A custom agent calls tools directly from model text without a stable lifecycle, schema validation, or explicit memory boundary.",
                "Implement observe-plan-act-verify transitions, validate tool schemas, and allocate context and memory.",
                "Produce a deterministic single-agent run whose state and tool decisions can be replayed.",
                "simulator"
            ),
            moduleBlueprint(
                "Sandbox execution and recover safely",
                4,
                "A generated test command can access broad files and networks, then hangs indefinitely when the process never exits.",
                "Configure code isolation, file and network permissions, timeouts, bounded retries, and failure recovery.",
                "Demonstrate denied access, timeout cleanup, and safe retry behavior.",
                "debugging"
            ),
            moduleBlueprint(
                "Record traces and build evaluation data",
                4,
                "A success score cannot be audited because intermediate observations and actions were discarded and evaluation tasks changed between runs.",
                "Capture complete traces, protect audit logs, version task datasets, and write deterministic graders.",
                "Create a replayable evaluation task with an unambiguous deterministic result.",
                "data-lab"
            ),
            moduleBlueprint(
                "Evaluate models and resist gaming",
                4,
                "A harness improves its visible score by exploiting the grader while hidden behavior, latency, token use, and cost worsen.",
                "Compare deterministic and model-based graders, hidden tests, operational metrics, reward-hacking cases, and prompt-injection attacks.",
                "Design an adversarial evaluation that detects superficial success and grader exploitation.",
                "scenario"
            ),
            moduleBlueprint(
                "Route work across specialized agents",
                4,
                "A single model handles every task poorly, while several agents duplicate work and pass contradictory context.",
                "Compare model and tool routing and define supervisor, planner, worker, reviewer, and communication responsibilities.",
                "Build a message protocol and routing policy with explicit ownership and evidence handoffs.",
                "visualizer"
            ),
            moduleBlueprint(
                "Control loops, approvals, and secure delivery",
                4,
                "Agents repeatedly delegate the same task and continue changing a repository after checks pass, with no human stop or rollback.",
                "Enforce loop and budget controls, approvals, rollback, auditable pull-request workflows, and secure multi-agent evaluation.",
                "Deliver a bounded orchestration run with approval gates, rollback evidence, and a security review.",
                "simulator"
            ),
        ],
        assignments: [
            assignment(
                "Bounded single-agent harness",
                "Build the observe-plan-act-verify loop with validated tools, context strategy, sandbox policy, retries, cleanup, and a complete trace.",
                [1, 2]
            ),
            assignment(
                "Adversarial evaluation and routing suite",
                "Create versioned tasks, deterministic and justified model-based graders, hidden checks, attacks, metrics, and a multi-agent routing policy.",
                [3, 5]
            ),
        ],
        capstone: capstone(
            "Secure evaluated multi-agent engineering system",
            "Design, deploy locally, attack, evaluate, and improve a system with supervisor, planner, worker, reviewer, permission boundaries, context strategy, communication, loop controls, approvals, rollback, deterministic and justified model-based evaluation, adversarial cases, injection and reward-hacking analysis, operational metrics, security reporting, and a final demonstration.",
            [
                "Learner-created repository plan and bounded runtime design",
                "Role, routing, memory, and communication design",
                "Versioned evaluation tasks and graders",
                "Adversarial, injection, and reward-hacking results",
                "Success, latency, token, cost, and security improvement report",
            ]
        ),
    },
];

const INTERNAL_TOOL_PREFIX = "/learn/tools/";
const NON_EXECUTION_NOTE =
    "This guided page does not execute code, train models, run databases, create repositories, access hardware, or provide hosted infrastructure.";

const removeMisclassifiedPaidOptions = (paidOptions = []) =>
    paidOptions.filter(
        ({ name }) => !/(github(?: free)?|unity(?: personal)?)/i.test(name)
    );

const conceptSimulatorName = (name) => {
    const base = name
        .replace(
            /\b(?:Lab|Studio|Workbench|Notebook|Playground|Simulator)\b$/i,
            ""
        )
        .trim();
    return `${base} Concept Simulator`;
};

const normalizeToolClaims = (resource) => {
    const paidOptions = removeMisclassifiedPaidOptions(resource.paidOptions);
    const isInternalConceptTool =
        resource.url?.startsWith(INTERNAL_TOOL_PREFIX);

    if (isInternalConceptTool) {
        return {
            ...resource,
            name: conceptSimulatorName(resource.name),
            description:
                "A free browser concept simulator with adjustable values, a prediction prompt, deterministic feedback, and a short explanatory trace. " +
                NON_EXECUTION_NOTE,
            setupSteps: [
                "Open the concept simulator and read its scenario, assumptions, and limitations.",
                "Make a prediction, adjust the available controls, and compare the result with the explanation.",
                "Record what changed and why; repeat with at least one different input.",
                "For applied work, follow the course instructions to create and keep your own project files with a freely installable or open tool appropriate to the subject.",
            ],
            verification:
                "Complete one prediction-and-explanation cycle and record the evidence you would carry into a learner-created project file.",
            paidOptions,
        };
    }

    if (!resource.url && ["software", "compute"].includes(resource.category)) {
        return {
            ...resource,
            description:
                "Optional learner-managed software for extending project files outside the guided concept simulator. It is not supplied, installed, connected, or run by this site.",
            setupSteps: [
                "Complete the guided browser concept activity first.",
                "If you choose a local tool, select a freely installable or open option appropriate to the assignment and follow its own current documentation.",
                "Keep credentials out of project files and preserve the course's file, process, time, and network boundaries.",
            ],
            verification:
                "Submit the learner-created file or documented design evidence requested by the assignment; the C4T page does not verify local execution.",
            paidOptions,
        };
    }

    return {
        ...resource,
        paidOptions,
    };
};

const normalizeSimulatorClaims = (definition) => ({
    ...definition,
    name: conceptSimulatorName(definition.name),
    purpose:
        "Explore course concepts through adjustable values, prediction, deterministic feedback, and an explanatory trace.",
    capabilities: [
        "Adjust values in a guided course-related scenario",
        "Predict an outcome before revealing feedback",
        "Inspect a deterministic conceptual trace",
        "Repeat with different inputs and record observations",
    ],
    limitations: [
        NON_EXECUTION_NOTE,
        "The simplified model teaches relationships and decision-making; it is not a substitute for component documentation, project software, empirical measurements, or production testing.",
    ],
});

const honestBlueprints = blueprints.map((blueprint) => ({
    ...blueprint,
    description:
        blueprint.id === "course-02"
            ? blueprint.description
            : `${blueprint.summary} The course combines structured lessons, guided browser concept simulations, and learner-created project files made with freely installable or open tools described in the course instructions. ${NON_EXECUTION_NOTE}`,
    primaryTool: normalizeToolClaims(blueprint.primaryTool),
    extraRequirements: (blueprint.extraRequirements || []).map(
        normalizeToolClaims
    ),
    simulators: blueprint.simulators.map(normalizeSimulatorClaims),
}));

module.exports = Object.freeze(honestBlueprints);
