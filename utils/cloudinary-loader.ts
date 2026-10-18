import { ImageLoader, ImageLoaderProps } from "next/image";
import config from "../config";

export const cloudinaryExternalLoader = ({
    src,
    quality,
}: Omit<ImageLoaderProps, "width">): string => {
    return `${config.cloudinary.url}/image/fetch/q_${
        quality || 75
    },fl_sanitize/${src}`;
};

export const cloudinaryLoader: ImageLoader = ({
    src,
    width,
    quality,
}: ImageLoaderProps): string => {
    return `${config.cloudinary.url}/image/upload/w_${width},q_${
        quality || 75
    },f_auto/web-assets/${src}`;
};

export const cloudinaryTransformLoader = ({
    transformations,
}: {
    transformations: string[];
}): ImageLoader => {
    let transformProperties = "";

    transformations.forEach((transform) => {
        transformProperties += `,${transform}`;
    });

    return ({ src, width, quality }: ImageLoaderProps) => {
        return `${config.cloudinary.url}/image/upload/w_${width},q_${
            quality || 75
        },f_auto${transformProperties}/web-assets/${src}`;
    };
};

/**
 * Default Cloudinary URL for an image under web-assets/, with automatic
 * quality and format. A template string rather than cloudinary-build-url, which
 * added a URL-builder library to every page for this one fixed pattern.
 */
export const getCloudinaryURL = (path: string) =>
    `${config.cloudinary.url}/image/upload/q_auto,f_auto/web-assets/${path}`;
