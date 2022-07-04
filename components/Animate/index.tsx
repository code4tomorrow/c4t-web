import React, { useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { useRef } from "react";
import { useCallback } from "react";
import { useEffect } from "react";
import { useDebounce } from "use-debounce";

gsap.registerPlugin(ScrollTrigger);

interface AnimateProps {
    className?: string;
    children: React.ReactNode;
    from?: gsap.TweenVars,
    to?: gsap.TweenVars,
    resetAfterTriggered?: boolean
}

const Animate : React.FC<AnimateProps> = ({ className, children, from = {}, to = {}, resetAfterTriggered = true }) => {
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
        console.log("resized");
        if (!containerRef.current) return;

        gsap.timeline({
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
    useEffect(() => {
        setTriggerListeners();
    }, [ setTriggerListeners ]);

    useEffect(() => {
        if (resizedWidth === null || !containerRef.current) return; 
        ScrollTrigger.refresh();
    }, [ resizedWidth, containerRef.current ]);

    return (
        <div className={className} ref={containerRef}>
            { children }
        </div>
    )
}  

export default Animate; 