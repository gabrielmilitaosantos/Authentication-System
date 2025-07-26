import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from "../config/nodemailer.js";

export async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const userExists = await userModel.emailExists(email);

    if (userExists) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await userModel.createUser(name, email, hashedPassword);
    if (!user) {
      return res.status(500).json({ error: "User creation failed" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
      maxAge: 1 * 60 * 60 * 1000, // 1 hour
    });

    // Welcome Email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Welcome to Our Service",
      text: `Hello ${user.name},\n\nThank you for registering with us! 
      We're excited to have you on board.\n\nBest regards,\nThe Team`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(201).json({
      message: "User registered successfully",
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Error checking email existence:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await userModel.emailExists(email);

    if (!user) {
      return res.status(400).json({ error: "Invalid email" });
    }

    const userData = await userModel.findByEmail(email);
    const isPasswordValid = await bcrypt.compare(password, userData.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ id: userData.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
      maxAge: 1 * 60 * 60 * 1000, // 1 hour
    });

    return res.status(200).json({
      message: "Login successful",
    });
  } catch (error) {
    console.error("Error checking email existence:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function logout(req, res) {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
    });

    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Function to send verification OTP to the user's email
export async function sendVerifyOtp(req, res) {
  try {
    const userId = req.user?.id;

    const user = await userModel.findById(userId);

    if (user.is_account_verified) {
      return res.status(400).json({ error: "Account already verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000)); // Generate a 6-digit OTP

    const otpTime = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

    console.log("=== OTP GENERATION ===");
    console.log("Generated OTP:", otp);
    console.log("OTP expires at:", user.verify_otp_expires);
    console.log("OTP type:", typeof otp);

    await userModel.updateOtp(userId, otp, otpTime);

    console.log("=== VERIFICATION AFTER SAVE ===");
    const userAfterUpdate = await userModel.findById(userId);
    console.log("User after OTP update:", userAfterUpdate);
    console.log("OTP saved in DB:", userAfterUpdate?.verify_otp);
    console.log(
      "OTP expires saved in DB:",
      userAfterUpdate?.verify_otp_expires
    );

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Verification OTP",
      text: `Your verification OTP is: ${otp}\n\n
      This OTP is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    return res
      .status(200)
      .json({ message: "Verification OTP sent successfully" });
  } catch (error) {
    console.error("Error sending verification OTP:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Function to verify the OTP sent to the user's email
export async function verifyOtp(req, res) {
  const { otp } = req.body;
  const userId = req.user?.id;

  if (!userId || !otp) {
    return res.status(400).json({ error: "User ID and OTP are required" });
  }

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.is_account_verified) {
      return res.status(400).json({ error: "Account already verified" });
    }

    console.log("=== OTP COMPARISON ===");
    console.log("OTP from DB:", user.verify_otp);
    console.log("OTP from request:", otp);
    console.log("Are they equal?", user.verify_otp === otp);
    console.log("DB OTP type:", typeof user.verify_otp);
    console.log("Request OTP type:", typeof otp);

    if (user.verify_otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (user.verify_otp_expires < Date.now()) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    // Mark the account as verified
    await userModel.updateOtp(userId, null, 0, true);

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
