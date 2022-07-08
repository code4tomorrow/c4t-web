import { useRouter } from "next/router"
import { UrlObject } from "url";

export type Url = UrlObject | string;

export interface IRouteCache {
    route?: Url;
}

interface TransitionOptions {
    shallow?: boolean;
    locale?: string | false;
    scroll?: boolean;
    unstable_skipClientCache?: boolean;
}

let previousRouteCache:IRouteCache = {
    route: typeof window !== "undefined" ? window.location.pathname : undefined
};

export const useNavigator = () => {
    const router = useRouter();

    function previousRoute() : Url | undefined {
        let route = previousRouteCache.route; 
        return route; 
    }

    async function push(url: Url, as?: Url | undefined, options?: TransitionOptions | undefined) : Promise<boolean> {
        return await router.push(url, as, options).then((e) => {
            previousRouteCache.route = url; 
            return e;
        })
    }

    return { ...router, push, previousRoute };
}