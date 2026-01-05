import Lead from "@/models/Lead.js";
import User, { Role } from "@/models/User.js";
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
          fullName: "Amit Verma",
          email: "amit.verma@gmail.com",
          phone: "9000000001",
          whatsappPreferred: true,
        },
        profile: {
          residencyStatus: "NRI",
          residencyNotes: "Based in Dubai for 5 years",
          discoverySource: "Website",
          discoveryNotes: "Found us through Google search",
        },
        demographics: {
          ageGroup: "35-44",
          professions: ["IT Professional", "Investor"],
          householdSize: "4",
          annualIncomeRange: "50L-1Cr",
          notes: "Looking for investment property",
        },
        buyerProfile: {
          propertiesPurchasedBefore: "2",
          propertyPurpose: ["Investment", "Retirement Home"],
          buyingMotivation: ["Passive Income", "Asset Appreciation"],
          shortTermRentalPreference: "Yes",
        },
        assetPreferences: {
          assetTypes: ["Villa", "Farmland"],
          unitConfigurations: ["3BHK", "4BHK"],
          farmlandSizePreference: "1-2 acres",
          waterSourcePreference: "Borewell",
        },
        purchaseReadiness: {
          journeyStage: "Shortlisting",
          explorationDuration: "3-6 months",
          purchaseTimeline: "Within 6 months",
          budgetRange: "1Cr-2Cr",
          fundingType: "Self-funded",
        },
        ownershipPreferences: {
          ownershipStructure: "Individual",
          possessionTimeline: "Ready to move",
          managementModel: "Self-managed",
        },
        locationProfile: {
          currentLocation: {
            city: "Dubai",
            state: "Dubai",
            country: "UAE",
          },
          buyingRegions: ["South India"],
          preferredStates: ["Karnataka", "Tamil Nadu"],
          preferredCities: ["Bangalore", "Mysore"],
          climatePreference: ["Moderate", "Cool"],
          locationPriorities: ["Connectivity", "Appreciation Potential"],
        },
        lifestylePreferences: {
          areaType: ["Suburban", "Rural"],
          naturePreference: "Green surroundings",
          viewPreferences: ["Garden View", "Mountain View"],
          communityFormat: "Gated Community",
          gatedPreference: true,
          amenitiesDesired: ["Swimming Pool", "Clubhouse", "Gym"],
        },
        unitPreferences: {
          furnishingLevel: "Semi-furnished",
          interiorStyle: "Modern",
          smartHomeFeatures: ["Security System", "Lighting Automation"],
        },
        notes: {
          buyingNotes: "Looking for a weekend home that can also generate rental income",
          dreamHomeNotes: "Villa with garden and peaceful surroundings",
        },
        system: {
          leadStatus: "Qualified",
          assignedAgent: agent1,
          priorityScore: 85,
          investmentScore: 90,
        },
      },
      {
        identity: {
          fullName: "Priya Singh",
          email: "priya.singh@outlook.com",
          phone: "9000000002",
          whatsappPreferred: true,
        },
        profile: {
          residencyStatus: "Resident",
          discoverySource: "Referral",
          discoveryNotes: "Referred by Amit Verma",
        },
        demographics: {
          ageGroup: "25-34",
          professions: ["Doctor"],
          householdSize: "2",
          annualIncomeRange: "25L-50L",
        },
        buyerProfile: {
          propertiesPurchasedBefore: "0",
          propertyPurpose: ["Primary Residence"],
          buyingMotivation: ["First Home", "Family Needs"],
        },
        assetPreferences: {
          assetTypes: ["Apartment"],
          unitConfigurations: ["2BHK", "3BHK"],
        },
        purchaseReadiness: {
          journeyStage: "Exploring",
          explorationDuration: "Just started",
          purchaseTimeline: "6-12 months",
          budgetRange: "50L-75L",
          fundingType: "Home Loan",
        },
        locationProfile: {
          currentLocation: {
            city: "Bangalore",
            state: "Karnataka",
            country: "India",
          },
          buyingRegions: ["Bangalore"],
          preferredStates: ["Karnataka"],
          preferredCities: ["Bangalore"],
          locationPriorities: ["Proximity to Work", "Good Schools"],
        },
        lifestylePreferences: {
          areaType: ["Urban"],
          communityFormat: "Apartment Complex",
          gatedPreference: true,
          amenitiesDesired: ["Gym", "Children Play Area", "24x7 Security"],
        },
        unitPreferences: {
          furnishingLevel: "Unfurnished",
          interiorStyle: "Contemporary",
        },
        notes: {
          buyingNotes: "First-time buyer, needs guidance on home loan process",
        },
        system: {
          leadStatus: "New",
          assignedAgent: agent2,
          priorityScore: 70,
          investmentScore: 65,
        },
      },
      {
        identity: {
          fullName: "Rajesh Kumar",
          email: "rajesh.kumar@yahoo.com",
          phone: "9000000003",
          whatsappPreferred: false,
        },
        profile: {
          residencyStatus: "Resident",
          discoverySource: "Social Media",
          discoveryNotes: "Found us on Instagram",
        },
        demographics: {
          ageGroup: "45-54",
          professions: ["Business Owner"],
          householdSize: "5",
          annualIncomeRange: "1Cr+",
        },
        buyerProfile: {
          propertiesPurchasedBefore: "5+",
          propertyPurpose: ["Investment", "Vacation Home"],
          buyingMotivation: ["Portfolio Diversification", "Leisure"],
          shortTermRentalPreference: "Open to it",
        },
        assetPreferences: {
          assetTypes: ["Farmhouse", "Villa"],
          unitConfigurations: ["4BHK", "5BHK+"],
          farmlandSizePreference: "5+ acres",
          farmlandVillaConfig: "With swimming pool",
          waterSourcePreference: "Lake/River nearby",
        },
        purchaseReadiness: {
          journeyStage: "Site Visit",
          explorationDuration: "1+ year",
          purchaseTimeline: "Within 3 months",
          budgetRange: "2Cr+",
          fundingType: "Self-funded",
        },
        ownershipPreferences: {
          ownershipStructure: "Company",
          possessionTimeline: "Under construction OK",
          managementModel: "Property Management Company",
        },
        locationProfile: {
          currentLocation: {
            city: "Chennai",
            state: "Tamil Nadu",
            country: "India",
          },
          buyingRegions: ["South India", "Goa"],
          preferredStates: ["Karnataka", "Goa", "Kerala"],
          preferredCities: ["Coorg", "Goa", "Wayanad"],
          avoidRisks: ["Flood prone", "Industrial area"],
          expansionRadiusKm: 100,
          climatePreference: ["Cool", "Tropical"],
          locationPriorities: ["Scenic Beauty", "Privacy"],
        },
        lifestylePreferences: {
          areaType: ["Rural", "Hill Station"],
          energyPreference: ["Solar", "Off-grid capable"],
          naturePreference: "Surrounded by nature",
          terrainPreference: "Hilly",
          viewPreferences: ["Mountain View", "Valley View", "Water Body"],
          communityFormat: "Standalone",
          gatedPreference: false,
          amenitiesDesired: ["Private Pool", "Landscaped Garden", "Outdoor Kitchen"],
        },
        unitPreferences: {
          vastuDirections: ["East Facing", "North Facing"],
          furnishingLevel: "Fully Furnished",
          interiorStyle: "Rustic/Traditional",
          smartHomeFeatures: ["Full Automation", "Security", "Entertainment"],
          mustHaveFeatures: ["Large Kitchen", "Multiple Parking", "Staff Quarters"],
        },
        notes: {
          buyingNotes: "Experienced investor, looking for premium farmhouse property",
          locationDealBreakers: "No properties near highways or industrial areas",
          dreamHomeNotes: "Expansive farmhouse with modern amenities but rustic charm",
        },
        system: {
          leadStatus: "Negotiation",
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
