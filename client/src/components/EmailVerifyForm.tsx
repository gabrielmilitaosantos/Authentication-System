import { useMemo, useState } from "react";
import { useOtpInput } from "../hooks/useOtpInput";
import { toast } from "react-toastify";
import { useAppContext } from "../hooks/useAppContext";
import { formatTime } from "../util/timeFormat";
import { useNavigate } from "react-router";
import axios from "axios";

const STYLES = {
  formContainer: "bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm",
  title: "text-gray-300 text-2xl font-semibold text-center mb-4",
  subtitle: "text-center mb-6 text-indigo-300",
  timerContainer: "text-center mb-6",
  otpContainer: "flex gap-2 justify-center mb-6",
  otpInput:
    "w-10 h-12 text-center text-lg font-bold rounded-md focus:outline-none transition-colors",
  verifyButton:
    "w-full mb-4 mt-3 py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-gray-300 rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
  resetButton:
    "w-full py-2 px-4 rounded-full cursor-pointer font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm",
} as const;

const OTP_LENGTH = 6;

interface LoadingState {
  isVerifying: boolean;
  isResending: boolean;
}

interface VerifyFormProps {
  timer: {
    timeLeft: number;
    isExpired: boolean;
    expirationTime: number | null;
  };
  onTimerUpdate: (expirationTime: number) => void;
}

export default function EmailVerifyForm({
  timer,
  onTimerUpdate,
}: VerifyFormProps) {
  const [loading, setLoading] = useState<LoadingState>({
    isVerifying: false,
    isResending: false,
  });

  const navigate = useNavigate();

  const {
    otp,
    otpInputsRef,
    handleOtpChange,
    handleKeyDown,
    handlePaste,
    resetOtp,
  } = useOtpInput();

  const { backendUrl, getUserData } = useAppContext();

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== OTP_LENGTH) {
      toast.warning("Please, type the complete code");
      return;
    }

    if (timer.isExpired) {
      toast.error("Code expired. Request a new code.");
      return;
    }

    setLoading((prev) => ({ ...prev, isVerifying: true }));

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/verify-account`,
        {
          otp: otpCode,
        }
      );

      toast.success(data.message);
      await getUserData();
      navigate("/");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "An error occurred. Please try again.";
      toast.error(errorMessage);

      // Clear input on error
      resetOtp();
      otpInputsRef.current[0]?.focus();
    } finally {
      setLoading((prev) => ({ ...prev, isVerifying: false }));
    }
  }

  async function handleResendCode() {
    setLoading((prev) => ({ ...prev, isResending: true }));

    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(
        `${backendUrl}/api/auth/send-verify-otp`
      );

      if (data.expiresAt) {
        onTimerUpdate(data.expiresAt);
      }

      resetOtp();
      otpInputsRef.current[0]?.focus();
      toast.success(data.message);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "An error occurred. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading((prev) => ({ ...prev, isResending: false }));
    }
  }

  const isAnyLoading = loading.isVerifying || loading.isResending;
  const isOtpComplete = otp.join("").length === OTP_LENGTH;
  const formattedTime = formatTime(timer.timeLeft);

  const otpInputClasses = useMemo(() => {
    const baseClasses = STYLES.otpInput;
    return timer.isExpired
      ? `${baseClasses} bg-slate-800 border border-red-500/50 text-red-300`
      : `${baseClasses} bg-slate-800 border border-slate-600 text-gray-300 focus:border-blue-400 focus:bg-slate-700`;
  }, [timer.isExpired]);

  const timerClasses = useMemo(() => {
    const baseClasses =
      "inline-flex flex-col items-center gap-2 px-4 py-2 rounded-lg";

    if (timer.isExpired) {
      return `${baseClasses} bg-red-900/50 text-red-300 border border-red-500/50`;
    }

    if (timer.timeLeft < 60) {
      return `${baseClasses} bg-orange-900/50 text-orange-300 border border-orange-500/50`;
    }

    return `${baseClasses} bg-green-900/50 text-green-300 border border-green-500/50`;
  }, [timer.isExpired, timer.timeLeft]);

  return (
    <form className={STYLES.formContainer} onSubmit={handleVerifyOtp}>
      <h1 className={STYLES.title}>Email Verification</h1>
      <p className={STYLES.subtitle}>
        Enter the 6-digit code sent to your email.
      </p>

      <div className={STYLES.timerContainer}>
        <div className={timerClasses}>
          <span className="font-semibold">
            {timer.isExpired ? "Expired" : formattedTime}
          </span>
        </div>
        {!timer.isExpired && (
          <p className="text-xs text-gray-400 mt-2">
            Time remaining to validate the code
          </p>
        )}
      </div>

      {/* Input */}
      <div className={STYLES.otpContainer} onPaste={handlePaste}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              otpInputsRef.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className={otpInputClasses}
            maxLength={1}
            disabled={timer.isExpired || isAnyLoading}
            aria-label={`Digit ${index + 1} of verification code`}
            autoComplete="off"
            spellCheck={false}
            required
          />
        ))}
      </div>

      {/* Verify Button */}
      <button
        disabled={timer.isExpired || !isOtpComplete || isAnyLoading}
        className={STYLES.verifyButton}
      >
        {loading.isVerifying ? "Verifying..." : "Verify Code"}
      </button>

      {/* Reset Code Button */}
      <button
        type="button"
        onClick={handleResendCode}
        disabled={isAnyLoading}
        className={`${STYLES.resetButton} ${
          timer.isExpired
            ? "bg-slate-700 text-gray-300 hover:bg-slate-600 focus:ring-slate-500"
            : "text-indigo-300 hover:bg-slate-800 focus:ring-indigo-500"
        }`}
      >
        {loading.isResending
          ? "Sending..."
          : timer.isExpired
          ? "Send New Code"
          : "Didn't receive the code? Resend"}
      </button>
    </form>
  );
}
