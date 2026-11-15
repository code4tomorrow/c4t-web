const { withPlaiceholder } = require("@plaiceholder/next");

// Every host the Image component is allowed to optimize from. Notion's own
// domain and its S3 file store were dropped along with the Notion renderer —
// an unused entry here is just extra surface for someone else's images.
const authorizedImageDomains = [
    "res.cloudinary.com",
    "images.unsplash.com",
    "images.ctfassets.net",
];

/**
 * Sent on every response. Deliberately excludes a full Content-Security-Policy:
 * the site loads Watson Assistant, Google Analytics and Cloudinary, so a CSP
 * needs its own testing pass rather than being switched on blind.
 */
const securityHeaders = [
    // Nothing here is meant to be framed; this blocks clickjacking.
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    },
    {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
    },
];

// Mirrors lib/platform.ts so static pages know at build time whether student
// accounts exist on this deployment (hiding Enroll and dashboard links if not).
const accountsEnabled =
    Boolean(process.env.DATABASE_URL) &&
    (process.env.NODE_ENV !== "production" ||
        Boolean(process.env.NEXTAUTH_SECRET));

/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        NEXT_PUBLIC_ACCOUNTS_ENABLED: accountsEnabled ? "true" : "false",
    },
    staticPageGenerationTimeout: 900,
    reactStrictMode: true,
    // Nothing gains from advertising the framework version.
    poweredByHeader: false,
    compiler: {
        // Debug logging is dead weight in production bundles; real problems
        // still surface through console.error and console.warn.
        removeConsole:
            process.env.NODE_ENV === "production"
                ? { exclude: ["error", "warn"] }
                : false,
    },
    images: {
        domains: authorizedImageDomains,
        // Serve modern formats to browsers that accept them.
        formats: ["image/avif", "image/webp"],
    },
    async headers() {
        return [
            { source: "/:path*", headers: securityHeaders },
            {
                // Fingerprinted build assets never change under the same URL.
                source: "/_next/static/:path*",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "public, max-age=31536000, immutable",
                    },
                ],
            },
            // Illustrations and the session flyer are not fingerprinted, so
            // they get a day of caching (served stale while a fresh copy is
            // fetched) instead of a revalidation on every visit.
            ...["/svg/:path*", "/fall-2026-flyer.png"].map((source) => ({
                source,
                headers: [
                    {
                        key: "Cache-Control",
                        value: "public, max-age=86400, stale-while-revalidate=604800",
                    },
                ],
            })),
        ];
    },
    async rewrites() {
        return [
            {
                source: "/jobs",
                destination: "/jobboard",
            },
        ];
    },
    async redirects() {
        return [
            // The Notion-backed course library is retired. Its root lived at
            // /courses/home; deeper paths are handled by the [...slug]
            // tombstone route, but a single segment would 404 in
            // [courseSlug].tsx before reaching it, so it is redirected here.
            // The browser concept simulators were retired; send old links
            // to the course catalog.
            {
                source: "/learn/tools/:path*",
                destination: "/courses",
                permanent: true,
            },
            {
                source: "/courses/home",
                destination: "/courses",
                permanent: true,
            },
            {
                source: "/index.html",
                destination: "/",
                permanent: true,
            },
            {
                source: "/about.html",
                destination: "/about",
                permanent: true,
            },
            {
                source: "/learn.html",
                destination: "/learn",
                permanent: true,
            },
            {
                source: "/courses.html",
                destination: "/courses",
                permanent: true,
            },
            {
                source: "/volunteer.html",
                destination: "/volunteer",
                permanent: true,
            },
            {
                source: "/jobboard.html",
                destination: "/jobboard",
                permanent: true,
            },
        ];
    },
    serverRuntimeConfig: {
        PROJECT_ROOT: __dirname,
        authorizedImageDomains,
    },
    webpack(conf) {
        conf.module.rules.push({
            test: /\.svg$/i,
            issuer: { and: [/\.(js|ts|md)x?$/] },
            use: [
                {
                    loader: "@svgr/webpack",
                    options: {
                        prettier: false,
                        svgo: true,
                        svgoConfig: {
                            plugins: [
                                {
                                    name: "removeViewBox",
                                    active: false,
                                },
                                {
                                    name: "cleanupIDs",
                                    active: false,
                                },
                                {
                                    name: "prefixIds",
                                    active: false,
                                },
                            ],
                        },
                        titleProp: true,
                    },
                },
            ],
        });
        return conf;
    },
};

const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer(withPlaiceholder(nextConfig));
