import clsx from "clsx";
import React from "react";
import { IStyleParams, useStyles } from "./styles";

interface ISkeletonProps extends React.HTMLProps<HTMLDivElement> {};

const Skeleton : React.FC<ISkeletonProps & IStyleParams> = ({ className, primary, accent, ...props }) => {
    const { classes } = useStyles({ primary, accent });

    return (
        <div 
            className={clsx(
                "rounded relative", 
                classes.container, 
                className
            )} 
            { ...props } 
        />
    )
}

export default Skeleton;