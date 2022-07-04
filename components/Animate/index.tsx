import React, { ComponentPropsWithoutRef, ElementType, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { useRef } from "react";
import { useCallback } from "react";
import { useEffect } from "react";
import { useDebounce } from "use-debounce";

gsap.registerPlugin(ScrollTrigger);

interface AnimateProps<T extends ElementType = "div"> {
    as?: T,
    className?: string;
    children: React.ReactNode;
    from?: gsap.TweenVars,
    to?: gsap.TweenVars,
    resetAfterTriggered?: boolean,
}

const Animate = <T extends ElementType = "div">({ 
        as, className, children, from = {}, to = {}, resetAfterTriggered = true, ...props
    } : AnimateProps<T> & ComponentPropsWithoutRef<T>) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [ triggered, setTriggered ] = useState(false);
    const [ viewportWidth, setViewportWidth ] = useState<number | null>(null);
    const [ resizedWidth ] = useDebounce(viewportWidth, 500);

    const handleResize = useCallback(() => {
        setViewportWidth(window.innerWidth);
    }, []);

    useEffect(() => {
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const setTriggerListeners = useCallback(() => {
        if (!containerRef.current) return;

        const tl = gsap.timeline({
            repeat: 0,
            scrollTrigger: {
                invalidateOnRefresh: true,
                trigger: containerRef.current,
                onEnter: () => setTriggered(true),
                onLeaveBack: () => resetAfterTriggered && setTriggered(false),
                onLeave: () => resetAfterTriggered && setTriggered(false),
                onEnterBack: () => resetAfterTriggered && setTriggered(true),
            }
        })
        return () => {
            gsap.killTweensOf(containerRef.current);
            tl.kill();
        }
    }, [ containerRef.current ]);

    const animateContainer = useCallback(() => {
        if (!containerRef.current) return;

        if (triggered) {
            gsap.fromTo(containerRef.current, from, to);
        } else {
            gsap.to(containerRef.current, from);
        }
        return () => {
            gsap.killTweensOf(containerRef.current);
        }
    }, [ containerRef.current, triggered, from, to ]);

    useEffect(animateContainer, [ animateContainer ]);
    useEffect(setTriggerListeners, [ setTriggerListeners ]);

    useEffect(() => {
        if (resizedWidth === null || !containerRef.current) return; 
        ScrollTrigger.refresh();
    }, [ resizedWidth, containerRef.current ]);

    const Component = as || "div";

    return (
        <Component className={className} { ...props } ref={containerRef}>
            { children }
        </Component>
    )
}  

export default Animate; 