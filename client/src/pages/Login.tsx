import { assets } from "../assets/assets";
import { useState } from "react";
import { useNavigate } from "react-router";
import AuthForm from "../components/AuthForm";

export default function Login() {
  const mainDivClass =
    "flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-blue-500";

  const boxLoginClass =
    "bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm";

  const buttonApiLoginClass =
    "w-full py-3 mb-5 rounded-full cursor-pointer bg-gray-100 font-medium text-slate-800";

  const navigate = useNavigate();

  const [title, setTitle] = useState("Sign Up");

  return (
    <div className={mainDivClass}>
      <img
        src={assets.logo}
        alt="Logo"
        className="absolute left-5 sm:left-20 top-5 sm:w-32 cursor-pointer"
        onClick={() => navigate("/")}
      />
      <div className={boxLoginClass}>
        <h2 className="text-3xl font-semibold mb-3 text-gray-300 text-center">
          {title === "Sign Up" ? "Create account" : "Login"}
        </h2>

        <p className="text-center text-sm mb-6">
          {title === "Sign Up" && "Create your free account"}
        </p>

        {title === "Sign Up" && <p className="text-sm mb-6">Connect with:</p>}
        {title === "Sign Up" && (
          <button className={buttonApiLoginClass}>
            Google [Check This Later]
          </button>
        )}

        {title === "Sign Up" && (
          <button className={buttonApiLoginClass}>
            Microsoft [Check This Later]
          </button>
        )}

        {title === "Sign Up" && (
          <div className="flex items-center gap-3 mb-5">
            <hr className="w-1/2 border-1 rounded-full" />{" "}
            <span className="text-nowrap">Or continue with email</span>{" "}
            <hr className="w-1/2 border-1 rounded-full" />
          </div>
        )}

        <AuthForm authSet={title} onNavigate={navigate} />

        {title === "Sign Up" && (
          <p className="text-center text-xs text-gray-400 mt-4">
            Already have an account?{" "}
            <span
              className="text-blue-400 cursor-pointer underline"
              onClick={() => setTitle("Login")}
            >
              Login here
            </span>
          </p>
        )}

        {title === "Login" && (
          <p className="text-center text-xs text-gray-400 mt-4">
            Don't have an account?{" "}
            <span
              className="text-blue-400 cursor-pointer underline"
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
