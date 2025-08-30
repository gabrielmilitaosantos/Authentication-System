import rateLimit from "express-rate-limit";

// Rate limiting for OAuth endpoints
export const oauthRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 OAuth requests per 15 min
  message: {
    error: "Too many OAuth attempts from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validate OAuth state parameter (CSRF protection)
export function validateOAuthState(req, res, next) {
  // Only validate state for callback, not for errors
  if (req.query.error) {
    return next();
  }

  const { state } = req.query;

  if (!state) {
    return res.status(400).json({
      error: "Missing state parameter",
    });
  }

  // In real production, you should validate the state against a stored
  // value (Redis, database or session)
  if (typeof state !== "string" || state.length < 10) {
    return res.status(400).json({
      error: "Invalid state parameter",
    });
  }

  next();
}

// Validate required environment variables
export function validateOAuthConfig(req, res, next) {
  const requiredVars = [
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_REDIRECT_URI",
  ];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error(
      `Missing OAuth environment variables: ${missingVars.join(", ")}`
    );
    return res.status(500).json({
      error: "OAuth configuration error",
    });
  }

  next();
}

export function sanitizeOAuthData(userData) {
  return {
    googleId: userData.googleId?.toString().trim(),
    email: userData.email?.toLowerCase().trim(),
    name: userData.name?.trim().substring(0, 100), // limit name length
    picture: userData.picture?.trim(),
    emailVerified: Boolean(userData.emailVerified),
  };
}
