import { makeStyles } from "tss-react/mui";

export const useStyles = makeStyles()(() => ({
    answerContainer: {
        "&::-webkit-scrollbar": {
            width: 0,
            backgroundColor: "transparent"
        }
    }
}))