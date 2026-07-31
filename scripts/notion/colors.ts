/**
 * Notion's named swatches -> the hex values the directory tags render with.
 * Lives beside the snapshot script because Notion colors are only ever
 * resolved when regenerating data/*.json — never at build or request time.
 */
export const notionColorMap = (color: string) => {
    switch (color) {
        case "green":
            return "#1D9757";
        case "yellow":
            return "#D3B020";
        case "blue":
            return "#2C50FF";
        case "red":
            return "#F36F65";
        case "pink":
            return "#DF5EBA";
        case "orange":
            return "#E18D22";
        case "purple":
            return "#C633BF";
        default:
            return color;
    }
};
