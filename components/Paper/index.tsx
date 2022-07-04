import clsx from "clsx";
import React from "react";

interface PaperProps {
    children?: React.ReactNode,
    containerClass?: string
}

const Paper : React.FC<PaperProps> = ({ children, containerClass }) => {
    return (
        <div style={{ 
            boxShadow: "0px 0px 0px 1px #000000",
        }} className={clsx(
            "border-0 border-t overflow-hidden rounded-md border-[#333333] border-solid bg-[rgba(255,255,255,0.04)]",
            containerClass,
        )}>
            { children }
        </div>
    )
}

export default Paper; 