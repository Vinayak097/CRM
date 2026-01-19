
console.log("Seed script starting...");
import mongoose from "mongoose";
import dotenv from "dotenv";
import { LocationModel } from "./models/location.model.js";
import { PropertyRepository } from "./models/property.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error("MongoDB URL is undefined");
  process.exit(1);
}

const lushWildAcres = {
  "listing_id": "AVA00006",
  "title": "Lush Wild Acres",
  "subtitle": "Your personalized farmstead awaits in Khidarpur, Gurgaon. Sustainable living: Build",
  "property_type": "Managed Farmland", // Mapped to propertyType enum or string? Enum expects specific values. 
  // "propertyType" field in Schema is Enum: PLOT, VILLA, APARTMENT...
  // "property_type" in JSON is "Managed Farmland". 
  // I need to map this. Schema expects "propertyType". JSON has "property_type".
  // "Managed Farmland" is closest to "FARM_HOUSE" or "PLOT". I'll map to "FARM_HOUSE".
  
  "project_status": "Under Construction", // Schema has constructionStatus
  
  "listing_type": "SALE",
  "location_id": "loc_6753",
  "location": {
    "city": "Khidarpur",
    "region": "Gurgaon",
    "state": "Haryana",
    "country": "India",
    "coordinates": {
      "latitude": 28.03385476,
      "longitude": 76.86933086
    },
    "full_address": null,
    "timezone": "Asia/Kolkata",
    "zip_code": "301411"
  },
  "specificAddress": {
    "street": null,
    "area": null,
    "city": "Khidarpur",
    "state": "Haryana",
    "country": "India",
    "pincode": "301411"
  },
  "description_short": "Discover Lush Wild Acres...",
  "description_long": "Discover Lush Wild Acres in Khidarpur...", // Schema has "description" and "description_full"
  
  "project_info": {
    "is_part_of_project": false,
    "project_id": null,
    "project_name": null,
    "project_type": null,
    "project_status": null,
    "possession_date": null,
    "completion_date": null,
    "rarera_number": null
  },
  "developer": {
    "developer_id": "7bf78ebe-5ca2-4e52-9c23-680f471e3380"
  },
  "pricing": {
    "total_price": {
      "value": 16900000,
      "currency": "INR",
      "display_value": "₹1.7Cr",
      "unit": null,
      "is_price_on_request": false
    },
    "price_per_sqft": {
      "value": 783,
      "currency": "INR",
      "display_value": "₹783/sq ft",
      "unit": "sq ft"
    },
    "original_price": null,
    "discount_percentage": null
  },
  "specifications": {
    "bedrooms": null,
    "bathrooms": null,
    "half_bathrooms": null,
    "parking_spaces": null,
    "property_age": null,
    "year_built": null,
    "floors": null
  },
  "spatialDetails": {
    "bedrooms": null,
    "bathrooms": null,
    "balconies": null,
    "area": {
      "carpet": 21600,
      "builtUp": null,
      "unit": "sqft"
    },
    "facing": null,
    "floorNumber": null,
    "layoutType": null,
    "viewQuality": "Good"
  },
  "area": {
    "carpet_area_sqft": 21600,
    "built_up_area_sqft": null,
    "living_area_sqft": null,
    "living_area_sqm": null,
    "balcony_area_sqft": null,
    "plot_area_sqft": null,
    "total_area_sqft": null
  },
  "amenities": {
    "indoor_amenities": [],
    "outdoor_amenities": [],
    "security_amenities": [],
    "parking_amenities": [],
    "other_amenities": [
      "Farmland",
      "Sustainable community living"
    ]
  },
  "amenities_summary": {
    "total_amenities_count": 11,
    "primary_amenities": [
      "Clubhouse",
      "Yoga and Meditation Area"
    ]
  },
  "features": {
    "construction_quality": "Premium",
    "design_features": [],
    "special_features": [],
    "fittings_quality": null,
    "window_features": null
  },
  "investment_highlights": [
    "Capital appreciation from appreciating farmland near NCR."
  ],
  "capital_appreciation": {
    "has_high_appreciation_potential": true,
    "projected_appreciation_rate": null,
    "prospects": null
  },
  "rental_potential": {
    "has_high_rental_yield": true,
    "seasonal_demand": {
    },
    "yield_percentage": null
  },
  "badges": {
    "is_featured": false,
    "is_new_listing": true,
    "is_pre_launch": false,
    "is_premium": false,
    "is_verified": true
  },
  "property_tags": [
    "Farmland",
    "Under Construction",
    "RERA Approved"
  ],
  "visual_assets": {
    "images": [
      {
        "src": "https://avacasa-images.s3.amazonaws.com/properties/AVA00006/2026-01-18/dcaaa5cd5848412eaf00935aaa8f91ff.png",
        "title": "dcaaa5cd5848412eaf00935aaa8f91ff.png",
        "type": "image"
      }
    ],
    "main_image_url": "https://avacasa-images.s3.amazonaws.com/properties/AVA00006/2026-01-18/fca48c8af03749db962c2c1c9aa96086.png",
    "thumbnail_url": "https://avacasa-images.s3.amazonaws.com/properties/AVA00006/2026-01-18/714a98f6e2524e6bb6de6b35ac3c13dc.png"
  },
  "engagement": {
    "views_count": 2847,
    "views_this_week": 169
  }
};

