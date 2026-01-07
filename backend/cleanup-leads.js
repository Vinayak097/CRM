// Cleanup script to remove leads with null/empty phone numbers
import { connectDB } from "./src/db/connect.ts";
import { Lead } from "./src/models/Lead.ts";

async function cleanup() {
  try {
    console.log("🔄 Connecting to database...");
    await connectDB();
    console.log("✅ Connected successfully");

    console.log("🧹 Removing leads with null/empty phone numbers...");
    const result = await Lead.deleteMany({
      $or: [
        { "identity.phone": null },
        { "identity.phone": "" },
        { "identity.phone": { $exists: false } }
      ]
    });

    console.log(`✅ Removed ${result.deletedCount} leads with invalid phone numbers`);

    // Also check for any other potential duplicates
    const totalLeads = await Lead.countDocuments();
    console.log(`📊 Total leads remaining: ${totalLeads}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
    process.exit(1);
  }
}

cleanup();
