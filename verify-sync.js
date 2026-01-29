import { PropertyService } from "./backend/src/services/property.service.js";
import { connectDB } from "./backend/src/db/connect.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "backend", ".env") });

async function verifySync() {
    await connectDB(process.env.MONGODB_URI!);

    const propertyService = new PropertyService();

    const testData = {
        "id": "c901111d-a324-4e5e-8313-c257a0180917", // Production UUID
        "listing_id": "VERIFY_" + Date.now(),
        "title": "Amodaa Verification",
        "subtitle": "Testing 100% Fidelity",
        "property_type": "Managed Farmland",
        "status": "Under Construction",
        "listing_type": "SALE",
        "location_id": "loc_verify",
        "location": {
            "city": "Madikeri",
            "coordinates": { "latitude": 12.3, "longitude": 75.7 }
        },
        "visual_assets": {
            "images": [
                {
                    "src": "https://example.com/img.png",
                    "title": "Amodaa Property View",
                    "slug": "amodaa-property-view",
                    "type": "image",
                    "alt": "Amodaa property image",
                    "description": null,
                    "settings": {}
                }
            ]
        }
    };

    console.log("Creating property...");
    const created = await propertyService.createProperty(testData as any);

    // Fetch raw document from MongoDB to check internal fields
    const rawDoc = await mongoose.connection.db.collection("properties").findOne({ listing_id: testData.listing_id });

    console.log("Raw Document from DB:");
    console.log(JSON.stringify(rawDoc, null, 2));

    const errors = [];

    if (rawDoc?._id instanceof mongoose.Types.ObjectId === false) errors.push("Missing or invalid _id");
    if (rawDoc?.id !== testData.id) errors.push("Root level 'id' missing or incorrect");
    if (!rawDoc?.created_at) errors.push("Missing 'created_at'");
    if (!rawDoc?.updated_at) errors.push("Missing 'updated_at'");
    if (rawDoc?.createdAt) errors.push("Should NOT have 'createdAt'");
    if (rawDoc?.updatedAt) errors.push("Should NOT have 'updatedAt'");
    if ("__v" in rawDoc!) errors.push("Should NOT have '__v'");

    // Check required root objects
    const requiredObjects = [
        "accessibility", "age", "calculator_data", "documentation",
        "financial_benefits", "furnishing", "inUnitFeatures",
        "property_management", "specialConsiderations"
    ];

    for (const objKey of requiredObjects) {
        if (!rawDoc || typeof rawDoc[objKey] !== "object") {
            errors.push(`Missing root object: ${objKey}`);
        }
    }

    if (errors.length === 0) {
        console.log("\n✅ SUCCESS: 100% SCHEMA FIDELITY MATCHED!");
    } else {
        console.log("\n❌ FAILURES FOUND:");
        errors.forEach(e => console.log(` - ${e}`));
    }

    await mongoose.disconnect();
}

verifySync().catch(console.error);
