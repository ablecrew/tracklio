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

// 🔐 Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5178",
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// 🧭 API Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

// 🧪 Health & Status Routes (critical for deployment platforms)
app.get("/api", (req, res) => {
  res.json({
    status: "ok",
    message: "Tracklio API is running 🚀",
    time: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.status(200).send("Tracklio API is running 🚀");
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// 🗄️ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // Exit if DB fails (optional but recommended in production)
  });

// 🚀 Start Server - THIS IS THE FIX THAT MAKES IT WORK EVERYWHERE
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Tracklio API is LIVE on port ${PORT}`);
  console.log(`➜ Local: http://localhost:${PORT}`);
  console.log(`➜ Network: http://0.0.0.0:${PORT}`);
});