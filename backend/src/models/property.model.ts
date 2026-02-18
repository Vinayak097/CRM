import { randomUUID } from "crypto";
import mongoose from "mongoose";

/* =====================================
   MIRROR SCHEMA — DO NOT OPTIMIZE
===================================== */

const PropertySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: () => randomUUID(),
      required: true,
      index: true,
    },
    assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    listing_id: { type: String, index: true },
    title: { type: String },
    subtitle: { type: String },

    property_type: { type: String },
    status: { type: String },
    listing_type: { type: String },

    location_id: { type: String },
    location: { type: mongoose.Schema.Types.Mixed },
    specificAddress: { type: mongoose.Schema.Types.Mixed },

    description_short: { type: String },
    description_long: { type: String },

    project_info: { type: mongoose.Schema.Types.Mixed },
    developer: { type: mongoose.Schema.Types.Mixed },

    pricing: { type: mongoose.Schema.Types.Mixed },
    specifications: { type: mongoose.Schema.Types.Mixed },
    spatialDetails: { type: mongoose.Schema.Types.Mixed },
    area: { type: mongoose.Schema.Types.Mixed },

    amenities: { type: mongoose.Schema.Types.Mixed },
    amenities_summary: { type: mongoose.Schema.Types.Mixed },

    features: { type: mongoose.Schema.Types.Mixed },
    investment_highlights: [{ type: String }],

    capital_appreciation: { type: mongoose.Schema.Types.Mixed, default: {} },
    rental_potential: { type: mongoose.Schema.Types.Mixed, default: {} },
    property_management: { type: mongoose.Schema.Types.Mixed, default: {} },

    badges: { type: mongoose.Schema.Types.Mixed },
    property_tags: [{ type: String }],

    visual_assets: { type: mongoose.Schema.Types.Mixed, default: {} },

    accessibility: { type: mongoose.Schema.Types.Mixed, default: {} },
    age: { type: mongoose.Schema.Types.Mixed, default: {} },
    calculator_data: { type: mongoose.Schema.Types.Mixed, default: {} },
    documentation: { type: mongoose.Schema.Types.Mixed, default: {} },

    engagement: { type: mongoose.Schema.Types.Mixed, default: {} },
    financial_benefits: { type: mongoose.Schema.Types.Mixed, default: {} },
    financial_metrics: { type: mongoose.Schema.Types.Mixed, default: {} },

    furnishing: { type: mongoose.Schema.Types.Mixed, default: {} },
    inUnitFeatures: { type: mongoose.Schema.Types.Mixed, default: {} },
    legal_info: { type: mongoose.Schema.Types.Mixed, default: {} },
    location_details: { type: mongoose.Schema.Types.Mixed, default: {} },
    luxuryAmenities: { type: mongoose.Schema.Types.Mixed, default: {} },
    marketMetrics: { type: mongoose.Schema.Types.Mixed, default: {} },

    microLocationPremium: { type: mongoose.Schema.Types.Mixed },

    parking: { type: mongoose.Schema.Types.Mixed, default: {} },
    possession: { type: mongoose.Schema.Types.Mixed, default: {} },
    rental_info: { type: mongoose.Schema.Types.Mixed, default: {} },
    specialConsiderations: { type: mongoose.Schema.Types.Mixed, default: {} },

    listingDetails: { type: mongoose.Schema.Types.Mixed, default: {} },

    lastPriceUpdate: { type: mongoose.Schema.Types.Mixed },

    is_deleted: { type: Number, default: 0, index: true },
    
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    published_at: { type: Date },

    listedDate: { type: Date },
  },
  {
    strict: false, // 👈 REQUIRED for 100% mirroring
    minimize: false, // 👈 REQUIRED to keep empty objects like accessibility: {}
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    },
    versionKey: false
  }
);

/* Safe indexes only */
PropertySchema.index({ property_type: 1 });
PropertySchema.index({ status: 1 });
PropertySchema.index({ title: "text", description_short: "text", description_long: "text" });

export const PropertyModel: mongoose.Model<any> =
  (mongoose.models.Property as mongoose.Model<any>) ||
  mongoose.model("Property", PropertySchema);

/* =====================================
   REPOSITORY — MIRROR SAFE
===================================== */

export class PropertyRepository {

  async create(data: any) {
    const doc = await PropertyModel.create(data);
    return (doc as any).toObject();
  }

  async findById(id: string) {
    return PropertyModel.findById(id).lean();
  }

  async findByListingId(listing_id: string) {
    return PropertyModel.findOne({ listing_id }).lean();
  }

  async find(
    filters: Record<string, any> = {},
    skip = 0,
    limit = 20,
    sort: Record<string, 1 | -1> = { created_at: -1 }
  ) {
    return PropertyModel.find(filters)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .lean();
  }

  async count(filters: Record<string, any> = {}) {
    return PropertyModel.countDocuments(filters);
  }

  async update(id: string, data: any) {
    return PropertyModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    ).lean();
  }

  async delete(id: string) {
    const res = await PropertyModel.findByIdAndDelete(id);
    return !!res;
  }

  async incrementField(
    id: string,
    fieldPath: string,
    value = 1
  ) {
    await PropertyModel.findByIdAndUpdate(id, {
      $inc: { [fieldPath]: value },
    });
  }

  async search(query: string, limit = 20) {
    return PropertyModel.find({
      $text: { $search: query },
    })
      .limit(limit)
      .lean();
  }
}
