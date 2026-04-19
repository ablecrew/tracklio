import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/tasks.js";
import transactionRoutes from "./routes/transactions.js";
import aiRoutes from "./routes/ai.js";
import chatRoutes from "./routes/chat.js";
import habitRoutes from "./routes/habits.js";
import notificationRoutes from "./routes/notifications.js";
import userRoutes from "./routes/user.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Trust proxy (important for platforms like Railway, Render, Heroku)
app.set("trust proxy", 1);

// CORS Setup — supports multiple origins
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5178",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Set to `callback(new Error("Not allowed by CORS"))` for strict mode
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logger (lightweight)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} → ${req.method} ${req.url}`);
  next();
});

//  Root route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Tracklio API is running 🚀",
    docs: "/api",
    health: "/api/health",
  });
});

//  API base route
app.get("/api", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Tracklio API is running 🚀",
    time: new Date().toISOString(),
  });
});

//  Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    uptime: process.uptime(),
    mongo: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

//  API Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

//  404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found`,
  });
});

//  Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack || err.message);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});

//  MongoDB Connection + Server Start
const PORT = process.env.PORT || 8080;

const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();

//  Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("⚠️ SIGTERM received, shutting down gracefully...");
  await mongoose.connection.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("⚠️ SIGINT received, shutting down gracefully...");
  await mongoose.connection.close();
  process.exit(0);
});

// 🪤 Catch unhandled errors
process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});