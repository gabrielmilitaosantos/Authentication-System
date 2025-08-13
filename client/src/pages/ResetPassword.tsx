import { assets } from "../assets/assets";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useTimer } from "../hooks/useTimer";
import { useAppContext } from "../hooks/useAppContext";
import CheckEmailForm from "../components/CheckEmailForm";
import axios from "axios";
import { toast } from "react-toastify";

const STYLES = {
  mainDiv:
    "flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-blue-500",
  logo: "absolute left-5 sm:left-20 top-5 sm:w-32 cursor-pointer",
} as const;

type ResetStep = "email" | "verify-otp" | "new-password";

export default function ResetPassword() {
  const navigate = useNavigate();

  // Flow steps
  const [currentStep, setCurrentStep] = useState<ResetStep>("email");
  const [resetData, setResetData] = useState({
    email: "",
    otp: "",
  });

  // Custom hook
  const { timer, updateTimer, stopTimer } = useTimer();

  const { backendUrl } = useAppContext();

  function handleEmailSent(email: string, expiresAt: number) {
    setResetData((prev) => ({ ...prev, email }));
    setCurrentStep("verify-otp");
    updateTimer(expiresAt);
  }

  function handleOtpVerified(otp: string) {
    setResetData((prev) => ({ ...prev, otp }));
    setCurrentStep("new-password");
    stopTimer();
  }

  async function handleResendOtp() {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/send-reset-otp`,
        {
          email: resetData.email,
        }
      );

      updateTimer(data.expiresAt);
      toast.success(data.message);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Failed to resend code";
      toast.error(errorMessage);
    }
  }

  return (
    <div className={STYLES.mainDiv}>
      <img
        src={assets.logo}
        alt="Logo"
        className={STYLES.logo}
        onClick={() => navigate("/")}
      />

      {currentStep === "email" && (
        <CheckEmailForm onEmailSent={handleEmailSent} />
      )}
    </div>
  );
}
