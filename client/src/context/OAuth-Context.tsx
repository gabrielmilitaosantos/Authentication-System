import { createContext, useCallback, useEffect, useState } from "react";
import { useAppContext } from "../hooks/useAppContext";
import { toast } from "react-toastify";

interface OAuthContextType {
  isProcessing: boolean;
  processOAuthCallback: () => boolean;
}

interface OAuthProviderProps {
  children: React.ReactNode;
}

export const OAuthContext = createContext<OAuthContextType | undefined>(
  undefined
);

export default function OAuthProvider({ children }: OAuthProviderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { setJustLoggedIn, getUserData } = useAppContext();

  const processOAuthCallback = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get("auth");
    const error = urlParams.get("error");

    if (!authStatus && !error) {
      return false; // No relevant parameters found
    }

    setIsProcessing(true);

    if (authStatus === "success") {
      toast.success("Google authentication successful");

      setJustLoggedIn(true);

      // Clean URL
      const cleanUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
      window.history.replaceState({}, "", cleanUrl);

      getUserData().finally(() => {
        setIsProcessing(false);
      });

      return true;
    } else if (error === "oauth_failed") {
      toast.error("Google authentication failed. Please try again.");

      // Clean URL
      const cleanUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
      window.history.replaceState({}, "", cleanUrl);

      setIsProcessing(false);
      return true;
    }

    setIsProcessing(false);
    return false;
  }, [setJustLoggedIn, getUserData]);

  // Check OAuth callback on mount
  useEffect(() => {
    processOAuthCallback();
  }, [processOAuthCallback]);

  const value = {
    isProcessing,
    processOAuthCallback,
  };

  return (
    <OAuthContext.Provider value={value}>{children}</OAuthContext.Provider>
  );
}
