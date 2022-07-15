import { makeStyles } from "tss-react/mui";

export const useStyles = makeStyles()(() => ({
    thead: {
        backdropFilter: "blur(10px)",
        boxShadow: "0px 5px 15px 3px #202124",
    }
}))