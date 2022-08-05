import { makeStyles } from "tss-react/mui";

export const useStyles = makeStyles({ name: "job" })(() => ({
    previewContainer: {
        transition: "box-shadow 250ms ease",
        boxShadow: "none"
    },
    previewContainerSelected: {
        boxShadow: `0px 0px 0px 2px #7892EE !important`
    }
}));    