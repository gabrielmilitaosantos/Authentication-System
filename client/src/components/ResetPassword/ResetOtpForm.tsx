import { useMemo, useState } from "react";
import { useOtpInput } from "../../hooks/useOtpInput";
import { formatTime } from "../../util/timeFormat";
import { toast } from "react-toastify";
import { useAppContext } from "../../hooks/useAppContext";
import axios from "axios";
import Loading from "../UI/Loading";

const STYLES = {
  formContainer: "bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm",
  title: "text-gray-300 text-2xl font-semibold text-center mb-4",
  subtitle: "text-center mb-6 text-indigo-300",
  timerContainer: "text-center mb-6",
  inputContainer: "flex gap-2 justify-center mb-6",
  otpInput:
    "w-10 h-12 text-center text-lg font-bold rounded-md focus:outline-none transition-colors",
  verifyButton:
    "w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-gray-300 rounded-full mt-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
  resetButton:
    "w-full mt-3 py-2 px-4 rounded-full cursor-pointer font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm",
} as const;

interface ResetOtpFormProps {
  email: string;
  timer: { timeLeft: number; isExpired: boolean };
  onOtpVerified: (otp: string) => void;
  onResendOtp: () => Promise<void>;
}

export default function ResetOtpForm({
  email,
  timer,
  onOtpVerified,
  onResendOtp,
}: ResetOtpFormProps) {
  // Custom Input Hook
  const {
    otp,
    otpInputsRef,
    handleOtpChange,
    handleKeyDown,
    handlePaste,
    resetOtp,
  } = useOtpInput();

  const { backendUrl } = useAppContext();

  const [loading, setLoading] = useState({
    isVerifying: false,
    isResending: false,
  });

  const isOtpComplete = otp.every((digit) => digit !== "");
  const isAnyLoading = loading.isVerifying || loading.isResending;
  const formattedTime = formatTime(timer.timeLeft);

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();

    if (!isOtpComplete || timer.isExpired) return;

    setLoading((prev) => ({ ...prev, isVerifying: true }));

    try {
      const otpCode = otp.join("");

      await axios.post(`${backendUrl}/api/auth/validate-reset-otp`, {
        email,
        otp: otpCode,
      });

      onOtpVerified(otpCode);
      toast.success("Code verified successfully");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Invalid verification code";
      toast.error(errorMessage);
      resetOtp();
    } finally {
      setLoading((prev) => ({ ...prev, isVerifying: false }));
    }
  }

  async function handleResendCode() {
    setLoading((prev) => ({ ...prev, isResending: true }));

    try {
      await onResendOtp();
      resetOtp();
    } catch (error: any) {
      // Error handled in parent component
    } finally {
      setLoading((prev) => ({ ...prev, isResending: false }));
    }
  }

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
      <h1 className={STYLES.title}>Verify Reset Code</h1>
      <p className={STYLES.subtitle}>
        Enter the 6-digit code sent to{" "}
        <span className="font-semibold">{email}</span>
      </p>

      {/* Timer */}
      <div className={STYLES.timerContainer}>
        <div className={timerClasses}>
          <span className="font-semibold">
            {timer.isExpired ? "Expired" : formattedTime}
          </span>
        </div>
        {!timer.isExpired && (
          <p className="text-xs text-gray-400 mt-2">
            Time remaining to enter the code
          </p>
        )}
      </div>

      {/* Input */}
      <div className={STYLES.inputContainer} onPaste={handlePaste}>
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
        {loading.isVerifying ? <Loading /> : "Verify Code"}
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
