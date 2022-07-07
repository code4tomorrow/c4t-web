import { makeStyles } from "tss-react/mui";

export const useStyles = makeStyles()(() => ({
    course: {
        position: "relative",
    },
    description: {
        "&::-webkit-scrollbar": {
            background: "transparent",
            width: 3,
        },
        "&::-webkit-scrollbar-thumb": {
            transition: "all 100ms ease",
            background: "rgba(255, 255, 255, 0)",
            width: 3,
            borderRadius: 3,
        },
        "&:hover::-webkit-scrollbar-thumb": {
            background: "rgba(255, 255, 255, 0.15)",
        }
    }
}))