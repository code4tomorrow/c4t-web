const siteUrl = "https://www.code4tomorrow.org";

/**
 * Routes that must never appear in the public sitemap.
 *
 * next-sitemap walks the build manifest, so without this it happily published
 * /admin, /admin/users and every signed-in learner page to search engines.
 * They are all guarded server-side, so this was never an access problem — but
 * it advertised the admin surface and sent crawlers to pages that can only
 * answer with a redirect or a 404.
 */
const privateRoutes = [
    "/admin",
    "/admin/*",
    "/learn/dashboard",
    "/learn/progress",
    "/learn/achievements",
    "/learn/certificates",
    "/learn/assignments",
    "/learn/assignments/*",
    "/learn/onboarding",
    "/learn/preview-blocked",
    "/learn/unavailable",
    "/learn/courses/*",
    "/login/check-email",
    "/certificate/verify/*",
];

/**
 * @type {import('next-sitemap').IConfig}
 * */
const nextSiteMapConfig = {
    siteUrl,
    generateRobotsTxt: true,
    robotsTxtOptions: {
        policies: [
            {
                userAgent: "*",
                allow: "/",
                // Keep crawlers out of the same places, so a stale sitemap or
                // an inbound link does not send them there either.
                disallow: privateRoutes,
            },
        ],
        additionalSitemaps: [],
    },
    exclude: privateRoutes,
};

module.exports = nextSiteMapConfig;
