import clsx from "clsx";
import React, { ReactNode, useRef, useState } from "react";
import { useStyles } from "./styles";
import Arrow from "../../public/svg/arrow.svg";

interface BrandButtonProps extends React.HTMLProps<HTMLButtonElement> {
    title: string; 
    onClick?: (e:React.MouseEvent<HTMLButtonElement, MouseEvent>) => void; 
    flex?: number,
    containerClass?: string,
    children?: ReactNode,
    label?: string,
    variant?: 'gradient' | 'default'
} 

const BrandButton : React.FC<BrandButtonProps> = ({ variant = "gradient", disabled, label, containerClass, title, className, onClick, flex = 0, children }) => {
    const handleOnClick = (e:React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();
        if (onClick && typeof onClick === "function") onClick(e);
    }

    const { classes } = useStyles();

    const [ mouseActive, setMouseActive ] = useState(false);
    const [ mouseCoords, setMouseCoords ] = useState<{ x:number, y:number}>({
        x: 0, y: 0
    })

    const buttonRef = useRef<HTMLButtonElement | null>(null);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!buttonRef.current) return; 
        const { x, y } = buttonRef.current.getBoundingClientRect(); 

        setMouseCoords({ 
            x: ~~(e.clientX - x), 
            y: ~~(e.clientY - y)
        });
    }

    return (
        <div className={clsx("relative", containerClass)} style={{ flex }}>
            <button 
                ref={buttonRef}
                onMouseOver={() => setMouseActive(true)}
                onMouseLeave={() => setMouseActive(false)}
                onMouseMove={handleMouseMove}
                style={{ 
                    "--x": mouseCoords.x + "px",
                    "--y": mouseCoords.y + "px",
                    "--size": mouseActive ? "150px" : "0px",
                    cursor: disabled ? "not-allowed" : "pointer",
                    filter: disabled ? "brightness(75%)" : "initial",
                } as React.CSSProperties}
                disabled={disabled}
                onClick={handleOnClick}
                className={clsx(
                    "",
                    "bg-gradient-to-b from-brand-blue-primary to-brand-green font-medium text-white border-0 rounded-xl py-3 px-6", 
                    "items-center flex justify-center space-x-2",
                    classes.button,
                    className
                )}>
                    <span className="text-sm">{ title }</span>
                    
                    { children }
            </button>
            {
                label && (
                    <div style={{ transform: "translate(-50%)" }} className="absolute flex items-end left-1/2">
                        <Arrow className="mt-2" width="15px" />
                        <span 
                            style={{ whiteSpace: "nowrap", transform: "translateY(25%)" }} 
                            className="text-medium-grey-primary text-xs">
                                { label }
                        </span>
                    </div>
                )
            }
        </div>
    )
}

export default BrandButton;