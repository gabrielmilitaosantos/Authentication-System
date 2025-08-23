import { assets } from "../assets/assets";
import { useForm } from "react-hook-form";
import { useAppContext } from "../hooks/useAppContext";
import { toast } from "react-toastify";
import axios from "axios";

const STYLES = {
  formContainer: "bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm",
  title: "text-gray-300 text-2xl font-semibold text-center mb-4",
  subtitle: "text-center mb-6 text-indigo-300",
  inputContainer:
    "flex items-center gap-3 w-full px-5 py-3 rounded-full bg-[#333A5C]",
  inputText: "w-full bg-transparent text-gray-300 outline-none",
  submitButton:
    "w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-gray-300 rounded-full mt-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
  errorText: "ml-2 mb-2 text-orange-600 text-xs",
} as const;

interface NewPasswordFormProps {
  email: string;
  otp: string;
  onPasswordReset: () => void;
}

type PasswordInputs = {
  newPassword: string;
  confirmPassword: string;
};

export default function NewPassworForm({
  email,
  otp,
  onPasswordReset,
}: NewPasswordFormProps) {
  const { backendUrl } = useAppContext();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PasswordInputs>({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  const newPassword = watch("newPassword");

  async function onSubmit(data: PasswordInputs) {
    try {
      await axios.post(`${backendUrl}/api/auth/reset-password`, {
        email,
        otp,
        newPassword: data.newPassword,
      });

      onPasswordReset(); // Redirect to login
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Failed to reset password";
      toast.error(errorMessage);
    }
  }

  return (
    <form className={STYLES.formContainer} onSubmit={handleSubmit(onSubmit)}>
      <h1 className={STYLES.title}>Set New Password</h1>
      <p className={STYLES.subtitle}>
        Choose a strong password for your account
      </p>

      <div
        className={`${STYLES.inputContainer}${
          errors.newPassword ? " mb-1" : " mb-4"
        }`}
      >
        <img src={assets.lock_icon} alt="Lock Icon" />
        <input
          type="password"
          placeholder="New Password"
          className={STYLES.inputText}
          {...register("newPassword", {
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/, // Allow special chars
              message:
                "Password must contain at least one uppercase letter, one lowercase letter, and one number",
            },
          })}
          disabled={isSubmitting}
        />
      </div>
      {errors.newPassword && (
        <p className={STYLES.errorText}>{errors.newPassword.message}</p>
      )}

      <div
        className={`${STYLES.inputContainer}${
          errors.confirmPassword ? " mb-1" : " mb-4"
        }`}
      >
        <img src={assets.lock_icon} alt="Lock Icon" />
        <input
          type="password"
          placeholder="Confirm new password"
          className={STYLES.inputText}
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) => {
              if (value !== newPassword) {
                return "Passwords do not match";
              }
              return true;
            },
          })}
          disabled={isSubmitting}
        />
      </div>
      {errors.confirmPassword && (
        <p className={STYLES.errorText}>{errors.confirmPassword.message}</p>
      )}

      {/* Can set passwords hints here, could be good */}
      <div className="mb-4 text-xs text-gray-400">
        <p className="mb-1">Password requirements:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>At least 8 characters long</li>
          <li>One uppercase letter (A-Z)</li>
          <li>One lowercase letter (a-z)</li>
          <li>One number (0-9)</li>
          <li>Allow special characters, but it's opcional</li>
        </ul>
      </div>

      <button className={STYLES.submitButton} disabled={isSubmitting}>
        {isSubmitting ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  );
}
