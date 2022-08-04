import Footer from "@components/Footer";
import Navbar from "@components/Navbar";
import { NextPageWithLayout } from "common/interfaces/nextPageWithLayout";
import WatsonAssistantChat from "@layouts/WatsonAssistantChat";
import Head from "next/head";
import React, { ReactElement } from "react";
import JobPreview from "@components/JobBoard/JobPreview";
import Paper from "@components/Paper";
import useSWR from "swr";
import { fetcher } from "@utils/fetcher";
import { IJobPreview } from "common/interfaces/job";

const JobBoard : NextPageWithLayout = () => {
    const { data:jobs } = useSWR<IJobPreview[]>('/api/contentful/jobs/preview', {
        fetcher,
        fallbackData: []
    })

    return (
        <div 
            style={{ width: "100vw" }} 
            className="flex flex-col w-screen top-[100px] min-h-screen items-center bg-dark-grey-primary">
            <Head>
                <title>Job Board | C4T</title>
            </Head>
            <Navbar />
            <main className="flex my-6 space-x-3 w-full max-w-6xl px-3">
                <div className="space-y-3 w-[100%] md:w-[40%]">
                    {
                        jobs?.map((preview) => (
                            <JobPreview key={preview.sys?.id} preview={preview} />
                        ))
                    }
                </div>
                <div className="none overflow-hidden md:overflow-auto md:w-[60%] h-[500px] md:!sticky top-5">
                    <Paper containerClass="w-full h-full">

                    </Paper>
                </div>
            </main>
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