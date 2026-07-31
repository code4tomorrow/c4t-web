import { EJobFaction } from "common/enums/job";

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
