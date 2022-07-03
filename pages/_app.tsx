import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { CacheProvider, EmotionCache } from "@emotion/react";
import createCache from '@emotion/cache';

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
