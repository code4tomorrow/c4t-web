import "../styles/globals.css";
import "../styles/lesson.css";
import React, { ReactElement } from "react";
import type { AppProps } from "next/app";
import { Raleway } from "next/font/google";
import { CacheProvider, EmotionCache } from "@emotion/react";
import createCache from "@emotion/cache";
import Head from "next/head";
import { NextSeo } from "next-seo";
import { NextPageWithLayout } from "common/interfaces/nextPageWithLayout";
import { getCloudinaryURL } from "@utils/cloudinary-loader";
import ProgressBar from "@components/ProgressBar";
import { useAtomValue } from "@utils/store";
import { snackBarState } from "@components/Snackbar/state";
import config from "config";
import { Router, useRouter } from "next/router";
import { SessionProvider } from "next-auth/react";
import dynamic from "next/dynamic";
import type { Session } from "next-auth";
import { VIEW_AS_COOKIE } from "lib/view-as";

/**
 * The toast container drags in gsap, and the preview banner only ever renders
 * for an administrator who has switched roles. Neither is needed for the first
 * paint of any page, so both are split out of the shared bundle.
 */
const Snackbar = dynamic(() => import("@components/Snackbar"), { ssr: false });
/**
 * Loads the toast container (and gsap with it) only once the first toast is
 * queued, then keeps it mounted so later toasts animate normally.
 */
const SnackbarWhenNeeded: React.FC = () => {
    const snacks = useAtomValue(snackBarState);
    const [needed, setNeeded] = React.useState(false);
    React.useEffect(() => {
        if (snacks.length) setNeeded(true);
    }, [snacks.length]);
    return needed || snacks.length ? <Snackbar /> : null;
};

const ViewAsBanner = dynamic(
    () => import("@components/Learning/ViewAsBanner"),
    { ssr: false }
);

/**
 * Raleway, self-hosted at build time.
 *
 * This used to be a render-blocking <link> to fonts.googleapis.com requesting
 * eleven static weights, which cost a DNS lookup, a TLS handshake and a
 * stylesheet round-trip before the first paint. Raleway is a variable font, so
 * omitting `weight` fetches one file covering the whole 100-900 range instead —
 * fewer bytes and fewer requests than the five weights the site actually uses.
 */
const raleway = Raleway({
    subsets: ["latin"],
    style: ["normal", "italic"],
    display: "swap",
    variable: "--font-raleway",
    fallback: [
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Roboto",
        "Helvetica Neue",
        "sans-serif",
    ],
});

let muiCache: EmotionCache | undefined = undefined;

export const createMuiCache = () =>
    (muiCache = createCache({
        key: "code-four-tomorrow",
        prepend: true,
        speedy: true,
    }));

type AppPropWithLayout = AppProps<{ session?: Session | null }> & {
    Component: NextPageWithLayout;
};

const DEBUG = process.env.NODE_ENV === "development";

/**
 * Routes that read the client session: the course page's enroll button, and
 * the role-preview banner on staff and learner pages. Everywhere else the
 * provider is given `session={null}`, which stops next-auth from calling
 * /api/auth/session — a serverless invocation plus a database query — on
 * every page view of the marketing site.
 */
const SESSION_ROUTE_PREFIXES = ["/admin", "/learn/", "/courses/[courseSlug]"];
const routeNeedsSession = (pathname: string) =>
    process.env.NEXT_PUBLIC_ACCOUNTS_ENABLED !== "false" &&
    SESSION_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));

const hasCookie = (name: string) =>
    document.cookie
        .split(";")
        .some((part) => part.trim().startsWith(`${name}=`));

/**
 * Google Analytics is ~170 KB of third-party script. It starts once the page
 * has finished loading and the main thread is idle, so it never competes with
 * the page itself.
 */
