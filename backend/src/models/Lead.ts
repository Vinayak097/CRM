import mongoose, { Schema, Document } from "mongoose";

export interface LeadDocument extends Document {
  // Section 1: Welcome
  identity: {
    fullName: string;
    email: string;
    phone: string;
    residencyStatus: string;
    residencyDetails?: string;
    discoverySource: string;
    discoveryDetails?: string;
  };

  // Section 2: Get to Know You
  demographics: {
    ageGroup?: string;
    professions: string[];
    householdSize?: string;
    annualIncomeRange?: string;
    notes?: string;
  };

  // Section 3: Property Vision
  propertyVision: {
    propertiesPurchasedBefore: string;
    propertyPurpose: string[];
    propertyPurposeDetails?: string;
    buyingMotivation: string[];
    buyingMotivationDetails?: string;
    shortTermRentalPreference?: string;
    assetTypes: string[];
    assetTypesDetails?: string;
    waterSourcePreference?: string;
    unitConfigurations: string[];
    unitConfigurationsDetails?: string;
    farmlandSize?: string;
    farmlandSizeDetails?: string;
    farmlandSizeAcres?: number;
    farmlandVillaConfig?: string;
    journeyStage: string;
    journeyStageDetails?: string;
    explorationDuration: string;
    explorationDurationDetails?: string;
    purchaseTimeline: string;
    purchaseTimelineDetails?: string;
    budgetRange: string;
    budgetRangeDetails?: string;
    notes?: string;
  };

  // Section 4: Investment Snapshot
  investmentPreferences: {
    ownershipStructure?: string;
    ownershipStructureDetails?: string;
    possessionTimeline?: string;
    possessionTimelineDetails?: string;
    managementModel?: string;
    managementModelDetails?: string;
    fundingType?: string;
    fundingTypeDetails?: string;
    notes?: string;
  };

  // Section 5: Location
  locationPreferences: {
    currentLocation: {
      city: string;
      state: string;
      country: string;
    };
    buyingRegions: string[];
    preferredCountries: string[];
    preferredStates: string[];
    preferredCities: string[];
    preferredCitiesDetails?: string;
    climateRisksToAvoid: string[];
    climatePreference: string[];
    climatePreferenceDetails?: string;
    locationPriorities: string[];
    locationPrioritiesDetails?: string;
    expansionRadiusKm?: string;
    expansionRadiusDetails?: string;
    notes?: string;
  };

  // Section 6: Lifestyle & Community
  lifestylePreferences: {
    areaType: string[];
    areaTypeDetails?: string;
    energyPreference: string[];
    energyPreferenceDetails?: string;
    natureFeature: string[];
    natureFeatureDetails?: string;
    terrainPreference: string[];
    terrainPreferenceDetails?: string;
    viewPreferences: string[];
    viewPreferencesDetails?: string;
    communityFormat?: string;
    communityFormatDetails?: string;
    gatedPreference?: string;
    communityFriendlyFor: string[];
    communityFriendlyForDetails?: string;
    outdoorAmenities: string[];
    notes?: string;
  };

  // Section 7: Unit Preferences
  unitPreferences: {
    vastuDirections: string[];
    furnishingLevel?: string;
    furnishingLevelDetails?: string;
    interiorStyle?: string;
    interiorStyleDetails?: string;
    smartHomeFeatures: string[];
    smartHomeFeaturesDetails?: string;
    mustHaveFeatures: string[];
    mustHaveFeaturesDetails?: string;
    notes?: string;
  };

  // Section 8: Dream Home Notes
  dreamHomeNotes?: string;

  // System fields
  system: {
    leadStatus:
      | "New"
      | "Contacted"
      | "Qualified"
      | "Shortlisted"
      | "Site Visit"
      | "Negotiation"
      | "Booked"
      | "Lost"
      | "Converted";
    assignedAgent?: mongoose.Types.ObjectId;
    priorityScore?: number;
    investmentScore?: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<LeadDocument>(
  {
    identity: {
      fullName: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      phone: { type: String, required: true, unique: true, trim: true },
      residencyStatus: { type: String, default: "" },
      residencyDetails: { type: String },
      discoverySource: { type: String, default: "" },
      discoveryDetails: { type: String },
    },

    demographics: {
      ageGroup: { type: String },
      professions: [{ type: String }],
      householdSize: { type: String },
      annualIncomeRange: { type: String },
      notes: { type: String },
    },

    propertyVision: {
      propertiesPurchasedBefore: { type: String, default: "0" },
      propertyPurpose: [{ type: String }],
      propertyPurposeDetails: { type: String },
      buyingMotivation: [{ type: String }],
      buyingMotivationDetails: { type: String },
      shortTermRentalPreference: { type: String },
      assetTypes: [{ type: String }],
      assetTypesDetails: { type: String },
      waterSourcePreference: { type: String },
      unitConfigurations: [{ type: String }],
      unitConfigurationsDetails: { type: String },
      farmlandSize: { type: String },
      farmlandSizeDetails: { type: String },
      farmlandSizeAcres: { type: Number },
      farmlandVillaConfig: { type: String },
      journeyStage: { type: String, default: "Just exploring" },
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
        city: { type: String, default: "" },
        state: { type: String, default: "" },
        country: { type: String, default: "India" },
      },
      buyingRegions: [{ type: String }],
      preferredCountries: [{ type: String }],
      preferredStates: [{ type: String }],
      preferredCities: [{ type: String }],
      preferredCitiesDetails: { type: String },
      climateRisksToAvoid: [{ type: String }],
      climatePreference: [{ type: String }],
      climatePreferenceDetails: { type: String },
      locationPriorities: [{ type: String }],
      locationPrioritiesDetails: { type: String },
      expansionRadiusKm: { type: String },
      expansionRadiusDetails: { type: String },
      notes: { type: String },
    },

    lifestylePreferences: {
      areaType: [{ type: String }],
      areaTypeDetails: { type: String },
      energyPreference: [{ type: String }],
      energyPreferenceDetails: { type: String },
      natureFeature: [{ type: String }],
      natureFeatureDetails: { type: String },
      terrainPreference: [{ type: String }],
      terrainPreferenceDetails: { type: String },
      viewPreferences: [{ type: String }],
      viewPreferencesDetails: { type: String },
      communityFormat: { type: String },
      communityFormatDetails: { type: String },
      gatedPreference: { type: String },
      communityFriendlyFor: [{ type: String }],
      communityFriendlyForDetails: { type: String },
      outdoorAmenities: [{ type: String }],
      notes: { type: String },
    },

    unitPreferences: {
      vastuDirections: [{ type: String }],
      furnishingLevel: { type: String },
      furnishingLevelDetails: { type: String },
      interiorStyle: { type: String },
      interiorStyleDetails: { type: String },
      smartHomeFeatures: [{ type: String }],
      smartHomeFeaturesDetails: { type: String },
      mustHaveFeatures: [{ type: String }],
      mustHaveFeaturesDetails: { type: String },
      notes: { type: String },
    },

    dreamHomeNotes: { type: String },

    system: {
      leadStatus: {
        type: String,
        enum: [
          "New",
          "Contacted",
          "Qualified",
          "Shortlisted",
          "Site Visit",
          "Negotiation",
          "Booked",
          "Lost",
          "Converted",
        ],
        default: "New",
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

leadSchema.index({ "identity.phone": 1 }, { unique: true });
leadSchema.index({ "identity.email": 1 });
leadSchema.index({ "system.assignedAgent": 1 });
leadSchema.index({ "system.leadStatus": 1 });

export default mongoose.model<LeadDocument>("Lead", leadSchema);
