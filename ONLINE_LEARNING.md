# C4T Online Learning Platform

A full learning platform for the 25-course Code 4 Tomorrow curriculum:
accounts, enrollment, server-verified progress, instructor grading, and
verifiable PDF certificates. Course content lives in version control; learner
data lives in Postgres. The website's existing Contentful and Notion
integrations are untouched.

**Setting this up for the first time? Start with [SETUP.md](SETUP.md).**

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
-   `learning/learning-path-definitions.js` defines the seven ordered learning
    paths through the catalog (CommonJS so the Node validator can check them).
-   `learning/learning-paths.ts` wraps those definitions with typed helpers that
    resolve course ids, total hours, capstones, and per-course path membership.

Paths mark each course as `core` (counts toward finishing the path) or
`foundation` (a recommended on-ramp). Prerequisites are advisory throughout —
`recommendedPriorCourses` links to earlier courses but never blocks enrollment,
so an experienced learner can start anywhere.

Each course has eight modules: free setup, six connected core modules, and a
capstone/reflection module. Every module has three substantive lessons, guided
practice, an interaction, a checkpoint, application guidance, and remediation.
Every course also has two applied assignments, a final assessment or capstone,
self-paced and weekly pacing templates, and configurable certificate rules.

### Learner application

-   `/courses` — searchable and filterable 25-course catalog, the learning-path
    overview, and a link section for the instructor-led Notion course library.
-   `/courses/[courseSlug]` — course overview, free setup walkthrough,
    prerequisites, recommended prior courses, learning-path membership,
    outcomes, projects, certificate rules, and full outline.
-   `/learn/paths` — the seven learning paths with per-course status, path
    completion, and a recommended next course.
-   `/learn/courses/[courseSlug]/lessons/[lessonSlug]` — interactive lesson
    player with scenario, explanation, worked example, simulator, practice,
    feedback, checkpoint, progress, and resume behavior.
-   `/learn/tools/[toolSlug]` — standalone free browser labs and hardware/compute
    simulations.
-   `/learn/dashboard` — active courses, real learning activity, pacing status,
    milestones, and cross-device resume links.
-   `/learn/assignments` — checkpoints, project rubrics, submissions, scores, and
    attempt history.
-   `/learn/assignments/completed` — completed-assignment review.
-   `/learn/assignments/[assignmentId]` — per-assignment report: best score,
    attempts used, full attempt history, rubric, and lessons to revisit.
-   `/learn/progress` — progress, learning time, streaks, and course summaries.
-   `/learn/achievements` — points and earned badges.
-   `/learn/certificates` — per-requirement eligibility, certificate issuance,
    and PDF download.
-   `/learn/onboarding`, `/login`, `/login/check-email` — account setup.
-   `/certificate/verify/[certificateId]` — public verification (no sign-in).
-   `/admin`, `/admin/courses`, `/admin/users`, `/admin/audit` — staff tools.

### Accounts, progress, and privacy

Learners sign in with **email + password** or **GitHub OAuth**; passwordless
magic links are available when SMTP is configured. All three use NextAuth
database sessions, so a session can be revoked server-side at any time.

Passwords are bcrypt hashed (cost 12) in `User.passwordHash`, which stays null
for OAuth-only accounts. `lib/password-auth.ts` compares against a dummy hash
when an account is missing, so a failed lookup takes the same time as a wrong
password, and sign-in returns one identical message either way — the form
cannot enumerate accounts. Registration necessarily reports that an address is
taken, which is unavoidable for a usable sign-up. Both routes are rate limited,
by source address and by the email being targeted.

Enrollments, lesson
progress, submissions, grades, activity time, points, badges, and certificates
live in **Postgres via Prisma**, so progress follows a learner across devices.

Course _content_ stays in version control under `learning/` — it is reviewed,
diffed, and validated in CI. The database only ever stores data about people,
referencing content by the stable ids the registry emits. Re-authoring a lesson
never orphans a learner's progress.

**Everything that matters is decided on the server.** A client may report which
interaction it finished; it may never report a completion percentage, a score,
or a pass. Specifically:

-   A lesson completes only when its required interaction is recorded
    (`lib/progress.ts`), and the completion timestamp is set once, server-side.
-   Module checkpoints, applied assignments, and the final assessment are all
    **reviewed by an instructor**. `/api/admin/grade` is the only route that can
    set a score or approve work, and it requires an `INSTRUCTOR` or `ADMIN`
    role. A learner cannot approve their own work — this is what makes the
    certificate mean something.
-   Certificates are issued only after `lib/certificates.ts` re-verifies every
    requirement. Issuance is idempotent via a unique `(userId, courseId)` index.
-   Points use an `(userId, idempotencyKey)` unique index, so a replayed request
    is a no-op rather than free points.
-   Active learning time is capped per flush (30 min) and per day (12 h), and
    only accrues while the tab is visible and recently interacted with.

