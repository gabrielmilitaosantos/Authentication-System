import { assets } from "../assets/assets";
import { useForm } from "react-hook-form";

interface AuthFormProps {
  authSet?: string;
  onNavigate: (path: string) => void;
}

type Inputs = {
  fullName?: string;
  email: string;
  password: string;
};

export default function AuthForm({ authSet, onNavigate }: AuthFormProps) {
  let formDivClass =
    "flex items-center gap-3 w-full px-5 py-3 rounded-full bg-zinc-800";

  const buttonLoginClass =
    "w-full py-3 rounded-full cursor-pointer bg-gradient-to-r from-indigo-500 to-indigo-900 text-gray-300 font-medium";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const onSubmit = (data: Inputs) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {authSet === "Sign Up" && (
        <>
          <div
            className={`${formDivClass}${errors.fullName ? " mb-1" : " mb-4"}`}
          >
            <img src={assets.person_icon} alt="Person-Icon" />
            <input
              type="text"
              placeholder="Full Name"
              className="bg-transparent text-gray-300 w-full outline-none"
              {...register("fullName", {
                required: "Full name is required",
                minLength: {
                  value: 3,
                  message: "The name has to be a least 3 characters",
                },
                maxLength: {
                  value: 50,
                  message: "This name is too long. Try less than 50 characters",
                },
                pattern: {
                  value: /^[a-zA-ZÀ-ÿ\s]+$/,
                  message: "Name can only contain letters and spaces",
                },
              })}
              disabled={isSubmitting}
            />
          </div>
          {errors.fullName && (
            <p className="ml-2 mb-2 text-orange-600">
              {errors.fullName.message}
            </p>
          )}
        </>
      )}

      <div className={`${formDivClass}${errors.email ? " mb-2" : " mb-4"}`}>
        <img src={assets.mail_icon} alt="Mail-Icon" />
        <input
          type="email"
          placeholder="Email"
          className="bg-transparent text-gray-300 w-full outline-none"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              message: "Please enter a valid email address",
            },
          })}
        />
      </div>
      {errors.email && (
        <p className="ml-2 mb-2 text-orange-600">{errors.email.message}</p>
      )}

      <div className={`${formDivClass}${errors.password ? " mb-2" : " mb-4"}`}>
        <img src={assets.lock_icon} alt="Lock-Icon" />
        <input
          type="password"
          placeholder="Password"
          className="bg-transparent text-gray-300 w-full outline-none"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 8,
              message:
                authSet === "Sign Up"
                  ? "Password must be at least 8 characters"
                  : "Invalid password. Must be at least 8 characters, including capital letters and numbers",
            },
            ...(authSet === "Sign Up" && {
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
                message:
                  "Password must contain at least one uppercase letter and one number",
              },
            }),
          })}
        />
      </div>
      {errors.password && (
        <p className="ml-2 mb-2 text-orange-600">{errors.password.message}</p>
      )}

      {authSet === "Login" && (
        <p
          className="mb-4 text-indigo-500 cursor-pointer"
          onClick={() => onNavigate("/reset-password")}
        >
          Forgot password?
        </p>
      )}

      <button className={buttonLoginClass}>
        {isSubmitting ? "Submitting..." : authSet}
      </button>
    </form>
  );
}
