import { assets } from "../assets/assets";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAppContext } from "../hooks/useAppContext";
import { useTimer } from "../hooks/useTimer";
import { toast } from "react-toastify";
import axios from "axios";
import EmailVerifyForm from "../components/EmailVerify/EmailVerifyForm";

const STYLES = {
  mainDiv:
    "flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-blue-500",
  logo: "absolute left-5 sm:left-20 top-5 sm:w-32 cursor-pointer",
} as const;

export default function EmailVerify() {
  const { backendUrl, isLogin } = useAppContext();
  const navigate = useNavigate();

  // Custom hook
  const { timer, updateTimer, stopTimer } = useTimer();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLogin) {
        toast.error("You need to be logged in to verify your email");
        navigate("/", { replace: true });
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [isLogin, navigate]);

  useEffect(() => {
    if (!isLogin) return;

    async function fetchOtpStatus() {
      try {
        const { data } = await axios.get(`${backendUrl}/api/auth/otp-status`);

        if (data.isVerified) {
          toast.info("Account already verified");
          navigate("/");
          return;
        }

        if (data.hasActiveOtp && data.expiresAt) {
          updateTimer(data.expiresAt);
        } else {
          stopTimer();
        }
      } catch (error: any) {
        console.error("Error fetching OTP status: ", error);
        const errorMessage =
          error.response?.data?.error || "Failed to fetch OTP status";
        toast.error(errorMessage);
      }
    }

    fetchOtpStatus();
  }, [backendUrl, navigate, updateTimer, stopTimer, isLogin]);

  if (!isLogin) return null;

  return (
    <div className={STYLES.mainDiv}>
      <img
        src={assets.logo}
        alt="Logo"
        className={STYLES.logo}
        onClick={() => navigate("/")}
      />
      <EmailVerifyForm timer={timer} onTimerUpdate={updateTimer} />
    </div>
  );
}
