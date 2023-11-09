"use-client"

import { INewsletter } from "common/interfaces/newsletter";
import React, { useMemo } from "react";
import Image from "next/image";
import { makeStyles } from "tss-react/mui";
import { format } from "fecha";

interface INewsletterMiniProps {
    newsletter: INewsletter;
    selectedNewsletter: INewsletter;
    setSelectedNewsletter: (newsletter: INewsletter) => void;
}

const NewsletterMini : React.FC<INewsletterMiniProps> = ({ newsletter, selectedNewsletter, setSelectedNewsletter }) => {
    const isSelected = useMemo(() => 
        selectedNewsletter.sys.id === newsletter.sys.id,
        [ selectedNewsletter, newsletter]
    );

    const { classes } = makeStyles()(() => ({
        border: {
            "&::before": {
                transition: "all 150ms ease",
                content: "''",
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                position: "absolute",
                display: 'block'
            }
        },
        shimmer: {
            "&::before": {
                content: "''",
                left: -5,
                top: -5,
                right: -5,
                bottom: -5,
                position: "absolute",
                backgroundImage: "linear-gradient(90deg, #7892EE 0%, #5A4CAD 40%, #7892EE 60%)",
                display: 'block',
                animation: "shineMini 1s linear infinite",
                
            },
            "@keyframes shineMini": {
                "0%": {
                    backgroundPosition: "0px",
                },
                "100%": {
                    backgroundPosition: "170px",
                },
            },
            "@media (min-width: 1024px)": {
                "@keyframes shineMini": {
                    "0%": {
                        backgroundPosition: "0px",
                    },
                    "100%": {
                        backgroundPosition: "260px",
                    },
                }
            }
        }  
    }))();

    const publishedDate = useMemo(() => {
        return format(new Date(newsletter.date), "mediumDate"); 
    }, [ newsletter ]);


    return (
        <div
            onClick={() => {
                window.scroll({ top: 0 });
                setSelectedNewsletter(newsletter)
            }}
            className="flex flex-col mx-3 cursor-pointer my-3 items-center"
        >
            <div className={`relative w-[160px] h-[220px] lg:w-[250px] transition-all lg:h-[340px] hover:opacity-50 ${classes.border} ${isSelected && classes.shimmer}`}>
                <Image 
                    src={newsletter.graphic.url} 
                    priority
                    fill
                    objectFit="cover"
                    alt={"newsletter"}
                />
            </div>
            <h2 className="text-medium-grey mt-3">
                {publishedDate}
            </h2>
        </div>
    )
}

export default NewsletterMini; 