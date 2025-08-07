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

  useEffect(() => {
    getAuthStatus();
  }, [getAuthStatus]);

  const ctxValue = useMemo(
    () => ({
      backendUrl,
      isLogin,
      setIsLogin,
      userData,
      setUserData,
      getUserData,
      resetUserData,
    }),
    [backendUrl, isLogin, userData, getUserData, resetUserData]
  );

  return <AppContext.Provider value={ctxValue}>{children}</AppContext.Provider>;
}
