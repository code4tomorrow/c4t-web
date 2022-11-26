import Animate from "@components/Animate";
import Paper from "@components/Paper";
import Skeleton from "@components/Skeleton";
import clsx from "clsx";
import { IInternship } from "common/interfaces/job";
import React, { useMemo } from "react";
import { useStyles } from "./styles";
import BriefcaseIcon from "@heroicons/react/outline/BriefcaseIcon";
import TimeRange from "@components/TimeRange";

interface InternshipPreviewProps {
    internship?: IInternship,
    selected: boolean; 
    onClick: (id:string) => void; 
}

const InternshipPreview : React.FC<InternshipPreviewProps> = ({ onClick, selected = false, internship  }) => {
    const handleClick = (_e: React.MouseEvent<HTMLElement>) => {
        internship?.sys?.id && onClick(internship?.sys.id);
    };

    const { classes } = useStyles();

    return (
        <Paper
          onClick={handleClick}
          containerClass={clsx(
            "w-full space-y-3 min-h-[125px] cursor-pointer py-6 md:px-6 px-4 flex flex-col",
            classes.previewContainer,
            selected && classes.previewContainerSelected
          )}>
          {
            internship ? (
              <Animate.Element
                resetAfterTriggered={false}
                onDeactivatedClasses="opacity-0" 
                onActivatedClasses="opacity-100" 
                className="space-y-3 duration-300 transition-opacity"
              >
                <h1 className="text-white inline-block mr-3 text-2xl font-bold">{ internship?.title }</h1>
                <TimeRange endDate={internship.endDate} startDate={internship.startDate} />
                <h2 className="text-white text-sm [&>*]:mr-2 font-semibold">
                    {
                      !!internship.realLifeJobs?.length ? (
                        <span 
                          style={{ background: `linear-gradient(to right, #5A4CAD, #7892EE)` }}
                          className={clsx(
                            "rounded p-1 inline-block space-x-1 px-2 relative overflow-hidden",
                          )}>
                            <BriefcaseIcon className="hidden sm:inline-block" width={15} />
                            <span className="capitalize z-50 text-white">
                              Real-Life | { internship.realLifeJobs[0] }
                            </span>
                        </span>
                      ) : <></>
                    }
                </h2> 
              </Animate.Element>
            ) : (
              <Animate.Element 
                resetAfterTriggered={false}
                onDeactivatedClasses="opacity-0" 
                onActivatedClasses="opacity-100" 
                className="space-y-3 duration-300 delay-300 transition-opacity"
              >
                <Skeleton accent="#292A32" className="w-full h-6" />
                <Skeleton accent="#292A32" className="w-1/2 h-6" />
              </Animate.Element>
            )
          }
      </Paper>
    )
}

export default InternshipPreview; 