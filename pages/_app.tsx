import '../styles/globals.css'
import React from 'react';
import type { AppProps } from 'next/app'
import { CacheProvider, EmotionCache } from "@emotion/react";
import createCache from '@emotion/cache';
import Head from 'next/head';

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
      <Component {...pageProps} />
    </CacheProvider>
  )
}

export default MyApp
