import { GroupedFAQS, IFAQ } from "pages/learn";
import React from "react";
import FAQ from "../FAQ";

interface FAQSectionProps {
    faqsGroupedByType: GroupedFAQS
}

const FAQSection : React.FC<FAQSectionProps> = ({ faqsGroupedByType }) => {
    return (
        <div className="w-full flex flex-col items-center">
           <div className="space-x-3 flex flex-col items-center">
                <h1 className="text-white font-bold text-5xl">FAQs</h1>
                <h2 className="text-medium-grey-primary font-medium text-lg">Frequently Asked Questions</h2>
           </div>
            <div className="flex w-full flex-col space-y-6">
                {
                    Object.keys(faqsGroupedByType).map((type:string, idx:number) => (
                        <div>
                            <h2 className="uppercase text-medium-grey-primary text-1xl font-bold">{ type }</h2>
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