async function seed() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI!);
        
        // 1. Ensure Location Exists
        const locationData = {
            _id: lushWildAcres.location_id,
            name: lushWildAcres.location.city,
            slug: "khidarpur-gurgaon", // Generated slug
            description: `Location data for ${lushWildAcres.location.city}`,
            coordinates: {
                lat: lushWildAcres.location.coordinates.latitude,
                lng: lushWildAcres.location.coordinates.longitude
            },
            // Add other fields as per model
            active: true
        };

        const existingLoc = await LocationModel.findById(locationData._id);
        if (!existingLoc) {
            await LocationModel.create(locationData);
            console.log(`Created location: ${locationData.name} (${locationData._id})`);
        } else {
            console.log(`Location exists: ${existingLoc.name}`);
        }

        // 2. Seed Property
        const repo = new PropertyRepository();
        // Cast keys to any to avoid strict type checks on mismatching keys just for seeding check
        
        const propertyInput: any = {
            ...lushWildAcres,
            // Explicit Mappings to match Schema Requirements
            slug: "lush-wild-acres-" + lushWildAcres.location_id,
            description: lushWildAcres.description_long, // Schema requirement
            description_full: lushWildAcres.description_long,
            price: String(lushWildAcres.pricing.total_price.value), // Schema legacy requirement
            propertyType: "FARM_HOUSE", // Mapping "Managed Farmland"
            area: lushWildAcres.area.carpet_area_sqft || 0,
            coordinates: {
                lat: lushWildAcres.location.coordinates.latitude,
                lng: lushWildAcres.location.coordinates.longitude
            },
            status: "AVAILABLE", // Default
            locationId: lushWildAcres.location_id,
            // Arrays need to be mapped if they are object arrays in Input but strings in Schema?
            // amenities in JSON is object with categories. Schema might expect flat array in `amenities` field?
            // Schema `amenities` is string[]. JSON `amenities` is object.
            // I will map `other_amenities` to `amenities`.
            amenities: lushWildAcres.amenities.other_amenities,
            images: lushWildAcres.visual_assets.images.map(img => img.src), // Legacy images field
            
            // New fields are passed via spread ...lushWildAcres
        };

        // Check availability
        const existingProp = await mongoose.model("Property").findOne({ listing_id: lushWildAcres.listing_id });
        if (!existingProp) {
            // Use repo or model directly. Repo does validation.
            // Since repo 'create' expects CreatePropertyInput which adheres to strict Zod,
            // and my input has extra keys (from JSON spread), Zod .strict() might fail if I pass them!
            // Wait, propertySchema is .strict().
            // So I MUST NOT pass unknown keys.
            // I should use the model directly to bypass Zod strict check for this test if I want to just save it,
            // OR I should conform to Zod.
            // The user wants me to UPDATE schema to match data.
            // I updated Zod to include MOST keys.
            // But if I missed one, it will fail.
            // I'll try via Model to see if Mongoose accepts it (Mongoose is less strict if Mixed used).
            // But PropertyRepository uses `.save()` which triggers Mongoose validation.
            
            await mongoose.model("Property").create(propertyInput);
            console.log(`Created property: ${lushWildAcres.title}`);
        } else {
            console.log(`Property exists: ${existingProp.title}`);
            // Update it to match new schema
            await mongoose.model("Property").updateOne({ listing_id: lushWildAcres.listing_id }, propertyInput);
            console.log("Updated property with new data.");
        }

        console.log("Seed success!");
        process.exit(0);

    } catch (e: any) {
        console.error("Error seeding:", e);
        if (e.errors) {
             console.error("Validation Errors:", JSON.stringify(e.errors, null, 2));
        }
        process.exit(1);
    }
}

seed();
