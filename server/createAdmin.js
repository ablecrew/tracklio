import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

try {
  // Connect to Atlas
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB connected");

  // Remove old broken admin (double hashed password)
  await User.deleteOne({ email: "tracklioadmin@gmail.com" });
  console.log("🗑️ Old admin deleted");

  // pre-save hook in User.js will hash it ONCE correctly
  await User.create({
    name: "Admin",
    email: "tracklioadmin@gmail.com",
    password: "c99marasighan/X",
    role: "admin",
  });

  console.log("Hooray!! 🎉 Admin created successfully 🤠");
  process.exit(0);

} catch (err) {
  console.error("❌ Error:", err.message);
  process.exit(1);
}