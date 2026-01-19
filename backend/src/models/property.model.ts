import mongoose from "mongoose";

/* =====================================
   MIRROR SCHEMA — DO NOT OPTIMIZE
===================================== */

const PropertySchema = new mongoose.Schema(
  {
    id: { type: String },
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

    capital_appreciation: { type: mongoose.Schema.Types.Mixed },
    rental_potential: { type: mongoose.Schema.Types.Mixed },
    property_management: { type: mongoose.Schema.Types.Mixed },

    badges: { type: mongoose.Schema.Types.Mixed },
    property_tags: [{ type: String }],

    visual_assets: { type: mongoose.Schema.Types.Mixed },

    accessibility: { type: mongoose.Schema.Types.Mixed },
    age: { type: mongoose.Schema.Types.Mixed },
    calculator_data: { type: mongoose.Schema.Types.Mixed },
    documentation: { type: mongoose.Schema.Types.Mixed },

    engagement: { type: mongoose.Schema.Types.Mixed },
    financial_benefits: { type: mongoose.Schema.Types.Mixed },
    financial_metrics: { type: mongoose.Schema.Types.Mixed },

    furnishing: { type: mongoose.Schema.Types.Mixed },
    inUnitFeatures: { type: mongoose.Schema.Types.Mixed },
    legal_info: { type: mongoose.Schema.Types.Mixed },
    location_details: { type: mongoose.Schema.Types.Mixed },
    luxuryAmenities: { type: mongoose.Schema.Types.Mixed },
    marketMetrics: { type: mongoose.Schema.Types.Mixed },

    microLocationPremium: { type: mongoose.Schema.Types.Mixed },

    parking: { type: mongoose.Schema.Types.Mixed },
    possession: { type: mongoose.Schema.Types.Mixed },
    rental_info: { type: mongoose.Schema.Types.Mixed },
    specialConsiderations: { type: mongoose.Schema.Types.Mixed },

    listingDetails: { type: mongoose.Schema.Types.Mixed },

    lastPriceUpdate: { type: mongoose.Schema.Types.Mixed },

    created_at: { type: Date },
    updated_at: { type: Date },
    published_at: { type: Date },

    listedDate: { type: Date },
  },
  {
    strict: false, // 👈 REQUIRED for 100% mirroring
    timestamps: true, // Mongo internal createdAt / updatedAt
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
    sort: Record<string, 1 | -1> = { createdAt: -1 }
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
