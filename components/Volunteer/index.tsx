import Paper from "@components/Paper";
import clsx from "clsx";
import React from "react";
import { useStyles } from "./styles";

const Volunteer = () => {
    const { classes } = useStyles();

    return (
      <div>
        <Paper containerClass={clsx("w-[300px] h-[400px] relative after:bg-gradient-to-tr after:from-brand-green after:to-green-400", classes.container)}>
        </Paper>
      </div>
    )
}

export default Volunteer; 