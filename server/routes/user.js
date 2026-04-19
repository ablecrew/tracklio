import express      from "express";
import multer       from "multer";
import streamifier  from "streamifier";
import bcrypt       from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

import User         from "../models/User.js";
import Task         from "../models/Task.js";
import Transaction  from "../models/Transaction.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* ═══════════════════════════════════════════════════════
   CLOUDINARY CONFIG
═══════════════════════════════════════════════════════ */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ═══════════════════════════════════════════════════════
   HELPER — Upload buffer to Cloudinary
═══════════════════════════════════════════════════════ */
const uploadToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

/* ═══════════════════════════════════════════════════════
   MULTER — Memory Storage
═══════════════════════════════════════════════════════ */

/* ── File Filters ── */
const imageFilter = (_req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only JPEG, PNG, WebP or GIF images are allowed"), false);
};

const documentFilter = (_req, file, cb) => {
  const allowed = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only PDF, DOC, DOCX or TXT files are allowed"), false);
};

/* ── Multer Instances ── */
const uploadAvatar = multer({
  storage:    multer.memoryStorage(),
  fileFilter: imageFilter,
  limits:     { fileSize: 5 * 1024 * 1024 },   // 5 MB
});

const uploadDocument = multer({
  storage:    multer.memoryStorage(),
  fileFilter: documentFilter,
  limits:     { fileSize: 10 * 1024 * 1024 },  // 10 MB
});


/* ─────────────────────────────────────────────
   POST /api/users/avatar
───────────────────────────────────────────── */
router.post(
  "/avatar",
  verifyToken,
  uploadAvatar.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const result = await uploadToCloudinary(req.file.buffer, {
        folder:         "tracklio/avatars",
        public_id:      `avatar_${req.user.id}`,
        overwrite:      true,
        transformation: [{ width: 300, height: 300, crop: "fill" }],
      });

      const avatarUrl = result.secure_url;

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { avatarUrl },
        { returnDocument: "after", select: "-password" }  // ✅ fixed
      );

      if (!user) return res.status(404).json({ error: "User not found" });

      res.json({ avatarUrl, user });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);


/* ─────────────────────────────────────────────
   POST /api/users/document
───────────────────────────────────────────── */
router.post(
  "/document",
  verifyToken,
  uploadDocument.single("document"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const result = await uploadToCloudinary(req.file.buffer, {
        folder:        "tracklio/documents",
        public_id:     `doc_${req.user.id}_${Date.now()}`,
        resource_type: "raw",
      });

      const document = {
        url:        result.secure_url,
        filename:   req.file.originalname,
        type:       req.body.type || "other",
        uploadedAt: new Date(),
      };

      res.json({ message: "Document uploaded successfully", document });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);


/* ─────────────────────────────────────────────
   DELETE /api/users/avatar
───────────────────────────────────────────── */
router.delete("/avatar", verifyToken, async (req, res) => {
  try {
    await cloudinary.uploader.destroy(`tracklio/avatars/avatar_${req.user.id}`);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatarUrl: "" },
      { returnDocument: "after", select: "-password" }  // ✅ fixed
    );

    res.json({ message: "Avatar removed", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* ─────────────────────────────────────────────
   GET /api/users/profile
───────────────────────────────────────────── */
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* ─────────────────────────────────────────────
   PUT /api/users/profile
───────────────────────────────────────────── */
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { name, bio, location, website, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select("+password");
    if (!user) return res.status(404).json({ error: "User not found" });

    if (name     !== undefined) user.name     = name.trim();
    if (bio      !== undefined) user.bio      = bio.trim();
    if (location !== undefined) user.location = location.trim();
    if (website  !== undefined) user.website  = website.trim();

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: "Current password is required to set a new one" });
      }
      const ok = await user.comparePassword(currentPassword);
      if (!ok) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters" });
      }
      user.password = newPassword;
    }

    await user.save();

    const safe = user.toObject();
    delete safe.password;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* ─────────────────────────────────────────────
   GET /api/users/settings
───────────────────────────────────────────── */
router.get("/settings", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("settings");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.settings || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* ─────────────────────────────────────────────
   PUT /api/users/settings
───────────────────────────────────────────── */
router.put("/settings", verifyToken, async (req, res) => {
  try {
    const ALLOWED = [
      "aiInsights","budgetWarnings","weeklyReport","darkMode","compactView",
      "animations","taskReminders","habitReminders","financeAlerts",
      "emailNotifications","pushNotifications","shareAnalytics",
      "currency","language","dataRetention",
    ];

    const updates = {};
    ALLOWED.forEach(k => {
      if (req.body[k] !== undefined) updates[`settings.${k}`] = req.body[k];
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { returnDocument: "after", select: "settings" }  // ✅ fixed
    );

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* ─────────────────────────────────────────────
   DELETE /api/users/data
───────────────────────────────────────────── */
router.delete("/data", verifyToken, async (req, res) => {
  try {
    const uid = req.user.id;

    const [{ default: Habit }, { default: Notification }] = await Promise.all([
      import("../models/Habit.js").catch(() => ({ default: null })),
      import("../models/Notification.js"),
    ]);

    await Promise.all([
      Task.deleteMany({ userId: uid }),
      Transaction.deleteMany({ userId: uid }),
      Habit ? Habit.deleteMany({ userId: uid }) : Promise.resolve(),
      Notification.deleteMany({ user: uid }),
    ]);

    res.json({ message: "All user data reset. Account kept." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* ─────────────────────────────────────────────
   DELETE /api/users/account
───────────────────────────────────────────── */
router.delete("/account", verifyToken, async (req, res) => {
  try {
    const uid = req.user.id;

    const [{ default: Habit }, { default: Notification }] = await Promise.all([
      import("../models/Habit.js").catch(() => ({ default: null })),
      import("../models/Notification.js"),
    ]);

    await cloudinary.uploader
      .destroy(`tracklio/avatars/avatar_${uid}`)
      .catch(() => {});

    await Promise.all([
      Task.deleteMany({ userId: uid }),
      Transaction.deleteMany({ userId: uid }),
      Habit ? Habit.deleteMany({ userId: uid }) : Promise.resolve(),
      Notification.deleteMany({ user: uid }),
      User.findByIdAndDelete(uid),
    ]);

    res.json({ message: "Account permanently deleted." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* ── Multer error handler ── */
router.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError || err.message?.includes("Only")) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: err.message });
});


export default router;