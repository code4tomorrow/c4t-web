import { useMemo } from "react";

interface IUseSizeClamp {
    minSize?: number;
    size: number;
    maxSize?: number;
}

const useSizeClamp = ({ minSize, size, maxSize }: IUseSizeClamp) => {
    const clampedSize = useMemo(() => {
        if (!minSize && !maxSize) {
            return size;
        } else if (minSize && !maxSize) {
            return size >= minSize ? size : minSize;
        } else if (maxSize && !minSize) {
            return size <= maxSize ? size : maxSize;
        } else {
            if (size > (maxSize as number)) return maxSize;
            else if (size < (minSize as number)) return minSize;
            else return size;
        }
    }, [size, minSize, maxSize]);

    return clampedSize;
};

export default useSizeClamp;
