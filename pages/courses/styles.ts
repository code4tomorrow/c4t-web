import { makeStyles } from "tss-react/mui";

export const useStyles = makeStyles({ name: "coursePage"})(() => ({
    mobileCoursesContainer: {
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))"
    }
}))