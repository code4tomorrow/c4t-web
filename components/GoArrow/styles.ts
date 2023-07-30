import { makeStyles } from "tss-react/mui";

export const useStyles = makeStyles()(() => ({
    container: {
        transition: "150ms ease",
        "& > svg[data-go-arrow]": {
            transition: "150ms ease",
            transform: "translateX(-5px)",
        },
        "& > svg[data-go-arrow] .octicon-chevrow-stem": {
            transition: "150ms ease",
            strokeDasharray: 100,
            strokeDashoffset: 100,
        },
        "&:hover > svg[data-go-arrow]": {
            transition: "150ms ease",
            transform: "translateX(0px)",
        },
        "&:hover > svg[data-go-arrow] .octicon-chevrow-stem": {
            transition: "100ms ease",
            strokeDasharray: 0,
            strokeDashoffset: 0,
        },
    },
}));
