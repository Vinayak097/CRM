import Lead from "./models/Lead.js";
import User, { Role } from "@/models/User.js";
import { LeadStatus } from "@/types/lead.types.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const MONGO_URI = process.env.MONGODB_URI;
if (MONGO_URI == undefined) {
  console.log("MongoDB URL is undefined");
  process.exit(1);
}

async function seed() {
  try {
    console.log("🌱 Connecting to database...");
    await mongoose.connect(MONGO_URI!);

    console.log("🧹 Clearing old data...");
    await User.deleteMany({});
    await Lead.deleteMany({});

    console.log("👤 Creating users...");
    const users = await User.create([
      {
        name: "Admin User",
        email: "admin@avacasa.com",
        password: "Admin@123",
        role: Role.Admin,
      },
      {
        name: "Rohit Sharma",
        email: "rohit@avacasa.com",
        password: "Agent@123",
        phone: "9876543210",
        role: Role.salesAgent,
      },
      {
        name: "Anjali Mehta",
        email: "anjali@avacasa.com",
        password: "Agent@123",
        phone: "9876543211",
        role: Role.salesAgent,
      },
    ]);

    const agent1 = users[1]!._id;
    const agent2 = users[2]!._id;

    console.log("📋 Creating leads...");
    await Lead.create([
      {
        identity: {
          firstName: "Amit",
          lastName: "Verma",
          email: "amit.verma@gmail.com",
          phone: "+919000000001",
          homeCountry: "UAE",
          taxResidencyCountry: "UAE",
          visaResidencyStatus: "Work Visa",
          leadSource: "Google Search",
          ageYears: 38,
          profession: "Salaried - Private Sector",
          householdSize: "4",
          householdIncomeBandInr: "₹1-1.5 Crores",
          priorPropertiesPurchased: "2",
          propertyRolePrimary: ["Investment property", "Retirement home"],
          searchTrigger: ["Investment / Wealth building", "Retirement planning"],
          buyingJourneyStage: "Actively searching",
          explorationDuration: "3-6 months",
          purchaseTimeline: "Within 6 months",
          aboutYouNotes: "Villa with garden and peaceful surroundings near Bangalore",
        },
        location: {
          buyingCountryFocus: "India",
          targetStatesRegions: ["Karnataka", "Tamil Nadu"],
          targetLocations: ["Bangalore", "Mysore", "Coorg"],
          preferredClimate: ["Cool / Pleasant year-round"],
          locationPriorities: ["Easy flight access", "Good road connectivity"],
          areaTypePreference: ["Suburban", "Semi-rural / Countryside"],
        },
        property: {
          assetTypeInterest: ["Villa / Independent house", "Farmhouse"],
          unitConfiguration: ["3 BHK", "4 BHK"],
          ownershipStructurePreference: "Full ownership (Freehold)",
          possessionStagePreference: "Ready to move",
          fundingPreference: "Self-funded",
          communityFormatPreference: "Gated community",
          furnishingLevelPreference: "Semi-furnished",
          vastuPreferredDirections: ["East", "North"],
          homeMustHaveFeatures: ["Modular kitchen", "Covered parking", "Balcony / Terrace"],
          smartHomeSecurityFeatures: ["Smart locks", "CCTV cameras"],
        },
        system: {
          leadStatus: LeadStatus.Qualified,
          assignedAgent: agent1,
          priorityScore: 85,
          investmentScore: 90,
        },
      },
      {
        identity: {
          firstName: "Priya",
          lastName: "Singh",
          email: "priya.singh@outlook.com",
          phone: "+919000000002",
          homeCountry: "India",
          taxResidencyCountry: "India",
          visaResidencyStatus: "Citizen (no visa required)",
          leadSource: "Friend / Family referral",
          ageYears: 32,
          profession: "Medical Professional",
          householdSize: "2",
          householdIncomeBandInr: "₹25-50 Lakhs",
          priorPropertiesPurchased: "0 (this is my first)",
          propertyRolePrimary: ["Primary residence"],
          searchTrigger: ["Peace & relaxation", "Nature / Clean air"],
          buyingJourneyStage: "Just exploring / Early research",
          explorationDuration: "Less than 1 month",
          purchaseTimeline: "6-12 months",
          aboutYouNotes: "First-time buyer, needs guidance on home loan process",
        },
        location: {
          buyingCountryFocus: "India",
          targetStatesRegions: ["Karnataka"],
          targetLocations: ["Bangalore"],
          areaTypePreference: ["Urban city center", "Suburban"],
        },
        property: {
          assetTypeInterest: ["Apartment / Flat"],
          unitConfiguration: ["2 BHK", "3 BHK"],
          fundingPreference: "Loan / Mortgage",
          communityFormatPreference: "Apartment complex",
          furnishingLevelPreference: "Unfurnished",
        },
        system: {
          leadStatus: LeadStatus.New,
          assignedAgent: agent2,
          priorityScore: 70,
          investmentScore: 65,
        },
      },
      {
        identity: {
          firstName: "Rajesh",
          lastName: "Kumar",
          email: "rajesh.kumar@yahoo.com",
          phone: "+919000000003",
          homeCountry: "India",
          taxResidencyCountry: "India",
          visaResidencyStatus: "Citizen (no visa required)",
          leadSource: "Instagram",
          ageYears: 52,
          profession: "Business Owner / Entrepreneur",
          householdSize: "5",
          householdIncomeBandInr: "Above ₹5 Crores",
          priorPropertiesPurchased: "More than 10",
          propertyRolePrimary: ["Vacation home", "Investment property", "Short-term rental (Airbnb)"],
          searchTrigger: ["Investment / Wealth building", "Rental income", "Nature / Clean air"],
          buyingJourneyStage: "Ready to buy soon",
          explorationDuration: "More than 2 years",
          purchaseTimeline: "Within 3 months",
        },
        location: {
          buyingCountryFocus: "India",
          targetStatesRegions: ["Karnataka", "Goa", "Kerala"],
          targetLocations: ["Coorg", "Goa", "Wayanad"],
          climateRiskAvoidance: ["Flooding / Waterlogging", "Extreme heat"],
          preferredClimate: ["Cool / Pleasant year-round", "Coastal / Humid"],
          locationPriorities: ["Scenic Beauty", "Privacy"],
          areaTypePreference: ["Semi-rural / Countryside", "Hill station / Mountains"],
          naturalFeatureClosest: ["Mountain view", "Forest / Jungle", "Lake view / Lakefront"],
        },
        property: {
          strPermissionImportance: "Must-have (deal breaker)",
          assetTypeInterest: ["Farmhouse", "Villa / Independent house"],
          unitConfiguration: ["4 BHK", "5 BHK"],
          farmlandLandSizeBucket: ["5-10 acres"],
          ownershipStructurePreference: "Company ownership",
          possessionStagePreference: "Any",
          managementModelPreference: "Professional property management",
          fundingPreference: "Self-funded",
          communityFormatPreference: "Standalone property",
          communityFriendlyFor: ["Pet-friendly", "Family-oriented"],
          vastuPreferredDirections: ["East", "North-East"],
          furnishingLevelPreference: "Fully furnished",
          homeMustHaveFeatures: ["Open-plan living", "Modular kitchen", "Home office / Study", "Covered parking"],
          homeNiceToHaveFeatures: ["Private gym / Workout room", "Home theater", "Wine cellar"],
          smartHomeSecurityFeatures: ["Smart locks", "Video doorbell", "CCTV cameras", "Smart lighting"],
          privateOutdoorFeatures: ["Private swimming pool", "Private garden", "Outdoor kitchen / BBQ"],
        },
        system: {
          leadStatus: LeadStatus.Negotiation,
          assignedAgent: agent1,
          priorityScore: 95,
          investmentScore: 98,
        },
      },
    ]);

    console.log("✅ Seeding completed successfully!");
    console.log("   Created 3 users and 3 leads");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seed();
