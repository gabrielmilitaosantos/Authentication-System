import { OAuth2Client } from "google-auth-library";

class GoogleOAuthService {
  constructor() {
    this.client = new OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI,
    });
  }

  generateAuthUrl() {
    const scopes = [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ];

    return this.client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      include_granted_scopes: true,
      state: this.generateRandomState(), // Optional: for CSRF protection
      prompt: "consent", // Always receive refresh token
    });
  }

  // Generate a token for CSRF protection
  generateRandomState() {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  async verifyAuthCode(code) {
    try {
      if (!code) {
        throw new Error("Authorization code is missing");
      }

      const tokenResponse = await this.client.getToken(code);

      if (!tokenResponse || !tokenResponse.tokens) {
        throw new Error("Failed to retrieve tokens from Google");
      }

      const { tokens } = tokenResponse;

      if (!tokens.id_token) {
        throw new Error("No ID token received from Google");
      }

      this.client.setCredentials(tokens);

      const ticket = await this.client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        throw new Error("Failed to get payload from ID token");
      }

      return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        emailVerified: payload.email_verified,
      };
    } catch (error) {
      console.error("Error verifying Google auth code:", error);
      throw new Error("invalid Google auth code");
    }
  }

  // Verify Google ID token (for frontend integration)
  async verifyIdToken(idToken) {
    try {
      if (!idToken) {
        throw new Error("ID token is missing");
      }

      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        throw new Error("Failed to get payload from ID token");
      }

      return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        emailVerified: payload.email_verified,
      };
    } catch (error) {
      console.error("Error verifying Google ID token:", error);
      throw new Error("invalid Google ID token");
    }
  }
}

const googleOAuthService = new GoogleOAuthService();
export default googleOAuthService;
