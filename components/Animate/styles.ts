import { makeStyles } from "tss-react/mui";

export const useStyles = makeStyles({ name: "animate" })(() => ({
    container: {
        "WebkitBackfaceVisibility": "hidden",
        "backfaceVisibility": "hidden"
    }
}));