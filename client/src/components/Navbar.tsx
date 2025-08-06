import { useNavigate } from "react-router";
import { assets } from "../assets/assets";
import axios from "axios";
import { useAppContext } from "../hooks/useAppContext";
import { useCallback } from "react";

export default function Navbar() {
  const buttonClass =
    "flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 transition-all cursor-pointer";

  const mainDivClass =
    "w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0";

  const iconUserDivClass =
    "w-8 h-8 flex justify-center items-center rounded-full bg-black text-white relative group";

  const listDivClass =
    "absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10";

  const listClass = "py-1 px-2 hover:bg-gray-200 cursor-pointer";

  const navigate = useNavigate();
  const { backendUrl, userData, resetUserData, isLogin, setIsLogin } =
    useAppContext();

  const logout = useCallback(async () => {
    try {
      axios.defaults.withCredentials = true;
      await axios.post(`${backendUrl}/api/auth/logout`);
      setIsLogin(false);
      resetUserData();
    } catch (error) {}
  }, [backendUrl, setIsLogin, resetUserData]);

  return (
    <div className={mainDivClass}>
      <img src={assets.logo} alt="Logo" className="w-28 sm:w-32" />
      {isLogin ? (
        <div className={iconUserDivClass}>
          {userData?.name[0]?.toUpperCase()}
          <div className={listDivClass}>
            <ul className="list-none m-0 p-2 bg-gray-100 text-sm">
              {!userData?.isAccountVerified && (
                <li className={listClass}>Verify Email</li>
              )}

              <li className={`${listClass} pr-10`} onClick={logout}>
                Logout
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <button className={buttonClass} onClick={() => navigate("/login")}>
          Login <img src={assets.arrow_icon} alt="Arrow-Icon" />
        </button>
      )}
    </div>
  );
}
