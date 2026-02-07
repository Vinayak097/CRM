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

export type PropertyStatus =
  | "AVAILABLE"
  | "SOLD"
  | "RESERVED"
  | "UNDER_CONTRACT";

export interface LeadIdentity {
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
  relationShipStatus?: string;
  householdSize?: string;
  household?: {
    hasSeniorCitizen: string;
    hasChildren: string;
    hasPets: string;
  };
  householdIncomeBandInr?: string;
  priorPropertiesPurchased?: string;
  propertyRolePrimary?: string[];
  searchTrigger?: string[];
  buyingJourneyStage?: string;
  explorationDuration?: string;
  purchaseTimeline?: string;
  aboutYouNotes?: string;
  ownershipTimelineNotes?: string;
}

export interface LeadLocation {
  buyingCountryFocus?: string;
  targetStatesRegions?: string[];

  targetLocations?: string[];

  locationPriorities?: string[];

  sorroundings?: string[];
  locationDealbreakerNotes?: string;
}

export interface LeadProperty {
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
}

export interface LeadSystem {
  leadStatus?: LeadStatus;
  assignedAgent?: {
    _id: string;
    name: string;
    email: string;
  };
  managerId?: {
    _id: string;
    name: string;
    email: string;
  };
  priorityScore?: number;
  investmentScore?: number;
  dealValue?: {
    amount: number;
    currency: string;
    expectedCloseDate?: string;
  };
}

export interface Lead {
  _id: string;
  identity?: LeadIdentity;
  location?: LeadLocation;
  property?: LeadProperty;
  system?: LeadSystem;
  createdAt?: string;
  updatedAt?: string;
}

export enum Role {
  Admin = "admin",
  SalesAgent = "sales_agent",
  OnboardingAgent = "onboarding_agent",
  SalesManager = "sales_manager",
  BusinessHead = "business_head",
  Developer = "developer", // Legacy
}

// Dashboard Types
export interface SalesAgentStats {
  todaysFollowups: number;
  missedFollowups: number;
  assignedLeadsCount: number;
  monthlyConversions: number;
  activeDeals: number;
  pipeline: Record<string, number>;
}

export interface OnboardingAgentStats {
  projectsCreated: number;
  propertiesAdded: number;
  projectsThisMonth: number;
  propertiesThisMonth: number;
  pendingApprovals: number;
  onboardingProgress: number;
  projectsByStatus: Record<string, number>;
}

export interface SalesManagerStats {
  totalLeads: number;
  activeDeals: number;
  teamConversionRate: number;
  monthlyConversions: number;
  revenuePipeline: number;
  pipeline: Record<string, number>;
  teamPerformance: Array<{
    id: string;
    name: string;
    email: string;
    assignedLeads: number;
  }>;
}

export interface BusinessHeadStats {
  activeProjects: number;
  totalProjects: number;
  totalProperties: number;
  onboardingCompletionRate: number;
  projectsByStatus: Record<string, number>;
  onboardingAgents: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  growthTrend: Array<{
    month: string;
    projects: number;
  }>;
}

export interface AdminStats {
  totalLeads: number;
  activeDeals: number;
  monthlyConversions: number;
  conversionRate: number;
  pipeline: Record<string, number>;
  totalProjects: number;
  activeProjects: number;
  totalProperties: number;
  projectsByStatus: Record<string, number>;
  totalUsers: number;
  salesAgents: Array<{
    id: string;
    name: string;
    email: string;
    assignedLeads: number;
  }>;
  onboardingAgents: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  growthTrend: Array<{
    month: string;
    projects: number;
  }>;
}

export type DashboardResponse =
  | { role: "sales_agent"; stats: SalesAgentStats }
  | { role: "onboarding_agent"; stats: OnboardingAgentStats }
  | { role: "sales_manager"; stats: SalesManagerStats }
  | { role: "business_head"; stats: BusinessHeadStats }
  | { role: "admin"; stats: AdminStats };
