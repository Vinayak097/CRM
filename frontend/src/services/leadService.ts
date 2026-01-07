import api from "./api";
import type { Lead } from "@/types";

export type { Lead };

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateLeadData {
  identity: {
    fullName: string;
    email: string;
    phone: string;
    residencyStatus?: string;
    residencyDetails?: string;
    discoverySource?: string;
    discoveryDetails?: string;
  };
  demographics?: {
    ageGroup?: string;
    professions?: string[];
    householdSize?: string;
    annualIncomeRange?: string;
    notes?: string;
  };
  propertyVision?: {
    propertiesPurchasedBefore?: string;
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
  dreamHomeNotes?: string;
  system?: {
    assignedAgent?: string;
  };
  buyerProfile?: {
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
  assetPreferences?: {
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
  purchaseReadiness?: {
    journeyStage?: string;
    purchaseTimeline?: string;
    budgetRange?: string;
  };
  ownershipPreferences?: {
    ownershipStructure?: string;
    fundingType?: string;
  };
  locationProfile?: {
    currentLocation?: {
      city?: string;
      state?: string;
      country?: string;
    };
    buyingRegions?: string[];
    preferredCities?: string[];
  };
}

export const leadService = {
  getLeads: async (
    page = 1,
    limit = 10,
    search = ""
  ): Promise<PaginatedResponse<Lead>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.append("search", search);
    const response = await api.get(`/leads?${params}`);
    return response.data;
  },

  getLeadById: async (id: string): Promise<{ data: Lead }> => {
    const response = await api.get(`/leads/${id}`);
    return response.data;
  },

  createLead: async (data: CreateLeadData): Promise<{ data: Lead }> => {
    const response = await api.post("/leads", data);
    return response.data;
  },

  updateLead: async (
    id: string,
    data: Record<string, unknown>
  ): Promise<{ data: Lead }> => {
    const response = await api.put(`/leads/${id}`, data);
    return response.data;
  },

  assignAgent: async (leadId: string, agentId: string): Promise<{ data: Lead }> => {
    const response = await api.post(`/leads/${leadId}/assign`, { agentId });
    return response.data;
  },

  convertToCustomer: async (leadId: string): Promise<{ data: Lead }> => {
    const response = await api.post(`/leads/${leadId}/convert`);
    return response.data;
  },
};
