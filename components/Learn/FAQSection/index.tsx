import Animate from "@components/Animate";
import Paper from "@components/Paper";
import clsx from "clsx";
import Link from "next/link";
import { GroupedFAQS, IFAQ } from "pages/learn";
import React from "react";
import FAQ from "../FAQ";

interface FAQSectionProps {
    faqsGroupedByType: GroupedFAQS
}

const FAQSection : React.FC<FAQSectionProps> = ({ faqsGroupedByType }) => {
    return (
        <div id="faqs" className="w-full flex space-y-10 mb-10 flex-col items-center">
           <div className="space-y-1 flex flex-col z-10 items-center">
                <Animate.Element 
                    as="h1" 
                    from={{ y: 30 }}
                    to={{ y: 0 }} 
                    className="text-white font-bold text-5xl">
                        FAQs
                </Animate.Element>
                <Animate.Element 
                    as="h2" 
                    from={{ y: 60 }}
                    to={{ y: 0  }} 
                    className="text-medium-grey font-medium text-lg">
                        Frequently Asked Questions
                </Animate.Element>
           </div>
            <div className="flex w-full relative flex-col space-y-6 max-w-4xl">
                {
                    Object.keys(faqsGroupedByType).map((type:string, idx:number) => (
                        <div key={idx}>
                            <h2 
                                className={clsx(
                                    "z-10 bg-dark-grey-primary uppercase text-medium-grey text-1xl font-bold text-left",
                                )}>
                                    { type }
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
            <Paper containerClass="p-2 flex justify-center items-center">
                <p className="text-medium-grey max-w-4xl text-center">
                    If your questions haven&apos;t been answered by the FAQs above, first check out our summary on the&nbsp;
                    <Link href={"/about"} passHref><a className="text-brand-purple-secondary hover:underline">about page</a></Link>. 
                    If your question still hasn&apos;t been answered, ask your question in the <b>#questions</b> channel on the C4T Classes Discord server or email us at&nbsp;
                    <a className="text-brand-purple-secondary hover:underline" href="mailto:classes@code4tomorrow.org">classes@code4tomorrow.org</a>.
                </p>
            </Paper>
        </div>
    )
}

export default FAQSection;