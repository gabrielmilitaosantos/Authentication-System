import { assets } from "../../assets/assets";
import { useCallback } from "react";
import { useNavigate } from "react-router";
import { useAppContext } from "../../hooks/useAppContext";
import { toast } from "react-toastify";
import axios from "axios";

const STYLES = {
  container:
    "w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0",
  image: "w-28 sm:w-32",
  containerUser:
    "w-8 h-8 flex justify-center items-center rounded-full bg-black text-white relative group",
  containerList:
    "absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10",
  ul: "list-none m-0 p-2 bg-gray-100 text-sm",
  list: "py-1 px-2 hover:bg-gray-200 cursor-pointer",
  submit:
    "flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 transition-all cursor-pointer",
} as const;

export default function Navbar() {
  const navigate = useNavigate();
  const { backendUrl, userData, resetUserData, isLogin, setIsLogin } =
    useAppContext();

  const sendVerificationOtp = useCallback(async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(
        `${backendUrl}/api/auth/send-verify-otp`
      );
      navigate("/email-verify");
      toast.success(data.message);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "An error occurred. Please try again.";
      toast.error(errorMessage);
    }
  }, [backendUrl]);

  const logout = useCallback(async () => {
    try {
      axios.defaults.withCredentials = true;
      await axios.post(`${backendUrl}/api/auth/logout`);
      setIsLogin(false);
      resetUserData();
      navigate("/");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "An error occurred. Please try again.";
      toast.error(errorMessage);
    }
  }, [backendUrl, setIsLogin, resetUserData]);

  return (
    <div className={STYLES.container}>
      <img src={assets.logo} alt="Logo" className={STYLES.image} />
      {isLogin ? (
        <div className={STYLES.containerUser}>
          {userData?.name[0]?.toUpperCase()}
          <div className={STYLES.containerList}>
            <ul className={STYLES.ul}>
              {!userData?.isAccountVerified && (
                <li className={STYLES.list} onClick={sendVerificationOtp}>
                  Verify Email
                </li>
              )}

              <li className={`${STYLES.list} pr-10`} onClick={logout}>
                Logout
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <button className={STYLES.submit} onClick={() => navigate("/login")}>
          Login <img src={assets.arrow_icon} alt="Arrow-Icon" />
        </button>
      )}
    </div>
  );
}
