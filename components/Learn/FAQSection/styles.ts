import { makeStyles } from "tss-react/mui";

export const useStyles = makeStyles()(() => ({
    faqTypeHeader: {
        "&::before": {
            content: "''",
            top: 0,
            transform: "translateY(-100%)",
            position: "absolute",
            width: "100%",
            left: 0,
            height: 25,
            background: "#111111"
        }
    }
}))