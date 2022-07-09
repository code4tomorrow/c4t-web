import { IFAQ } from "pages/learn";
import React, { useState } from "react";
import clsx from "clsx";

interface FAQProps {
    faq: IFAQ
}

const FAQ : React.FC<FAQProps> = ({ faq }) => {
    const [ expanded, setExpanded] = useState(false);

    const handleExpand = () => {
        setExpanded(!expanded); 
    };

    return (
        <li className="list-none w-full border-b border-medium-grey-primary py-6">
             <div className="flex justify-between space-x-3 items-center">
                <h1 className="text-white font-semibold text-lg">{ faq.question }</h1>
                <div onClick={handleExpand} className="flex justify-center items-center relative w-4 h-4 cursor-pointer transition-opacity">
                    <span role="button" 
                        className={clsx(
                            "w-[2px] h-4 rounded-full transition-transform duration-200  bg-brand-green block absolute",
                            expanded && "-rotate-90"
                        )}
                    />

                    <span 
                        role="button" 
                        className={clsx(
                            "w-[2px] h-4 bg-brand-green rounded-full duration-200 block transition-transform -rotate-90 absolute",

                            expanded && "!-rotate-[270deg] !bg-white"
                        )}
                    />
                </div>
            </div>
        </li>
    )
}

export default FAQ;