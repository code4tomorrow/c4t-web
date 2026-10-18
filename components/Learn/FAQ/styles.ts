import { makeStyles } from "@utils/tss";

export const useStyles = makeStyles()(() => ({
    answerContainer: {
        "&::-webkit-scrollbar": {
            width: 0,
            backgroundColor: "transparent",
        },
    },
}));
