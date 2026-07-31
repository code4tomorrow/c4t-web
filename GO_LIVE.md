# Go-live checklist

Everything you need to do on your end to put this branch on
code4tomorrow.org. Work top to bottom — step 1 is genuinely urgent, the
rest is mechanical.

[SETUP.md](SETUP.md) is the guide for running your own copy. This file is
about shipping to the real site.

---

## 1. Rotate the credentials you pasted into chat 🔴

You sent these to me in a chat message, so treat all of them as exposed.
They are **live production credentials for code4tomorrow.org**, not just
yours. None of them was ever committed — `.env` is gitignored, is mode
600, and appears zero times in git history — but rotate them anyway.

| Credential                       | Where to rotate                                                 |
| -------------------------------- | --------------------------------------------------------------- |
| Neon database password           | Neon console → your project → **Roles** → Reset password         |
| GitHub OAuth client secret       | github.com/settings/developers → your app → **Generate a new secret** |
| Contentful access token          | Contentful → Settings → **API keys**                             |
| Contentful preview access token  | same page                                                        |
| Notion API key                   | notion.so/my-integrations → your integration → **Refresh secret** |

After rotating, update `.env` locally and the environment variables on
whatever hosts the live site.

**Do not paste the new values into a chat.** Put them straight into
`.env` and your host's dashboard.

---

## 2. Get the branch onto master

You have 9 commits on `online-modules` that aren't on `master`.

**You are allowed to push straight to `master`.** You're one of eight
admins on `code4tomorrow/c4t-web`. The branch requires one approving
review, but `enforce_admins` is off, so that rule does not apply to you.

A PR is still the better move here — nine commits, a retired feature,
seven other admins, and no CI in the repo to catch anything:

```bash
git push -u origin online-modules
gh pr create --base master --head online-modules \
  --title "Free online learning platform + retire Notion"
```

Point reviewers at [ONLINE_LEARNING.md](ONLINE_LEARNING.md) for the
architecture, and at its "Retiring Notion" section for the part that
changes existing behaviour.

If you'd rather just ship it:

```bash
git push origin online-modules:master
```

Be aware that if the site deploys from `master` via Vercel's GitHub
integration, this goes live immediately — there is no staging step and
no test run between the push and production.

---

## 3. Environment variables on the production host

### Add these (the learning platform needs them)

| Variable               | Value                                                    |
| ---------------------- | -------------------------------------------------------- |
| `DATABASE_URL`         | Your Neon connection string (with the **new** password)   |
| `NEXTAUTH_SECRET`      | Generate fresh: `openssl rand -base64 32`                 |
| `NEXTAUTH_URL`         | `https://www.code4tomorrow.org` (no trailing slash)       |
| `NEXT_PUBLIC_SITE_URL` | `https://www.code4tomorrow.org`                           |
| `GITHUB_ID`            | From a **new** OAuth app — see step 4                     |
| `GITHUB_SECRET`        | From that same new OAuth app                              |
| `INITIAL_ADMIN_EMAILS` | `shamsizafir@gmail.com` (comma-separate to add others)    |

### Keep these (the existing marketing pages need them)

`CONTENTFUL_SPACE_ID`, `CONTENTFUL_ACCESS_TOKEN`,
`CONTENTFUL_PREVIEW_ACCESS_TOKEN`, `C4T_FORCE_REVALIDATE_TOKEN`.

### Delete these if they're set 🗑️

-   **`NOTION_API_KEY`** — nothing at build or request time reads it any
    more. It is now developer tooling for `npm run snapshot:directory`
    only. Leaving it in production is just an unnecessary live secret.
-   **`REDIS_URL`** — it only ever cached the Notion sitemap. `ioredis`
    is uninstalled.

---

## 4. Create a production GitHub OAuth app

The existing app's callback points at localhost. Make a second one at
**github.com/settings/developers → New OAuth App**:

-   **Homepage URL:** `https://www.code4tomorrow.org`
-   **Authorization callback URL:**
    `https://www.code4tomorrow.org/api/auth/callback/github`

Use its Client ID and secret for `GITHUB_ID` / `GITHUB_SECRET` above.
Keep the localhost app for local development.

---

## 5. Prepare the production database

Run once, from your machine, against the production connection string:

```bash
DATABASE_URL="postgresql://...new-password..." npm run db:migrate
DATABASE_URL="postgresql://...new-password..." npm run db:seed
```

`db:migrate` creates the 25 tables. `db:seed` marks all 25 courses
published and never overwrites a status an admin has already changed, so
it is safe to re-run. It skips creating demo accounts when
`NODE_ENV=production`.

You become an ADMIN automatically the first time you sign in, because
your email is in `INITIAL_ADMIN_EMAILS`.

---

## 6. After the first deploy, check these

| Check                                  | Expected                                          |
| -------------------------------------- | ------------------------------------------------- |
| `/courses`                             | 25 courses listed                                 |
| `/courses/game-development-with-unity`  | loads, "Enroll and start" is live                 |
| `/courses/home`                        | **redirects** to `/courses` (old Notion library)  |
| `/about`                               | team + alumni directories still populated         |
| Sign in with GitHub                    | works, lands on `/learn/dashboard`                |
| `/admin`                               | reachable for you, 404 for everyone else          |
| Enroll → finish a lesson → certificate | PDF downloads, verify page says "Valid"           |

---

## Things worth knowing

**Old Notion course links still work.** `/courses/home` and any deeper
`/courses/**` path permanently redirect to `/courses`, so inbound links
and bookmarks land somewhere useful instead of a 404.

**The /about directory is now a snapshot.** It lives in
`data/team-directory.json` and `data/alumni-directory.json`. When the
roster changes, run `npm run snapshot:directory` and commit the result —
the page no longer updates itself from Notion.

**One Notion page needs cleaning up.** A directory page (Aadi Tiwari's)
is being used to track meeting attendance, and the old renderer was
publishing that list on the public About page. The snapshot now refuses
to publish pages containing checklists, so the leak is closed — but it's
worth clearing those notes out of Notion.

**There's no "forgot password" yet.** That needs an email service, which
you asked me not to set up. GitHub sign-in is the fallback. If you want
it later, `SETUP.md` step 4 has the (commented-out) config.

**No Content-Security-Policy.** I added the other standard security
headers, but a CSP needs its own testing pass against Watson Assistant,
Google Analytics and Cloudinary rather than being switched on blind.
