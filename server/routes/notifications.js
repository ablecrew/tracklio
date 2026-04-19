import express from "express";
import Notification from "../models/Notification.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* ─────────────────────────────────────────────
   Helper: auto-create system notifications
   from real user data (tasks + transactions).
   Called when GET /notifications finds 0 docs
   so a new user always sees something useful.
───────────────────────────────────────────── */
async function seedNotificationsIfEmpty(userId) {
  const count = await Notification.countDocuments({ user: userId });
  if (count > 0) return;

  const seeds = [
    {
      user: userId,
      title: "Welcome to Tracklio!",
      message: "Your AI-powered life OS is ready. Start by adding tasks.",
      type: "system",
      read: false,
      link: "/dashboard",
    },
    {
      user: userId,
      title: "AI Analysis Ready",
      message: "Add tasks and transactions to unlock personalised AI insights.",
      type: "ai",
      read: false,
      link: "/dashboard",
    },
  ];

  await Notification.insertMany(seeds);
}


/* ─────────────────────────────────────────────
   GET /notifications/unread/count
   Returns the count badge for the Navbar bell.
───────────────────────────────────────────── */
router.get("/unread/count", verifyToken, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user.id,
      read: false,           // frontend uses "read", not "unread"
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* ─────────────────────────────────────────────
   GET /notifications
   Returns all notifications for the logged-in
   user, newest first.  Seeds welcome messages
   on first login.
───────────────────────────────────────────── */
router.get("/", verifyToken, async (req, res) => {
  try {
    const { limit = 50, unreadOnly } = req.query;

    await seedNotificationsIfEmpty(req.user.id);

    const query = { user: req.user.id };
    if (unreadOnly === "true") query.read = false;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* ─────────────────────────────────────────────
   POST /notifications
   Creates a notification for the logged-in user.
   Body: { title, message, type, link? }
───────────────────────────────────────────── */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, message, type, link } = req.body;

    if (!title) {
      return res.status(400).json({ error: "title is required" });
    }

    const notif = await Notification.create({
      user:    req.user.id,
      title,
      message: message || "",
      type:    type    || "system",
      link:    link    || "",
      read:    false,
    });

    res.status(201).json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* ─────────────────────────────────────────────
   PUT /notifications/:id/read
   Marks a single notification as read.
   Frontend uses PUT (not PATCH).
───────────────────────────────────────────── */
router.put("/:id/read", verifyToken, async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true },
      { new: true }
    );

    if (!notif) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* ─────────────────────────────────────────────
   PUT /notifications/read-all
   Marks ALL unread notifications as read.
   Frontend calls: API.put("/notifications/read-all")
   ⚠ Must be declared BEFORE /:id routes or
     Express will treat "read-all" as an :id.
───────────────────────────────────────────── */
router.put("/read-all", verifyToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { read: true }
    );
    res.json({ message: "All marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* ─────────────────────────────────────────────
   DELETE /notifications/all
   Clears all notifications for the user.
   Frontend calls: API.delete("/notifications/all")
   ⚠ Must be declared BEFORE /:id.
───────────────────────────────────────────── */
router.delete("/all", verifyToken, async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user.id });
    res.json({ message: "All notifications cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* ─────────────────────────────────────────────
   DELETE /notifications/:id
   Deletes a single notification (ownership-checked).
───────────────────────────────────────────── */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const notif = await Notification.findOneAndDelete({
      _id:  req.params.id,
      user: req.user.id,
    });

    if (!notif) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;