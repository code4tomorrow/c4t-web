import clsx from "clsx";
import React from "react";
import { useStyles } from "./styles";

interface IBarStyles extends React.CSSProperties {
    "--i": number;
}

const BAR_COUNT = 12;

interface LoaderProps {
    className?: string;
    style?: React.CSSProperties;
}

const Loader: React.FC<LoaderProps> = ({ className, style }) => {
    const { classes } = useStyles({ barCount: BAR_COUNT });

    return (
        <div
            style={style}
            className={clsx(classes.container, !!className && className)}
        >
            {Array.from({ length: BAR_COUNT }).map((_, idx) => (
                <span key={idx} style={{ "--i": idx } as IBarStyles}></span>
            ))}
        </div>
    );
};

export default Loader;
