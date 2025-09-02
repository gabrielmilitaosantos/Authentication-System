import { assets } from "../../assets/assets";
import { useState } from "react";
import { useAppContext } from "../../hooks/useAppContext";
import { toast } from "react-toastify";
import axios from "axios";

const STYLES = {
  button: `
   w-full py-3 mb-5 rounded-full cursor-pointer bg-gray-100 font-medium 
   text-slate-800 transition-all duration-200 hover:bg-gray-200 hover:shadow-md 
   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 
   flex items-center justify-center border border-gray-300
  `,
  divLoading:
    "animate-spin w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full mr-2",
} as const;

interface GoogleAuthButtonProps {
  onError?: (error: string) => void;
  disabled?: boolean;
}

export default function GoogleAuthButton({
  onError,
  disabled = false,
}: GoogleAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { backendUrl } = useAppContext();

  async function handleGoogleSignIn() {
    if (disabled || isLoading) return;
    setIsLoading(true);

    try {
      const { data } = await axios.get(`${backendUrl}/api/auth/oauth/google`);

      if (data.success && data.authUrl) {
        // Direct to Google OAuth URL
        window.location.href = data.authUrl;
      } else {
        throw new Error("Failed to get Google auth URL");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        "Failed to initiate Google authentication";

      console.error("Google OAuth error:", error);
      onError?.(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
    }
    // Note: setIsLoading(false) not needed in success case because page redirects
  }

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={disabled || isLoading}
      className={STYLES.button}
    >
      {isLoading ? (
        <>
          <div className={STYLES.divLoading}></div>
          Redirecting to Google...
        </>
      ) : (
        <>
          <img
            src={assets.google_icon}
            alt="Google Icon"
            className="w-5 h-5 mr-2"
          />
          Continue with Google
        </>
      )}
    </button>
  );
}
