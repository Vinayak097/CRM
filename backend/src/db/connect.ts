import mongoose from "mongoose";
import dotenv from "dotenv";

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/avacasa-crm";
    console.log("env file mongo url", process.env.MONGODB_URI);
    await mongoose.connect(mongoUri);
    console.log("MongoDB Connected successfully");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};
