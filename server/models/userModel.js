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
         password TEXT NOT NULL,
         verify_otp TEXT DEFAULT NULL,
         verify_otp_expires BIGINT DEFAULT 0,
         is_account_verified BOOLEAN DEFAULT false,
         reset_otp TEXT DEFAULT NULL,
         reset_otp_expires BIGINT DEFAULT 0
         )         
         `;
      console.log("Users table ready");
    } catch (error) {
      console.error("Error creating users table:", error);
      throw error;
    }
  }

  async createUser(name, email, password) {
    try {
      const [user] = await sql`
        INSERT INTO users (name, email, password)
        VALUES (${name}, ${email}, ${password})
        RETURNING id, name, email
      `;

      return user;
    } catch (error) {
      console.error("Error creating user:", error);
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

  async updateOtp(userId, otp, expires, isVerified = false) {
    try {
      await sql`
        UPDATE users
        SET verify_otp = ${otp}, verify_otp_expires = ${expires}, is_account_verified = ${isVerified}
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
        SET reset_otp = ${otp}, reset_otp_expires = ${expires}
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
        SET password = ${newPassword}, reset_otp = NULL, reset_otp_expires = 0
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
