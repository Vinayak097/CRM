
console.log("Seed script starting for Lagom Villas...");
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

const lagomVillasData: any = {
  "id": "786ca0a2-c226-4f0c-9bab-88511d87a100",
  "listing_id": "AVA00002",
  "title": "Lagom Villas",
  "subtitle": "Luxury Goa villas: Find your perfect 'just right' holiday home.",
  "property_type": "Holiday Home",
  "status": "Under Construction",
  "listing_type": "SALE",
  "location_id": "loc_8746",
  "location": {
    "city": "Nachinola",
    "region": "Goa",
    "state": "Goa",
    "country": "India",
    "coordinates": {
      "latitude": 15.59567685,
      "longitude": 73.85388464
    },
    "full_address": null,
    "timezone": "Asia/Kolkata",
    "zip_code": "403508"
  },
  "specificAddress": {
    "street": null,
    "area": null,
    "city": "Nachinola",
    "state": "Goa",
    "country": "India",
    "pincode": "403508"
  },
  "description_short": "Discover Lagom Villas, two luxury 3-bedroom villas in Nachinola, Goa. Embrace 'Lagom' - just the right amount of opulence and mindful living. Enjoy a private pool, garden, and 3875 sq ft of designed space.",
  "description_long": "Discover Lagom Villas, an exquisite pair of luxury 3-bedroom villas nestled in the serene village of Nachinola, Goa, where the concept of 'Lagom' – finding the perfect balance – is brought to life. These villas offer an idyllic retreat that harmoniously blends opulence with mindful living, providing an unparalleled living experience. Each villa boasts a private pool and lush garden, set within a sprawling 3875 sq ft of thoughtfully designed space, ensuring ample room for relaxation and entertainment. Residents can enjoy the tranquility of Goan life while remaining conveniently connected to essential amenities and vibrant local attractions.\n\nFamilies will appreciate the proximity to reputable educational institutions such as Don Bosco High School (20 km), Vidhya Prabhodini High School (11 km), and Anthony's High School in Mapusa (8 km), as well as the Goa College of Hospitality (25 km) for those pursuing culinary or hospitality careers. For daily needs and local produce, the famous Mapusa Friday Market (6 km) and Siolim Market (12 km) offer a colorful array of goods. Healthcare is readily accessible with North Goa District Hospital in Mapusa (7 km), Manipal Hospital in Dona Paula (26 km), and Vision Hospital (7.5 km) all within a comfortable driving distance.\n\nConnectivity is a breeze with Dabolim International Airport (43 km, approximately 70 minutes) and the new Mopa International Airport (23 km, approximately 30 minutes) providing convenient air travel options. For ground transportation, the Mapusa Bus Station is just 8 km away (15 minutes), while Thivim Railway Station (14 km, 25 minutes) and Karmali Railway Station (21 km, 45 minutes) offer rail links. Furthermore, the NH-66 (Mumbai-Goa Highway) is a mere 4 km away (10 minutes), ensuring easy access to other parts of Goa and beyond. Lagom Villas presents an exceptional opportunity to embrace a balanced lifestyle in a coveted Goan setting.",
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
    "developer_id": "77d0e90a-7d78-49be-8da7-700417c6c153"
  },
  "pricing": {
    "total_price": {
      "value": 42500000,
      "currency": "INR",
      "display_value": "₹4.25 Crores",
      "unit": null,
      "is_price_on_request": false
    },
    "price_per_sqft": {
      "value": 15631,
      "currency": "INR",
      "display_value": "₹15,631/sq ft",
      "unit": "sq ft"
    },
    "original_price": null,
    "discount_percentage": null
  },
  "specifications": {
    "bedrooms": 2,
    "bathrooms": 2,
    "half_bathrooms": null,
    "parking_spaces": 2,
    "property_age": null,
    "year_built": null,
    "floors": null
  },
  "spatialDetails": {
    "bedrooms": 2,
    "bathrooms": 2,
    "balconies": null,
    "area": {
      "carpet": 3875,
      "builtUp": null,
      "unit": "sqft"
    },
    "facing": null,
    "floorNumber": null,
    "layoutType": null,
    "viewQuality": "Good"
  },
  "area": {
    "carpet_area_sqft": 3875,
    "built_up_area_sqft": null,
    "living_area_sqft": null,
    "living_area_sqm": null,
    "balcony_area_sqft": null,
    "plot_area_sqft": null,
    "total_area_sqft": null
  },
  "amenities": {
    "indoor_amenities": [
      "Dining",
      "inside bar"
    ],
    "outdoor_amenities": [],
    "security_amenities": [],
    "parking_amenities": [],
    "other_amenities": [
      "Plantations",
      "Secured Gateway",
      "Elegant living space",
      "Landscaped Garden",
      "Nature trail",
      "Private Swimming Pool",
      "Inside bar",
      "Dining area",
      "Verandah",
      "Modern Living",
      "Open Space"
    ]
  },
  "amenities_summary": {
    "total_amenities_count": 12,
    "primary_amenities": [
      "Private Swimming Pool",
      "Yoga and Meditation Area",
      "Bonfire and Barbeque Area",
      "Private Landscaped Garden",
      "Sundeck / Terrace"
    ],
    "additional_amenities_count": 7,
    "primary_amenities_images": [
      "https://project-avacasa.s3.ap-southeast-2.amazonaws.com/amenities/private-swimming-pool.png",
      "https://project-avacasa.s3.ap-southeast-2.amazonaws.com/amenities/yoga-and-meditation-area.png",
      "https://project-avacasa.s3.ap-southeast-2.amazonaws.com/amenities/bonfire-and-barbeque-area.png",
      "https://project-avacasa.s3.ap-southeast-2.amazonaws.com/amenities/private-landscaped-garden.png",
      "https://project-avacasa.s3.ap-southeast-2.amazonaws.com/amenities/sundeck-terrace.png"
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
    "High returns from short-term holiday rentals in Goa's thriving tourism market.",
    "Personal vacation home + passive rental income when not in use.",
    "Rising demand and limited supply make this a strong asset.",
    "Strategic location away from beach crowds but close to nature offering peaceful living",
    "Limited inventory of only two exclusive villas ensuring privacy and exclusivity",
    "Fully furnished luxury villas with private pools commanding premium rental yields",
    "Growing demand for holiday homes in Goa driving capital appreciation"
  ],
  "capital_appreciation": {
    "has_high_appreciation_potential": true,
    "projected_appreciation_rate": null,
    "prospects": null
  },
  "rental_potential": {
    "has_high_rental_yield": true,
    "seasonal_demand": {
      "peak_season": null,
      "off_season": null,
      "peak_season_occupancy": null,
      "off_season_occupancy": null
    },
    "yield_percentage": null
  },
  "property_management": {},
  "badges": {
    "is_featured": true,
    "is_new_listing": true,
    "is_pre_launch": false,
    "is_premium": false,
    "is_verified": true
  },
  "property_tags": [
    "Holiday Home",
    "Under Construction",
    "RERA Approved",
    "Goa",
    "Rental Yields",
    "Peacefull Living",
    "Premium Villa"
  ],
  "visual_assets": {
    "images": [
      {
        "src": "https://avacasa-images.s3.amazonaws.com/properties/AVA00002/2026-01-10/8e8d98260a7a41248f3b441173256c04.webp",
        "title": "8e8d98260a7a41248f3b441173256c04.webp",
        "type": "image",
        "description": "",
        "alt": "Property image",
        "settings": {}
      },
      {
        "src": "https://avacasa-images.s3.amazonaws.com/properties/AVA00002/2026-01-10/f835e15b6d924e528ff703d3fa74f835.webp",
        "title": "f835e15b6d924e528ff703d3fa74f835.webp",
        "type": "image",
        "description": "",
        "alt": "Property image",
        "settings": {}
      }
    ],
    "main_image_url": "https://avacasa-images.s3.amazonaws.com/properties/AVA00002/2026-01-10/f9d9be69b99640a3bd97ca7e2a72a6d4.webp",
    "thumbnail_url": "https://avacasa-images.s3.amazonaws.com/properties/AVA00002/2026-01-10/dd7c18c0e08648c8b77b40b8aeb9223b.webp"
  },
  "created_at": "2025-12-28T18:38:16.066103Z",
  "updated_at": "2026-01-10T09:28:47.232779Z",
  "published_at": null,
  "accessibility": {},
  "age": {},
  "calculator_data": {},
  "documentation": {},
  "engagement": {
    "views_count": 2847,
    "views_this_week": 169,
    "saved_count": 0,
    "share_count": 17,
    "last_viewed_at": "2025-12-28T18:38:16.066115+00:00"
  },
  "financial_benefits": {},
  "financial_metrics": {
    "roi_percentage": 8
  },
  "furnishing": {},
  "inUnitFeatures": {},
  "legal_info": {
    "reraApproved": true,
    "reraNumber": "Not Available",
    "occupancyCertificate": false,
    "fireNOC": false,
    "permits": []
  },
  "location_details": {},
  "luxuryAmenities": {},
  "marketMetrics": {},
  "microLocationPremium": null,
  "parking": {
    "covered": true,
    "open": false,
    "visitorParking": true,
    "evCharging": true
  },
  "possession": {},
  "rental_info": {},
  "specialConsiderations": {},
  "listingDetails": {
    "listedBy": "Developer",
    "listingId": "AVA00002"
  },
  "lastPriceUpdate": null,
  "listedDate": "2025-12-28T18:38:16.066121Z"
};

