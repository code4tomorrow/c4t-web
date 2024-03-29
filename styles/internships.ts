import { makeStyles } from "tss-react/mui";

export const useStyles = makeStyles()(() => ({
    gradientBubble: {
        position: "absolute",
        top: 0,
        right: 0,
        userSelect: "none",
        width: "100%",
        height: "30%",
        filter: "blur(92px)",
        transform:
            "rotate(30deg) translateZ(0) translateX(-50%) translateY(100%)",
        borderRadius: "40%",
        maxHeight: 400,
        maxWidth: 1200,
        left: "50%",
        background:
            "linear-gradient( 90deg, #5A4CAD 25%,  rgba(221, 14, 255, 0.15) 75% )",
    },
}));
