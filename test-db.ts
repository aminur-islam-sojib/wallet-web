import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

async function test() {
  try {
    console.log("URI:", process.env.MONGODB_URI);
    console.log("Attempting connection...");
    await mongoose.connect(process.env.MONGODB_URI!, {
      serverSelectionTimeoutMS: 5000, // 👈 fail after 5 seconds
      connectTimeoutMS: 5000,
    });
    console.log("✅ Connected successfully!");
    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Connection failed:", err);
  }
}

test();