async function seed() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI!);
        
        // 1. Ensure Location Exists (Nachinola, Goa)
        const locationData = {
            _id: lagomVillasData.location_id,
            name: lagomVillasData.location.city,
            slug: "nachinola", 
            description: "Nachinola is an emerging gem in North Goa, offering a perfect blend of tranquility and development.",
            coordinates: {
                lat: lagomVillasData.location.coordinates.latitude,
                lng: lagomVillasData.location.coordinates.longitude
            },
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
        
        const propertyInput: any = {
            ...lagomVillasData,
            // Explicit Mappings to match Schema Requirements
            slug: "lagom-villas-" + lagomVillasData.location_id,
            description: lagomVillasData.description_long, 
            description_full: lagomVillasData.description_long,
            price: String(lagomVillasData.pricing.total_price.value), 
            propertyType: "VILLA", 
            area: lagomVillasData.area.carpet_area_sqft || 0,
            coordinates: {
                lat: lagomVillasData.location.coordinates.latitude,
                lng: lagomVillasData.location.coordinates.longitude
            },
            status: "AVAILABLE",
            locationId: lagomVillasData.location_id,
            amenities: lagomVillasData.amenities.other_amenities,
            images: lagomVillasData.visual_assets.images.map(img => img.src),
        };

        const existingProp = await mongoose.model("Property").findOne({ listing_id: lagomVillasData.listing_id });
        if (!existingProp) {
            await mongoose.model("Property").create(propertyInput);
            console.log(`Created property: ${lagomVillasData.title}`);
        } else {
            console.log(`Property exists: ${existingProp.title}`);
            await mongoose.model("Property").updateOne({ listing_id: lagomVillasData.listing_id }, propertyInput);
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
