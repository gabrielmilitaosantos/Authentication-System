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
         verifyOtp TEXT DEFAULT NULL,
         verifyOtpExpires INT DEFAULT 0,
         isAccountVerified BOOLEAN DEFAULT false,
         resetOtp TEXT DEFAULT NULL,
         resetOtpExpires INT DEFAULT 0
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

  // close connections (use this when shutting down the server)
  async close() {
    await sql.end();
  }
}

const userModel = new UserModel();
export default userModel;