Personal data is kept minimal: a display name (not necessarily a legal name), an
optional experience level, interests, weekly goal, time zone, and accessibility
preferences. The public certificate-verification page shows the display name,
course, and date — never an email address or any coursework.

### Authentication and roles

| Role             | Capabilities                                          |
| ---------------- | ----------------------------------------------------- |
| `LEARNER`        | Enroll, learn, submit work, earn certificates         |
| `INSTRUCTOR`     | Grade submissions at `/admin`                         |
| `CONTENT_EDITOR` | Publish/unpublish courses at `/admin/courses`         |
| `ADMIN`          | Manage roles, revoke certificates, read the audit log |

Roles are enforced on the server in `lib/guards.ts` (pages) and `lib/api.ts`
(API routes). Client-side checks are only ever cosmetic.

The first administrator on a fresh database is bootstrapped with
`INITIAL_ADMIN_EMAILS` (comma-separated), applied on sign-in. After that, roles
are managed at `/admin/users` or with `npm run db:make-admin`.

### Role preview ("view as")

An administrator can preview the site as a learner, instructor, or content
editor from the bar at the top of `/admin`. While previewing, an amber banner is
pinned to every page with the way out.

The preview is **enforced, not cosmetic**: `resolveEffectiveRole` in
`lib/view-as.ts` feeds both the page guards and the API handler, so an admin
previewing as a learner is genuinely refused by `/admin` and `/api/admin/*`.

It can only ever *narrow* access, which is why the preview cookie needs no
signing:

-   The cookie is honoured only when the account's real role — read from the
    database-backed session, never from the cookie — is `ADMIN`.
-   `ADMIN` is not a previewable target, so the cookie cannot restore or grant
    privilege.
-   A learner who forges the cookie gains nothing.
-   Ending a preview is authorised against the *real* role, so an admin
    previewing as a learner can always switch back.

Previewing does not touch data: the admin's own enrollments, progress, and
submissions are their own, which is what makes it useful for walking the learner
flow end to end.

## Development

**New here? Follow [SETUP.md](SETUP.md)** — it walks through creating a free
Neon database, GitHub OAuth, and email sign-in step by step.

```bash
npm install
cp .env.example .env      # then fill it in — see SETUP.md
npm run db:migrate
npm run db:seed
npm run dev
```

Run the curriculum validator:

```bash
npm run validate:curriculum
```

Run the checks:

```bash
npx tsc --noEmit
npm run lint
npm test
```

Required environment variables are documented in `.env.example`. The learning
platform needs `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, and at least
one sign-in provider. Contentful and Notion credentials are only needed by the
pre-existing marketing pages and the legacy course library.

## Deployment

`npm run build` prerenders every course, lesson, and assignment page from the
local registry — none of that needs credentials. Two things still do:

-   `/courses/[...slug]` (the instructor-led Notion library) calls Contentful in
    `getStaticPaths` and **fails the build** when `CONTENTFUL_SPACE_ID` and
    `CONTENTFUL_ACCESS_TOKEN` are missing or invalid. Set them, or remove that
    page if the Notion library is being retired.
-   The instructor-led library section on `/courses` uses the same credentials
    but is wrapped in a try/catch: without them it logs a warning and hides the
    section rather than failing the build.

`REDIS_URL` is optional. Without it the Notion sitemap cache falls back to the
build cache and `ioredis` logs connection errors that do not stop the build.

Because learner progress lives in `localStorage`, the learning platform itself
needs no database, no session secret, and no OAuth application to deploy.

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
creator attribution. It also rejects a learning path with a duplicate slug, an
unknown or repeated course, an invalid role, or no `core` course, and fails when
any course is missing from every path. Progress, completion, eligibility, pacing, and
streak logic live in `lib/progress.ts` and are covered by `npm test`.

## Known limitations

-   **Graded work needs a human.** The authored curriculum assesses with
    open-ended rubric prompts rather than multiple-choice answer keys, so
    checkpoints and projects are instructor-reviewed. A learner working entirely
    alone can complete every lesson but cannot reach a certificate until someone
    with an `INSTRUCTOR` role grades their submissions. Auto-graded question
    banks would need answer keys that the current content does not have.
-   **Rate limiting is per-instance.** `lib/rate-limit.ts` is in-memory, so on a
    serverless host each warm instance keeps its own counters. It stops runaway
    clients; it is not a distributed guarantee. The real protection against
    replay is the set of unique constraints and idempotency keys in the schema.
-   **Email sign-in needs SMTP.** Without `EMAIL_SERVER_*` configured, only
    GitHub sign-in is offered. The login page adapts automatically.
-   **The pre-existing marketing pages still need Contentful.** `/`, `/about`,
    `/contact`, `/volunteer`, `/news`, `/internships`, `/jobboard`, `/learn`,
    and `/courses/[...slug]` fetch from Contentful at build time and fail the
    production build without valid credentials. This predates the learning
    platform, which builds cleanly on its own. See SETUP.md step 7.
