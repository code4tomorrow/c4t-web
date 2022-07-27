import config from "config";
import React, { ReactElement, useCallback, useEffect, useMemo, useRef } from "react";
import { withWebChat } from '@ibm-watson/assistant-web-chat-react';

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
          wacInstance.render();
        },
      }
      window.watsonAssistantChatOptions = {
        integrationID: config.watsonAssistantChat.integrationID,
        region: config.watsonAssistantChat.region,
        serviceInstanceID: config.watsonAssistantChat.serviceInstanceID,
        onLoad: () => { return; }
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