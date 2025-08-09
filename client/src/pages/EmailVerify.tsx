import { useNavigate } from "react-router";
import { assets } from "../assets/assets";
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useAppContext } from "../hooks/useAppContext";
import { toast } from "react-toastify";

// Avoid recreation
const OTP_LENGTH = 6;

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
  "w-full py-3 px-4 rounded-full cursor-pointer font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4";

const resetButton =
  "w-full py-2 px-4 rounded-full cursor-pointer font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm";

// Util format time function
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

function calculateTimeLeft(expirationTime: number): number {
  const now = Date.now();
  const timeLeft = Math.floor((expirationTime - now) / 1000);
  return Math.max(0, timeLeft);
}

interface TimerState {
  timeLeft: number;
  isExpired: boolean;
  expirationTime: number | null;
}

interface LoadingState {
  isVerifying: boolean;
  isResending: boolean;
}

export default function EmailVerify() {
  const { backendUrl, getUserData } = useAppContext();
  const navigate = useNavigate();

  const [otp, setOtp] = useState<string[]>(() =>
    new Array(OTP_LENGTH).fill("")
  );
  const [timer, setTimer] = useState<TimerState>({
    timeLeft: 0,
    isExpired: false,
    expirationTime: null,
  });
  const [loading, setLoading] = useState<LoadingState>({
    isVerifying: false,
    isResending: false,
  });

  const timerRef = useRef<number | null>(null);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

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
          const timeLeft = calculateTimeLeft(data.expiresAt);
          setTimer({
            timeLeft,
            isExpired: timeLeft <= 0,
            expirationTime: data.expiresAt,
          });
        }
      } catch (error: any) {
        console.error("Error fetching OTP status: ", error);
        const errorMessage =
          error.response?.data?.error || "Failed to fetch OTP status";
        toast.error(errorMessage);
      }
    }

    fetchOtpStatus();
  }, [backendUrl, navigate]);

  // Timer
  useEffect(() => {
    if (!timer.expirationTime || timer.isExpired) return;

    timerRef.current = window.setInterval(() => {
      const timeLeft = calculateTimeLeft(timer.expirationTime!);

      setTimer((prev) => ({
        ...prev,
        timeLeft,
        isExpired: timeLeft <= 0,
      }));

      // Timer expires
      if (timeLeft <= 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timer.expirationTime, timer.isExpired]);

  function handleOtpChange(index: number, value: string) {
    if (value.length > 1) return;

    setOtp((prev) => {
      const newOtp = [...prev];
      newOtp[index] = value;
      return newOtp;
    });

    if (value && index < OTP_LENGTH - 1) {
      otpInputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      otpInputsRef.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const paste = e.clipboardData.getData("text");

    if (paste.length === 0) return;

    const pasteArray = paste.slice(0, OTP_LENGTH).split("");
    const newOtp = new Array(OTP_LENGTH).fill("");
    pasteArray.forEach((char, index) => {
      if (index < OTP_LENGTH) {
        newOtp[index] = char;
      }
    });

    setOtp(newOtp);

    // Focus on the last filled input ou next empty one
    const focusIndex = Math.min(pasteArray.length - 1, OTP_LENGTH - 1);
    otpInputsRef.current[focusIndex]?.focus();
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== OTP_LENGTH) {
      toast.warning("Please, type the complete code");
      return;
    }

    if (timer.isExpired) {
      toast.error("Code expired. Request a new code.");
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
      setOtp(new Array(OTP_LENGTH).fill(""));
      otpInputsRef.current[0]?.focus();
    } finally {
      setLoading((prev) => ({ ...prev, isVerifying: false }));
    }
  }

  async function handleResendCode() {
    setLoading((prev) => ({ ...prev, isResending: true }));

    try {
      axios.defaults.withCredentials = true;
      // Send new OTP
      const { data } = await axios.post(
        `${backendUrl}/api/auth/send-verify-otp`
      );

      if (data.expiresAt) {
        const timeLeft = calculateTimeLeft(data.expiresAt);
        setTimer({
          timeLeft,
          isExpired: timeLeft <= 0,
          expirationTime: data.expiresAt,
        });
      }

      setOtp(new Array(OTP_LENGTH).fill(""));
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

  // Computed Values
  const formattedTime = formatTime(timer.timeLeft);

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
    [timer.isExpired]
  );
  return (
    <div className={mainDiv}>
      <img
        src={assets.logo}
        alt="Logo"
        className={logo}
        onClick={() => navigate("/")}
      />
      <form className={formContainer} onSubmit={handleVerifyOtp}>
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
        <div className={otpContainer} onPaste={handlePaste}>
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
              required
            />
          ))}
        </div>

        {/* Verify Button */}
        <button
          disabled={timer.isExpired || !isOtpComplete || isAnyLoading}
          className={`${verifyButton} bg-blue-600 text-gray-300 hover:bg-blue-700 focus:ring-blue-500`}
        >
          {loading.isVerifying ? "Verifying..." : "Verify Code"}
        </button>

        {/* Reset Code Button */}
        {timer.isExpired ? (
          <button
            type="button"
            onClick={handleResendCode}
            disabled={isAnyLoading}
            className={`${resetButton} bg-slate-700 text-gray-300 hover:bg-slate-600 focus:ring-slate-500`}
          >
            {loading.isResending ? "Sending..." : "Send New Code"}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleResendCode}
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
