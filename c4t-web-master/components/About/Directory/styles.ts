import { makeStyles } from "tss-react/mui";

export const useStyles = makeStyles()(() => ({
    container: {
        "&::-webkit-scrollbar": {
            width: 0,
            height: 3,
            backgroundColor: "transparent",
        },
        "@media (max-width: 1280px)": {
            "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(255,255,255,0.25)",
                borderRadius: 3,
            },
        },
    },
    thead: {
        boxShadow: "0px 5px 7.5px 3px #202124",
    },
    table: {
        "& *::-webkit-scrollbar": {
            width: 0,
            height: 0,
            backgroundColor: "transparent",
        },
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
            backgroundColor: "transparent",
        },
    },
}));
