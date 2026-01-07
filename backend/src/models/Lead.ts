import mongoose, { Schema } from "mongoose";
import { LeadStatus, type LeadDocument } from "../types/lead.types.js";

const leadSchema = new Schema<LeadDocument>(
  {
    identity: {
      fullName: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
      phone: { type: String, trim: true },
      residencyStatus: { type: String },
      residencyDetails: { type: String },
      discoverySource: { type: String },
      discoveryDetails: { type: String },
    },

    demographics: {
      ageGroup: { type: String },
      professions: { type: [String], default: [] },
      householdSize: { type: String },
      annualIncomeRange: { type: String },
      notes: { type: String },
    },

    propertyVision: {
      propertiesPurchasedBefore: { type: Number, default: 0 },
      propertyPurpose: { type: [String], default: [] },
      propertyPurposeDetails: { type: String },
      buyingMotivation: { type: [String], default: [] },
      buyingMotivationDetails: { type: String },
      shortTermRentalPreference: { type: String },
      assetTypes: { type: [String], default: [] },
      assetTypesDetails: { type: String },
      waterSourcePreference: { type: String },
      unitConfigurations: { type: [String], default: [] },
      unitConfigurationsDetails: { type: String },
      farmlandSize: { type: String },
      farmlandSizeDetails: { type: String },
      farmlandSizeAcres: { type: Number },
      farmlandVillaConfig: { type: String },
      journeyStage: { type: String },
      journeyStageDetails: { type: String },
      explorationDuration: { type: String },
      explorationDurationDetails: { type: String },
      purchaseTimeline: { type: String },
      purchaseTimelineDetails: { type: String },
      budgetRange: { type: String },
      budgetRangeDetails: { type: String },
      notes: { type: String },
    },

    investmentPreferences: {
      ownershipStructure: { type: String },
      ownershipStructureDetails: { type: String },
      possessionTimeline: { type: String },
      possessionTimelineDetails: { type: String },
      managementModel: { type: String },
      managementModelDetails: { type: String },
      fundingType: { type: String },
      fundingTypeDetails: { type: String },
      notes: { type: String },
    },

    locationPreferences: {
      currentLocation: {
        city: { type: String },
        state: { type: String },
        country: { type: String, default: "India" },
      },
      buyingRegions: { type: [String], default: [] },
      preferredCountries: { type: [String], default: [] },
      preferredStates: { type: [String], default: [] },
      preferredCities: { type: [String], default: [] },
      preferredCitiesDetails: { type: String },
      climateRisksToAvoid: { type: [String], default: [] },
      climatePreference: { type: [String], default: [] },
      climatePreferenceDetails: { type: String },
      locationPriorities: { type: [String], default: [] },
      locationPrioritiesDetails: { type: String },
      expansionRadiusKm: { type: String },
      expansionRadiusDetails: { type: String },
      notes: { type: String },
    },

    lifestylePreferences: {
      areaType: { type: [String], default: [] },
      areaTypeDetails: { type: String },
      energyPreference: { type: [String], default: [] },
      energyPreferenceDetails: { type: String },
      natureFeature: { type: [String], default: [] },
      natureFeatureDetails: { type: String },
      terrainPreference: { type: [String], default: [] },
      terrainPreferenceDetails: { type: String },
      viewPreferences: { type: [String], default: [] },
      viewPreferencesDetails: { type: String },
      communityFormat: { type: String },
      communityFormatDetails: { type: String },
      gatedPreference: { type: String },
      communityFriendlyFor: { type: [String], default: [] },
      communityFriendlyForDetails: { type: String },
      outdoorAmenities: { type: [String], default: [] },
      notes: { type: String },
    },

    unitPreferences: {
      vastuDirections: { type: [String], default: [] },
      furnishingLevel: { type: String },
      furnishingLevelDetails: { type: String },
      interiorStyle: { type: String },
      interiorStyleDetails: { type: String },
      smartHomeFeatures: { type: [String], default: [] },
      smartHomeFeaturesDetails: { type: String },
      mustHaveFeatures: { type: [String], default: [] },
      mustHaveFeaturesDetails: { type: String },
      notes: { type: String },
    },

    dreamHomeNotes: { type: String },

    system: {
      leadStatus: {
        type: String,
        enum: Object.values(LeadStatus),
        default: LeadStatus.New,
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

// /* INDEXES */
// leadSchema.index({ "identity.phone": 1 }, { unique: true, sparse: true });
// leadSchema.index({ "identity.email": 1 }, { sparse: true });
// leadSchema.index({ "system.assignedAgent": 1 });
// leadSchema.index({ "system.leadStatus": 1 });

export const Lead = mongoose.model<LeadDocument>("Lead", leadSchema);
