export type LeadStatus =
  | "New"
  | "Contacted"
  | "Qualified"
  | "Shortlisted"
  | "Site Visit"
  | "Negotiation"
  | "Booked"
  | "Lost"
  | "Converted";

export interface Lead {
  _id: string;
  
  identity: {
    fullName: string;
    email: string;
    phone: string;
    residencyStatus: string;
    residencyDetails?: string;
    discoverySource: string;
    discoveryDetails?: string;
  };

  demographics: {
    ageGroup?: string;
    professions: string[];
    householdSize?: string;
    annualIncomeRange?: string;
    notes?: string;
  };

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

  dreamHomeNotes?: string;

  system: {
    leadStatus: LeadStatus;
    assignedAgent?: {
      _id: string;
      name: string;
      email: string;
    };
    priorityScore?: number;
    investmentScore?: number;
  };

  createdAt: string;
  updatedAt: string;
}

export enum Role {
  Admin = "admin",
  SalesAgent = "sales_agent",
  Developer = "developer",
}
