import Animate from "@components/Animate";
import Document from "@components/Document";
import Skeleton from "@components/Skeleton";
import { fetcher } from "@utils/fetcher";
import clsx from "clsx";
import { getAPIJobByID } from "common/endpoints/jobs";
import { IJob, IJobPreview } from "common/interfaces/job";
import { jobFactionMap } from "common/maps/color";
import React, { useMemo } from "react";
import useSWR from "swr";
import { useDebounce } from "use-debounce";
import { useStyles } from "./styles";
import { BriefcaseIcon } from "@heroicons/react/outline";

interface IFullJobProps {
    preview: IJobPreview,
    showContent?: boolean; 
    internship?: boolean; 
}

const MEMBER_SIGNUP_LINK     = "https://tally.so/r/mVgJl3"; 
const INTERNSHIP_SIGNUP_LINK = "https://tally.so/r/wobNke"

const FullJob : React.FC<IFullJobProps> = ({ preview, showContent:_showContent = true, internship = false  }) => {
    const { data:queriedJob, error } = useSWR<IJob>(getAPIJobByID(preview.sys?.id), {
        fetcher
    });

    const isLoading = useMemo(() => !queriedJob && !error, [ queriedJob, error]);

    const [ isLoadingDebounced ] = useDebounce(isLoading, 300);

    const job:IJob = useMemo(() => ({ ...preview, ...queriedJob }), [ preview, queriedJob ])

    const { classes } = useStyles();

    const factionColor = useMemo(() => 
      preview?.faction? jobFactionMap(preview?.faction) : "#5A4CAD", 
    [ preview?.faction ])

    const containerRef = React.useRef<HTMLDivElement | null>(null);

    return (
        <article ref={containerRef} className="w-full transition-all h-full pb-4 space-y-3">
            <header className={clsx(
                "min-h-[6rem] flex py-4 justify-center before:!h-0 md:before:!h-full flex-col items-center border-b-dim-grey border-b",
                classes.fullJobHeader
            )}>
                <h1 className="text-white mt-3 md:mt-0 flex md:flex-row text-center flex-col space-y-2 md:space-y-0 space-x-2 text-2xl items-center z-10 font-bold">
                    <span>{ job.title }</span>
                    { 
                        !internship && (
                            <span 
                                style={{ backgroundColor: factionColor }}
                                className={clsx(
                                "rounded py-1 px-2 h-min relative text-sm font-semibold overflow-hidden",
                                !factionColor && "bg-brand-purple-secondary"
                                )}>
                                <span className="capitalize z-50 text-white">{preview?.faction}</span>
                            </span>
                        )}
                </h1>
                <a
                    rel="noopener noreferrer nofollow"
                    target={"_blank"}
                    href={internship ? INTERNSHIP_SIGNUP_LINK : MEMBER_SIGNUP_LINK}
                    className="text-brand-purple-secondary text-sm font-semibold hover:underline pt-3 md:pt-1"
                >
                    Apply Now
                </a>
            </header>
            <div className="">
            <div className="px-4 space-y-2 mb-4">
                <h2 className="font-bold text-white text-lg">Full Job Description</h2>
                {
                    !isLoadingDebounced ? (
                        <Animate.Element
                            ref={containerRef}
                            resetAfterTriggered={false}
                            onDeactivatedClasses="opacity-0" 
                            onActivatedClasses="opacity-100" 
                            className="space-y-3 duration-300 transition-opacity">
                            { job.description?.json ? 
                                <Document document={job.description.json} /> :
                                <p className="text-medium-grey">N/A</p>
                            }
                        </Animate.Element>
                    ) : (
                        <Animate.Element 
                            ref={containerRef}
                            resetAfterTriggered={false}
                            onDeactivatedClasses="opacity-0" 
                            onActivatedClasses="opacity-100" 
                            className="space-y-3 duration-300 delay-300 transition-opacity">
                            <Skeleton className="w-full h-4"/>
                            <Skeleton className="w-full h-4"/>
                            <Skeleton className="w-[66%] h-4"/>
                        </Animate.Element>
                    )
                }
            </div>
            <div className="px-4 space-y-2">
                <h2 className="font-bold text-white text-lg">Skills</h2>
                {
                    !isLoadingDebounced ? (
                        <Animate.Element
                            ref={containerRef}
                            resetAfterTriggered={false}
                            onDeactivatedClasses="opacity-0" 
                            onActivatedClasses="opacity-100" 
                            className="space-y-3 duration-300 transition-opacity">
                            { job.skills?.json ? 
                                <Document document={job.skills.json} /> :
                                <p className="text-medium-grey">N/A</p>
                            }
                        </Animate.Element>
                    ) : (
                        <Animate.Element 
                            ref={containerRef}
                            resetAfterTriggered={false}
                            onDeactivatedClasses="opacity-0" 
                            onActivatedClasses="opacity-100" 
                            className="space-y-3 duration-300 delay-300 transition-opacity">
                            <Skeleton className="w-full h-4"/>
                            <Skeleton className="w-full h-4"/>
                            <Skeleton className="w-[66%] h-4"/>
                        </Animate.Element>
                    )
                }
            </div>
            <div className="px-4 space-y-2">
                <h2 className="font-bold text-white text-lg">Responsibilities</h2>
                {
                    !isLoadingDebounced ? (
                        <Animate.Element
                            ref={containerRef}
                            resetAfterTriggered={false}
                            onDeactivatedClasses="opacity-0" 
                            onActivatedClasses="opacity-100" 
                            className="space-y-3 duration-300 transition-opacity">
                            { job.responsibilities?.json ? 
                                <Document document={job.responsibilities.json} /> :
                                <p className="text-medium-grey">N/A</p>
                            }
                        </Animate.Element>
                    ) : (
                        <Animate.Element 
                            ref={containerRef}
                            resetAfterTriggered={false}
                            onDeactivatedClasses="opacity-0" 
                            onActivatedClasses="opacity-100" 
                            className="space-y-3 duration-300 delay-300 transition-opacity">
                            <Skeleton className="w-full h-4"/>
                            <Skeleton className="w-full h-4"/>
                            <Skeleton className="w-[66%] h-4"/>
                        </Animate.Element>
                    )
                }
            </div>
            {
                job.realLifeJobs?.length && (
                    <div className="px-4 space-y-2">
                    <h2 className="font-bold text-white text-lg">Real-Life Careers</h2>
                    {
                        !isLoadingDebounced ? (
                            <Animate.Element
                                ref={containerRef}
                                resetAfterTriggered={false}
                                onDeactivatedClasses="opacity-0" 
                                onActivatedClasses="opacity-100" 
                                className="space-y-3 duration-300 transition-opacity">
                            <div className="[&>*]:mr-2 text-sm font-semibold">
                                    {
                                        job.realLifeJobs?.map(((realLifeJob, i) => (
                                            <span 
                                                key={i}
                                                style={{ background: `linear-gradient(to right, ${factionColor}, #7892EE)` }}
                                                className={clsx(
                                                    "rounded p-1 inline-block space-x-1 px-2 relative overflow-hidden",
                                                    !factionColor && "bg-brand-purple-secondary"
                                                )}>
                                                    <BriefcaseIcon color="#fff" style={{ display: "inline-block" }} width={15} />
                                                <span className="capitalize z-50 text-white">
                                                    { realLifeJob }
                                                </span>
                                            </span>
                                        )))
                                    }
                            </div>
                           <div>
                                { job.realLifeJobConnection?.json &&
                                    <Document document={job.realLifeJobConnection.json} />
                                }
                           </div>
                            </Animate.Element>
                        ) : (
                            <Animate.Element 
                                ref={containerRef}
                                resetAfterTriggered={false}
                                onDeactivatedClasses="opacity-0" 
                                onActivatedClasses="opacity-100" 
                                className="space-y-3 duration-300 delay-300 transition-opacity">
                                <Skeleton className="w-[66%] h-4"/>
                                <Skeleton className="w-[66%] h-4"/>
                            </Animate.Element>
                        )
                    }
                </div>
                ) 
            }
            </div>
        </article>
    )
}

export default FullJob; 