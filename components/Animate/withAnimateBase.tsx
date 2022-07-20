import React, { useEffect, useContext} from "react";  
import { AnimateContext } from '.';

export const withAnimateBase = <P extends object>(Component: React.ComponentType<P>) : React.FC<P> => React.forwardRef(({ ...props }, ref) => {
    const ctx = useContext(AnimateContext);

    useEffect(() => {
        if (!ctx.isNestedInAnimate) {
            throw new Error("Animate.Element is not nested within Animate parent component.");
        }
    }, [ ctx ]);

    return <Component ref={ref} {...props as P} />;
})