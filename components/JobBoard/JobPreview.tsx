import Animate, { AnimateContext } from "@components/Animate";
import Paper from "@components/Paper";
import Skeleton from "@components/Skeleton";
import clsx from "clsx";
import { IJobPreview } from "common/interfaces/job";
import { jobFactionMap } from "common/maps/color";
import React, { useMemo } from "react";
import { useStyles } from "./styles";
import BriefcaseIcon from "@heroicons/react/outline/BriefcaseIcon";

interface IJobPreviewProps {
    preview?: IJobPreview,
    selected: boolean; 
    onClick: (id:string) => void; 
    internship?: boolean; 
}

const JobPreview : React.FC<IJobPreviewProps> = ({ preview, onClick, selected = false, internship = false  }) => {
    const handleClick = (_e: React.MouseEvent<HTMLElement>) => {
      preview?.sys?.id && onClick(preview?.sys.id);
    };

    const { classes } = useStyles();

    const factionColor = useMemo(() => 
      preview?.faction? jobFactionMap(preview?.faction) : "#5A4CAD", 
    [ preview?.faction ])

    return (
        <Paper
          onClick={handleClick}
          containerClass={clsx(
            "w-full space-y-3 min-h-[125px] cursor-pointer py-6 md:px-6 px-4 flex flex-col",
            classes.previewContainer,
            selected && classes.previewContainerSelected
          )}>
          {
            preview ? (
              <Animate.Element
                resetAfterTriggered={false}
                onDeactivatedClasses="opacity-0" 
                onActivatedClasses="opacity-100" 
                className="space-y-3 duration-300 transition-opacity"
              >
                <h1 className="text-white text-2xl font-bold">{ preview?.title }</h1>
                <h2 className="text-white text-sm [&>*]:mr-2 font-semibold">
                    {
                      !internship && (
                        <span 
                          style={{ backgroundColor: factionColor }}
                          className={clsx(
                            "rounded p-1 inline-block px-2 relative overflow-hidden",
                            !factionColor && "bg-brand-purple-secondary"
                          )}>
                            <span className="capitalize z-50 text-white">{preview?.faction}</span>
                        </span>
                      )
                    }
                    {
                      !!preview.realLifeJobs?.length ? (
                        <span 
                          style={{ background: `linear-gradient(to right, ${factionColor}, #7892EE)` }}
                          className={clsx(
                            "rounded p-1 inline-block space-x-1 px-2 relative overflow-hidden",
                            !factionColor && "bg-brand-purple-secondary"
                          )}>
                            <BriefcaseIcon className="hidden sm:inline-block" width={15} />
                            <span className="capitalize z-50 text-white">
                              Real-Life | { preview.realLifeJobs[0] }
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

export default JobPreview; 