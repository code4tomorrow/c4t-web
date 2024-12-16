import { makeStyles } from "tss-react/mui";

export const useStyles = makeStyles()(() => ({
    nav: {},
    linksContainer: {
        boxShadow: "0px 0px 0px 1px #000000",
        transition: `150ms transform ease, 
                    150ms opacity ease`,
        "@media (max-width: 500px)": {
            width: "calc(100% - 30px)",
            right: 15,
            left: 15,
        },
    },
    linkContainer: {
        transition: "150ms ease opacity",
    },
    link: {
        transition: "150ms ease background",
        "@media (max-width: 767px)": {
            borderRadius: 5,
            paddingLeft: 10,
            marginBottom: 5,
            paddingRight: 10,
            "&:hover": {
                background: "rgba(255,255,255,0.075)",
            },
        },
    },
    linkActive: {
        "@media (max-width: 767px)": {
            background: "rgba(255,255,255,0.075)",
        },
    },
    barsContainer: {
        "&:hover > span": {
            opacity: 0.85,
        },
        span: {
            transformOrigin: "center right",
            transition: "all 250ms ease",
            display: "block",
            background: "#fff",
            height: 2,
            width: 17,
            borderRadius: 5,
        },
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
        },
    },
    notificationDot: {
        position: "relative",
        "&::before": {
            content: "''",
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
            transform: "scale(2.5)",
            zIndex: -1,
            borderRadius: "100%",
            animation: "radio 3000ms ease infinite",
        },
        "@keyframes radio": {
            "0%": {
                transform: "scale(1)",
            },
            "90%": {
                transform: "scale(2.5)",
            },
            "100%": {
                backgroundColor: "rgba(0,0,0,0)",
            },
        },
    },
}));
