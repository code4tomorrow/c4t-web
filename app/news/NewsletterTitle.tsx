"use client";

import { INewsletter } from "common/interfaces/newsletter";
import { useMemo } from "react";
import { makeStyles } from "tss-react/mui";
import { format } from "fecha";

interface INewsletterTitle {
    newsletter: INewsletter;
}

const NewsletterTitle : React.FC<INewsletterTitle> = ({ newsletter }) => {
    const { classes } = makeStyles()(() => ({
        shimmer: {
            backgroundImage: "linear-gradient(90deg, #8C8796 0%, #DCDCDC 40%, #8C8796 60%)",
            WebkitBackgroundClip: "text",
            width: 500,
            textAlign: "center",
            color: "transparent",
            animation: "shineTitle 3s linear infinite",
            "@keyframes shineTitle": {
                "0%": {
                    backgroundPosition: "0px",
                },
                "100%": {
                    backgroundPosition: "500px",
                },
            }
        }  
    }))();
    
    const publishedDate = useMemo(() => {
        return format(new Date(newsletter.date), "mediumDate"); 
    }, [ newsletter ]);

    return (
        <div className="flex flex-col items-center">
            <h1 className={`text-medium-grey font-semibold text-2xl ${classes.shimmer}`}>
                { newsletter.title }
            </h1>
            <h2 className={`text-medium-grey font-normal text-lg`}>
                Published on { publishedDate }
            </h2>
        </div>

    )
}

export default NewsletterTitle;