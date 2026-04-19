import User from "../models/User.js";

/*
 * requireAdmin — Express middleware.
 * Must be used AFTER verifyToken so req.user is already set.
 *
 * Usage:
 *   import { verifyToken }  from "./auth.js";
 *   import { requireAdmin } from "./adminMiddleware.js";
 *
 *   router.get("/stats", verifyToken, requireAdmin, handler);
 */
export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await User.findById(req.user.id).select("role status");

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    if (user.status === "suspended") {
      return res.status(403).json({ error: "Account suspended" });
    }

    /* Attach full role info for downstream handlers */
    req.user.role = user.role;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};