import mongoose from "mongoose";

const habitSchema = new mongoose.Schema(
  {
    // ✅ Add userId
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: { type: String, required: true },

    history: [
      {
        date: { type: String, required: true },
        completed: { type: Boolean, default: false },
      },
    ],

    streak: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Habit", habitSchema);