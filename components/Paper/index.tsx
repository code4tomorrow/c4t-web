import clsx from "clsx";
import React from "react";

interface PaperProps {
    children?: React.ReactNode,
    containerClass?: string;
    style?: React.CSSProperties
}

const Paper : React.FC<PaperProps> = ({ children, containerClass, style }) => {
    return (
        <div style={{ 
            boxShadow: "0px 0px 0px 1px #000000", ...style
        }} className={clsx(
            "border-0 border-t overflow-hidden rounded-md border-[#333333] border-solid bg-dark-grey-secondary",
            containerClass,
        )}>
            { children }
        </div>
    )
}

export default Paper; 