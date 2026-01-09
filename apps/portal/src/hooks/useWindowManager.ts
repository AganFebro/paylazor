import { useCallback } from 'react';
import { getPostMessageTargetOrigin } from '../utils/postMessage';

export function useWindowManager() {
  const isIframe = useCallback(() => {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true; // If we can't access window.top, we're probably in iframe
    }
  }, []);

  const closeIframe = useCallback(() => {
    const message = { type: "IFRAME_CLOSE_REQUEST" };
    const targetOrigin = getPostMessageTargetOrigin();

    if (window.opener && window.opener !== window) {
      window.opener.postMessage(message, targetOrigin);
      window.close();
    } else if (window.parent && window.parent !== window) {
      window.parent.postMessage(message, targetOrigin);
    } else {
      console.warn("No parent window to notify; running standalone?");
    }
  }, []);

  const autoClose = useCallback((environment: string, delay: number = 2000) => {
    setTimeout(() => {
      if (environment === 'expo') {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: "CLOSE_WEBVIEW"
          }));
        } else {
          closeIframe();
        }
      } else {
        closeIframe();
      }
    }, delay);
  }, [closeIframe]);

  return {
    isIframe,
    closeIframe,
    autoClose
  };
}
