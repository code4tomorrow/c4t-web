# C4T Online Learning Platform

This repository now contains a version-controlled, always-free online learning
path for the 25-course Code 4 Tomorrow curriculum. The public website's
Contentful and Notion integrations remain available for legacy content, while
the new curriculum, lesson structure, simulators, validation, and local learner
progress live in the repository.

## Free-access guarantee

Every course must satisfy all of the following rules:

-   The first module is a guided **Start here: free setup** module.
-   The course can be completed without a payment method, subscription, paid
    API, cloud credit, GPU, or physical hardware.
-   Every software, account, compute, dataset, and hardware requirement has a
    documented free path.
-   Paid services may appear only as clearly optional comparisons.
-   Hardware courses include a no-hardware browser simulation and safety
    guidance for learners who optionally use physical equipment.
-   Advanced AI and agent courses include deterministic browser fixtures that do
    not require model tokens. Local or paid models are optional extensions.
-   Course pages display `Course created by Zafir Shamsi.` in small text.

These invariants are enforced by the curriculum validator rather than relying
on individual page authors to remember them.

## Architecture

### Curriculum

-   `learning/source-curriculum.js` is the canonical inventory of every supplied
    source topic.
-   `learning/course-blueprints.js` contains course-specific descriptions,
    audiences, outcomes, setup paths, six core module blueprints, projects,
    capstones, simulators, and free alternatives.
-   `learning/build-course-registry.js` builds the fully structured curriculum.
-   `learning/course-registry.ts` exposes the typed catalog to Next.js.
-   `learning/course-models.ts` defines courses, modules, lessons, interactions,
    assessments, requirements, pacing, certificate rules, and coverage records.
-   `learning/curriculum-coverage.ts` exposes the machine-readable mapping from
    each source topic to its lesson and activity.

Each course has eight modules: free setup, six connected core modules, and a
capstone/reflection module. Every module has three substantive lessons, guided
practice, an interaction, a checkpoint, application guidance, and remediation.
Every course also has two applied assignments, a final assessment or capstone,
self-paced and weekly pacing templates, and configurable certificate rules.

### Learner application

-   `/courses` — searchable and filterable 25-course catalog.
-   `/courses/[courseSlug]` — course overview, free setup walkthrough,
    prerequisites, outcomes, projects, certificate rules, and full outline.
-   `/learn/courses/[courseSlug]/lessons/[lessonSlug]` — interactive lesson
    player with scenario, explanation, worked example, simulator, practice,
    feedback, checkpoint, progress, and resume behavior.
-   `/learn/tools/[toolSlug]` — standalone free browser labs and hardware/compute
    simulations.
-   `/learn/dashboard` — active courses, real local learning activity, milestones,
    and resume links.
-   `/learn/assignments` — checkpoints, project rubrics, submissions, scores, and
    attempt history.
-   `/learn/assignments/completed` — completed-assignment review.
-   `/learn/progress` — progress, learning time, streaks, and course summaries.
-   `/learn/achievements` — points and earned badges.
-   `/learn/certificates` — eligibility and printable local certificates.

### Progress and privacy

The always-free path does not require an account. Enrollments, lesson
completion, interactions, quiz and assignment attempts, active learning time,
resume positions, points, badges, safety acknowledgements, and certificates are
stored in browser `localStorage` under `c4t:learning-progress:v1`.

Activity time counts only while the page is visible, focused, and recently
interactive. The learner can export, import, or reset their local data, and
cross-tab changes are synchronized.

This storage is deliberately private and free, but it is device-local rather
than cross-device. Clearing browser storage removes it unless the learner first
exports a backup. A server account/sync provider can be added later without
removing this guest pathway.

## Development

Install dependencies:

```bash
npm ci
```

Run the curriculum validator:

```bash
npm run validate:curriculum
npm run validate:learning
```

Run type checking, linting, and the development server:

```bash
npx tsc --noEmit
npx next lint
npm run dev
```

The repository's existing public pages still require the Contentful and Notion
variables documented in `env.template`. The local curriculum and learner
experience do not require those credentials.

## Content-authoring rules

When editing or adding a course:

1. Update the canonical source topic inventory if the approved curriculum
   changes.
2. Update the corresponding course blueprint with complete module allocations,
   setup guidance, free paths, assignments, and capstone.
3. Never make a paid or physical resource the only path.
4. Add a safe simulator or supplied-data path for hardware and expensive
   compute.
5. Keep paid tools explicitly optional.
6. Run `npm run validate:curriculum`.
7. Open the course, first setup lesson, a core lesson, assignments page, and
   certificate page at mobile and desktop sizes.

The validator rejects missing topics, courses, modules, lessons, assessments,
free alternatives, simulators, pacing, certificate rules, safety guidance, or
creator attribution. The learning-state validator rejects malformed or
oversized progress backups and checks interaction-gated lesson completion,
course-specific checkpoint thresholds, and course-completion status.

## Current limitation

The included certificate is a learner-controlled, device-local record suitable
for the free self-paced pathway. It is not an identity-verified credential and
does not claim instructor review. A future authenticated backend can add
cross-device synchronization, instructor grading, and public certificate
verification while keeping all course content and simulations freely
accessible.
