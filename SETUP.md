# Setup guide — C4T Learning Platform

Follow these steps in order. Everything here is **free**, with no credit card
required. Total time: about 25 minutes.

You need three things:

| What               | Why                                     | Service we use                           | Cost              |
| ------------------ | --------------------------------------- | ---------------------------------------- | ----------------- |
| A database         | Stores accounts, progress, certificates | **Neon** (Postgres)                      | Free forever tier |
| A sign-in method   | So learners can log in                  | **Email + password** (built in) and/or **GitHub OAuth** | Free |
| A place to host it | To put it on the internet               | **Vercel** (already set up for code4tomorrow.org) | Free Hobby tier   |

You can do steps 1–5 and run everything on your own laptop first. Step 7
(deploying) can wait until you're happy with it.

---

## Step 1 — Create the database (Neon)

Neon gives you a free Postgres database. "Postgres" is just the type of
database; you never have to install anything.

1. Go to **https://neon.com** and click **Sign up**. Use your GitHub account —
   it's the fastest.
2. It will ask you to create a project. Name it `c4t-learning`. Leave every
   other setting on its default and click **Create**.
3. You'll land on a dashboard showing a **Connection string**. It looks like:

    ```
    postgresql://neondb_owner:AbCd1234@ep-cool-name-12345.us-east-2.aws.neon.tech/neondb?sslmode=require
    ```

4. Click the **copy** button next to it. **Keep this tab open** — you'll paste
   this in step 5.

> If you don't see the connection string, click **Connect** or **Connection
> Details** on the project dashboard. Make sure the string ends with
> `?sslmode=require`.

---

## Step 2 — Get the code running locally

Open Terminal, go to the project folder, and run:

```bash
npm install
```

This also generates the database client automatically.

---

## Step 3 — Set up GitHub sign-in

This lets people click "Continue with GitHub" instead of making a password.

1. Go to **https://github.com/settings/developers**
2. Click **OAuth Apps** → **New OAuth App**.
3. Fill in exactly this:
    - **Application name:** `C4T Learning (local)`
    - **Homepage URL:** `http://localhost:3000`
    - **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
4. Click **Register application**.
5. Copy the **Client ID** shown on the next page.
6. Click **Generate a new client secret**, then copy the secret immediately
   (GitHub only shows it once).

> Later, when you deploy, create a **second** OAuth app with your real domain
> (`https://yourdomain.com` and
> `https://yourdomain.com/api/auth/callback/github`). One app cannot serve both
> local and production callbacks.

---

## Step 4 — Email sign-in (already works, nothing to set up)

Learners can create an account with an **email and password**. This needs no
email service, no SMTP, and no API key — it works the moment the database is
connected.

Passwords are hashed with bcrypt (cost 12) and never stored in readable form.
Sign-in failures return one identical message whether the address exists or
not, so the form cannot be used to discover who has an account.

