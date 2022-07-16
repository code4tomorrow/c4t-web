import { makeStyles } from "tss-react/mui";

export const useStyles = makeStyles()(() => ({
    thead: {
        boxShadow: "0px 5px 15px 3px #202124",
    },
    cell: {
        overflow: "auto",
        minWidth: 200,
        whiteSpace: "nowrap",
        color: "#fff",
        "& div span[data-tag]": {
            borderRadius: "0.25rem",
            padding: "0.25rem",
            fontSize: "0.875rem",
            lineHeight: "1.25rem",
            marginRight: 5,
        },
        "&::-webkit-scrollbar": {
            width: 0,
            height: 0,
            backgroundColor: "transparent"
        }
    }
}))