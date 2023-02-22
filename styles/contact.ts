import { makeStyles } from "tss-react/mui";

export const useStyles = makeStyles()(() => ({
    gradientBubble: {
        position: "absolute",
        right: 0,
        top: 0,
        userSelect: "none",
        width: "100%",
        filter: "blur(92px)",
        transform: "rotate(180deg) translateZ(0) translateY(100%)",
        borderRadius: "40%",
        minHeight: 200,
        backgroundImage: "linear-gradient( 90deg, #5A4CAD 25%,  #0B6455 75% )"
    },
    gradientBubbleBottom: {
        position: "absolute",
        right: 0,
        bottom: 0,
        userSelect: "none",
        width: "100%",
        filter: "blur(92px)",
        WebkitTransform: "translate3d(0, 100%, 0)",
        transform: "translate3d(0, 100%, 0)",
        borderRadius: "40%",
        minHeight: 200,
        backgroundImage: "linear-gradient( 90deg, #5A4CAD 25%,  #0B6455 75% )"
    }
}))