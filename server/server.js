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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// 🧭 Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes); 

// 🧪 API test route
app.get("/api", (req, res) => {
  res.json({
    status: "ok",
    message: "Tracklio API is running 🚀",
    time: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.send("Tracklio API is running 🚀");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// 🗄️ MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// 🚀 Start server
const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});