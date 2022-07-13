import React, { ComponentPropsWithoutRef, ElementType, useContext, useState } from "react";
import gsap from "gsap";
import { useRef } from "react";
import { useCallback } from "react";
import { useEffect } from "react";
import clsx from "clsx";
import { useStyles } from "./styles";
import { AnimateContext } from ".";
import _ from "lodash";

interface ElementProps<T extends ElementType = "div"> {
    as?: T,
    className?: string;
    children: React.ReactNode;
    from?: gsap.TweenVars,
    to?: gsap.TweenVars,
    onActivatedClasses?: string; 
    onDeactivatedClasses?: string; 
    resetAfterTriggered?: boolean,
}

const Element = <T extends ElementType = "div">({ 
        as, 
        className, 
        children, 
        from = {}, 
        to = {},
        resetAfterTriggered = true, 
        onDeactivatedClasses,
        onActivatedClasses,
        start,
        end,
        ...props
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
                start: start,
                end: end,
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
    }, [ containerRef, resetAfterTriggered, start, end ]);

    const [ animation, setAnimation ] = useState<{
        from?: gsap.TweenVars, to?: gsap.TweenVars,
    }>({ from: undefined, to: undefined});

    useEffect(() => {
        if (!_.isEqual(from, animation.from) || ! _.isEqual(to, animation.to)) {
            setAnimation({ from, to });
        }
    }, [ from, to, animation.from, animation.to ]);

    const animateContainer = useCallback(() => {
        if (!containerRef.current || !animation.from || !animation.to) return;

        const fromTemp = _.cloneDeep(animation.from);
        const toTemp = _.cloneDeep(animation.to);

        if (triggered) {
            gsap.fromTo(containerRef.current, fromTemp, toTemp);
        } else {
            gsap.fromTo(containerRef.current, toTemp, fromTemp);
        }
        return () => {
            gsap.killTweensOf(containerRef.current);
        }
    }, [ containerRef, triggered, animation.from, animation.to ]);

    useEffect(animateContainer, [ animateContainer ]);
    useEffect(setTriggerListeners, [ setTriggerListeners ]);

    const Component = as || "div";

    const { classes } = useStyles();

    return (
        <Component 
            style={{ 
                opacity: from.opacity !== undefined ? from.opacity as number : "initial",
                transform: `translate3d(${from.x || 0}px, ${from.y || 0}px,0px)`,
                WebkitTransform: `translate3d(${from.x || 0}px, ${from.y || 0}px,0px)`
            }}
            className={clsx(
                classes.container, 
                className, 
                triggered ? onActivatedClasses : onDeactivatedClasses,
            )} { ...props } 
            ref={containerRef}>
            { children }
        </Component>
    )
}  

export default React.memo(Element); 