import { sql } from "../config/database.js";

class UserModel {
  constructor() {
    this.tableName = "users";
  }

  async createTable() {
    try {
      await sql`
         CREATE TABLE IF NOT EXISTS users (
         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
         name TEXT NOT NULL,
         email TEXT NOT NULL UNIQUE,
         password TEXT DEFAULT NULL,
         google_id TEXT DEFAULT NULL,
         profile_picture TEXT DEFAULT NULL,
         verify_otp TEXT DEFAULT NULL,
         verify_otp_expires BIGINT DEFAULT 0,
         is_account_verified BOOLEAN DEFAULT false,
         reset_otp TEXT DEFAULT NULL,
         reset_otp_expires BIGINT DEFAULT 0,
         auth_provider TEXT DEFAULT 'email',
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
         )         
         `;

      await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);`;

      console.log("Users table ready");
    } catch (error) {
      console.error("Error creating users table:", error);
      throw error;
    }
  }

  async createUser(name, email, password) {
    try {
      const [user] = await sql`
        INSERT INTO users (name, email, password, auth_provider)
        VALUES (${name}, ${email}, ${password}, 'email')
        RETURNING id, name, email
      `;

      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async createGoogleUser({ name, email, googleId, profilePicture = null }) {
    try {
      const [user] = await sql`
      INSERT INTO users (
        name,
        email,
        google_id,
        profile_picture,
        is_account_verified,
        auth_provider
      )
      VALUES (
        ${name},
        ${email},
        ${googleId},
        ${profilePicture},
        true,
        'google'
      )
      RETURNING id, name, email, profile_picture, is_account_verified
      `;

      return user;
    } catch (error) {
      console.error("Error creating Google user:", error);
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      const [user] = await sql`
        SELECT * FROM users WHERE email = ${email}
      `;

      return user;
    } catch (error) {
      console.error("Error finding user by email:", error);
      throw error;
    }
  }

  async findByGoogleId(googleId) {
    try {
      const [user] = await sql`
        SELECT * FROM users WHERE google_id = ${googleId}
      `;

      return user;
    } catch (error) {
      console.error("Error finding user by Google ID:", error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const [user] = await sql`
        SELECT * FROM users WHERE id = ${id}
      `;

      return user;
    } catch (error) {
      console.error("Error finding user by ID:", error);
      throw error;
    }
  }

  async emailExists(email) {
    try {
      const [user] = await sql`
        SELECT id FROM users WHERE email = ${email}
      `;

      return !!user; // Return true if user exists, false otherwise
    } catch (error) {
      console.error("Error checking if email exists:", error);
      throw error;
    }
  }

  async updateGoogleId(userId, googleId) {
    try {
      await sql`
        UPDATE users
        SET google_id = ${googleId}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${userId}
      `;
      console.log("Google ID updated successfully");
    } catch (error) {
      console.error("Error updating Google ID:", error);
      throw error;
    }
  }

  async updateProfilePicture(userId, profilePicture) {
    try {
      await sql`
        UPDATE users
        SET profile_picture = ${profilePicture}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${userId}
      `;
      console.log("Profile picture updated successfully");
    } catch (error) {
      console.error("Error updating profile picture:", error);
      throw error;
    }
  }

  async updateOtp(userId, otp, expires, isVerified = false) {
    try {
      await sql`
        UPDATE users
        SET verify_otp = ${otp}, verify_otp_expires = ${expires}, is_account_verified = ${isVerified}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${userId}
      `;
      console.log("OTP updated successfully");
    } catch (error) {
      console.error("Error updating OTP:", error);
      throw error;
    }
  }

  async updateResetOtp(userId, otp, expires) {
    try {
      await sql`
        UPDATE users
        SET reset_otp = ${otp}, reset_otp_expires = ${expires}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${userId}
      `;
      console.log("Reset OTP updated successfully");
    } catch (error) {
      console.error("Error updating reset OTP:", error);
      throw error;
    }
  }

  async updateUserPassword(userId, newPassword) {
    try {
      await sql`
        UPDATE users
        SET password = ${newPassword}, reset_otp = NULL, reset_otp_expires = 0, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${userId}
      `;
    } catch (error) {
      console.error("Error updating user password:", error);
      throw error;
    }
  }

  // close connections (use this when shutting down the server)
  async close() {
    await sql.end();
  }
}

const userModel = new UserModel();
export default userModel;
