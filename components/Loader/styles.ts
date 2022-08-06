import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles<{ barCount: number }>({ name: "loader" })((_, { barCount }) => ({
    container: {
        position: "relative",
        width: 25,
        height: 25,
        display: "flex",
        justifyContent: "center",
        alignItems: 'center',

        "& > span": {
            width: 5,
            height: 1,
            background: "rgba(255, 255, 255, 0.2)",
            display: "block",
            position: "absolute",
            transform: `rotate(calc(360deg / ${barCount} * var(--i))) translate(7.5px, 0px)`,
            animation: "blinking 1000ms infinite",
            animationDelay: "calc(var(--i) * 100ms)",
            "@keyframes blinking": {
                from: {
                    background: "rgba(255, 255, 255, 0.2)",
                }, 
                to: {
                    background: "rgba(255, 255, 255, 0.7)",
                }
            }
        }
    },
   
}));