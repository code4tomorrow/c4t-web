import React, { useEffect, useState } from "react";
import Image, { ImageProps } from "next/image";
import { useStyles } from "./styles";
import clsx from "clsx";

interface NextImageProps extends ImageProps {
    fallbackSrc?: string; 
    transitionBlur?: boolean;
}

const NextImage : React.FC<NextImageProps> = ({ 
    src, 
    alt, 
    fallbackSrc, 
    transitionBlur = false, className, ...props 
}) => {
    const [ currentSrc, setCurrentSrc ] = useState(src);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => { setCurrentSrc(src)}, [ src ]);

    const { classes } = useStyles();

    return (
        <Image 
            alt={alt}
            src={currentSrc}
            className={clsx(
                className,
                loaded && transitionBlur ? classes.unblur : '',
            )}
            onLoadingComplete={() => setLoaded(true)}
            onError={() => {
                console.error(`%cImage Resource Not Found: ${src}`, "color:red");
                if (fallbackSrc) setCurrentSrc(fallbackSrc);
            }}
            { ...props }
        />
    )
}

export default NextImage; 