const startAnalytics = () => {
    let cancelled = false;
    let idleHandle: number | undefined;
    const run = () => {
        if (cancelled) return;
        import("react-ga4").then(({ default: ReactGA }) => {
            if (cancelled) return;
            ReactGA.initialize(config.ga.measurementId, { testMode: DEBUG });
            ReactGA.send({
                hitType: "pageview",
                page: window.location.pathname + window.location.search,
            });
        });
    };
    // Safari has no requestIdleCallback; a short timeout stands in for it.
    const hasIdle = typeof window.requestIdleCallback === "function";
    const schedule = () => {
        idleHandle = hasIdle
            ? window.requestIdleCallback(run, { timeout: 5000 })
            : (setTimeout(run, 2000) as unknown as number);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
        cancelled = true;
        window.removeEventListener("load", schedule);
        if (idleHandle === undefined) return;
        if (hasIdle) window.cancelIdleCallback(idleHandle);
        else clearTimeout(idleHandle);
    };
};

function MyApp({ Component, pageProps }: AppPropWithLayout) {
    const router = useRouter();
    const needsSession = routeNeedsSession(router.pathname);
    // An admin previewing a role still needs the banner's way out on pages
    // that otherwise skip the session. The cookie is only readable after
    // hydration, so this starts false on every render that the server makes.
    const [previewing, setPreviewing] = React.useState(false);
    React.useEffect(() => {
        setPreviewing(
            process.env.NEXT_PUBLIC_ACCOUNTS_ENABLED !== "false" &&
                hasCookie(VIEW_AS_COOKIE)
        );
    }, [router.asPath]);

    const handleScrollTop = React.useCallback(() => {
        const frame = requestAnimationFrame(() => {
            window.scroll({
                top: 0,
                left: 0,
                behavior: "smooth",
            });
        });
        return () => window.cancelAnimationFrame(frame);
    }, []);

    React.useEffect(() => {
        Router.events.on("routeChangeComplete", handleScrollTop);
        return () => Router.events.off("routeChangeComplete", handleScrollTop);
    }, [handleScrollTop]);

    React.useEffect(startAnalytics, []);

    const getLayout = Component.getLayout ?? ((page: ReactElement) => page);
    return (
        <CacheProvider value={muiCache ?? createMuiCache()}>
            {/* next/font can only be initialised in _app on the Pages Router,
                so the generated family is published as a custom property that
                globals.css consumes on <body>. */}
            <style jsx global>{`
                :root {
                    --font-raleway: ${raleway.style.fontFamily};
                }
            `}</style>
            <Head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, maximum-scale=5"
                />
                <meta name="theme-color" content="#111111" />
                <link
                    rel="apple-touch-icon"
                    href={getCloudinaryURL("logo-v2")}
                />
                <link rel="icon" href={getCloudinaryURL("logo-v2")} />
            </Head>
            <NextSeo
                key={"root"}
                title="Code 4 Tomorrow"
                additionalMetaTags={[
                    {
                        name: "keywords",
                        content: "code 4 tomorrow,c4t,code,free,non-profit",
                    },
                ]}
                description={config.meta.description}
                openGraph={{
                    url: "https://www.code4tomorrow.org/",
                    title: "Code 4 Tomorrow",
                    description: config.meta.description,
                    images: [],
                    site_name: "Code 4 Tomorrow",
                }}
                twitter={{
                    site: "https://www.code4tomorrow.org/",
                    cardType: "summary_large_image",
                }}
            />
            {!needsSession && previewing && (
                <SessionProvider
                    refetchInterval={0}
                    refetchOnWindowFocus={false}
                >
                    <ViewAsBanner />
                </SessionProvider>
            )}
            <SessionProvider
                // Re-mount when crossing between session and no-session routes,
                // so arriving on a course page from the marketing site fetches
                // the session instead of keeping the placeholder null.
                key={needsSession ? "session" : "no-session"}
                session={needsSession ? pageProps.session : null}
                // Learner pages read the session from getServerSideProps, so the
                // client does not need to poll for it.
                refetchInterval={0}
                refetchOnWindowFocus={false}
            >
                {needsSession && <ViewAsBanner />}
                <React.StrictMode>
                    <ProgressBar
                        options={{ showSpinner: false }}
                        color={"#fff"}
                        height={2}
                    />
                    {getLayout(
                        <>
                            <Component {...pageProps} />
                            <SnackbarWhenNeeded />
                        </>,
                        pageProps
                    )}
                </React.StrictMode>
            </SessionProvider>
        </CacheProvider>
    );
}

export default MyApp;
