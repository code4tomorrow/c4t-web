import { makeStyles } from "tss-react/mui";

export const useStyles = makeStyles()(() => ({
    button: {
        transition: "height 200ms ease, transform 150ms ease",
        position: "relative",
        overflow: "hidden",
        "&:hover": {
            transform: "translateY(-2px)",
        },
        "&:active": {
            transform: "translateY(2px)",
        },
        "&::before": {
            content: "''",
            display: "block",
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            background: "rgba(0,0,0,0.25)",
            borderRadius: "5px"
        },
        "&::after": {
            content: "''",
            display: "block",
            left: 0,
            top: 0,
            width: "var(--size)",
            height: "var(--size)",
            background: "radial-gradient(circle closest-side, rgba(255,255,255,0.2), transparent)",
            transition: "height 200ms ease",
            borderRadius: "50%",
            position: "absolute",
            transform: "translate(calc(-50% + var(--x)), calc(-50% + var(--y)))"
        }
    },
}))