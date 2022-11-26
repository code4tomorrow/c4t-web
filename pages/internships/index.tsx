import Footer from "@components/Footer";
import Navbar from "@components/Navbar";
import { NextPageWithLayout } from "common/interfaces/nextPageWithLayout";
import Head from "next/head";
import React, { ReactElement, useEffect, useMemo, useRef, useState } from "react";
import JobPreview from "@components/JobBoard/JobPreview";
import Paper from "@components/Paper";
import useSWRInfinite from "swr/infinite";
import { fetcher } from "@utils/fetcher";
import { IJobPreview } from "common/interfaces/job";
import Animate from "@components/Animate";
import { XIcon } from "@heroicons/react/outline";
import { getAPIInternships } from "common/endpoints/jobs";
import InternSVG from "@svg/internship.svg";
import config from "config";
import { graphQLClient, IPagination } from "@utils/contentful";
import { gql } from "graphql-request";
import { INotificationFlag } from "common/interfaces/navigationFlag";
import { InferGetStaticPropsType } from "next";
import Modal from "@components/Modal";
import useDimensions from "hooks/useDimensions";
import flatMap from "lodash/flatMap";
import Loader from "@components/Loader";
import WalkSVG from "@svg/walk.svg";
import WatsonAssistantChat from "@layouts/WatsonAssistantChat";
import BrandButton from "@components/BrandButton";
import { useStyles } from "styles/internships";
import InternshipPreview from "@components/JobBoard/InternshipPreview";
import FullInternship from "@components/JobBoard/FullInternship";

const getInternshipURL = (pageIndex:number) => {
    return getAPIInternships(pageIndex, 5);        
}

