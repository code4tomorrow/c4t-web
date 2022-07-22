import React from "react";
import GoArrowSVG from "@svg/go-arrow.svg";
import clsx from "clsx";
import { useStyles } from "./styles";

interface GoArrowProps extends React.ComponentPropsWithoutRef<"span"> {
    color?: string; 
}

const GoArrow : React.FC<GoArrowProps> = ({ color="#fff", className, ...props }) => {
    const { classes } = useStyles();

    return (
        <span className={clsx(classes.container, className)} { ...props }>
            <GoArrowSVG data-go-arrow="" color={color} />
        </span>
    )
}

export default GoArrow; 