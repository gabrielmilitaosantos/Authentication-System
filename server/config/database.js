import postgres from "postgres";

const { DATABASE_URL } = process.env;

const sql = postgres(DATABASE_URL, {
  ssl: "require",
  idle_timeout: 20,
  connect_timeout: 60,
});

async function connectDB() {
  try {
    const result = await sql`SELECT version()`;
    console.log("Database connected:", result[0]);
  } catch (error) {
    console.error("Error connecting to Neon database:", error);
    throw error;
  }
}

export { sql, connectDB as default };
