import Animate from "@components/Animate";
import Document from "@components/Document";
import clsx from "clsx";
import { IInternship } from "common/interfaces/job";
import React from "react";
import { useStyles } from "./styles";
import { BriefcaseIcon } from "@heroicons/react/outline";
import TimeRange from "@components/TimeRange";

interface IFullJobProps {
    internship: IInternship;
    showContent?: boolean;
}

const INTERNSHIP_SIGNUP_LINK = "https://tally.so/r/wobNke";

const FullInternship: React.FC<IFullJobProps> = ({ internship }) => {
    const { classes } = useStyles();

    const containerRef = React.useRef<HTMLDivElement | null>(null);

    return (
        <article
            ref={containerRef}
            className="w-full transition-all h-full pb-4 space-y-3"
        >
            <header
                className={clsx(
                    "min-h-[6rem] flex py-4 justify-center before:!h-0 md:before:!h-full flex-col items-center border-b-dim-grey border-b",
                    classes.fullJobHeader
                )}
            >
                <h1 className="text-white mt-3 md:mt-0 flex md:flex-row text-center flex-col space-y-2 md:space-y-0 space-x-2 text-2xl items-center z-10 font-bold">
                    <span>{internship.title}</span>
                    <TimeRange
                        endDate={internship.endDate}
                        startDate={internship.startDate}
                    />
                </h1>
                <a
                    rel="noopener noreferrer nofollow"
                    target={"_blank"}
                    href={INTERNSHIP_SIGNUP_LINK}
                    className="text-brand-purple-secondary text-sm font-semibold hover:underline pt-3 md:pt-1"
                >
                    Apply Now
                </a>
            </header>
            <div className="">
                <div className="px-4 space-y-2 mb-4">
                    <h2 className="font-bold text-white text-lg">
                        Full Job Description
                    </h2>

                    <Animate.Element
                        ref={containerRef}
                        resetAfterTriggered={false}
                        onDeactivatedClasses="opacity-0"
                        onActivatedClasses="opacity-100"
                        className="space-y-3 duration-300 transition-opacity"
                    >
                        {internship.description?.json ? (
                            <Document document={internship.description.json} />
                        ) : (
                            <p className="text-medium-grey">N/A</p>
                        )}
                    </Animate.Element>
                </div>
                <div className="px-4 space-y-2">
                    <h2 className="font-bold text-white text-lg">
                        Time Commitment
                    </h2>

                    <Animate.Element
                        ref={containerRef}
                        resetAfterTriggered={false}
                        onDeactivatedClasses="opacity-0"
                        onActivatedClasses="opacity-100"
                        className="space-y-3 duration-300 transition-opacity"
                    >
                        {internship.timeCommitment?.json ? (
                            <Document
                                document={internship.timeCommitment.json}
                            />
                        ) : (
                            <p className="text-medium-grey">N/A</p>
                        )}
                    </Animate.Element>
                </div>
                <div className="px-4 space-y-2">
                    <h2 className="font-bold text-white text-lg">Skills</h2>

                    <Animate.Element
                        ref={containerRef}
                        resetAfterTriggered={false}
                        onDeactivatedClasses="opacity-0"
                        onActivatedClasses="opacity-100"
                        className="space-y-3 duration-300 transition-opacity"
                    >
                        {internship.skills?.json ? (
                            <Document document={internship.skills.json} />
                        ) : (
                            <p className="text-medium-grey">N/A</p>
                        )}
                    </Animate.Element>
                </div>
                <div className="px-4 space-y-2">
                    <h2 className="font-bold text-white text-lg">
                        Responsibilities
                    </h2>
                    {
                        <Animate.Element
                            ref={containerRef}
                            resetAfterTriggered={false}
                            onDeactivatedClasses="opacity-0"
                            onActivatedClasses="opacity-100"
                            className="space-y-3 duration-300 transition-opacity"
                        >
                            {internship.responsibilities?.json ? (
                                <Document
                                    document={internship.responsibilities.json}
                                />
                            ) : (
                                <p className="text-medium-grey">N/A</p>
                            )}
                        </Animate.Element>
                    }
                </div>
                {internship.realLifeJobs?.length && (
                    <div className="px-4 space-y-2">
                        <h2 className="font-bold text-white text-lg">
                            Real-Life Careers
                        </h2>

                        <Animate.Element
                            ref={containerRef}
                            resetAfterTriggered={false}
                            onDeactivatedClasses="opacity-0"
                            onActivatedClasses="opacity-100"
                            className="space-y-3 duration-300 transition-opacity"
                        >
                            <div className="[&>*]:mr-2 text-sm font-semibold">
                                {internship.realLifeJobs?.map(
                                    (realLifeJob, i) => (
                                        <span
                                            key={i}
                                            style={{
                                                background: `linear-gradient(to right, #5A4CAD, #7892EE)`,
                                            }}
                                            className={clsx(
                                                "rounded p-1 inline-block space-x-1 px-2 relative overflow-hidden"
                                            )}
                                        >
                                            <BriefcaseIcon
                                                color="#fff"
                                                style={{
                                                    display: "inline-block",
                                                }}
                                                width={15}
                                            />
                                            <span className="capitalize z-50 text-white">
                                                {realLifeJob}
                                            </span>
                                        </span>
                                    )
                                )}
                            </div>
                            <div>
                                {internship.realLifeJobConnection?.json && (
                                    <Document
                                        document={
                                            internship.realLifeJobConnection
                                                .json
                                        }
                                    />
                                )}
                            </div>
                        </Animate.Element>
                    </div>
                )}
            </div>
        </article>
    );
};

export default FullInternship;
