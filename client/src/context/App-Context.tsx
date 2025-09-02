import axios from "axios";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "react-toastify";

interface AppContextProps {
  children: React.ReactNode;
}

interface UserData {
  name: string;
  isAccountVerified: boolean;
}

interface AppContextType {
  backendUrl: string;
  isLogin: boolean;
  setIsLogin: (value: boolean) => void;
  userData: UserData | null;
  setUserData: (value: UserData | null) => void;
  getUserData: () => Promise<void>;
  resetUserData: () => void;
  justLoggedIn: boolean;
  setJustLoggedIn: (value: boolean) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export default function AppContextProvider({ children }: AppContextProps) {
  axios.defaults.withCredentials = true; // send cookies

  const backendUrl = (() => {
    const url = import.meta.env.VITE_BACKEND_URL as string;
    if (!url) {
      console.error("VITE_BACKEND_URL is not defined in environment variables");
      throw new Error("Backend URL configuration is missing");
    }

    try {
      new URL(url);
      return url;
    } catch (error) {
      throw new Error("VITE_BACKEND_URL is not a valid URL");
    }
  })();

  const [isLogin, setIsLogin] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  const resetUserData = useCallback(() => {
    setUserData(null);
  }, []);

  const getUserData = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/data`);
      setUserData(data.userData);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        "An error occurred while fetching user data.";
      toast.error(errorMessage);
    }
  }, [backendUrl]);

  const getAuthStatus = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`);
      setIsLogin(data.authenticated);
      if (data.authenticated) {
        await getUserData();
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        setIsLogin(false);
        resetUserData();
        return;
      }

      const errorMessage =
        error.response?.data?.error ||
        "An error occurred while checking authentication status.";
      toast.error(errorMessage);
    }
  }, [backendUrl, getUserData, resetUserData]);

  // check auth only if there are no OAuth params in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasOAuthParams = urlParams.get("auth") || urlParams.get("error");

    if (!hasOAuthParams) {
      getAuthStatus();
    }
  }, [getAuthStatus]);

  // Avoid race condition with useEffect in Login component
  useEffect(() => {
    if (justLoggedIn) {
      const timer = setTimeout(() => {
        setJustLoggedIn(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [justLoggedIn]);

  const ctxValue = useMemo(
    () => ({
      backendUrl,
      isLogin,
      setIsLogin,
      userData,
      setUserData,
      getUserData,
      resetUserData,
      justLoggedIn,
      setJustLoggedIn,
    }),
    [backendUrl, isLogin, userData, justLoggedIn, getUserData, resetUserData]
  );

  return <AppContext.Provider value={ctxValue}>{children}</AppContext.Provider>;
}
