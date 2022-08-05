import Footer from "@components/Footer";
import Navbar from "@components/Navbar";
import { NextPageWithLayout } from "common/interfaces/nextPageWithLayout";
import WatsonAssistantChat from "@layouts/WatsonAssistantChat";
import Head from "next/head";
import React, { ReactElement, useCallback, useEffect, useMemo, useState } from "react";
import JobPreview from "@components/JobBoard/JobPreview";
import Paper from "@components/Paper";
import useSWRInfinite from "swr/infinite";
import { fetcher } from "@utils/fetcher";
import { IJobPreview } from "common/interfaces/job";
import Animate from "@components/Animate";
import FullJob from "@components/JobBoard/FullJob";
import { XIcon } from "@heroicons/react/outline";
import { getAPIJobsPreview } from "common/endpoints/jobs";
import WorkSVG from "@svg/work.svg";
import BrandButton from "@components/BrandButton";
import config from "config";
import { graphQLClient, IPagination } from "@utils/contentful";
import { gql } from "graphql-request";
import { INotificationFlag } from "common/interfaces/navigationFlag";
import { InferGetStaticPropsType } from "next";
import Modal from "@components/Modal";
import useDimensions from "hooks/useDimensions";
import flatMap from "lodash/flatMap";

const getJobAPIKey = (pageIndex:number) => {
    return getAPIJobsPreview(pageIndex, 5);        
  }
  

const JobBoard : NextPageWithLayout<InferGetStaticPropsType<typeof getStaticProps>> = ({ notificationFlags }) => {
    const [ jobId, setJobId ] = useState<string | undefined>();

    const { data:jobPages, error, setSize, size } = useSWRInfinite<IPagination<IJobPreview>>(getJobAPIKey, {
        fetcher,
        fallbackData: [],
    })

    const jobs = useMemo(() => flatMap(jobPages?.map(({ items }) => items || [])), [jobPages]);

    const loading = useMemo(() => jobs?.length === 0 && !error, [ error, jobs ]);
    const selectedJob = useMemo(() => jobs?.find(job => job.sys?.id === jobId), [ jobId, jobs ]);

    const { width } = useDimensions({ enableDebounce: true })
    const isMobile = useMemo(() => width < 768, [ width ]);

    const hasMore = useMemo(() => {
        const lastPage = jobPages?.slice(-1); 
        if (lastPage && lastPage?.length !== 0) {
            return (lastPage[0].skip || 0) + (lastPage[0].items?.length || 0) !== lastPage[0].total;
        }
        return false; 
    }, [ jobPages ]);

    const handleNextPage = () => {
        setSize(size + 1);
    }

    return (
        <div 
            style={{ width: "100vw" }} 
            className="flex flex-col w-screen top-[100px] min-h-screen items-center bg-dark-grey-primary">
            <Head>
                <title>Job Board | C4T</title>
            </Head>
            <Navbar notificationFlags={notificationFlags}/>
            {
                isMobile && (
                    <Modal open={!!selectedJob} setOpen={() => { setJobId(undefined) }}>
                        { selectedJob && <FullJob preview={selectedJob} /> }
                    </Modal>
                )
            }
            <Animate>
                <header className="w-screen flex md:flex-row items-center flex-col max-w-6xl p-3 md:p-6">
                    <div className="w-[85%] md:max-w-none max-w-[450px] md:w-[40%] p-3 md:p-6 flex flex-col justify-center">
                        <WorkSVG width="100%"/>
                    </div>
                    <div className="p-3 md:p-6 w-full md:w-[60%] flex space-y-6 flex-col justify-center">
                        <h1 
                            style={{ lineHeight: "1.1"}}
                            className="text-white text-6xl xs:text-7xl font-bold">
                                Open Member <span className="text-brand-purple-secondary">Positions</span>.
                        </h1>
                        <h2 className="text-medium-grey">
                            Please understand, if you are interested in learning these things, but don't have experience, you should still apply! We'll teach you what you need to know.
                        </h2>
                        <BrandButton
                            as="a"
                            style={{ display: "inline-block" }}
                            rel="noopener noreferrer nofollow"
                            target={"_blank"}
                            href="https://tally.so/r/mVgJl3"
                            title="Apply Today."
                        />
                    </div>
                </header>
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
                        {
                            Array.from({ length: loading ? 5 : 0 }).map((_, i) => (
                                <JobPreview 
                                    key={i}
                                    selected={false}
                                    onClick={(id) => setJobId(id)}
                                    preview={undefined}
                                />
                            ))
                        }
                        <div>
                            {
                                hasMore ? (
                                    <p 
                                        role="button"
                                        onClick={handleNextPage}
                                        className="text-brand-purple-secondary hover:opacity-75 transition-opacity cursor-pointer text-center">
                                            Load More
                                    </p>
                                ) : (
                                    <p className="text-medium-grey text-center">
                                       <span className="text-brand-purple-secondary">Stay Tuned</span> for more Member Positions.
                                    </p>
                                )
                            }
                        </div>
                    </div>
                    <div className="hidden md:block overflow-hidden md:overflow-auto md:w-[60%] h-min md:!sticky top-5">
                        {
                            !!selectedJob && !isMobile ? (
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
                            ) : <></>
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

export async function getStaticProps() {
    const response = await graphQLClient.request(gql`
      query($preview:Boolean, $where:NotificationFlagFilter) {
        notificationFlagCollection(preview:$preview, where:$where) {
          items {
            notification {
              json
            },
            type,
            link
          }
        }
    }
    `, { 
        preview: config.contentful.preview,
        where: { 
            isVisible:true, 
            pages_contains_some:["/jobboard", "*"]
        }
    });

    const notificationFlags:INotificationFlag[] = response?.notificationFlagCollection?.items || [];  

    return {
      props: { 
        notificationFlags
      },
      // - At most once every 15 minutes
      revalidate: 60 * 15, // In seconds
    }
}

export default JobBoard; 