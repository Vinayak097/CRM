
console.log("Script starting...");
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

const rawLocations = [
  {
      "_id": "loc_1903",
      "slug": "athimugam",
      "CORE LOCATION ENTITY": {
        "name": "Athimugam",
        "subtitle": "Emerging Industrial & Residential Hub, Tamil Nadu",
        "country": "India",
        "region": "Tamil Nadu",
        "coordinates": {
          "latitude": 12.7529318,
          "longitude": 77.9740832
        },
        "timezone": "Asia/Kolkata",
        "currency": "INR",
        "currency_symbol": "₹",
        "status": "active"
      },
      "LOCATION METRICS": {
        "description": "Athimugam is a rapidly emerging locality in the Krishnagiri district of Tamil Nadu...",
         "highlights": [
          "Benefit from spillover industrial and residential demand from Hosur.",
          "Lower entry cost compared to nearby metropolitan areas.",
          "Strong potential for land value appreciation."
        ],
         "score": "72"
      }
  }
];

const rawProperties = [
 {
  "_id": "3d9c8543-3e50-4570-a577-9b089103cdf1",
  "name": "1-Bedroom Loft Villa at Nunggalan Clifftop",
  "subtitle": "Exclusive Clifftop Loft Villas in Uluwatu, Bali",
  "project_type": "Holiday Home",
  "project_status": "Under Construction",
  "description_short": "An exclusive clifftop sanctuary featuring two 1-bedroom loft villas...",
  "description_full": "Discover an exclusive clifftop sanctuary moments from Nunggalan Beach...",
  "location_id": "loc_1903", // Temporarily link to Athimugam as valid ID, or we need to seed Bali location.
  "project_pricing": {
    "min_price": {
      "value": 12865000,
      "currency": "INR",
      "display_value": "₹1.3Cr"
    },
    "average_price": 12865000,
    "price_trend": "Premium villas in the Uluwatu-Nunggalan area..."
  },
  "project_features": {
    "construction_quality": "Premium",
    "unique_selling_points": [
      "Unobstructed panoramic ocean and clifftop views..."
    ]
  },
  "location_context": {
      "location_description": "Perched on the majestic cliffs of Uluwatu..."
  }
 }
];

async function seed() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI!);
        
        console.log("Seeding Locations...");
        for (const locData of rawLocations) {
             try {
                const exist = await LocationModel.findById(locData._id);
                if (!exist) {
                     const location = new LocationModel({
                         _id: locData._id,
                         name: locData["CORE LOCATION ENTITY"].name,
                         description: locData["LOCATION METRICS"].description,
                         coordinates: {
                             lat: locData["CORE LOCATION ENTITY"].coordinates.latitude,
                             lng: locData["CORE LOCATION ENTITY"].coordinates.longitude
                         },
                         highlights: locData["LOCATION METRICS"].highlights || [],
                         active: true
                     });
                     await location.save();
                     console.log(`Created location: ${locData["CORE LOCATION ENTITY"].name}`);
                } else {
                     console.log(`Location ${locData["CORE LOCATION ENTITY"].name} exists`);
                }
             } catch (err: any) {
                 console.error(`Error creating location ${locData.slug}:`, err.message);
                 if(err.errors) console.error(JSON.stringify(err.errors, null, 2));
             }
        }

        console.log("Seeding Properties...");
        const propRepo = new PropertyRepository();
        // Use Type assertion to bypass strict checks for this seed script
        const repo: any = propRepo;
        
        for (const propData of rawProperties) {
             try {
                const slug = propData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const exist = await repo.findBySlug(slug);
                
                if (!exist) {
                     await repo.create({
                         title: propData.name,
                         slug: slug,
                         description: propData.description_full || propData.description_short,
                         price: String(propData.project_pricing?.average_price || 0),
                         locationId: "loc_1903", 
                         propertyType: "VILLA",
                         area: 1200, 
                         coordinates: { lat: 12.7529318, lng: 77.9740832 }, 
                         
                         subtitle: propData.subtitle,
                         description_short: propData.description_short,
                         description_full: propData.description_full,
                         project_pricing: propData.project_pricing,
                         project_features: propData.project_features,
                         location_context: propData.location_context,
                         active: true
                     });
                     console.log(`Created property: ${propData.name}`);
                } else {
                     console.log(`Property ${propData.name} exists`);
                }
             } catch (err: any) {
                 console.error(`Error creating property ${propData.name}:`, err.message);
                 // If it is a Zod error it might be buried
                 if (err.errors) console.error(JSON.stringify(err.errors, null, 2));
                 console.error(err);
             }
        }
        
        console.log("Seeding Done!");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
seed();
