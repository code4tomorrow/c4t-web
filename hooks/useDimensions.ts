import React, { useEffect } from "react";
import { useDebounce } from "use-debounce";

interface IUseDimensionsProps {
    enableDebounce?: boolean; 
    debounceWait?: number; 
    resize?: boolean; 
}

const useDimensions = ({
        enableDebounce = false,
        debounceWait = 150, 
        resize = true 
    } : IUseDimensionsProps = { 
        enableDebounce: false, 
        debounceWait: 150, 
        resize: true  
    }) => {
    const [dimensions, setDimensions] = React.useState({ 
        height: 0,
        width: 0
      })

    const [ debouncedDimensions ] = useDebounce(dimensions, debounceWait);

    useEffect(() => {
        function handleResize() {
            setDimensions({
                height: document.documentElement.clientHeight,
                width: document.documentElement.clientWidth,
            })
        }

        if (resize) {
            window.addEventListener('resize', handleResize)
            return () => window.removeEventListener("resize", handleResize)
        }
    }, [])

    useEffect(() => {
        setDimensions({ height: document.documentElement.clientHeight, width: document.documentElement.clientWidth});
    }, []);

    return enableDebounce && (debouncedDimensions.width != 0 || debouncedDimensions.height != 0) ? debouncedDimensions : dimensions;
}   

export default useDimensions;