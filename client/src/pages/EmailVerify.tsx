import { useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import { useAppContext } from "../hooks/useAppContext";
import { useTimer } from "../hooks/useTimer";
import axios from "axios";
import EmailVerifyForm from "../components/EmailVerifyForm";

const STYLES = {
  mainDiv:
    "flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-blue-500",
  logo: "absolute left-5 sm:left-20 top-5 sm:w-32 cursor-pointer",
} as const;

export default function EmailVerify() {
  const { backendUrl } = useAppContext();
  const navigate = useNavigate();

  // Custom hook
  const { timer, updateTimer, stopTimer } = useTimer();

  useEffect(() => {
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
  }, [backendUrl, navigate, updateTimer, stopTimer]);

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