**Optional:** if you later want passwordless "magic link" sign-in instead, set
the `EMAIL_SERVER_*` variables in `.env` (Resend's free tier works well). The
login page shows whichever methods are configured, so leaving them blank is
fine.

> There is no "forgot password" flow yet, because that genuinely does require
> sending email. Until you configure SMTP, an admin can reset someone by
> deleting their `passwordHash` in the database and asking them to sign up
> again, or the learner can use GitHub instead.

---

## Step 5 — Fill in your environment file

In the project folder, copy the example file:

```bash
cp .env.example .env
```

Now open `.env` in your editor and fill in these values:

```bash
# From step 1 — paste your Neon connection string
DATABASE_URL="postgresql://neondb_owner:...@....neon.tech/neondb?sslmode=require"

# Leave as-is for local development
NEXTAUTH_URL="http://localhost:3000"

# Generate this by running:  openssl rand -base64 32
NEXTAUTH_SECRET="paste-the-generated-string-here"

# From step 3
GITHUB_ID="Ov23li..."
GITHUB_SECRET="abc123..."

# Optional — only for passwordless magic links. Email + password works
# without any of this.
# EMAIL_SERVER_HOST="smtp.resend.com"
# EMAIL_SERVER_PORT="587"
# EMAIL_SERVER_USER="resend"
# EMAIL_SERVER_PASSWORD="re_your_api_key_here"
# EMAIL_FROM="onboarding@resend.dev"

# Promoted to ADMIN on sign-in
INITIAL_ADMIN_EMAILS="you@example.com"

# Optional: lets /about read team roles live from Notion. Without it the page
# shows the saved copy in data/ instead.
NOTION_API_KEY="secret_..."
```

To generate the secret, run this in Terminal and paste the output:

```bash
openssl rand -base64 32
```

> `.env` is already in `.gitignore`, so these secrets will never be committed.

---

## Step 6 — Create the tables and start

Run these three commands:

```bash
npm run db:migrate      # creates all the tables in your Neon database
npm run db:seed         # adds course settings and publishes every course
npm run dev             # starts the site
```

Open **http://localhost:3000/courses** — you should see the catalog.

### Make yourself an admin

Add your email to `.env` (comma-separate several):

```bash
INITIAL_ADMIN_EMAILS="shamsizafir@gmail.com,ishanya.malik@gmail.com"
```

Then sign in with **GitHub** (or an emailed sign-in link) using that email —
you are promoted to admin automatically, and **/admin** is open. Email +
password sign-ins are **not** promoted, because a password account never
proves it owns the address; otherwise anyone could register an admin's email
first.

If you signed up with email + password, either have an existing admin promote
you, or run `npm run db:make-admin -- you@example.com`.

### Add more admins

Any admin can make someone else an admin:

1. Have them create an account at /signup (or sign in with GitHub).
2. Go to **/admin/users**, search for their email, and change their role to
   **admin**. You'll be asked to confirm.

Emails listed in `INITIAL_ADMIN_EMAILS` are founding admins: their admin role
can't be removed from /admin/users, so nobody can lock them out. Take an email
off the list to make it an ordinary account again.

### Preview the site as a student or teacher

At the top of **/admin** there's a **"Preview the site as"** bar. Pick Learner,
Instructor, or Content editor and the whole site behaves as that role — an amber
banner stays pinned to every page with an **Exit preview** button.

This is a real permission change, not a UI trick: while previewing as a learner
you genuinely cannot reach `/admin` or grade anything. Your own progress and
submissions are untouched, so it's the easiest way to walk the full student
flow yourself.

### Try the whole flow

1. **/courses** → open a published course → **Enroll and start**
2. Work through a lesson and finish the lab → progress saves to the database
3. **/learn/assignments** → submit a checkpoint
4. **/admin** → approve it (you're an admin, so you can grade)
5. Finish all lessons and get everything approved
6. **/learn/certificates** → **Issue my certificate** → **Download PDF**
7. Open the verification link — it works for anyone, signed in or not

---

## Step 7 — Deploy to the internet (Vercel)

### How the live site deploys

code4tomorrow.org already runs on Vercel, in the team **c4t-website-team**,
project **c4t-web**. That project is connected to the GitHub repo
`code4tomorrow/c4t-web`, which you can confirm on GitHub: every commit on
`master` has a "Vercel – c4t-web" check, and the deployments list shows
`vercel[bot]` publishing to **Production**.

So you don't need your own Vercel account to deploy:

-   **Every push or merge to `master` goes live within a few minutes.** There's
    no staging step in between.
-   **Any other branch you push gets a preview deployment.** It has its own
    `*.vercel.app` link (shown on the PR and in the branch's checks), so you
    can click around before anything reaches the real site.

### Environment variables, and when nobody can edit them

Environment variables live in the Vercel project, and only members of the
**c4t-website-team** Vercel team can change them. If nobody on that team is
reachable, you can still ship: the site notices that its database and
sign-in secret are missing and switches student accounts off cleanly
(`lib/platform.ts`), while everything else goes live from a normal push to
`master`. [GO_LIVE.md](GO_LIVE.md) has the two-stage plan for turning
accounts on later in the same project.

### Ship it

1. Push your branch and open a pull request into `master`:

    ```bash
    git push -u origin online-modules
    gh pr create --base master --head online-modules
    ```

2. Open the PR's Vercel preview link and check it.
3. Merge the PR. Vercel deploys `master` to code4tomorrow.org automatically.

### Contentful is still required

The site's original marketing pages (`/`, `/contact`, `/volunteer`, `/news`,
`/internships`, `/jobboard`, `/learn`) fetch from **Contentful** at build time,
so `npm run build` fails without `CONTENTFUL_SPACE_ID`,
`CONTENTFUL_ACCESS_TOKEN` and `CONTENTFUL_PREVIEW_ACCESS_TOKEN`. The live
Vercel project already has them. The learning platform itself never touches
Contentful.

`/about` doesn't need Contentful. It reads team roles from Notion when
`NOTION_API_KEY` is set and falls back to the saved copy in `data/`, so it
builds either way.

---

## Session dates (the site updates itself)

The homepage banner, the Fall/Winter cards, and the register buttons on the
Courses page follow the dates in `utils/sessionSchedule.ts`. Edit a date
there to move a deadline. Add `?asOf=2026-11-25` to any URL to see the site
as it will look on that day. [GO_LIVE.md](GO_LIVE.md) lists what changes
when.

---

## Editing the team page (/about)

The team and alumni directories come from Notion. Change someone's position,
department or projects there, and /about picks it up within about 15 minutes.
There's nothing to redeploy.

The page also keeps a saved copy in `data/team-directory.json` and
`data/alumni-directory.json`. It uses that copy when Notion can't be reached.
Refresh it every so often so the fallback stays current, then commit it:

```bash
npm run snapshot:directory
```

A Notion page with checkboxes on it is treated as internal notes, not a bio,
and its text is never published.

---

## Common problems

**"Environment variable not found: DATABASE_URL"**
Your `.env` file is missing or in the wrong folder. It must sit next to
`package.json`.

**"Can't reach database server"**
Your Neon connection string is wrong or missing `?sslmode=require` at the end.
Copy it again from the Neon dashboard.

**Sign-in says "redirect_uri mismatch"**
The callback URL in your GitHub OAuth app doesn't exactly match your site. It
must be `<your-site>/api/auth/callback/github` — including `https://` in
production.

**The magic-link email never arrives**
If you're using `onboarding@resend.dev`, Resend only delivers to the email you
signed up with. Verify a real domain to email anyone else. Also check spam.

**"This course is not open for enrollment yet"**
The course isn't published. Go to **/admin/courses** and click **Publish**, or
run `npm run db:seed`, which publishes every course, including new ones.

**I can't reach /admin**
Run `npm run db:make-admin -- your@email.com` and sign out and back in.

---

## Command reference

```bash
npm run dev                 # start the local site
npm run build               # production build
npm test                    # run the test suite
npm run lint                # lint and format

npm run db:migrate          # apply migrations (safe to re-run)
npm run db:migrate:dev      # create a new migration after editing the schema
npm run db:seed             # course settings + demo data (safe to re-run)
npm run db:make-admin -- you@example.com [ROLE]
npm run db:studio           # visual database browser

npm run validate:curriculum # check every course (self-paced and live) is complete
npm run validate:learning   # check progress/completion rules

npm run snapshot:directory  # save the Notion team/alumni directory to data/
```

## Roles

| Role             | Can do                                                |
| ---------------- | ----------------------------------------------------- |
| `LEARNER`        | Enroll, learn, submit work, earn certificates         |
| `INSTRUCTOR`     | Everything above, plus grade submissions at `/admin`  |
| `CONTENT_EDITOR` | Publish and unpublish courses at `/admin/courses`     |
| `ADMIN`          | Everything, plus manage people and view the audit log |

Set them with `npm run db:make-admin -- email@example.com INSTRUCTOR`, or from
**/admin/users** once you're an admin.
