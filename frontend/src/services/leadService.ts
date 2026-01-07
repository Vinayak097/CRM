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
  identity?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    homeCountry?: string;
    taxResidencyCountry?: string;
    visaResidencyStatus?: string;
    leadSource?: string;
    ageYears?: number;
    profession?: string;
    householdSize?: string;
    householdIncomeBandInr?: string;
    priorPropertiesPurchased?: string;
    propertyRolePrimary?: string[];
    searchTrigger?: string[];
    buyingJourneyStage?: string;
    explorationDuration?: string;
    purchaseTimeline?: string;
    aboutYouNotes?: string;
    ownershipTimelineNotes?: string;
  };
  location?: {
    buyingCountryFocus?: string;
    targetStatesRegions?: string[];
    climateRiskAvoidance?: string[];
    targetLocations?: string[];
    preferredClimate?: string[];
    locationPriorities?: string[];
    areaTypePreference?: string[];
    naturalFeatureClosest?: string[];
    locationDealbreakerNotes?: string;
  };
  property?: {
    strPermissionImportance?: string;
    assetTypeInterest?: string[];
    farmlandWaterSourcePreference?: string;
    unitConfiguration?: string[];
    farmlandLandSizeBucket?: string[];
    ownershipStructurePreference?: string;
    possessionStagePreference?: string;
    possessionTimelineBucket?: string;
    managementModelPreference?: string;
    fundingPreference?: string;
    communityFormatPreference?: string;
    communityFriendlyFor?: string[];
    communityOutdoorAmenitiesTop?: string[];
    vastuPreferredDirections?: string[];
    furnishingLevelPreference?: string;
    homeMustHaveFeatures?: string[];
    homeNiceToHaveFeatures?: string[];
    interiorFinishLevel?: string;
    smartHomeSecurityFeatures?: string[];
    privateOutdoorFeatures?: string[];
    propertyVisionNotes?: string;
    idealHomeNotes?: string;
    finalNotes?: string;
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

  deleteLead: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/leads/${id}`);
    return response.data;
  },
};
