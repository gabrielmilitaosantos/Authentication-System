import express from "express";
import {
  getOtpStatus,
  isAuthenticated,
  login,
  logout,
  register,
  sendResetOtp,
  sendVerifyOtp,
  verifyOtp,
  verifyResetOtp,
} from "../controller/authController.js";
import userAuth from "../middleware/userAuth.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/send-verify-otp", userAuth, sendVerifyOtp);
authRouter.get("/otp-status", userAuth, getOtpStatus);
authRouter.post("/verify-account", userAuth, verifyOtp);
authRouter.get("/is-auth", userAuth, isAuthenticated);
authRouter.post("/send-reset-otp", sendResetOtp);
authRouter.post("/reset-password", verifyResetOtp);

export default authRouter;
