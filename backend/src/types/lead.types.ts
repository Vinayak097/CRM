import { Types } from "mongoose";

export enum LeadStatus {
  New = "New",
  Contacted = "Contacted",
  Qualified = "Qualified",
  Shortlisted = "Shortlisted",
  SiteVisit = "Site Visit",
  Negotiation = "Negotiation",
  Booked = "Booked",
  Lost = "Lost",
  Converted = "Converted",
}
export interface LeadDocument {
  // SECTION 1: WELCOME
  identity: {
    fullName?: string;
    email?: string;
    phone?: string;
    residencyStatus?: string;
    residencyDetails?: string;
    discoverySource?: string;
    discoveryDetails?: string;
  };

  // SECTION 2: GET TO KNOW YOU
  demographics?: {
    ageGroup?: string;
    professions?: string[];
    householdSize?: string;
    annualIncomeRange?: string;
    notes?: string;
  };

  // SECTION 3: PROPERTY VISION
  propertyVision?: {
    propertiesPurchasedBefore?: number;
    propertyPurpose?: string[];
    propertyPurposeDetails?: string;
    buyingMotivation?: string[];
    buyingMotivationDetails?: string;
    shortTermRentalPreference?: string;
    assetTypes?: string[];
    assetTypesDetails?: string;
    waterSourcePreference?: string;
    unitConfigurations?: string[];
    unitConfigurationsDetails?: string;
    farmlandSize?: string;
    farmlandSizeDetails?: string;
    farmlandSizeAcres?: number;
    farmlandVillaConfig?: string;
    journeyStage?: string;
    journeyStageDetails?: string;
    explorationDuration?: string;
    explorationDurationDetails?: string;
    purchaseTimeline?: string;
    purchaseTimelineDetails?: string;
    budgetRange?: string;
    budgetRangeDetails?: string;
    notes?: string;
  };

  // SECTION 4: INVESTMENT SNAPSHOT
  investmentPreferences?: {
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

  // SECTION 5: LOCATION
  locationPreferences?: {
    currentLocation?: {
      city?: string;
      state?: string;
      country?: string;
    };
    buyingRegions?: string[];
    preferredCountries?: string[];
    preferredStates?: string[];
    preferredCities?: string[];
    preferredCitiesDetails?: string;
    climateRisksToAvoid?: string[];
    climatePreference?: string[];
    climatePreferenceDetails?: string;
    locationPriorities?: string[];
    locationPrioritiesDetails?: string;
    expansionRadiusKm?: string;
    expansionRadiusDetails?: string;
    notes?: string;
  };

  // SECTION 6: LIFESTYLE & COMMUNITY
  lifestylePreferences?: {
    areaType?: string[];
    areaTypeDetails?: string;
    energyPreference?: string[];
    energyPreferenceDetails?: string;
    natureFeature?: string[];
    natureFeatureDetails?: string;
    terrainPreference?: string[];
    terrainPreferenceDetails?: string;
    viewPreferences?: string[];
    viewPreferencesDetails?: string;
    communityFormat?: string;
    communityFormatDetails?: string;
    gatedPreference?: string;
    communityFriendlyFor?: string[];
    communityFriendlyForDetails?: string;
    outdoorAmenities?: string[];
    notes?: string;
  };

  // SECTION 7: UNIT PREFERENCES
  unitPreferences?: {
    vastuDirections?: string[];
    furnishingLevel?: string;
    furnishingLevelDetails?: string;
    interiorStyle?: string;
    interiorStyleDetails?: string;
    smartHomeFeatures?: string[];
    smartHomeFeaturesDetails?: string;
    mustHaveFeatures?: string[];
    mustHaveFeaturesDetails?: string;
    notes?: string;
  };

  // SECTION 8: DREAM HOME NOTES
  dreamHomeNotes?: string;

  // SYSTEM
  system?: {
    leadStatus?: LeadStatus;
    assignedAgent?: Types.ObjectId;
    priorityScore?: number;
    investmentScore?: number;
  };

  createdAt?: Date;
  updatedAt?: Date;
}
