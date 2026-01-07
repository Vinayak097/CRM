// One-time script to clean up leads with null phone numbers
import { connectDB } from "./src/db/connect.ts";
import { Lead } from "./src/models/Lead.ts";

async function cleanup() {
  try {
    await connectDB();
    console.log("Connected to database");

    // Remove leads with null or empty phone numbers
    const result = await Lead.deleteMany({
      $or: [
        { "identity.phone": null },
        { "identity.phone": "" },
        { "identity.phone": { $exists: false } }
      ]
    });

    console.log(`Removed ${result.deletedCount} leads with invalid phone numbers`);

    // Also clean up any indexes that might be causing issues
    const collection = Lead.collection;
    const indexes = await collection.indexes();

    console.log("Current indexes:", indexes);

    process.exit(0);
  } catch (error) {
    console.error("Cleanup failed:", error);
    process.exit(1);
  }
}

cleanup();
