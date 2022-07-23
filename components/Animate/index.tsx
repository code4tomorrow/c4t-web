import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import Element from "./Element";
import gsap from "gsap";
import Scrub from "./Scrub";
import { withAnimateBase } from "./withAnimateBase";
import isEqual from "react-fast-compare";

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

    const childs = useMemo(() => <>{children}</>, [ children ]);

    return (
        <AnimateContext.Provider value={{ isNestedInAnimate: true }}>
            { childs }
        </AnimateContext.Provider>
    )
}

export default Object.assign(React.memo(Animate, isEqual), { 
    Element: withAnimateBase(Element), 
    Scrub: withAnimateBase(Scrub)
});