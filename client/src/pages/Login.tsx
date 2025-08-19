import { assets } from "../assets/assets";
import { useState } from "react";
import { useNavigate } from "react-router";
import AuthForm from "../components/AuthForm";

const STYLES = {
  container:
    "flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-blue-500",
  image: "absolute left-5 sm:left-20 top-5 sm:w-32 cursor-pointer",
  loginContainer:
    "bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm",
  title: "text-3xl font-semibold mb-3 text-gray-300 text-center",
  subtitle: "text-center text-sm mb-6",
  textConnect: "text-sm mb-6",
  submitOAuth:
    "w-full py-3 mb-5 rounded-full cursor-pointer bg-gray-100 font-medium text-slate-800",
  splitterContainer: "flex items-center gap-3 mb-5",
  split: "w-1/2 border-1 rounded-full",
  text: "text-center text-xs text-gray-400 mt-4",
  textLink: "text-blue-400 cursor-pointer underline",
} as const;

export default function Login() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("Sign Up");

  return (
    <div className={STYLES.container}>
      <img
        src={assets.logo}
        alt="Logo"
        className={STYLES.image}
        onClick={() => navigate("/")}
      />
      <div className={STYLES.loginContainer}>
        <h2 className={STYLES.title}>
          {title === "Sign Up" ? "Create account" : "Login"}
        </h2>

        <p className={STYLES.subtitle}>
          {title === "Sign Up" && "Create your free account"}
        </p>

        {title === "Sign Up" && (
          <p className={STYLES.textConnect}>Connect with:</p>
        )}
        {title === "Sign Up" && (
          <button className={STYLES.submitOAuth}>
            Google [Check This Later]
          </button>
        )}

        {title === "Sign Up" && (
          <button className={STYLES.submitOAuth}>
            Microsoft [Check This Later]
          </button>
        )}

        {title === "Sign Up" && (
          <div className={STYLES.splitterContainer}>
            <hr className={STYLES.split} />{" "}
            <span className="text-nowrap">Or continue with email</span>{" "}
            <hr className={STYLES.split} />
          </div>
        )}

        <AuthForm authSet={title} onNavigate={navigate} />

        {title === "Sign Up" && (
          <p className={STYLES.text}>
            Already have an account?{" "}
            <span className={STYLES.textLink} onClick={() => setTitle("Login")}>
              Login here
            </span>
          </p>
        )}

        {title === "Login" && (
          <p className={STYLES.text}>
            Don't have an account?{" "}
            <span
              className={STYLES.textLink}
              onClick={() => setTitle("Sign Up")}
            >
              Sign up here
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
