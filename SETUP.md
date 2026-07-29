# Setup guide — C4T Learning Platform

Follow these steps in order. Everything here is **free**, with no credit card
required. Total time: about 25 minutes.

You need three things:

| What               | Why                                     | Service we use                           | Cost              |
| ------------------ | --------------------------------------- | ---------------------------------------- | ----------------- |
| A database         | Stores accounts, progress, certificates | **Neon** (Postgres)                      | Free forever tier |
| A sign-in method   | So learners can log in                  | **GitHub OAuth** and/or **Resend** email | Free              |
| A place to host it | To put it on the internet               | **Vercel**                               | Free Hobby tier   |

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

## Step 4 — Set up email sign-in (optional but recommended)

This sends people a "magic link" — they click it and they're signed in. No
passwords to reset, ever.

**If you skip this, GitHub sign-in still works.** The login page automatically
hides whichever method isn't configured.

1. Go to **https://resend.com** and sign up (free: 3,000 emails/month).
2. Go to **API Keys** → **Create API Key**. Name it `c4t-learning`, give it
   **Sending access**, and copy the key (starts with `re_`).
3. For the `EMAIL_FROM` address you have two options:
    - **Quickest:** use `onboarding@resend.dev` — works immediately, but only
      sends to _your own_ signup email. Fine for testing.
    - **For real learners:** go to **Domains** → **Add Domain**, enter your
      domain, and add the DNS records Resend shows you. Then use something like
      `learning@yourdomain.com`.

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

# From step 4 (delete these five lines if you skipped step 4)
EMAIL_SERVER_HOST="smtp.resend.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="resend"
EMAIL_SERVER_PASSWORD="re_your_api_key_here"
EMAIL_FROM="onboarding@resend.dev"
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
npm run db:seed         # adds course settings and publishes 5 starter courses
npm run dev             # starts the site
```

Open **http://localhost:3000/courses** — you should see the catalog.

### Make yourself an admin

Add your email to `.env`:

```bash
INITIAL_ADMIN_EMAILS="you@example.com"
```

Then sign in at **http://localhost:3000/login** — you are promoted to admin
automatically, and **/admin** is open. Grant everyone else their roles from
**/admin/users**.

(If you would rather not use the env var, sign in first and then run
`npm run db:make-admin -- you@example.com`.)

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

1. Push your branch to GitHub.
2. Go to **https://vercel.com**, sign in with GitHub, click **Add New…** →
   **Project**, and import this repository.
3. Before clicking Deploy, open **Environment Variables** and add every value
   from your `.env`, **with these two changes**:
    - `NEXTAUTH_URL` → your real Vercel URL, e.g.
      `https://c4t-web.vercel.app` (no trailing slash)
    - `NEXT_PUBLIC_SITE_URL` → the same URL
4. Create a **second GitHub OAuth app** (step 3) using your Vercel URL, and use
   its Client ID and secret in Vercel's environment variables.
5. Click **Deploy**.
6. After the first deploy, run the migration against production. Locally:

    ```bash
    DATABASE_URL="your-neon-url" npm run db:migrate
    DATABASE_URL="your-neon-url" npm run db:seed
    ```

    (It's the same Neon database, so you may have already done this in step 6.)

### One thing that will block the build

This was already true before the learning platform existed: the site's original
marketing pages (`/`, `/about`, `/contact`, `/volunteer`, `/news`,
`/internships`, `/jobboard`, `/learn`) and the Notion course library
(`/courses/[...slug]`) all fetch from **Contentful** at build time. Without
valid Contentful and Notion keys, `npm run build` fails on those pages.

Everything in the learning platform builds fine without them — all 25 courses,
`/login`, the dashboard, assignments, admin, and certificates.

So for a working deploy you need to either:

-   **Add the existing keys** (recommended if you're keeping the current site):
    `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ACCESS_TOKEN`,
    `CONTENTFUL_PREVIEW_ACCESS_TOKEN`, and `NOTION_API_KEY`. Ask whoever
    currently runs code4tomorrow.org for these — they are the same values the
    live site already uses.
-   **Or remove the pages you no longer want.** The learning platform itself
    never touches Contentful or Notion.

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
run `npm run db:seed` which publishes five starter courses.

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

npm run validate:curriculum # check all 25 courses are complete
npm run validate:learning   # check progress/completion rules
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
