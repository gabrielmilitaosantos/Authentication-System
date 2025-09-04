import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/database.js";
import userModel from "./models/userModel.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";

const app = express();
const port = process.env.PORT || 3000;
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [];

// Middleware setup
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.get("/", (req, res) => {
  res.send("Welcome to the server!");
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

async function initializeServer() {
  try {
    await connectDB();
    await userModel.createTable();

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Error initializing server:", error);
    process.exit(1);
  }
}

const gracefulShutdown = async (signal) => {
  console.log(`${signal} received: closing server`);
  await userModel.close();
  console.log("Database connections closed.");
  process.exit(0);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

initializeServer(); // Start the server
