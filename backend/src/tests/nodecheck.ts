import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "@/db/connect.js";
import User from "@/models/User.js";

async function check() {
  try {
    await connectDB();
    
    const db = mongoose.connection.db;
    if (!db) {
        console.error("Not connected to database");
        return;
    }

    console.log("Current Database Name:", db.databaseName);
    
    const collections = await db.listCollections().toArray();
    console.log("Collections in this DB:", collections.map(c => c.name));

    const userCount = await User.countDocuments();
    console.log("Total users in 'users' collection:", userCount);

    const user = await User.findOne({ email: "admin@avacasa.life" });
    console.log("Searching for 'admin@avacasa.life'...");
    console.log("Result :", user);

    if (!user) {
        const anyUser = await User.findOne();
        if (anyUser) {
            console.log("Found a different user instead:", anyUser.email);
        } else {
            console.log("The 'users' collection is completely empty.");
        }
    }

  } catch (error) {
    console.error("Error during check:", error);
  } finally {
    await mongoose.connection.close();
  }
}

check();