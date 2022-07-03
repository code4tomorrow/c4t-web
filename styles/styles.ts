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
            boxShadow: `-50px -25px 150px 0px rgba(94, 158, 255, 0.3),    
                        50px -25px 150px 0px rgba(227, 146, 255, 0.3)`,
        }
    }
}))