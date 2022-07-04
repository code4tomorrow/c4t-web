import { makeStyles } from "tss-react/mui";

export const useStyles = makeStyles()(() => ({
    nav: {},
    linksContainer: {
        boxShadow: "0px 0px 0px 1px #000000",
        transition: `150ms transform ease, 
                    150ms opacity ease`
    },
    barsContainer: {
        "&:hover > span": {
            opacity: 0.85,
        },
        "span": {
            transformOrigin: "center right",
            transition: "all 250ms ease",
            display: "block",
            background: "#fff",
            height: 2,
            width: 17,
            borderRadius: 5,
        }
    },
    mobileNavOpen: {
        "span:nth-of-type(1)": {
            transformOrigin: "center right",
            transform: "rotate(-45deg)",
        },
        "span:nth-of-type(2)": {
            opacity: "0 !important",
        },
        "span:nth-of-type(3)": {
            transformOrigin: "center right",
            transform: "rotate(45deg)",
        }
    }
}))