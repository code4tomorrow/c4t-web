import React, { useEffect, useState } from "react";
import Image, { ImageProps } from "next/image";

interface NextImageProps extends ImageProps {
    fallbackSrc?: string; 
}

const NextImage : React.FC<NextImageProps> = ({ src, fallbackSrc, ...props }) => {
    const [ currentSrc, setCurrentSrc ] = useState(src);

    useEffect(() => { setCurrentSrc(src)}, [ src ]);

    return (
        <Image 
            src={currentSrc}
            onError={() => {
                console.error(`%cImage Resource Not Found: ${src}`, "color:red");
                if (fallbackSrc) setCurrentSrc(fallbackSrc);
            }}
            { ...props }
        />
    )
}

export default NextImage; 