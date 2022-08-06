import Animate, { AnimateContext } from "@components/Animate";
import Paper from "@components/Paper";
import Skeleton from "@components/Skeleton";
import clsx from "clsx";
import { IJobPreview } from "common/interfaces/job";
import { jobFactionMap } from "common/maps/color";
import React, { useMemo } from "react";
import { useStyles } from "./styles";

interface IJobPreviewProps {
    preview?: IJobPreview,
    selected: boolean; 
    onClick: (id:string) => void; 
}

const JobPreview : React.FC<IJobPreviewProps> = ({ preview, onClick, selected = false }) => {
    const handleClick = (_e: React.MouseEvent<HTMLElement>) => {
      preview?.sys?.id && onClick(preview?.sys.id);
    };

    const { classes } = useStyles();

    const factionColor = useMemo(() => 
      preview?.faction? jobFactionMap(preview?.faction) : undefined, 
    [ preview?.faction ])

    return (
        <Paper
          onClick={handleClick}
          containerClass={clsx(
            "w-full space-y-3 min-h-[125px] cursor-pointer p-6 flex flex-col",
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
                <h2 className="text-white text-sm font-semibold">
                    <span 
                      style={{ backgroundColor: factionColor }}
                      className={clsx(
                        "rounded p-1 px-2 relative overflow-hidden",
                        !factionColor && "bg-brand-purple-secondary"
                      )}>
                        <span className="capitalize z-50 text-white">{preview?.faction}</span>
                    </span>
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