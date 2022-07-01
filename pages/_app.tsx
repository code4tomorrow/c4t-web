import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { storyblokInit, apiPlugin } from "@storyblok/react";
import { CacheProvider, EmotionCache } from "@emotion/react";
import createCache from '@emotion/cache';

storyblokInit({
  accessToken: process.env.STORYBLOK_TOKEN,
  use: [apiPlugin]
});

let muiCache: EmotionCache | undefined = undefined;

export const createMuiCache = () =>
    muiCache = createCache({
        key: "staywiserent",
        prepend: true,
        speedy: true,
    });

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <CacheProvider value={muiCache ?? createMuiCache()}>
      <Component {...pageProps} />
    </CacheProvider>
  )
}

export default MyApp