const Internships : NextPageWithLayout<InferGetStaticPropsType<typeof getStaticProps>> = ({ notificationFlags }) => {
    const [ jobId, setJobId ] = useState<{
        id: string | null | undefined,
        showContent: boolean
    }>({ id: undefined, showContent: false });

    const { data:jobPages, error, setSize, size } = useSWRInfinite<IPagination<IJobPreview>>(getInternshipURL, {
        fetcher,
        fallbackData: [],
        errorRetryCount: 2,
        errorRetryInterval: 1000
    })

    const jobs = useMemo(() => flatMap(jobPages?.map(({ items }) => items || [])), [jobPages]);

    const initialLoading = useMemo(() => jobs?.length === 0 && !error, [ error, jobs ]);
    const isLoadingMore = size > 0 && jobPages && typeof jobPages[size - 1] === 'undefined'
    const selectedJob = useMemo(() => jobs?.find(job => job.sys?.id === jobId.id), [ jobId, jobs ]);

    const { width } = useDimensions({ enableDebounce: true })
    const isMobile = useMemo(() => width < 768, [ width ]);

    useEffect(() => {
        if (jobId.id === undefined && size === 1 && jobs.length > 0 && !isMobile) {
            setJobId({ id: jobs[0].sys?.id, showContent: true });
        }
    }, [ size, jobs, jobId, isMobile ]);

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

    const total = useMemo(() => jobPages?.slice(-1)[0]?.total || 0, [ jobPages ]);

    const jobsContainerRef = useRef<HTMLDivElement | null>(null);
    const jobPreviewContainerRef = useRef<HTMLDivElement | null>(null);

    const { classes } = useStyles();

    return (
        <div 
            style={{ width: "100vw" }} 
            className="flex flex-col w-screen top-[100px] min-h-screen items-center bg-dark-grey-primary">
            <Head>
                <title>Internships | C4T</title>
            </Head>
            <Navbar notificationFlags={notificationFlags}/>
            <Animate>
                {
                    isMobile && (
                        <Modal fullWidth open={!!selectedJob} setOpen={() => { setJobId({ id: null, showContent: false }) }}>
                            { selectedJob && (
                                <div className="pb-16">
                                    <FullInternship internship={selectedJob} />
                                </div>
                            )}
                        </Modal>
                    )
                }
                <header className="w-screen flex md:flex-row items-center flex-col max-w-7xl p-3 md:p-6">
                    <div className={classes.gradientBubble}></div>
                    <Animate.Element 
                        resetAfterTriggered={false}
                        onDeactivatedClasses="scale-75"
                        onActivatedClasses="scale-100"
                        className="w-[85%] md:max-w-none duration-700 transition-transform max-w-[450px] md:w-[40%] p-3 md:p-6 flex flex-col justify-center">
                        <InternSVG width="100%"/>
                    </Animate.Element>
                    <div className="p-3 md:p-6 w-full md:w-[60%] flex space-y-6 flex-col justify-center">
                        <Animate.Element
                            resetAfterTriggered={false}
                            onDeactivatedClasses="scale-75"
                            onActivatedClasses="scale-100"
                            as="h1" 
                            style={{ lineHeight: "1.1" }}
                            className="text-white duration-700 transition-transform text-5xl sm:text-6xl lg:text-7xl font-bold">
                                Explore Internship <span className="text-brand-purple-secondary">Opportunites</span>.
                        </Animate.Element>
                        <Animate.Element 
                            resetAfterTriggered={false}
                            onDeactivatedClasses="scale-75"
                            onActivatedClasses="scale-100"
                            as="h2" 
                            className="text-medium-grey duration-700 transition-transform">
                            High school students who specialize in specific skill sets by completing a short-term project for the internal organization.
                        </Animate.Element>
                        <BrandButton
                            as="a"
                            style={{ display: "inline-block" }}
                            rel="noopener noreferrer nofollow"
                            target={"_blank"}
                            href="https://tally.so/r/wobNke"
                            title="Apply Today."
                        />
                    </div>
                </header>
                <main className="flex items-center flex-col my-6 w-full max-w-7xl px-3">
                    <div className="text-medium-grey h-4 mb-5">
                        {
                            jobs.length ? (
                                <Animate.Element
                                    as="p"
                                    resetAfterTriggered={false}
                                    onDeactivatedClasses="opacity-0"
                                    onActivatedClasses="opacity-100"
                                    className="transition-opacity duration-300"
                                >
                                    Showing {jobs.length} of {total} Internships
                                </Animate.Element>
                            ) : <></>
                        }
                    </div>
                    <div className="flex space-x-3 w-full">
                        <div 
                            className="w-[100%] md:w-[40%]">
                            <div 
                                ref={jobsContainerRef}
                                className="space-y-3">
                                {
                                    jobs?.map((preview) => (
                                        <InternshipPreview
                                            internship={preview}
                                            selected={jobId.id === preview.sys?.id}
                                            onClick={(id) => {
                                                if (id !== jobId.id && !isMobile) {
                                                    setJobId({ id, showContent: false });
                                                    requestAnimationFrame(() => {
                                                        setJobId({ id, showContent: true });
                                                    });
                                                } else {
                                                    setJobId({ id, showContent: true });
                                                }
                                            }}
                                            key={preview.sys?.id} 
                                        />
                                    ))
                                }
                                {
                                    Array.from({ length: initialLoading ? 5 : 0 }).map((_, i) => (
                                        <JobPreview 
                                            internship={true}
                                            key={i}
                                            selected={false}
                                            onClick={(id) => setJobId({ id, showContent: true })}
                                            preview={undefined}
                                        />
                                    ))
                                }
                                <div className="flex justify-center items-center">
                                    {
                                        hasMore ? (
                                            <div
                                                role="button"
                                                onClick={handleNextPage}
                                                className="text-brand-purple-secondary space-x-2 flex hover:opacity-75 transition-opacity cursor-pointer text-center">
                                                    { isLoadingMore && <Loader /> }
                                                    <span>Load More</span>
                                            </div>
                                        ) : (
                                            <p className="text-medium-grey text-center">
                                            <span className="text-brand-purple-secondary">Stay Tuned</span> for more Internship Positions.
                                            </p>
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                        <div 
                            ref={jobPreviewContainerRef}
                            className="hidden md:block overflow-hidden md:overflow-auto md:w-[60%] h-min md:!sticky top-5">
                            {
                                !!selectedJob && !isMobile ? (
                                    <Paper containerClass="w-full h-full">
                                        <div className="flex z-50 justify-between [&>*]:transition-opacity [&>*]:hover:opacity-50 items-center p-3 absolute top-0 right-0">
                                            <button 
                                                aria-label="hide job"
                                                name="hide job"
                                                onClick={() => { setJobId({ id: null, showContent: false }) }} 
                                                type="button" 
                                                className="text-gray-400 bg-transparent border-b-4 border-transparent rounded-lg text-sm p-1.5 ml-auto inline-flex items-center" data-modal-toggle="small-modal">
                                                <XIcon style={{ width: 22.5 }} />  
                                            </button>
                                        </div>
                                        <FullInternship internship={selectedJob} showContent={jobId.showContent} /> 
                                    </Paper>
                                ) : (
                                   <>
                                    {
                                        !isMobile && jobId.id === null ? (
                                            <Animate.Element 
                                                onDeactivatedClasses="opacity-0"
                                                onActivatedClasses="opacity-100"
                                                resetAfterTriggered={false}
                                                className="w-full h-full flex delay-150 justify-center transition-opacity duration-300 items-center">
                                                <div className="w-[50%] flex flex-col items-center space-y-6">
                                                    <WalkSVG width="100%" height="100%" />
                                                    <p className="text-medium-grey">
                                                        <span className="text-brand-purple-secondary">Click</span> 
                                                        &nbsp;an Internship to View Details.
                                                    </p>
                                                </div>
                                            </Animate.Element>
                                        ) : <></>
                                    }
                                   </>
                                )
                            }
                        </div>
                    </div>
                </main>
            </Animate>
            <Footer/>
        </div>
    )
}

Internships.getLayout = (page: ReactElement ) => {
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
            pages_contains_some:["/internships", "*"]
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

export default Internships; 