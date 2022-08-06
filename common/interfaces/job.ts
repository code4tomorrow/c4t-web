import { Document } from "@contentful/rich-text-types";
import { EJobFaction } from "common/enums/job";

export interface IJobPreview {
    title?: string; 
    sys?: {
        id?: string; 
    },
    faction?: EJobFaction; 
}

export interface IJob extends IJobPreview {
    description?: {
        json: Document
    },
    responsibilities?: {
        json?: Document
    },
    skills?: {
        json?: Document
    }
}