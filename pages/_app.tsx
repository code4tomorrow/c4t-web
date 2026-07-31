import "../styles/globals.css";
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
import { RecoilRoot } from "recoil";
import ReactGA from "react-ga4";
import config from "config";
import { Router } from "next/router";
import { SessionProvider } from "next-auth/react";
import dynamic from "next/dynamic";
import type { Session } from "next-auth";

/**
 * The toast container drags in gsap, and the preview banner only ever renders
 * for an administrator who has switched roles. Neither is needed for the first
 * paint of any page, so both are split out of the shared bundle.
 */
const Snackbar = dynamic(() => import("@components/Snackbar"), { ssr: false });
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

function MyApp({ Component, pageProps }: AppPropWithLayout) {
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

    React.useEffect(() => {
        ReactGA.initialize(config.ga.measurementId, {
            testMode: DEBUG,
        });
        ReactGA.send({
            hitType: "pageview",
            page: window.location.pathname + window.location.search,
        });
    }, []);

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
            <SessionProvider
                session={pageProps.session}
                // Learner pages read the session from getServerSideProps, so the
                // client does not need to poll for it.
                refetchInterval={0}
            >
                <ViewAsBanner />
                <React.StrictMode>
                    <ProgressBar
                        options={{ showSpinner: false }}
                        color={"#fff"}
                        height={2}
                    />
                    {getLayout(
                        <RecoilRoot>
                            <Component {...pageProps} />
                            <Snackbar />
                        </RecoilRoot>,
                        pageProps
                    )}
                </React.StrictMode>
            </SessionProvider>
        </CacheProvider>
    );
}

export default MyApp;
