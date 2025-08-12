import { useCallback, useRef, useState } from "react";

export function useOtpInput(length: number = 6) {
  const [otp, setOtp] = useState<string[]>(() => new Array(length).fill(""));
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpChange = useCallback(
    (index: number, value: string) => {
      if (value.length > 1) return;

      // only numbers
      if (value && !/^\d$/.test(value)) return;

      setOtp((prev) => {
        const newOtp = [...prev];
        newOtp[index] = value;
        return newOtp;
      });

      if (value && index < length - 1) {
        otpInputsRef.current[index + 1]?.focus();
      }
    },
    [length]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        otpInputsRef.current[index - 1]?.focus();
      } else if (e.key === "ArrowLeft" && index > 0) {
        otpInputsRef.current[index - 1]?.focus();
      } else if (e.key === "ArrowRight" && index < length - 1) {
        otpInputsRef.current[index + 1]?.focus();
      }
    },
    [otp, length]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const paste = e.clipboardData.getData("text");

      if (paste.length === 0) return;

      const pasteArray = paste.slice(0, length).split("");
      const newOtp = new Array(length).fill("");
      pasteArray.forEach((char, index) => {
        if (index < length) {
          newOtp[index] = char;
        }
      });

      setOtp(newOtp);

      // Focus on the last filled input ou next empty one
      const focusIndex = Math.min(pasteArray.length - 1, length - 1);
      otpInputsRef.current[focusIndex]?.focus();
    },
    [length]
  );

  const resetOtp = useCallback(() => {
    setOtp(new Array(length).fill(""));
    otpInputsRef.current[0]?.focus();
  }, [length]);

  return {
    otp,
    otpInputsRef,
    handleOtpChange,
    handleKeyDown,
    handlePaste,
    resetOtp,
  };
}
