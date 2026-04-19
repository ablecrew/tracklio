import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import bcrypt from "bcryptjs";

dotenv.config();

try {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB connected");
  console.log("📍 Database:", mongoose.connection.name);

  // Find admin user
  const user = await User.findOne({ 
    email: "tracklioadmin@gmail.com" 
  }).select("+password");

  if (!user) {
    console.log("❌ User NOT FOUND in database");
    console.log("💡 createAdmin.js did not save to this database");
    process.exit(1);
  }

  console.log("✅ User found:");
  console.log("   Name:     ", user.name);
  console.log("   Email:    ", user.email);
  console.log("   Role:     ", user.role);
  console.log("   Password: ", user.password); // shows hashed password
  console.log("   Hash starts with $2b$12$:", user.password?.startsWith("$2b$12$"));

  // Test password comparison
  const testPassword = "c99marasighan/X";
  const isMatch = await bcrypt.compare(testPassword, user.password);
  
  console.log("\n🔐 Password Test:");
  console.log("   Testing:  ", testPassword);
  console.log("   Match:    ", isMatch ? "✅ YES" : "❌ NO");

  if (!isMatch) {
    console.log("\n💡 Possible reasons:");
    console.log("   1. Password was double hashed");
    console.log("   2. Wrong password stored");
    console.log("   3. createAdmin.js ran against local DB not Atlas");
  }

  process.exit(0);

} catch (err) {
  console.error("❌ Error:", err.message);
  process.exit(1);
}