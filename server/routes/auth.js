import express from "express";
import { register, login } from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

/**
 * GET /api/auth/me
 * Returns the logged-in user's profile from the database.
 * The frontend can call this to get the real name, email, avatar etc.
 * Usage in frontend:
 *   const res = await API.get("/auth/me");
 *   const user = res.data; // { _id, name, email, ... }
 */
router.get("/me", verifyToken, async (req, res) => {
  try {
    // req.user.id is set by verifyToken middleware
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

export default router;