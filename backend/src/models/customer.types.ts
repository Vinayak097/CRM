import { Types } from "mongoose";
import { CustomerStatus, CustomerType } from "./customer.enums.js";

export interface CustomerDocument {
  leadId: Types.ObjectId;

  identity: {
    fullName: string;
    email: string;
    phone: string;
    alternatePhone?: string;
    customerType?: CustomerType;
  };

  address?: {
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };

  ownershipProfile?: {
    ownershipStructure?: string;
    fundingType?: string;
    sourceOfFunds?: string;
  };

  transactionSummary?: {
    totalBudget?: number;
    preferredAssetType?: string;
    preferredLocation?: string;
  };

  system?: {
    status?: CustomerStatus;
    assignedAgent?: Types.ObjectId;
    onboardingCompleted?: boolean;
  };

  createdAt?: Date;
  updatedAt?: Date;
}
