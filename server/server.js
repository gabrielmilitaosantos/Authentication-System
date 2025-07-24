import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/database.js";
import userModel from "./models/userModel.js";
import authRouter from "./routes/authRoutes.js";

const app = express();
const port = process.env.PORT || 3000;

// Middleware setup
app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true }));

app.get("/", (req, res) => {
  res.send("Welcome to the server!");
});
app.use("/api/auth", authRouter);

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

process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received: closing HTTP server");
  await userModel.close();
  console.log("Database connections closed.");
  process.exit(0);
});

initializeServer(); // Start the server
