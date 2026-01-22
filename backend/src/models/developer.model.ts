import mongoose from "mongoose";

const developerSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    id: { type: String, required: true },
    developer_name: { type: String, required: true, index: true },
    developer_logo_url: { type: String, default: null },
    developer_rating: { type: Number, default: 0 },
    developer_previous_projects: [{ type: String }],
    developer_contact: {
      email: { type: String, default: null },
      phone: { type: String, default: null }
    },
    reputation: { type: String },
    esgComplianceScore: { type: Number, default: 0 },
    projects: [{ type: String }],
    properties: [{ type: String }],
    active: { type: Boolean, default: true, index: true }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
);

export const DeveloperModel = mongoose.model("Developer", developerSchema);

export interface Developer {
  _id: string;
  id: string;
  developer_name: string;
  developer_logo_url: string | null;
  developer_rating: number;
  developer_previous_projects: string[];
  developer_contact: {
    email: string | null;
    phone: string | null;
  };
  reputation: string;
  esgComplianceScore: number;
  projects: string[];
  properties: string[];
  created_at: Date;
  updated_at: Date;
  active: boolean;
}


