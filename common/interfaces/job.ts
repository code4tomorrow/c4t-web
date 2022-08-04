import { Document } from "@contentful/rich-text-types";
import { IJobFaction } from "common/enums/job";

export interface IJobPreview {
    title?: string; 
    skills?: string[],
    sys?: {
        id?: string; 
    },
    faction?: IJobFaction; 
}

export interface IJob extends IJobPreview {
    description?: {
        json: Document
    }
}