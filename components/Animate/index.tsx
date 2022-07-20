import React, { useCallback, useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import Element from "./Element";
import gsap from "gsap";
import Scrub from "./Scrub";
import { withAnimateBase } from "./withAnimateBase";

declare module "react" {
    function forwardRef<T, P = {}>(
      render: (props: P, ref: React.Ref<T>) => React.ReactElement | null
    ): (props: P & React.RefAttributes<T>) => React.ReactElement | null;
}

gsap.registerPlugin(ScrollTrigger);

export const AnimateContext = React.createContext({
    isNestedInAnimate: false,
})

interface AnimateProps {
    children: React.ReactNode
}

const Animate : React.FC<AnimateProps> = ({ children }) => {
    const [ viewportWidth, setViewportWidth ] = useState<number | null>(null);
    const [ resizedWidth ] = useDebounce(viewportWidth, 500);

    const handleResize = useCallback(() => {
        setViewportWidth(window.innerWidth);
    }, []);

    useEffect(() => {
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [ handleResize ]);

    useEffect(() => {
        if (resizedWidth === null) return; 
        ScrollTrigger.refresh();
    }, [ resizedWidth ]);

    return (
        <AnimateContext.Provider value={{ isNestedInAnimate: true }}>
            { children }
        </AnimateContext.Provider>
    )
}

export default Object.assign(React.memo(Animate), { 
    Element: withAnimateBase(Element), 
    Scrub: withAnimateBase(Scrub)
});