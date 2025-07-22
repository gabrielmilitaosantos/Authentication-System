import postgres from "postgres";

const { DATABASE_URL } = process.env;

const sql = postgres(DATABASE_URL, {
  ssl: "require",
  idle_timeout: 20,
  connect_timeout: 60,
});

class UserModel {
  constructor() {
    this.tableName = "users";
  }

  async createTable() {
    try {
      await sql`
         CREATE TABLE IF NOT EXISTS users (
         name TEXT NOT NULL,
         email TEXT NOT NULL UNIQUE,
         password TEXT NOT NULL,
         verifyOtp TEXT DEFAULT NULL,
         verifyOtpExpires INT DEFAULT 0,
         isAccountVerified BOOLEAN DEFAULT false,
         resetOtp TEXT DEFAULT NULL,
         resetOtpExpires INT DEFAULT 0,
         )         
         `;
      console.log("Users table created or already exists.");
    } catch (error) {
      console.error("Error creating users table:", error);
      throw error;
    }
  }
}

const userModel = new UserModel();
export default userModel;
