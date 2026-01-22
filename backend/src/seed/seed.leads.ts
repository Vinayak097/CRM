import mongoose from "mongoose";

import { LeadStatus } from "../types/lead.types.js";
import Lead from "@/models/Lead.js";
import { connectDB } from "@/db/connect.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function seedLeads() {
  try {
    await connectDB();
    await Lead.deleteMany({});
    console.log("✅ MongoDB connected");

    const sampleLead = {
      identity: {
        fullName: "Rahul Mehta",
        email: "rahul.mehta@gmail.com",
        phone: "+919876543210",
        residencyStatus: "NRI",
        residencyDetails: "Based in Dubai for 8 years",
        discoverySource: "Instagram",
        discoveryDetails: "Saw Bali villa investment reel",
      },

      demographics: {
        ageGroup: "35-44",
        professions: ["Entrepreneur", "Investor"],
        householdSize: "3",
        annualIncomeRange: "2Cr+",
        notes: "Looking for long-term appreciation and lifestyle value",
      },

      propertyVision: {
        propertiesPurchasedBefore: 2,
        propertyPurpose: ["Investment", "Holiday Home"],
        propertyPurposeDetails: "Personal use + rental income",
        buyingMotivation: ["Capital Appreciation", "Rental Yield"],
        buyingMotivationDetails: "Prefers stable rental with upside",
        shortTermRentalPreference: "Yes",
        assetTypes: ["Villa", "Managed Resort Villa"],
        assetTypesDetails: "Open to branded villa projects",
        waterSourcePreference: "Ocean view preferred",
        unitConfigurations: ["3 BHK", "4 BHK"],
        unitConfigurationsDetails: "Ensuite bathrooms mandatory",
        journeyStage: "Evaluating options",
        explorationDuration: "3-6 months",
        purchaseTimeline: "6-9 months",
        budgetRange: "5Cr - 8Cr",
        budgetRangeDetails: "Flexible for right opportunity",
        notes: "Prefers limited inventory projects",
      },

      investmentPreferences: {
        ownershipStructure: "Individual",
        possessionTimeline: "Under construction",
        managementModel: "Developer-managed",
        fundingType: "Self-funded",
        notes: "Open to partial bank funding if ROI improves",
      },

      locationPreferences: {
        currentLocation: {
          city: "Dubai",
          state: "Dubai",
          country: "UAE",
        },
        buyingRegions: ["Bali", "Goa"],
        preferredCountries: ["Indonesia", "India"],
        preferredStates: ["Bali", "Goa"],
        preferredCities: ["Ubud", "Canggu", "Assagao"],
        climateRisksToAvoid: ["Flood-prone"],
        climatePreference: ["Tropical"],
        locationPriorities: ["Tourism demand", "Airport proximity"],
        expansionRadiusKm: "20",
        notes: "Avoid over-commercialized areas",
      },

      lifestylePreferences: {
        areaType: ["Low-density", "Nature-centric"],
        energyPreference: ["Solar"],
        natureFeature: ["Beach", "Greenery"],
        terrainPreference: ["Flat land"],
        viewPreferences: ["Ocean", "Sunset"],
        communityFormat: "Boutique gated",
        gatedPreference: "Yes",
        communityFriendlyFor: ["Families", "Remote workers"],
        outdoorAmenities: ["Private pool", "Garden", "Yoga deck"],
        notes: "Quiet, premium neighborhood preferred",
      },

      unitPreferences: {
        vastuDirections: ["East-facing"],
        furnishingLevel: "Fully furnished",
        interiorStyle: "Modern tropical",
        smartHomeFeatures: ["Smart lighting", "Remote AC"],
        mustHaveFeatures: ["Private pool", "Ensuite bedrooms"],
        notes: "High ceiling and natural light are important",
      },

      dreamHomeNotes:
        "A serene villa with strong rental demand and future resale value.",

      system: {
        leadStatus: LeadStatus.New,
        priorityScore: 8,
        investmentScore: 9,
        isConverted_to_Customer: false,
      },
    };

    // 🔒 Prevent duplicate seed
    const existingLead = await Lead.findOne({
      "identity.phone": sampleLead.identity.phone,
    });

    if (existingLead) {
      console.log("⚠️ Lead already exists, skipping seed");
      return;
    }

    await Lead.create(sampleLead);
    console.log("✅ Lead seeded successfully");
  } catch (error) {
    console.error("❌ Seeding error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");
  }
}

seedLeads();
