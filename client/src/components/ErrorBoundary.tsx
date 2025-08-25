import { useEffect } from "react";
import { useNavigate } from "react-router";
import { assets } from "../assets/assets";

const STYLES = {
  container:
    "flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-blue-500 px-4",
  errorContainer:
    "bg-slate-900 p-8 rounded-lg shadow-lg w-full max-w-md text-center",
  logo: "w-30 mx-auto mb-6 cursor-pointer",
  emoji: "text-4xl mb-4",
  title: "text-2xl font-semibold text-gray-300 mb-2",
  message: "text-gray-400 mb-4",
  countdownMessage: "text-indigo-300 text-sm",
  buttonContainer: "space-y-3",
  primaryButton:
    "w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-gray-300 rounded-full cursor-pointer font-medium",
};

export default function ErrorBoundary() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect after show error for 4 seconds
    const timer = setTimeout(() => {
      navigate("/", { replace: true });
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const errorContent = {
    title: "Page Not Found",
    message: "The page you're looking for doesn't exist.",
  };

  return (
    <div className={STYLES.container}>
      <div className={STYLES.errorContainer}>
        <img
          src={assets.logo}
          alt="Logo"
          className={STYLES.logo}
          onClick={() => navigate("/", { replace: true })}
        />
        <div className="mb-6">
          <div className={STYLES.emoji}>🔍</div>
          <h1 className={STYLES.title}>{errorContent.title}</h1>
          <p className={STYLES.message}>{errorContent.message}</p>
          <p className={STYLES.countdownMessage}>
            You'll be redirected to home in 4 seconds...
          </p>
        </div>
        <div className={STYLES.buttonContainer}>
          <button
            onClick={() => navigate("/", { replace: true })}
            className={STYLES.primaryButton}
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}
