import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ["income", "expense"] },
  amount: Number,
  category: String,

  // ✅ Changed from String to ObjectId
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

}, { timestamps: true });

export default mongoose.model("Transaction", transactionSchema);