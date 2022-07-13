import { makeStyles } from "tss-react/mui";

export const useStyles = makeStyles<{ accentColor: string }>()(({ palette }, { accentColor }) => ({
    container: {
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        WebkitTransformStyle: "preserve-3d",
        transition: "250ms transform ease",
        "&::before, &::after": {
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            WebkitTransformStyle: "preserve-3d",
            WebkitClipPath: "polygon(100% 0%, 0% 0% , 0% 43.20%, 1% 43.18%, 2% 43.10%, 3% 42.98%, 4% 42.81%, 5% 42.59%, 6% 42.34%, 7% 42.05%, 8% 41.73%, 9% 41.38%, 10% 41.01%, 11% 40.62%, 12% 40.23%, 13% 39.83%, 14% 39.43%, 15% 39.04%, 16% 38.67%, 17% 38.32%, 18% 37.99%, 19% 37.69%, 20% 37.44%, 21% 37.22%, 22% 37.04%, 23% 36.91%, 24% 36.83%, 25% 36.80%, 26% 36.82%, 27% 36.89%, 28% 37.00%, 29% 37.17%, 30% 37.37%, 31% 37.62%, 32% 37.91%, 33% 38.23%, 34% 38.57%, 35% 38.94%, 36% 39.33%, 37% 39.72%, 38% 40.12%, 39% 40.52%, 40% 40.91%, 41% 41.28%, 42% 41.64%, 43% 41.97%, 44% 42.27%, 45% 42.53%, 46% 42.76%, 47% 42.94%, 48% 43.07%, 49% 43.16%, 50% 43.20%, 51% 43.19%, 52% 43.12%, 53% 43.01%, 54% 42.86%, 55% 42.65%, 56% 42.41%, 57% 42.13%, 58% 41.82%, 59% 41.47%, 60% 41.11%, 61% 40.72%, 62% 40.33%, 63% 39.93%, 64% 39.53%, 65% 39.14%, 66% 38.76%, 67% 38.40%, 68% 38.07%, 69% 37.77%, 70% 37.50%, 71% 37.27%, 72% 37.08%, 73% 36.94%, 74% 36.85%, 75% 36.80%, 76% 36.81%, 77% 36.86%, 78% 36.97%, 79% 37.12%, 80% 37.32%, 81% 37.56%, 82% 37.83%, 83% 38.14%, 84% 38.48%, 85% 38.84%, 86% 39.23%, 87% 39.62%, 88% 40.02%, 89% 40.42%, 90% 40.81%, 91% 41.19%, 92% 41.55%, 93% 41.89%, 94% 42.19%, 95% 42.47%, 96% 42.70%, 97% 42.89%, 98% 43.04%, 99% 43.14%, 100% 43.19%)",
            clipPath: "polygon(100% 0%, 0% 0% , 0% 43.20%, 1% 43.18%, 2% 43.10%, 3% 42.98%, 4% 42.81%, 5% 42.59%, 6% 42.34%, 7% 42.05%, 8% 41.73%, 9% 41.38%, 10% 41.01%, 11% 40.62%, 12% 40.23%, 13% 39.83%, 14% 39.43%, 15% 39.04%, 16% 38.67%, 17% 38.32%, 18% 37.99%, 19% 37.69%, 20% 37.44%, 21% 37.22%, 22% 37.04%, 23% 36.91%, 24% 36.83%, 25% 36.80%, 26% 36.82%, 27% 36.89%, 28% 37.00%, 29% 37.17%, 30% 37.37%, 31% 37.62%, 32% 37.91%, 33% 38.23%, 34% 38.57%, 35% 38.94%, 36% 39.33%, 37% 39.72%, 38% 40.12%, 39% 40.52%, 40% 40.91%, 41% 41.28%, 42% 41.64%, 43% 41.97%, 44% 42.27%, 45% 42.53%, 46% 42.76%, 47% 42.94%, 48% 43.07%, 49% 43.16%, 50% 43.20%, 51% 43.19%, 52% 43.12%, 53% 43.01%, 54% 42.86%, 55% 42.65%, 56% 42.41%, 57% 42.13%, 58% 41.82%, 59% 41.47%, 60% 41.11%, 61% 40.72%, 62% 40.33%, 63% 39.93%, 64% 39.53%, 65% 39.14%, 66% 38.76%, 67% 38.40%, 68% 38.07%, 69% 37.77%, 70% 37.50%, 71% 37.27%, 72% 37.08%, 73% 36.94%, 74% 36.85%, 75% 36.80%, 76% 36.81%, 77% 36.86%, 78% 36.97%, 79% 37.12%, 80% 37.32%, 81% 37.56%, 82% 37.83%, 83% 38.14%, 84% 38.48%, 85% 38.84%, 86% 39.23%, 87% 39.62%, 88% 40.02%, 89% 40.42%, 90% 40.81%, 91% 41.19%, 92% 41.55%, 93% 41.89%, 94% 42.19%, 95% 42.47%, 96% 42.70%, 97% 42.89%, 98% 43.04%, 99% 43.14%, 100% 43.19%)",
        },  
        "&::before": {
            transition: "transform 400ms ease, background 350ms ease",
            content: "''",
            display: "block",
            position: "absolute",
            top: 0,
            left: 0,
            width: "400%",
            height: "100%",
            transform: "translate3d(0px, -5%, 0px)",
        },
        "&::after": {
            //WebkitBackground: `-webkit-linear-gradient(90deg, ${accentColor} 25%, #7892EE 100%)`,
            //background: `linear-gradient(0deg, ${accentColor} 25%, #7892EE 100%)`,
            background: "#7892EE",
            transition: "transform 400ms ease, background 350ms ease, 150ms opacity ease",
            content: "''",
            display: "block",
            position: "absolute",
            top: 0,
            left: 0,
            width: "400%",
            height: "100%",
            transform: "translate3d(0px, -8%, 0px)",
        },
    },
    flowSetup: {
        "&::before": {
            transition: "1000ms background ease",
            animation: "waveBefore 5000ms linear infinite",
            animationPlayState: "paused",
        },
        "&::after": {
            transition: "1000ms background ease, 150ms opacity linear",
            animation: "waveAfter 3500ms linear infinite",
            animationPlayState: "paused",
        },
        "@keyframes waveBefore": {
            from: {
                transform: "translate3d(0%, -5%, 0px)",
            },
            to: {
                transform: "translate3d(-50%, -5%, 0px)",
            }
        },
        "@keyframes waveAfter": {
            from: {
                transform: "translate3d(0%, -8%, 0px)",
            },
            to: {
                transform: "translate3d(-50%, -8%, 0px)",
            }
        },
    },
    description: {
        "&::-webkit-scrollbar": {
            width: 0,
            backgroundColor: "transparent"
        }
    },
    flowMotion: {
        "&::before": {
            animationPlayState: "running !important"
        },
        "&::after": {
            animationPlayState: "running !important"
        },
    },
    flowMotionMobile: {
        "@media (max-width: 768px)": {
            "&::before": {
                animationPlayState: "running !important"
            },
            "&::after": {
                animationPlayState: "running !important"
            },
        }
    }
}))