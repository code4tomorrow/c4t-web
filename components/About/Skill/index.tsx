import Paper from "@components/Paper";
import clsx from "clsx";
import React from "react";
import { useStyles } from "./styles";

interface SkillProps {
    stat: string; 
    label: string; 
    children?: string; 
}

const Skill : React.FC<SkillProps> = ({ stat, label, children }) => {
    const { classes } = useStyles();

    return (
        <Paper containerClass={clsx(
            "[&>*]:z-10 sm:p-4 sm:before:h-[47.5%] before:h-[25%] p-3 space-y-3 h-72 w-full sm:max-w-none max-w-[250px] flex sm:justify-center flex-col",
            classes.container
        )}>
            <h1 className="text-brand-purple-secondary sm:text-5xl text-4xl font-bold">{ stat }</h1>
            <h2 className="text-white text-xl sm:text-2xl font-semibold">{ label }</h2>
            <p className="text-medium-grey text-base font-semibold">{children}</p>
        </Paper>
    )
}

export default Skill;