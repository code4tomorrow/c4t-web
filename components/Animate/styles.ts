import { makeStyles } from "@utils/tss";

export const useStyles = makeStyles({ name: "animate" })(() => ({
    container: {
        WebkitBackfaceVisibility: "hidden",
        backfaceVisibility: "hidden",
    },
}));
