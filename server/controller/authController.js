import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
