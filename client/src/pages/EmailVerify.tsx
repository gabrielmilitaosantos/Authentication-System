import { useNavigate } from "react-router";
import { assets } from "../assets/assets";
import { useMemo, useState } from "react";

// Avoid recreation
const OTP_LENGTH = 6;
const TIMER_DURATION = 10 * 60; // 10 minutes

const mainDiv =
  "flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-blue-500";

const logo = "absolute left-5 sm:left-20 top-5 sm:w-32 cursor-pointer";

const formContainer = "bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm";

const title = "text-gray-300 text-2xl font-semibold text-center mb-4";

const subtitle = "text-center mb-6 text-indigo-300";

const timerContainer = "text-center mb-6";

const otpContainer = "flex gap-2 justify-center mb-6";

const otpInput =
  "w-10 h-12 text-center text-lg font-bold rounded-md focus:outline-none transition-colors";

const verifyButton =
  "w-full py-3 px-4 rounded-md cursor-pointer font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4";

const resetButton =
  "w-full py-2 px-4 rounded-md cursor-pointer font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm";

// Util format time function
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

interface TimerState {
  timeLeft: number;
  isExpired: boolean;
}

interface LoadingState {
  isVerifying: boolean;
  isResending: boolean;
}

export default function EmailVerify() {
  const [otp, setOtp] = useState<string[]>(() =>
    new Array(OTP_LENGTH).fill("")
  );
  const [timer, setTimer] = useState<TimerState>({
    timeLeft: TIMER_DURATION,
    isExpired: false,
  });
  const [loading, setLoading] = useState<LoadingState>({
    isVerifying: false,
    isResending: false,
  });

  const navigate = useNavigate();

  // Computed Values
  const formattedTime = useMemo(
    () => formatTime(timer.timeLeft),
    [timer.timeLeft]
  );
  const isOtpComplete = useMemo(
    () => otp.join("").length === OTP_LENGTH,
    [otp]
  );
  const isAnyLoading = useMemo(
    () => loading.isVerifying || loading.isResending,
    [loading]
  );

  // CSS Classes computed (changings based on timer state)
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

  function getOtpInputClasses(isExpired: boolean) {
    const baseClasses = otpInput;
    if (isExpired) {
      return `${baseClasses} bg-slate-800 border border-red-500/50 text-red-300`;
    }
    return `${baseClasses} bg-slate-800 border border-slate-600 text-gray-300 focus:border-blue-400 focus:bg-slate-700`;
  }

  const otpInputClasses = useMemo(
    () => getOtpInputClasses(timer.isExpired),
    [timer.isExpired, getOtpInputClasses]
  );
  return (
    <div className={mainDiv}>
      <img
        src={assets.logo}
        alt="Logo"
        className={logo}
        onClick={() => navigate("/")}
      />
      <form className={formContainer}>
        <h1 className={title}>Email Verification</h1>
        <p className={subtitle}>Enter the 6-digit code sent to your email.</p>

        <div className={timerContainer}>
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
        <div className={otpContainer}>
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={digit}
              className={otpInputClasses}
              maxLength={1}
              disabled={timer.isExpired || isAnyLoading}
              aria-label={`Digit ${index + 1} of verification code`}
              required
            />
          ))}
        </div>

        {/* Verify Button */}
        <button
          type="button"
          disabled={timer.isExpired || !isOtpComplete || isAnyLoading}
          className={`${verifyButton} bg-blue-600 text-gray-300 hover:bg-blue-700 focus:ring-blue-500`}
        >
          {loading.isVerifying ? "Verifying..." : "Verify Code"}
        </button>

        {/* Reset Code Button */}
        {timer.isExpired ? (
          <button
            type="button"
            disabled={isAnyLoading}
            className={`${resetButton} bg-slate-700 text-gray-300 hover:bg-slate-600 focus:ring-slate-500`}
          >
            {loading.isResending ? "Sending..." : "Send New Code"}
          </button>
        ) : (
          <button
            type="button"
            disabled={isAnyLoading}
            className={`${resetButton} text-indigo-300 hover:bg-slate-800 focus:ring-indigo-500`}
          >
            {loading.isResending
              ? "Sending..."
              : "Didn't receive the code? Resend"}
          </button>
        )}
      </form>
    </div>
  );
}
