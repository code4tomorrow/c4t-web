import config from "config";
import React, { ReactElement, useCallback, useEffect, useMemo, useRef } from "react";
import { withWebChat } from '@ibm-watson/assistant-web-chat-react';
import { getCloudinaryURL } from "@utils/cloudinary-loader";

const SSR = typeof window === "undefined";

const WatsonAssistantChat : React.FC<{ children: ReactElement, createWebChatInstance: Function }> = ({ 
    children, createWebChatInstance 
}) => {
    const pathname = useMemo(() => SSR ? undefined : window.location.pathname, [ SSR ]);
    const currentInjectedPath = useRef<string | undefined>(undefined);

    const injectChatBot = useCallback(() => {
      if (currentInjectedPath.current === pathname) return; 
      currentInjectedPath.current = pathname; 
      const watsonAssistantChatOptions = {
        integrationID: config.watsonAssistantChat.integrationID,
        region: config.watsonAssistantChat.region,
        serviceInstanceID: config.watsonAssistantChat.serviceInstanceID,
        namespace: `${window.origin}${pathname}`,
        onLoad: (wacInstance:any) => {
          wacInstance.updateHomeScreenConfig({
            bot_avatar_url: getCloudinaryURL("logo"),
          })
          wacInstance.updateCSSVariables({
            'BASE-font-family': '"Raleway"',
            'PRIMARY-color': "",
            'PRIMARY-color-hover': "rgba(0,0,0,0.05)",
            "PRIMARY-color-active": "rgba(0,0,0,0.1)",
            "SECONDARY-color-text": "#fff",
            'SECONDARY-color': '#7892EE',
            'ACCENT-color-text': "#fff",
            'ACCENT-color': "#7892EE",
            "ACCENT-color-ghost-text": "#7892EE",
            '$focus': '#7892EE',
            '$active-primary': '#7892EE',
            '$hover-primary': '#7892EE',
            '$interactive-01': '#7892EE',
            '$interactive-04': '#7892EE',
            '$interactive-03': '#7892EE',
            '$inverse-support-04': '#7892EE',
          });
          wacInstance.render();
        },
      }
      window.watsonAssistantChatOptions = {
        integrationID: config.watsonAssistantChat.integrationID,
        region: config.watsonAssistantChat.region,
        serviceInstanceID: config.watsonAssistantChat.serviceInstanceID,
        onLoad: (wacInstance:any) => { 
          wacInstance.destroy() // removes deuplicate 
        }
      }; 
      createWebChatInstance(watsonAssistantChatOptions);
    }, [ pathname ]);

    useEffect(injectChatBot, [ injectChatBot ]);
      
    return (
        <>
          { children }
        </>
    )
}

export default withWebChat()(React.memo(WatsonAssistantChat)); 