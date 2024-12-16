import clsx from "clsx";
import _isEqual from "lodash/isEqual";
import cloneDeep from "lodash/cloneDeep";
import React, {
    ComponentPropsWithoutRef,
    ElementType,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { useStyles } from "./styles";
import gsap from "gsap";
import isEqual from "react-fast-compare";

interface ScrubProps<T extends ElementType = "div"> {
    as?: T;
    className?: string;
    children: React.ReactNode;
    from?: gsap.TweenVars;
    to?: gsap.TweenVars;
    start?: string;
    end?: string;
}

const Scrub = <T extends ElementType = "div">(
    {
        as,
        className,
        children,
        from = {},
        to = {},
        start,
        end,
        ...props
    }: ScrubProps<T> & ComponentPropsWithoutRef<T>,
    ref: any
) => {
    const containerRef = useRef<HTMLDivElement | null>(null);

    const [animation, setAnimation] = useState<{
        from?: gsap.TweenVars;
        to?: gsap.TweenVars;
    }>({ from: undefined, to: undefined });

    useEffect(() => {
        if (!_isEqual(from, animation.from) || !_isEqual(to, animation.to)) {
            setAnimation({ from: cloneDeep(from), to: cloneDeep(to) });
        }
    }, [from, to, animation.from, animation.to]);

    const animateContainer = useCallback(() => {
        if (
            !containerRef.current ||
            !Object.keys(animation.to || {}).length ||
            !Object.keys(animation.from || {}).length
        )
            return;

        const tl = gsap
            .timeline({
                repeat: 0,
                scrollTrigger: {
                    start: start,
                    end: end,
                    scrub: true,
                    invalidateOnRefresh: true,
                    trigger: ref?.current || containerRef.current,
                },
            })
            .fromTo(
                containerRef.current,
                animation.from || {},
                animation.to || {}
            );

        return () => {
            if (ref?.current) gsap.killTweensOf(ref.current);
            gsap.killTweensOf(containerRef.current);
            tl.kill();
        };
    }, [containerRef, animation.from, animation.to, ref, end, start]);

    const Component = as || "div";

    const { classes } = useStyles();

    useEffect(animateContainer, [animateContainer]);

    return (
        <Component
            className={clsx(classes.container, className)}
            {...props}
            ref={containerRef}
        >
            {children}
        </Component>
    );
};

export default React.memo(
    React.forwardRef(Scrub) as <
        T extends ElementType = "div",
        R = HTMLDivElement
    >(
        props: ScrubProps<T> &
            React.RefAttributes<R> &
            ComponentPropsWithoutRef<T>
    ) => React.ReactElement | null,
    isEqual
);
