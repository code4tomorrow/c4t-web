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
                animation: "shineMini 3s linear infinite",
                
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
                        backgroundPosition: "290px",
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
            <div className={`relative w-[160px] h-[220px] lg:w-[280px] transition-all lg:h-[370px] hover:opacity-70 ${classes.border} ${isSelected && classes.shimmer}`}>
                <Image 
                    src={newsletter.graphic.url} 
                    priority
                    fill
                    placeholder="blur"
                    blurDataURL={newsletter.placeholderDataURL || `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>`}
                    className="object-cover"
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