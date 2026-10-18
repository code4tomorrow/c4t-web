# Go-live checklist

How to put this branch on code4tomorrow.org when the person who manages
the Vercel account is unavailable and you only have GitHub access.

It happens in two stages:

1. **Ship the site now, with GitHub alone.** Everything goes live except
   student accounts, which stay switched off on their own.
2. **Turn on student accounts** once someone can add environment variables
   to the existing Vercel project. Nothing in the code changes for this
   step.

[SETUP.md](SETUP.md) covers running your own copy. This file is about the
real site.

---

## What you can and can't do without Vercel access

-   **Deploying code works.** The Vercel project (team `c4t-website-team`,
    project `c4t-web`) is connected to `code4tomorrow/c4t-web` on GitHub.
    Every push to `master` deploys to code4tomorrow.org within minutes,
    whoever pushes it. You're a GitHub admin of the repo, so you can push.
-   **Settings don't.** Environment variables can only be changed by a
    member of that Vercel team. The live project has the Contentful,
    SendGrid, Notion and revalidation keys, but none of the ones student
    accounts need (database, sign-in secret, GitHub OAuth).
-   **Secrets can't go in the code.** The repo is public, so anything
    committed is readable by anyone.

Because of this, the site checks for its database and sign-in secret when
it runs (`lib/platform.ts`). Without them, accounts switch off cleanly
instead of erroring:

-   **Lessons stay open to read.** Every lesson, with its lab, can be read
    without signing in. A note says account access is coming soon, and
    nothing is saved.
-   **Course pages** show a "Start reading" button in place of Enroll.
-   **Sign-in, dashboard, assignments, certificates and admin** go to an
    "Account access is coming soon" page, and account APIs answer 503.

The rest of the site works normally.

---

## 1. Rotate the credentials you pasted into chat 🔴

You sent these in a chat message, so treat them as exposed. None of them
was ever committed (`.env` is gitignored), but rotate them anyway, in this
order:

| Credential                 | Rotate now?                                        | Where                                                         |
| -------------------------- | -------------------------------------------------- | ------------------------------------------------------------- |
| Neon database password     | **Yes.** The live site doesn't use it yet.         | Neon console → your project → **Roles** → Reset password      |
| GitHub OAuth client secret | **Yes.** Only your local copy uses it.             | github.com/settings/developers → your app → **Generate a new secret** |
| Contentful tokens (both)   | **Not yet.** The live site reads them.             | Contentful → Settings → **API keys**                          |
| Notion API key             | **Not yet.** The live About page reads it.         | notion.so/my-integrations → your integration → **Refresh secret** |

Rotating the Contentful tokens today would break the live homepage, news
and job pages, because nobody can put the new tokens into the Vercel
project. Rotating the Notion key would freeze the About page on its saved
copy. Rotate both once you can edit the Vercel project (stage 2), and put
the new values there.

**Don't paste the new values into a chat.** Put them straight into `.env`
and your host's dashboard.

---

## 2. Stage 1: ship with GitHub alone

Open a pull request so the other admins can see what's changing:

```bash
git push -u origin online-modules
gh pr create --base master --head online-modules \
  --title "Online courses, Fall 2026 classes, and a faster site"
```

GitHub shows a Vercel preview link on the PR. Click through it first.
Merging the PR, or pushing straight to master
(`git push origin online-modules:master`), puts it live within minutes.
There's no staging step and no automated test run between the push and
production.

**Then check:**

| Page                                      | Expected                                                  |
| ----------------------------------------- | --------------------------------------------------------- |
| `/`                                       | Fall/Winter sessions, flyer, banner "Student Registration 📋 Open!" linking to the Google Form |
| `/about`                                  | new stats; team roles from Notion                         |
| `/courses`                                | 25 self-paced courses; "Fall 2026 live classes" tab shows 4 |
| `/courses/android-studio-app-development` | schedule, week-by-week plan, Register button, "Start reading" |
| `/login`                                  | goes to "Account access is coming soon"                   |
| any lesson, e.g. "Start reading" on a course | opens without signing in, with an "Account access coming soon" note |
| `/courses/home`                           | redirects to `/courses` (old Notion library)              |

---

## 3. Stage 2: turn on student accounts

Accounts need six environment variables added to the **existing** Vercel
project (team `c4t-website-team`, project `c4t-web`), which keeps its
domain, history and current settings. That takes someone with access to
that team. If its owner stays unreachable, contact Vercel support as the
GitHub organization admin, explain the owner is gone, and ask to be added
to the team. This isn't guaranteed.

Until then the site runs with accounts off, and nothing needs to change
when they're turned on: add the variables and redeploy.

---

## 4. Environment variables to add

