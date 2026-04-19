import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: String,
  status: { type: String, default: "pending" },
  priority: { type: String, default: "medium" },

  // ✅ Changed from String to ObjectId
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

}, { timestamps: true });

export default mongoose.model("Task", taskSchema);