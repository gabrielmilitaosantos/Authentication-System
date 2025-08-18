import { assets } from "../assets/assets";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useTimer } from "../hooks/useTimer";
import { useAppContext } from "../hooks/useAppContext";
import { toast } from "react-toastify";
import axios from "axios";
import CheckEmailForm from "../components/CheckEmailForm";
import ResetOtpForm from "../components/ResetOtpForm";
import NewPassworForm from "../components/NewPasswordForm";

const STYLES = {
  mainDiv:
    "flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-blue-500",
  logo: "absolute left-5 sm:left-20 top-5 sm:w-32 cursor-pointer",
} as const;

type ResetStep = "email" | "verify-otp" | "new-password";

interface ResetData {
  email: string;
  otp: string;
  expiresAt: number | null;
}

// Keys for sessionStorage
const STORAGE_KEYS = {
  STEP: "reset-password-step",
  DATA: "reset-password-data",
} as const;

export default function ResetPassword() {
  const navigate = useNavigate();
  const { backendUrl } = useAppContext();
  // Custom hook
  const { timer, updateTimer, stopTimer } = useTimer();

  // States with initial values of sessionStorage
  const [currentStep, setCurrentStep] = useState<ResetStep>(() => {
    const savedStep = sessionStorage.getItem(STORAGE_KEYS.STEP);
    return (savedStep as ResetStep) || "email";
  });

  const [resetData, setResetData] = useState<ResetData>(() => {
    const savedData = sessionStorage.getItem(STORAGE_KEYS.DATA);
    return savedData
      ? JSON.parse(savedData)
      : {
          email: "",
          otp: "",
          expiresAt: null,
        };
  });

  // Persists the currentStep in sessionStorage on every reload page
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEYS.STEP, currentStep);
  }, [currentStep]);

  // Persists the data on every reload page
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify(resetData));
  }, [resetData]);

  // Persists the timer if not expired
  useEffect(() => {
    if (currentStep === "verify-otp" && resetData.expiresAt) {
      const now = Date.now();
      if (resetData.expiresAt > now) {
        updateTimer(resetData.expiresAt);
      } else {
        // OTP expired, return to first step
        handleStepReset();
      }
    }
  }, [currentStep, resetData.expiresAt]);

  // Clear data and return to begin
  function handleStepReset() {
    setCurrentStep("email");
    setResetData({ email: "", otp: "", expiresAt: null });
    sessionStorage.removeItem(STORAGE_KEYS.STEP);
    sessionStorage.removeItem(STORAGE_KEYS.DATA);
    stopTimer();
  }

  function handleEmailSent(email: string, expiresAt: number) {
    const newData = { email, otp: "", expiresAt };
    setResetData(newData);
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

      // Update time expiration
      const newExpiresAt = data.expiresAt;
      setResetData((prev) => ({ ...prev, expiresAt: newExpiresAt }));
      updateTimer(newExpiresAt);
      toast.success(data.message);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Failed to resend code";
      toast.error(errorMessage);
    }
  }

  function handlePasswordReset() {
    handleStepReset();
    toast.success(
      "Password reset successfully! Please login with your new password"
    );
    navigate("/login");
  }

  return (
    <div className={STYLES.mainDiv}>
      <img
        src={assets.logo}
        alt="Logo"
        className={STYLES.logo}
        onClick={() => {
          handleStepReset();
          navigate("/");
        }}
      />

      {currentStep === "email" && (
        <CheckEmailForm onEmailSent={handleEmailSent} />
      )}

      {currentStep === "verify-otp" && (
        <ResetOtpForm
          email={resetData.email}
          timer={timer}
          onOtpVerified={handleOtpVerified}
          onResendOtp={handleResendOtp}
        />
      )}

      {currentStep === "new-password" && (
        <NewPassworForm
          email={resetData.email}
          otp={resetData.otp}
          onPasswordReset={handlePasswordReset}
        />
      )}
    </div>
  );
}
