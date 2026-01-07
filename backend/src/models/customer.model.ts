import mongoose, { Schema } from "mongoose";
import type { CustomerDocument } from "./customer.types.js";
import { CustomerStatus, CustomerType } from "./customer.enums.js";

const customerSchema = new Schema<CustomerDocument>(
  {
    // Lead reference
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      unique: true, // one lead → one customer
    },

    identity: {
      fullName: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      alternatePhone: { type: String },
      customerType: {
        type: String,
        enum: Object.values(CustomerType),
        default: CustomerType.Individual,
      },
    },

    address: {
      city: { type: String },
      state: { type: String },
      country: { type: String, default: "India" },
      pincode: { type: String },
    },

    ownershipProfile: {
      ownershipStructure: { type: String },
      fundingType: { type: String },
      sourceOfFunds: { type: String },
    },

    transactionSummary: {
      totalBudget: { type: Number },
      preferredAssetType: { type: String },
      preferredLocation: { type: String },
    },

    system: {
      status: {
        type: String,
        enum: Object.values(CustomerStatus),
        default: CustomerStatus.Active,
      },
      assignedAgent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      onboardingCompleted: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true }
);

/* INDEXES */
customerSchema.index({ "identity.phone": 1 }, { unique: true });
customerSchema.index({ "identity.email": 1 });
customerSchema.index({ leadId: 1 });
customerSchema.index({ "system.assignedAgent": 1 });

export const Customer = mongoose.model<CustomerDocument>(
  "Customer",
  customerSchema
);
