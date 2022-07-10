import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { IFAQ } from "pages/learn";
import Document from "@components/Document";

interface FAQProps {
    faq: IFAQ
}

const FAQ : React.FC<FAQProps> = ({ faq }) => {
    const [ expanded, setExpanded] = useState<{ expanded: boolean, height: number }>({ expanded: false, height: 0 });

    const answerRef = useRef<HTMLDivElement | null>(null);

    const handleExpand = () => {
        if (!answerRef.current) return; 
        const isExpanded = expanded.expanded;
        const height = !isExpanded ? answerRef.current.scrollHeight : 0; 
        setExpanded({ expanded: !isExpanded, height }); 
    };

    return (
        <li className="list-none w-full border-b border-dim-grey-primary py-6">
             <div onClick={handleExpand} className="flex cursor-pointer justify-between space-x-3 items-center">
                <h1 className="text-white font-semibold text-lg">{ faq.question }</h1>
                <div onClick={handleExpand} className="flex justify-center items-center relative w-4 h-4 cursor-pointer transition-opacity">
                    <span role="button" 
                        className={clsx(
                            "w-[2px] h-4 rounded-full transition-transform duration-200  bg-brand-green block absolute",
                            expanded.expanded && "-rotate-90 opacity-0"
                        )}
                    />

                    <span 
                        role="button" 
                        className={clsx(
                            "w-[2px] h-4 bg-brand-green rounded-full duration-200 block transition-transform -rotate-90 absolute",

                            expanded.expanded && "!-rotate-[270deg] !bg-white"
                        )}
                    />
                </div>
            </div>
            <div 
                ref={answerRef} 
                style={{ 
                    height: expanded.height,
                }} 
                className={clsx(
                    "h-0 overflow-hidden transition-all",
                    expanded.expanded && "!overflow-auto"
                )}>
                <div className="p-3 space-y-3">
                    {
                        faq.answer?.json && <Document document={faq.answer.json} />
                    }
                </div>
            </div>
        </li>
    )
}

export default FAQ;