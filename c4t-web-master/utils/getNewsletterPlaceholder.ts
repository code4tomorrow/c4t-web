import got from "got";
import lqip from "lqip-modern";

export const getNewsletterPlaceholder = async (
    url: string
): Promise<string | null> => {
    try {
        const { body } = await got(url, { responseType: "buffer" });
        const result = await lqip(body);
        return result.metadata.dataURIBase64;
    } catch (err: any) {
        if (err.message === "Input buffer contains unsupported image format") {
            return null;
        }

        console.warn("failed to create preview image", url, err.message);
        return null;
    }
};
