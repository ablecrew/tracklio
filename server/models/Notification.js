import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* ── Content ── */
    title: {
      type: String,
      required: true,
      trim: true,
    },

    /*
     * "message" — the body text shown in the Navbar panel and
     * Notifications page.  Frontend reads n.message everywhere.
     * (Your old model called this "sub" — we keep "sub" as an alias
     * alias via a virtual so existing documents aren't broken.)
     */
    message: {
      type: String,
      default: "",
      trim: true,
    },

    /*
     * "type" — controls which icon/colour the frontend uses.
     * Matches the NOTIF_META keys in Navbar.jsx & Notifications.jsx:
     *   ai | finance | task | habit | report | system
     */
    type: {
      type: String,
      enum: ["ai", "finance", "task", "habit", "report", "system"],
      default: "system",
    },

    /*
     * "read" — false = unread (shows dot + highlight).
     * Frontend checks: !n.read  →  unread
     * (Your old model called this "unread: true" — the logic was
     *  inverted.  We normalise to "read: false = unread" to match the
     *  frontend, and add an "unread" virtual for backward compat.)
     */
    read: {
      type: Boolean,
      default: false,
    },

    /* Optional deep-link — e.g. "/tasks", "/finance" */
    link: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically

    /*
     * Backward-compat virtuals so any existing code that reads
     * doc.sub or doc.unread still works without a migration.
     */
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ── Virtuals (backward compat only — do NOT store these) ── */
notificationSchema.virtual("sub").get(function () {
  return this.message;
});
notificationSchema.virtual("unread").get(function () {
  return !this.read;
});

/* ── Index: fast lookup per user, sorted newest-first ── */
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, read: 1 });

export default mongoose.model("Notification", notificationSchema);