import Animate from "@components/Animate";
import Paper from "@components/Paper";
import { IJobPreview } from "common/interfaces/job";
import React from "react";

interface IJobPreviewProps {
    preview: IJobPreview,
    onClick: (id:string) => void; 
}

const JobPreview : React.FC<IJobPreviewProps> = ({ preview, onClick }) => {
    const handleClick = (_e: React.MouseEvent<HTMLElement>) => {
      preview.sys?.id && onClick(preview.sys.id);
    };

    return (
      <Animate.Element 
        resetAfterTriggered={false} 
        className="transition-opacity duration-300 cursor-pointer"
        onActivatedClasses="opacity-100"
        onDeactivatedClasses="opacity-0"
      >
          <Paper
            onClick={handleClick}
            containerClass="w-full space-y-3  p-6 flex flex-col">
            <h1 className="text-white text-2xl font-bold">{ preview.title }</h1>
            <h2 className="text-white text-medium font-semibold">
                <span className="bg-dark-grey-accent rounded p-1 px-2">
                    <span className="capitalize">{preview.faction} Faction</span>
                </span>
            </h2>
        </Paper>
      </Animate.Element>
    )
}

export default JobPreview; 