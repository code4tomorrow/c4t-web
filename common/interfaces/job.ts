import { Document } from "@contentful/rich-text-types";
import { EJobFaction } from "common/enums/job";

export interface IJobPreview {
    title?: string; 
    sys?: {
        id?: string; 
    },
    faction?: EJobFaction; 
    realLifeJobs?: string[];
}

export interface IJob extends IJobPreview {
    description?: {
        json: Document
    },
    realLifeJobConnection?: {
        json: Document
    },
    responsibilities?: {
        json?: Document
    },
    skills?: {
        json?: Document
    }
}
export interface IInternship extends Omit<IJob, "faction"> {
    timeCommitment?: {
        json: Document
    },
    startDate?: string; 
    endDate?: string;
}