import { assets } from "../../assets/assets";
import { useRef, useState } from "react";
import { useAppContext } from "../../hooks/useAppContext";
import { toast } from "react-toastify";
import axios from "axios";
import Loading from "../UI/Loading";

const STYLES = {
  formContainer: "bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm",
  title: "text-gray-300 text-2xl font-semibold text-center mb-4",
  subtitle: "text-center mb-6 text-indigo-300",
  inputContainer:
    "mb-4 flex items-center gap-3 w-full px-5 py-3 rounded-full bg-[#333A5C]",
  inputText: "w-full bg-transparent text-gray-300 outline-none",
  submitButton:
    "w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-gray-300 rounded-full mt-3 cursor-pointer",
} as const;

interface CheckEmailProps {
  onEmailSent: (email: string, expiresAt: number) => void;
}

export default function CheckEmailForm({ onEmailSent }: CheckEmailProps) {
  const { backendUrl } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!inputRef.current?.value.trim()) {
      toast.error("Please enter with your email");
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/send-reset-otp`,
        {
          email: inputRef.current.value.trim(),
        }
      );

      onEmailSent(inputRef.current.value.trim(), data.expiresAt);
      toast.success(data.message);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Failed to send reset code";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className={STYLES.formContainer} onSubmit={handleSubmit}>
      <h1 className={STYLES.title}>Reset Password</h1>
      <p className={STYLES.subtitle}>Enter with your registered email</p>

      <div className={STYLES.inputContainer}>
        <img src={assets.mail_icon} alt="Mail Icon" />
        <input
          type="email"
          placeholder="Type your email here"
          className={STYLES.inputText}
          ref={inputRef}
          disabled={isLoading}
          required
        />
      </div>
      <button className={STYLES.submitButton} disabled={isLoading}>
        {isLoading ? <Loading /> : "Send Reset Code"}
      </button>
    </form>
  );
}
