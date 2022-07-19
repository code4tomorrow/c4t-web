import '../styles/globals.css'
import React from 'react';
import type { AppProps } from 'next/app'
import { CacheProvider, EmotionCache } from "@emotion/react";
import createCache from '@emotion/cache';
import Head from 'next/head';
import NextNProgress from "nextjs-progressbar";
import { NextSeo } from 'next-seo';

let muiCache: EmotionCache | undefined = undefined;

export const createMuiCache = () =>
    muiCache = createCache({
        key: "code-four-tomorrow",
        prepend: true,
        speedy: true,
    });

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <CacheProvider value={muiCache ?? createMuiCache()}>
      <Head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
          <meta name="theme-color" content="#111111" />
      </Head>
      <NextSeo
        key={"root"}
        title="Code4Tomorrow"
        additionalMetaTags={[
          {
            name: "keywords",
            content: "code4tomorrow,c4t,code,free,non-profit"
          }
        ]}
        description="Code4Tomorrow is entirely student-run, from the official website to merch design and finance management. Fiscally sponsored by Irvine LIGHTS, C4T is a 501(c)(3) non-profit organization that offers free coding classes to students around the globe, as well as community service opportunities to our members and teachers."
        openGraph={{
          url: "https://c4t.vercel.app/",
          title: "Code4Tomorrow",
          description: "Code4Tomorrow is entirely student-run, from the official website to merch design and finance management. Fiscally sponsored by Irvine LIGHTS, C4T is a 501(c)(3) non-profit organization that offers free coding classes to students around the globe, as well as community service opportunities to our members and teachers.",
          images: [
          ],
          site_name: "Code4Tomorrow",
        }}
        twitter={{
          site: 'https://c4t.vercel.app/',
          cardType: 'summary_large_image',
        }}
      />
      <React.StrictMode>
        <NextNProgress
          options={{ showSpinner: false }}
            color={"#fff"}
            height={2}
        />
        <Component {...pageProps} />
      </React.StrictMode>
    </CacheProvider>
  )
}

export default MyApp
