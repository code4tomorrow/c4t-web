import { EJobFaction } from "common/enums/job";

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

export const jobFactionMap = (faction: string) => {
    switch (faction) {
        case EJobFaction.CLASSES:
            return "#1D9757";
        case EJobFaction.EVENTS:
            return "#D3B020";
        case EJobFaction.INTERNAL_AFFAIRS:
            return "#F36F65";
        case EJobFaction.OUTREACH:
            return "#2C50FF";
        case EJobFaction.OPERATIONS:
            return "#1D9757";
        default:
            null;
    }
};
