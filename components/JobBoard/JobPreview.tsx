import Paper from "@components/Paper";
import { IJobPreview } from "common/interfaces/job";
import React, { useMemo } from "react";

interface IJobPreviewProps {
    preview: IJobPreview
}

const JobPreview : React.FC<IJobPreviewProps> = ({ preview }) => {
    return (
      <Paper
        containerClass="w-full space-y-3  p-6 flex flex-col">
        <h1 className="text-white text-2xl font-bold">{ preview.title }</h1>
        <h2 className="text-white text-medium font-semibold">
            <span className="bg-dark-grey-accent rounded p-1 px-2">
                <span className="capitalize">{preview.faction} Faction</span>
            </span>
        </h2>
      </Paper>
    )
}

export default JobPreview; 