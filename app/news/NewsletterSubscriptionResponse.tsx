import clsx from "clsx";
import React from "react";
import { useFormStatus } from "react-dom";

interface INewsletterSubscriptionResponseProps {
    success: boolean | null;
}

const NewsletterSubscriptionResponse : React.FC<INewsletterSubscriptionResponseProps> = ({ success }) => {
    const { pending } = useFormStatus();
    
    
    return (
        <p className={clsx(
            success === true && "text-green-400", 
            success === false && "text-red-500", 
            "font-semibold text-center m-2 h-3"
        )}>
            {(!pending && success === true) && "Successfully Subscribed!"}
            {(!pending && success === false) && "Failed to Subscribe. Try Again."}
        </p>
    )
}

export default NewsletterSubscriptionResponse;