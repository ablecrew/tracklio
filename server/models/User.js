import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    /* ── Core auth fields ── */
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // never returned in queries by default
    },

    /* ── Profile ── */
    avatarUrl: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
      trim: true,
    },

    location: {
      type: String,
      default: "",
      trim: true,
    },

    website: {
      type: String,
      default: "",
      trim: true,
    },

    /* ── Plan & role ── */
    plan: {
      type: String,
      enum: ["free", "pro"],
      default: "free",
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    status: {
      type: String,
      enum: ["active", "suspended", "inactive"],
      default: "active",
    },

    /* ── Per-user settings (persisted) ── */
    settings: {
      aiInsights:         { type: Boolean, default: true  },
      budgetWarnings:     { type: Boolean, default: true  },
      weeklyReport:       { type: Boolean, default: false },
      darkMode:           { type: Boolean, default: true  },
      compactView:        { type: Boolean, default: false },
      animations:         { type: Boolean, default: true  },
      taskReminders:      { type: Boolean, default: true  },
      habitReminders:     { type: Boolean, default: true  },
      financeAlerts:      { type: Boolean, default: true  },
      emailNotifications: { type: Boolean, default: true  },
      pushNotifications:  { type: Boolean, default: false },
      shareAnalytics:     { type: Boolean, default: false },
      currency:           { type: String,  default: "KES" },
      language:           { type: String,  default: "en"  },
      dataRetention:      { type: String,  default: "1year" },
    },

    /* ── Metadata ── */
    lastLoginAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

/* ── Hash password before saving ── */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  if (!this.password) return;

  this.password = await bcrypt.hash(this.password, 12);
});

/* ── Instance method: compare passwords ── */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/* ── Instance method: return safe public object ── */
userSchema.methods.toPublic = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

/* ── Indexes ── */
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ plan: 1 });

export default mongoose.model("User", userSchema);