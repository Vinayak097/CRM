import { Types } from "mongoose";

export interface CustomerDocument {
  // Reference
  leadId: Types.ObjectId;

  // Identity (VERIFIED)
  identity: {
    fullName: string;
    email: string;
    phone: string;
    alternatePhone?: string;
    customerType: CustomerType;
  };

  // Address
  address?: {
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };

  // Investment / Ownership
  ownershipProfile?: {
    ownershipStructure?: string;
    fundingType?: string;
    sourceOfFunds?: string;
  };

  // Transaction summary (can expand later)
  transactionSummary?: {
    totalBudget?: number;
    preferredAssetType?: string;
    preferredLocation?: string;
  };

  // System
  system: {
    status: CustomerStatus;
    assignedAgent?: Types.ObjectId;
    onboardingCompleted: boolean;
  };

  createdAt?: Date;
  updatedAt?: Date;
}
export enum CustomerStatus {
  Active = "Active",
  Inactive = "Inactive",
  Blacklisted = "Blacklisted",
}

export enum CustomerType {
  Individual = "Individual",
  Joint = "Joint",
  Company = "Company",
}
