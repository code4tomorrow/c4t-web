import BrandButton from "@components/BrandButton";
import Loader from "@components/Loader";
import { BellIcon } from "@heroicons/react/outline";
import React from "react";
import { useFormStatus } from "react-dom";

const NewsletterSubscribeButton = () => {
    const { pending } = useFormStatus();

    return (
        <BrandButton
            disabled={pending}
            title={pending ? "Subscribing" : "Subscribe"}
            className="ml-2 rounded-[6px]"
        >
            {pending ? (
                <Loader className="!h-0" />
            ) : (
                <BellIcon
                    color="#fff"
                    className="-translate-y-[1px]"
                    width={20}
                />
            )}
        </BrandButton>
    );
};

export default NewsletterSubscribeButton;
