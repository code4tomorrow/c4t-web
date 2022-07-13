import clsx from "clsx";
import React, { useState } from "react";
import { useStyles } from "./styles";
import Document from "@components/Document";
import { IVolunteerOpportunity } from "pages/volunteer";
import { Options as DocumentOptions } from '@contentful/rich-text-react-renderer';
import { useMemo } from "react";
import { BLOCKS } from "@contentful/rich-text-types";
import BrandButton from "@components/BrandButton";

interface VolunteerProps {
  opportunity: IVolunteerOpportunity
}

const Description : React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <p className="text-medium-grey-primary text-center">{ children }</p>
}

const Volunteer : React.FC<VolunteerProps> = ({ opportunity }) => {
    const [ activated, setActivated ] = useState(false);

    const { classes } = useStyles({ 
      accentColor: opportunity.accentColor ? opportunity.accentColor : "#FF89E4"
    });

    const documentOptions = useMemo<DocumentOptions>(() => {
      let options: DocumentOptions = {
          renderNode: {
              [BLOCKS.PARAGRAPH]: (_node, children) => <Description>{children}</Description>,
          },
      }

      return options;
  }, []);

    return (
      <div 
        onMouseOver={() => setActivated(true)}
        onMouseLeave={() => setActivated(false)}
        className={clsx(
            "w-[300px] min-h-[400px] cursor-pointer relative rounded-sm overflow-hidden bg-dark-grey-secondary",
            "before:bg-dark-blue-primary flex flex-col items-center p-4 hover:-translate-y-3",
            "after:opacity-0 hover:after:opacity-100",
            classes.container,
            classes.flow
        )}>
          <div className="relative space-y-3 z-10 h-full flex flex-col items-center">
            <h1 className="text-white font-bold text-3xl mt-10">{ opportunity.name }</h1>
            <div className={clsx("space-y-3 !mt-auto max-h-[150px] overflow-auto", classes.description)}>
                {
                    opportunity.description?.json && (
                      <Document 
                        document={opportunity.description.json} 
                        options={documentOptions}
                      />
                    )
                }
            </div>
            <BrandButton 
                as={!!opportunity.link ? "a" : "div"}
                target={!!opportunity.link ? "_blank" : undefined}
                rel={!!opportunity.link ? "nofollow noreferrer noopener" : undefined}
                href={opportunity.link}
                disabled={!!!opportunity.link}
                containerClass="!mt-auto"
                title={`Become a ${opportunity.name}`} 
            />
          </div>
      </div>
    )
}

export default Volunteer; 