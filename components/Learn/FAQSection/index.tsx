import clsx from "clsx";
import { GroupedFAQS, IFAQ } from "pages/learn";
import React from "react";
import FAQ from "../FAQ";
import { useStyles } from "./styles";

interface FAQSectionProps {
    faqsGroupedByType: GroupedFAQS
}

const FAQSection : React.FC<FAQSectionProps> = ({ faqsGroupedByType }) => {
    const { classes } = useStyles();

    return (
        <div className="w-full flex space-y-10 mb-10 flex-col items-center">
           <div className="space-y-1 flex flex-col items-center">
                <h1 className="text-white font-bold text-5xl">FAQs</h1>
                <h2 className="text-medium-grey-primary font-medium text-lg">Frequently Asked Questions</h2>
           </div>
            <div className="flex w-full relative flex-col space-y-6 max-w-4xl">
                {
                    Object.keys(faqsGroupedByType).map((type:string, idx:number) => (
                        <div key={idx}>
                            <h2 
                                className={clsx(
                                    "z-10 bg-dark-grey-primary uppercase text-medium-grey-primary text-1xl font-bold text-left",
                                )}>
                                    <u>{ type }</u>
                            </h2>
                            <ul key={idx} className="w-full flex flex-col items-center">
                                {
                                    faqsGroupedByType[type].map((faq, idx) => (
                                        <FAQ key={idx} faq={faq} />
                                    ))
                                }
                            </ul>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default FAQSection;