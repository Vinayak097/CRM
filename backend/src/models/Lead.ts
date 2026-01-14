import mongoose, { Schema } from "mongoose";
import { LeadStatus } from "../types/lead.types.js";

const leadSchema = new Schema(
  {
    identity: {
      firstName: { type: String, trim: true },
      lastName: { type: String, trim: true },
      phone: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
      homeCountry: { type: String },
      taxResidencyCountry: { type: String },
      visaResidencyStatus: { type: String },
      leadSource: { type: String },
      ageYears: { type: Number },
      profession: { type: String },
      householdSize: { type: String },
      household: {
        hasSeniorCitizen: { type: String },
        hasChildren: { type: String },
        hasPets: { type: String },
      },
      householdIncomeBandInr: { type: String },
      priorPropertiesPurchased: { type: String },
      propertyRolePrimary: { type: [String], default: [] },
      searchTrigger: { type: [String], default: [] },
      buyingJourneyStage: { type: String },
      explorationDuration: { type: String },
      purchaseTimeline: { type: String },
      // notes tied to identity
      aboutYouNotes: { type: String },
      ownershipTimelineNotes: { type: String },
    },

    location: {
      buyingCountryFocus: { type: String },
      targetStatesRegions: { type: [String], default: [] },
      targetLocations: { type: [String], default: [] },
      locationPriorities: { type: [String], default: [] },
      naturalFeatureClosest: { type: [String], default: [] },
      // notes tied to location
      locationDealbreakerNotes: { type: String },
    },

    property: {
      strPermissionImportance: { type: String },
      assetTypeInterest: { type: [String], default: [] },
      farmlandWaterSourcePreference: { type: String },
      unitConfiguration: { type: [String], default: [] },
      farmlandLandSizeBucket: { type: [String], default: [] },
      ownershipStructurePreference: { type: String },
      possessionStagePreference: { type: String },
      possessionTimelineBucket: { type: String },
      managementModelPreference: { type: String },
      fundingPreference: { type: String },
      communityFormatPreference: { type: String },

      communityFriendlyFor: { type: [String], default: [] },
      communityOutdoorAmenitiesTop: { type: [String], default: [] },
      vastuPreferredDirections: { type: [String], default: [] },
      furnishingLevelPreference: { type: String },

      homeMustHaveFeatures: { type: [String], default: [] },
      homeNiceToHaveFeatures: { type: [String], default: [] },
      interiorFinishLevel: { type: String },
      smartHomeSecurityFeatures: { type: [String], default: [] },
      privateOutdoorFeatures: { type: [String], default: [] },

      // notes tied to property
      propertyVisionNotes: { type: String },
      idealHomeNotes: { type: String },
      finalNotes: { type: String },
    },

    system: {
      leadStatus: {
        type: String,
        enum: Object.values(LeadStatus || {}),
        default: LeadStatus?.New || "New",
      },

      assignedAgent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },

      priorityScore: { type: Number, default: 0 },
      investmentScore: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Lead", leadSchema);
