import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

interface AppContextProps {
  children: React.ReactNode;
}

interface UserData {
  name: string;
  isAccountVerified: boolean;
}

export const AppContext = createContext({
  backendUrl: "",
  isLogin: false,
  setIsLogin: (_value: boolean) => {},
  userData: {} as UserData,
  setUserData: (_value: any) => {},
  getUserData: () => Promise.resolve(),
});

export default function AppContextProvider({ children }: AppContextProps) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL as string;

  const [isLogin, setIsLogin] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    name: "",
    isAccountVerified: false,
  });

  async function getAuthStatus() {
    try {
      const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`);
      setIsLogin(data.authenticated);
      await getUserData();
    } catch (error: any) {
      if (error.response?.status === 401) {
        setIsLogin(false);
        return;
      }

      const errorMessage =
        error.response?.data?.error ||
        "An error occurred while checking authentication status.";
      toast.error(errorMessage);
    }
  }

  async function getUserData() {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/data`);
      setUserData(data.userData);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        "An error occurred while fetching user data.";
      toast.error(errorMessage);
    }
  }

  useEffect(() => {
    (async () => {
      await getAuthStatus();
    })();
  }, []);

  const ctxValue = {
    backendUrl,
    isLogin,
    setIsLogin,
    userData,
    setUserData,
    getUserData,
  };

  return <AppContext.Provider value={ctxValue}>{children}</AppContext.Provider>;
}
