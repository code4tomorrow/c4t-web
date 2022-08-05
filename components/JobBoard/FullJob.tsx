import Document from "@components/Document";
import { fetcher } from "@utils/fetcher";
import { getAPIJobByID } from "common/endpoints/jobs";
import { IJob, IJobPreview } from "common/interfaces/job";
import React, { useMemo } from "react";
import useSWR from "swr";

interface IFullJobProps {
    preview: IJobPreview
}

const FullJob : React.FC<IFullJobProps> = ({ preview }) => {
    const { data:queriedJob } = useSWR<IJob>(getAPIJobByID(preview.sys?.id), {
        fetcher
    });

    const job:IJob = useMemo(() => ({ ...preview, ...queriedJob }), [ preview, queriedJob ])

    return (
        <div className="w-full h-full p-4 space-y-3">
            <h1 className="text-white text-2xl font-bold">
                { job.title }
            </h1>
            { job.description?.json && <Document document={job.description.json} /> }
        </div>
    )
}

export default FullJob; 