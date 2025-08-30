import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import googleOAuthService from "../config/googleOAuth.js";
import transporter from "../config/nodemailer.js";

export async function googleAuth(req, res) {
  try {
    const authUrl = googleOAuthService.generateAuthUrl();

    res.status(200).json({
      success: true,
      authUrl,
      message: "Google auth URL generated",
    });
  } catch (error) {
    console.error("Error generating Google auth URL:", error);
    res.status(500).json({ error: "Failed to initiate Google OAuth" });
  }
}

export async function googleCallback(req, res) {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Authorization code is missing" });
  }

  try {
    const googleUser = await googleOAuthService.verifyAuthCode(code);

    if (!googleUser.emailVerified) {
      return res.status(400).json({
        error:
          "Google email not verified. Please verify your email with Google first.",
      });
    }

    let user = await userModel.findByEmail(googleUser.email);

    if (user) {
      if (!user.google_id) {
        await userModel.updateGoogleId(user.id, googleUser.googleId);
      }

      if (googleUser.picture && user.profile_picture !== googleUser.picture) {
        await userModel.updateProfilePicture(user.id, googleUser.picture);
      }
    } else {
      // Create new user
      user = await userModel.createGoogleUser({
        name: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.googleId,
        profilePicture: googleUser.picture,
      });

      if (!user) {
        return res.status(500).json({ error: "Failed to create user" });
      }

      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: "Welcome to Our Service!",
        text: `Hello ${user.name}, \n\nWelcome to our service! We're excited to have you on board.\n\nBest regards,\nThe Team`,
      };

      try {
        await transporter.sendMail(mailOptions);
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError);
        // Don't fail the whole process if email sending fails
      }
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d", // Longer expiration for OAuth users
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/?auth=success`);
  } catch (error) {
    console.error("Error during Google OAuth callback:", error);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/login?error=oauth_failed`);
  }
}

export async function googleTokenAuth(req, res) {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ error: "Google ID token is required" });
  }

  try {
    const googleUser = await googleOAuthService.verifyIdToken(idToken);

    if (!googleUser.emailVerified) {
      return res.status(400).json({
        error: "Google account email is not verified",
      });
    }

    let user = await userModel.findByEmail(googleUser.email);

    if (user) {
      if (!user.google_id) {
        await userModel.updateGoogleId(user.id, googleUser.googleId);
      }

      if (googleUser.picture && user.profile_picture !== googleUser.picture) {
        await userModel.updateProfilePicture(user.id, googleUser.picture);
      }
    } else {
      // Create new user
      user = await userModel.createGoogleUser({
        name: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.googleId,
        profilePicture: googleUser.picture,
      });

      if (!user) {
        return res.status(500).json({ error: "Failed to create user" });
      }

      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: "Welcome to Our Service!",
        text: `Hello ${user.name}, \n\nWelcome to our service! We're excited to have you on board.\n\nBest regards,\nThe Team`,
      };

      try {
        await transporter.sendMail(mailOptions);
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError);
      }
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d", // Longer expiration for OAuth users
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      message: "Google authentication successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAccountVerified: true, // Since Google email is verified
      },
    });
  } catch (error) {
    console.error("Error during Google token authentication:", error);
    return res
      .status(500)
      .json({ error: "Google token authentication failed" });
  }
}
