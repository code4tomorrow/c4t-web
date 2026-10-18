import config from "config";
import React, { ReactElement, useCallback, useEffect, useRef } from "react";
import { withWebChat } from "@ibm-watson/assistant-web-chat-react";
import { getCloudinaryURL } from "@utils/cloudinary-loader";
import AnnotationIcon from "@heroicons/react/outline/AnnotationIcon";
import BrandButton from "@components/BrandButton";

/**
 * The floating chat button and the IBM Watson Assistant behind it.
 *
 * Watson's web chat is several hundred kilobytes of third-party script, so it
 * is no longer loaded on page load. It starts loading when someone shows
 * intent — hovering, focusing, or touching the button — and opens as soon as
 * it is ready if they clicked.
 */
const WatsonAssistantChat: React.FC<{
    children: ReactElement;
    createWebChatInstance: (o: object) => void;
}> = ({ children, createWebChatInstance }) => {
    const chatButtonRef = useRef<HTMLDivElement | null>(null);
    const instanceRef = useRef<any>(null);
    const requestedRef = useRef(false);
    const openWhenReadyRef = useRef(false);

    const loadChat = useCallback(() => {
        if (requestedRef.current) return;
        requestedRef.current = true;
        createWebChatInstance({
            integrationID: config.watsonAssistantChat.integrationID,
            region: config.watsonAssistantChat.region,
            serviceInstanceID: config.watsonAssistantChat.serviceInstanceID,
            namespace: `${window.origin}${window.location.pathname}`,
            showLauncher: false,
            onLoad: (wacInstance: any) => {
                wacInstance.updateHomeScreenConfig({
                    bot_avatar_url: getCloudinaryURL("logo-v2-bg"),
                });
                wacInstance.updateCSSVariables({
                    "BASE-font-family": '"Raleway"',
                    "PRIMARY-color": "",
                    "PRIMARY-color-hover": "rgba(0,0,0,0.05)",
                    "PRIMARY-color-active": "rgba(0,0,0,0.1)",
                    "SECONDARY-color-text": "#fff",
                    "SECONDARY-color": "#7892EE",
                    "ACCENT-color-text": "#fff",
                    "ACCENT-color": "#7892EE",
                    "BASE-border-radius-xlarge": "8px",
                    "BASE-border-radius-med": "8px",
                    "BASE-border-radius-small": "8px",
                    "ACCENT-color-ghost-text": "#7892EE",
                    $focus: "#7892EE",
                    "$active-primary": "#7892EE",
                    "$hover-primary": "#7892EE",
                    "$interactive-01": "#7892EE",
                    "$interactive-04": "#7892EE",
                    "$interactive-03": "#7892EE",
                    "$inverse-support-04": "#7892EE",
                });
                instanceRef.current = wacInstance;
                Promise.resolve(wacInstance.render()).then(() => {
                    if (openWhenReadyRef.current) wacInstance.openWindow();
                });
            },
        });
    }, [createWebChatInstance]);

    useEffect(() => {
        const button = chatButtonRef.current;
        if (!button) return;

        const handleClick = () => {
            if (instanceRef.current) {
                instanceRef.current.openWindow();
                return;
            }
            openWhenReadyRef.current = true;
            loadChat();
        };

        button.addEventListener("click", handleClick);
        button.addEventListener("pointerenter", loadChat);
        button.addEventListener("focusin", loadChat);
        button.addEventListener("touchstart", loadChat, { passive: true });
        return () => {
            button.removeEventListener("click", handleClick);
            button.removeEventListener("pointerenter", loadChat);
            button.removeEventListener("focusin", loadChat);
            button.removeEventListener("touchstart", loadChat);
        };
    }, [loadChat]);

    return (
        <>
            <BrandButton
                title=""
                ariaLabel="Chat Assistant"
                ref={chatButtonRef}
                className="!rounded-[20px] !space-x-0 !px-3"
                containerClass="!fixed z-50 right-6 bottom-6 md:right-9 md:bottom-9"
            >
                <AnnotationIcon width={35} color="#fff" />
            </BrandButton>
            {children}
        </>
    );
};

export default withWebChat()(React.memo(WatsonAssistantChat));
