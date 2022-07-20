import React, { useEffect, useContext} from "react";  
import { AnimateContext } from '.';

export const withAnimateBase = <P extends object, R = HTMLDivElement>(Component: React.ComponentType<P>) : React.FC<P> => {
    // TODO: Remove eslint disable rule and find an alternate solution
    /* eslint-disable react/display-name */
    const WithAnimateBase = React.forwardRef(({ ...props }, ref) => {
        const ctx = useContext(AnimateContext);
    
        useEffect(() => {
            if (!ctx.isNestedInAnimate) {
                throw new Error("Animate.Element is not nested within Animate parent component.");
            }
        }, [ ctx ]);
    
        return <Component ref={ref} {...props as P} />;
    })

    return WithAnimateBase as (props: P & React.RefAttributes<R>) => React.ReactElement | null;
}