import React, { ComponentPropsWithoutRef, ElementType, useContext, useState } from "react";
import gsap from "gsap";
import { useRef } from "react";
import { useCallback } from "react";
import { useEffect } from "react";
import clsx from "clsx";
import { useStyles } from "./styles";
import { AnimateContext } from ".";

interface ElementProps<T extends ElementType = "div"> {
    as?: T,
    className?: string;
    children: React.ReactNode;
    from?: gsap.TweenVars,
    to?: gsap.TweenVars,
    resetAfterTriggered?: boolean,
}

const Element = <T extends ElementType = "div">({ 
        as, className, children, from = {}, to = {}, resetAfterTriggered = true, ...props
    } : ElementProps<T> & ComponentPropsWithoutRef<T>) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [ triggered, setTriggered ] = useState(false);

    const ctx = useContext(AnimateContext);
    
    useEffect(() => {
        if (!ctx.isNestedInAnimate) {
            throw new Error("Animate.Element is not nested within Animate parent component.");
        }
    }, [ ctx ]);

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
    }, [ containerRef, resetAfterTriggered ]);

    const animateContainer = useCallback(() => {
        if (!containerRef.current) return;

        if (triggered) {
            gsap.fromTo(containerRef.current, from, to);
        } else {
            gsap.fromTo(containerRef.current, to, from);
        }
        return () => {
            gsap.killTweensOf(containerRef.current);
        }
    }, [ containerRef, triggered, from, to ]);

    useEffect(animateContainer, [ animateContainer ]);
    useEffect(setTriggerListeners, [ setTriggerListeners ]);

    const Component = as || "div";

    const { classes } = useStyles();

    return (
        <Component className={clsx(classes.container, className)} { ...props } ref={containerRef}>
            { children }
        </Component>
    )
}  

export default Element; 