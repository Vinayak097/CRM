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
  priorityScore?: number;
  investmentScore?: number;
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
  Developer = "developer",
}
