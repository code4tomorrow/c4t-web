import { makeStyles } from "tss-react/mui";

export interface IStyleParams {
    primary?: string; 
    accent?: string; 
}

export const useStyles = makeStyles<IStyleParams>()((_, { accent, primary }) => ({
    container: {
        overflow: "hidden",
        background: primary || "#111111",
        "&::before": {
            content: "''",
            position: "absolute",
            display: "block",
            top: 0,
            left: 0,
            width: "200%",
            height: '100%',
            transform: "translateX(100%)",
            background: `linear-gradient(to right, ${primary || "#111111"}, ${accent || "rgba(255,255,255,0.35)"}, ${primary || "#111111"})`,
            animation: "slide 1500ms ease infinite 0ms",
        },
        "@keyframes slide": {
            "0%": {
                transform: "translateX(100%)",
            },
            "100%": {
                transform: "translateX(-100%)",
            }
        }
    }
}));