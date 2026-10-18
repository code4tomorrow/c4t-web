/**
 * Whether student accounts can work on this deployment.
 *
 * Accounts need a database (DATABASE_URL) and, in production, NEXTAUTH_SECRET.
 * The site can be deployed before those are set — pushing to master deploys it
 * even when nobody can edit the host's environment variables — so instead of
 * erroring, every account feature switches off cleanly: account pages redirect
 * to /learn/unavailable, account APIs answer 503, and course pages offer the
 * syllabus and live-class registration instead of an Enroll button. Setting
 * the variables turns everything back on with no code change.
 *
 * The browser gets the same answer as NEXT_PUBLIC_ACCOUNTS_ENABLED, fixed at
 * build time in next.config.js.
 */
export const accountsEnabled = () =>
    Boolean(process.env.DATABASE_URL) &&
    (process.env.NODE_ENV !== "production" ||
        Boolean(process.env.NEXTAUTH_SECRET));

export const ACCOUNTS_UNAVAILABLE_PATH = "/learn/unavailable";
