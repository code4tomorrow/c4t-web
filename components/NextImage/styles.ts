import { makeStyles } from "tss-react/mui";

export const useStyles = makeStyles()(() => ({
    unblur: {
        animation: "unblur 0.15s linear",
        "@keyframes unblur": {
            from: {
                filter: "blur(20px)"
            },
            to: {
                filter: "blur(0)"
            }
        }
    }
}));