| Variable                     | Value                                                     |
| ---------------------------- | --------------------------------------------------------- |
| `DATABASE_URL`               | Neon connection string (with the **new** password)        |
| `NEXTAUTH_SECRET`            | Generate fresh: `openssl rand -base64 32`                 |
| `NEXTAUTH_URL`               | `https://www.code4tomorrow.org` (no trailing slash)       |
| `NEXT_PUBLIC_SITE_URL`       | `https://www.code4tomorrow.org`                           |
| `GITHUB_ID`, `GITHUB_SECRET` | From the production OAuth app (step 5)                    |
| `INITIAL_ADMIN_EMAILS`       | `shamsizafir@gmail.com,ishanya.malik@gmail.com`           |

Contentful, SendGrid, Notion and the revalidation token are already in
the project; leave them alone. Once you have access, rotate the Contentful
tokens and the Notion key (step 1) and update them there.

---

## 5. Point GitHub OAuth at production

Sign-in has never run on the live site, so there's no production OAuth
app to reuse. A GitHub OAuth app has exactly one callback URL, and yours
points at `localhost:3000`.

At **github.com/settings/developers**, create a **second OAuth App**
(recommended, so local sign-in keeps working):

```
Homepage URL:   https://www.code4tomorrow.org
Callback URL:   https://www.code4tomorrow.org/api/auth/callback/github
```

---

## 6. Prepare the production database

Run once from your machine, against the production connection string:

```bash
DATABASE_URL="postgresql://...new-password..." npm run db:migrate
DATABASE_URL="postgresql://...new-password..." npm run db:seed
```

`db:migrate` creates the tables. `db:seed` publishes every course (the 25
self-paced courses and the 4 Fall 2026 live classes) and never overwrites
a status an admin has already changed, so it's safe to re-run. **Run it
again whenever courses are added**, or they show "Not open for enrollment
yet". It skips the demo accounts when `NODE_ENV=production`; if you seeded
this database from your laptop, delete `demo.learner@example.invalid` and
`demo.instructor@example.invalid` at /admin/users.

You and Ishanya become admins automatically the first time you sign in
**with GitHub**, because both emails are in `INITIAL_ADMIN_EMAILS`. Email
+ password sign-ups are not promoted (a password account never proves it
owns the address), so if Ishanya signs up that way, promote her at
/admin/users.

**Then check:** sign in with GitHub and land on `/learn/dashboard`;
`/admin` opens for you and 404s for everyone else; enroll, finish a
lesson, and confirm the certificate PDF downloads and its verify page
says "Valid".

---

## The session schedule (automatic)

The site changes by itself on the dates in `utils/sessionSchedule.ts`
(Eastern time):

| From              | Homepage banner                     | Fall 2026 card                                   | Register button |
| ----------------- | ----------------------------------- | ------------------------------------------------ | --------------- |
| now               | Student Registration 📋 Open!       | "Sign up by October 25"                          | under Fall      |
| Oct 26            | Open!                               | "Registration is open until November 21"         | under Fall      |
| Nov 1             | Open!                               | "Classes started the first week of November"     | under Fall      |
| **Nov 22**        | **Student Registration 📋 Closed**  | "Classes are in session"; the flyer comes down   | **under Winter** |
| Dec 14            | Closed                              | card disappears                                  | under Winter    |

The Courses page's Fall 2026 tab and each class page switch to
"registration has closed" (then "the session has ended") on the same
dates, with a link to sign up for Winter 2027.

-   **Preview any date:** add `?asOf=2026-11-25` to any page URL. It only
    changes what you see.
-   **Change a date:** edit `utils/sessionSchedule.ts` and push. The
    session end (Dec 13) assumes no week is skipped; move it if one is.
-   **Open pages update too.** A page left open flips at the exact moment,
    without a reload.

The registration banner is now controlled by the code instead of
Contentful, so it can't go stale and it points at the current Google
Form. Contentful banners about student registration, and any banner that
names a past year, are hidden (today that's "Winter Session Registration
is now open!" and "Summer 2023 Teacher Applications are Open Now!").
Other Contentful banners still show as before.

**For Winter 2027:** add a schedule for it next to `FALL_2026`, update the
homepage's Winter card text in `pages/index.tsx`, and change
`studentRegistrationLink` in `config/index.ts` if winter uses a new form.

---

## Things worth knowing

**Old Notion course links still work.** `/courses/home` and any deeper
`/courses/**` path permanently redirect to `/courses`.

**The /about directory still comes from Notion.** Role edits in Notion
show up within about 15 minutes. If Notion is unreachable, the page falls
back to the saved copy in `data/`; refresh it with
`npm run snapshot:directory` now and then.

**One Notion page needs cleaning up.** Aadi Tiwari's directory page is
being used to track meeting attendance. The site refuses to publish pages
with checklists, so nothing leaks, but it's worth moving those notes out
of Notion.

**There's no "forgot password" yet.** That needs an email service. GitHub
sign-in is the fallback.

**No Content-Security-Policy.** The other standard security headers are
on, but a CSP needs its own testing pass against Watson Assistant, Google
Analytics and Cloudinary.
