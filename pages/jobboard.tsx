import Footer from "@components/Footer";
import Navbar from "@components/Navbar";
import { NextPageWithLayout } from "common/interfaces/nextPageWithLayout";
import Head from "next/head";
import React, {
    ReactElement,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
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
import Loader from "@components/Loader";
import WalkSVG from "@svg/walk.svg";
import WatsonAssistantChat from "@layouts/WatsonAssistantChat";

const getJobAPIKey = (pageIndex: number) => {
    return getAPIJobsPreview(pageIndex, 5);
};

const JobBoard: NextPageWithLayout<
    InferGetStaticPropsType<typeof getStaticProps>
> = ({ notificationFlags }) => {
    const [jobId, setJobId] = useState<{
        id: string | null | undefined;
        showContent: boolean;
    }>({ id: undefined, showContent: false });

    const {
        data: jobPages,
        error,
        setSize,
        size,
    } = useSWRInfinite<IPagination<IJobPreview>>(getJobAPIKey, {
        fetcher,
        fallbackData: [],
        errorRetryCount: 2,
        errorRetryInterval: 1000,
    });

    const jobs = useMemo(
        () => flatMap(jobPages?.map(({ items }) => items || [])),
        [jobPages]
    );

    const initialLoading = useMemo(
        () => jobs?.length === 0 && !error,
        [error, jobs]
    );
    const isLoadingMore =
        size > 0 && jobPages && typeof jobPages[size - 1] === "undefined";
    const selectedJob = useMemo(
        () => jobs?.find((job) => job.sys?.id === jobId.id),
        [jobId, jobs]
    );

    const { width } = useDimensions({ enableDebounce: true });
    const isMobile = useMemo(() => width < 768, [width]);

    useEffect(() => {
        if (
            jobId.id === undefined &&
            size === 1 &&
            jobs.length > 0 &&
            !isMobile
        ) {
            setJobId({ id: jobs[0].sys?.id, showContent: true });
        }
    }, [size, jobs, jobId, isMobile]);

    const hasMore = useMemo(() => {
        const lastPage = jobPages?.slice(-1);
        if (lastPage && lastPage?.length !== 0) {
            return (
                (lastPage[0].skip || 0) + (lastPage[0].items?.length || 0) !==
                lastPage[0].total
            );
        }
        return false;
    }, [jobPages]);

    const handleNextPage = () => {
        setSize(size + 1);
    };

    const total = useMemo(() => jobPages?.slice(-1)[0]?.total || 0, [jobPages]);

    const jobsContainerRef = useRef<HTMLDivElement | null>(null);
    const jobPreviewContainerRef = useRef<HTMLDivElement | null>(null);

    const extraPadding = useMemo(() => {
        if (!jobPreviewContainerRef.current || !jobsContainerRef.current)
            return 0;

        const { height: heightOne } =
            jobPreviewContainerRef.current.getBoundingClientRect();
        const { height: heightTwo } =
            jobsContainerRef.current.getBoundingClientRect();

        return Math.abs(heightOne - heightTwo);
    }, [jobPreviewContainerRef, jobsContainerRef, jobId, jobPages]);

    console.log(extraPadding);

    return (
        <div
            style={{ width: "100vw" }}
            className="flex flex-col w-screen top-[100px] min-h-screen items-center bg-dark-grey-primary"
        >
            <Head>
                <title>Job Board | C4T</title>
            </Head>
            <Navbar notificationFlags={notificationFlags} />
            <Animate>
                {isMobile && (
                    <Modal
                        fullWidth
                        open={!!selectedJob}
                        setOpen={() => {
                            setJobId({ id: null, showContent: false });
                        }}
                    >
                        {selectedJob && (
                            <div className="pb-16">
                                <FullJob preview={selectedJob} />
                            </div>
                        )}
                    </Modal>
                )}
                <header className="w-screen flex md:flex-row items-center flex-col max-w-6xl p-3 md:p-6">
                    <Animate.Element
                        resetAfterTriggered={false}
                        onDeactivatedClasses="scale-75"
                        onActivatedClasses="scale-100"
                        className="w-[85%] md:max-w-none duration-700 transition-transform max-w-[450px] md:w-[40%] p-3 md:p-6 flex flex-col justify-center"
                    >
                        <WorkSVG width="100%" />
                    </Animate.Element>
                    <div className="p-3 md:p-6 w-full md:w-[60%] flex space-y-6 flex-col justify-center">
                        <Animate.Element
                            resetAfterTriggered={false}
                            onDeactivatedClasses="scale-75"
                            onActivatedClasses="scale-100"
                            as="h1"
                            style={{ lineHeight: "1.1" }}
                            className="text-white duration-700 transition-transform text-6xl xs:text-7xl font-bold"
                        >
                            Open Member{" "}
                            <span className="text-brand-purple-secondary">
                                Positions
                            </span>
                            .
                        </Animate.Element>
                        <Animate.Element
                            resetAfterTriggered={false}
                            onDeactivatedClasses="scale-75"
                            onActivatedClasses="scale-100"
                            as="h2"
                            className="text-medium-grey duration-700 transition-transform"
                        >
                            Please understand, if you are interested in learning
                            these things, but don&apos;t have experience, you
                            should still apply! We&apos;ll teach you what you
                            need to know.
                        </Animate.Element>
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
                <main className="flex items-center flex-col my-6 w-full max-w-7xl px-3">
                    <div className="text-medium-grey h-4 mb-5">
                        {jobs.length ? (
                            <Animate.Element
                                as="p"
                                resetAfterTriggered={false}
                                onDeactivatedClasses="opacity-0"
                                onActivatedClasses="opacity-100"
                                className="transition-opacity duration-300"
                            >
                                Showing {jobs.length} of {total} Member
                                Positions
                            </Animate.Element>
                        ) : (
                            <></>
                        )}
                    </div>
                    <div className="flex space-x-3 w-full">
                        <div className="w-[100%] md:w-[40%]">
                            <div ref={jobsContainerRef} className="space-y-3">
                                {jobs?.map((preview) => (
                                    <JobPreview
                                        selected={jobId.id === preview.sys?.id}
                                        onClick={(id) => {
                                            if (id !== jobId.id && !isMobile) {
                                                setJobId({
                                                    id,
                                                    showContent: false,
                                                });
                                                requestAnimationFrame(() => {
                                                    setJobId({
                                                        id,
                                                        showContent: true,
                                                    });
                                                });
                                            } else {
                                                setJobId({
                                                    id,
                                                    showContent: true,
                                                });
                                            }
                                        }}
                                        key={preview.sys?.id}
                                        preview={preview}
                                    />
                                ))}
                                {Array.from({
                                    length: initialLoading ? 5 : 0,
                                }).map((_, i) => (
                                    <JobPreview
                                        key={i}
                                        selected={false}
                                        onClick={(id) =>
                                            setJobId({ id, showContent: true })
                                        }
                                        preview={undefined}
                                    />
                                ))}
                                <div className="flex justify-center items-center">
                                    {hasMore ? (
                                        <div
                                            role="button"
                                            onClick={handleNextPage}
                                            className="text-brand-purple-secondary space-x-2 flex hover:opacity-75 transition-opacity cursor-pointer text-center"
                                        >
                                            {isLoadingMore && <Loader />}
                                            <span>Load More</span>
                                        </div>
                                    ) : (
                                        <p className="text-medium-grey text-center">
                                            <span className="text-brand-purple-secondary">
                                                Stay Tuned
                                            </span>{" "}
                                            for more Member Positions.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div
                            ref={jobPreviewContainerRef}
                            className="hidden md:block overflow-hidden md:overflow-auto md:w-[60%] h-min md:!sticky top-5"
                        >
                            {!!selectedJob && !isMobile ? (
                                <Paper containerClass="w-full h-full">
                                    <div className="flex z-50 justify-between [&>*]:transition-opacity [&>*]:hover:opacity-50 items-center p-3 absolute top-0 right-0">
                                        <button
                                            aria-label="hide job"
                                            name="hide job"
                                            onClick={() => {
                                                setJobId({
                                                    id: null,
                                                    showContent: false,
                                                });
                                            }}
                                            type="button"
                                            className="text-gray-400 bg-transparent border-b-4 border-transparent rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                                            data-modal-toggle="small-modal"
                                        >
                                            <XIcon style={{ width: 22.5 }} />
                                        </button>
                                    </div>
                                    <FullJob
                                        preview={selectedJob}
                                        showContent={jobId.showContent}
                                    />
                                </Paper>
                            ) : (
                                <>
                                    {!isMobile && jobId.id === null ? (
                                        <Animate.Element
                                            onDeactivatedClasses="opacity-0"
                                            onActivatedClasses="opacity-100"
                                            resetAfterTriggered={false}
                                            className="w-full h-full flex delay-150 justify-center transition-opacity duration-300 items-center"
                                        >
                                            <div className="w-[50%] flex flex-col items-center space-y-6">
                                                <WalkSVG
                                                    width="100%"
                                                    height="100%"
                                                />
                                                <p className="text-medium-grey">
                                                    <span className="text-brand-purple-secondary">
                                                        Click
                                                    </span>
                                                    &nbsp;a Job to View Details.
                                                </p>
                                            </div>
                                        </Animate.Element>
                                    ) : (
                                        <></>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </main>
            </Animate>
            <Footer />
        </div>
    );
};

JobBoard.getLayout = (page: ReactElement) => {
    return <WatsonAssistantChat>{page}</WatsonAssistantChat>;
};

export async function getStaticProps() {
    const response = await graphQLClient.request(
        gql`
            query ($preview: Boolean, $where: NotificationFlagFilter) {
                notificationFlagCollection(preview: $preview, where: $where) {
                    items {
                        notification {
                            json
                        }
                        type
                        link
                    }
                }
            }
        `,
        {
            preview: config.contentful.preview,
            where: {
                isVisible: true,
                pages_contains_some: ["/jobboard", "*", "/jobs"],
            },
        }
    );

    const notificationFlags: INotificationFlag[] =
        response?.notificationFlagCollection?.items || [];

    return {
        props: {
            notificationFlags,
        },
        // - At most once every 15 minutes
        revalidate: 60 * 15, // In seconds
    };
}

export default JobBoard;
