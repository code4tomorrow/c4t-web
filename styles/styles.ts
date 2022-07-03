import { makeStyles } from "tss-react/mui";

export const useStyles = makeStyles()(() => ({
    carouselContainer: {
        position: "relative",
        "&::before": {
            content: "''",
            borderRadius: "15%",
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0)",
            display: "block",
            position: "absolute",
            boxShadow: `-50px -25px 175px 0px rgba(94, 158, 255, 0.35),    
                        50px -25px 175px 0px rgba(227, 146, 255, 0.35)`,
        }
    },
    blinkingCursor: {
        opacity: 0,
        animation: "blink 750ms forwards step-end infinite",
        "@keyframes blink": {
            "0%": {
                opacity: 1,
            },
            "50%": {
                opacity: 0,
            },
            "100%": {
                opacity: 1,
            },
        } 
    }
}))