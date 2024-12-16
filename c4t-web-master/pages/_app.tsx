import "../styles/globals.css";
import React, { ReactElement } from "react";
import type { AppProps } from "next/app";
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
import Snackbar from "@components/Snackbar";

let muiCache: EmotionCache | undefined = undefined;

export const createMuiCache = () =>
    (muiCache = createCache({
        key: "code-four-tomorrow",
        prepend: true,
        speedy: true,
    }));

type AppPropWithLayout = AppProps & {
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
        </CacheProvider>
    );
}

export default MyApp;
