import Footer from "@components/Footer";
import Navbar from "@components/Navbar";
import { NextPageWithLayout } from "common/interfaces/nextPageWithLayout";
import WatsonAssistantChat from "@layouts/WatsonAssistantChat";
import Head from "next/head";
import React, { ReactElement, useMemo, useState } from "react";
import JobPreview from "@components/JobBoard/JobPreview";
import Paper from "@components/Paper";
import useSWR from "swr";
import { fetcher } from "@utils/fetcher";
import { IJobPreview } from "common/interfaces/job";
import Animate from "@components/Animate";
import FullJob from "@components/JobBoard/FullJob";
import { Pages } from "common/enums/pages";
import { XIcon } from "@heroicons/react/outline";

const JobBoard : NextPageWithLayout = () => {
    const { data:jobs } = useSWR<IJobPreview[]>(Pages.API_JOB_PREVIEW, {
        fetcher,
        fallbackData: []
    })

    const [ jobId, setJobId ] = useState<string | undefined>();
    const selectedJob = useMemo(() => jobs?.find(job => job.sys?.id === jobId), [ jobId, jobs ]);

    return (
        <div 
            style={{ width: "100vw" }} 
            className="flex flex-col w-screen top-[100px] min-h-screen items-center bg-dark-grey-primary">
            <Head>
                <title>Job Board | C4T</title>
            </Head>
            <Navbar />
            <Animate>
                <main className="flex my-6 space-x-3 w-full max-w-6xl px-3">
                    <div className="space-y-3 w-[100%] md:w-[40%]">
                        {
                            jobs?.map((preview) => (
                                <JobPreview
                                    selected={jobId === preview.sys?.id}
                                    onClick={(id) => setJobId(id)}
                                    key={preview.sys?.id} 
                                    preview={preview} 
                                />
                            ))
                        }
                    </div>
                    <div className="hidden md:block overflow-hidden md:overflow-auto md:w-[60%] h-[500px] md:!sticky top-5">
                        {
                            !!selectedJob && (
                                <Paper containerClass="w-full h-full">
                                    <div className="flex z-50 justify-between [&>*]:transition-opacity [&>*]:hover:opacity-50 items-center p-3 absolute top-0 right-0">
                                        <button 
                                            aria-label="hide job"
                                            name="hide job"
                                            onClick={() => { setJobId(undefined) }} 
                                            type="button" 
                                            className="text-gray-400 bg-transparent border-b-4 border-transparent rounded-lg text-sm p-1.5 ml-auto inline-flex items-center" data-modal-toggle="small-modal">
                                            <XIcon style={{ width: 22.5 }} />  
                                        </button>
                                    </div>
                                    <FullJob preview={selectedJob} />
                                </Paper>
                            )
                        }
                    </div>
                </main>
            </Animate>
            <Footer/>
        </div>
    )
}

JobBoard.getLayout = (page: ReactElement ) => {
    return (
        <WatsonAssistantChat>
        { page }
        </WatsonAssistantChat>
    )
}

export default JobBoard; 