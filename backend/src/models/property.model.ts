// repositories/property.repository.ts
import mongoose from "mongoose";
import type {
  Property,
  CreatePropertyInput,
  UpdatePropertyInput,
  QueryPropertyInput,
} from "../schemas/property.schema.js";

// Define the Property model schema
const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    price: { type: String, required: true },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    propertyType: {
      type: String,
      enum: ["PLOT", "VILLA", "APARTMENT", "FARM_HOUSE", "COMMERCIAL"],
      required: true,
    },
    bedrooms: { type: Number, min: 0, default: 0 },
    bathrooms: { type: Number, min: 0, default: 0 },
    area: { type: Number, required: true }, // in sq.ft
    floors: { type: Number, min: 0, default: 1 },
    images: [{ type: String }],
    amenities: [{ type: String }],
    features: [{ type: String }],
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ["AVAILABLE", "SOLD", "RESERVED", "UNDER_CONTRACT"],
      default: "AVAILABLE",
    },
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    unitConfiguration: {
      type: { type: String },
      size: { type: String },
      price: { type: String },
    },
    aboutProject: { type: String },
    legalApprovals: {
      type: { type: String },
      details: { type: String },
    },
    registrationCosts: {
      stampDuty: { type: String },
      registration: { type: String },
    },
    propertyManagement: { type: String },
    financialReturns: { type: String },
    investmentBenefits: [{ type: String }],
    nearbyInfrastructure: {
      education: { type: String },
      healthcare: { type: String },
      shopping: { type: String },
      transport: { type: String },
    },
    plotSize: { type: String },
    constructionStatus: { type: String },
    emiOptions: { type: String },
    tags: [{ type: String }],
    views: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create text index for search
propertySchema.index({
  title: "text",
  description: "text",
  tags: "text",
  features: "text",
});

// Create the Mongoose model
const PropertyModel = mongoose.model("Property", propertySchema);

export class PropertyRepository {
  // Create a new property
  async create(data: CreatePropertyInput): Promise<Property> {
    const property = new PropertyModel(data);
    await property.save();
    return this.toDomain(property);
  }

  // Find property by ID
  async findById(id: string): Promise<Property | null> {
    const property = await PropertyModel.findById(id);
    return property ? this.toDomain(property) : null;
  }

  // Find property by slug
  async findBySlug(slug: string): Promise<Property | null> {
    const property = await PropertyModel.findOne({ slug });
    return property ? this.toDomain(property) : null;
  }

  // Find properties with filters, pagination, and sorting
  async find(
    filters: Partial<QueryPropertyInput>,
    skip: number = 0,
    limit: number = 20,
    sort: Record<string, 1 | -1> = { createdAt: -1 }
  ): Promise<Property[]> {
    const query = this.buildQuery(filters);

    const properties = await PropertyModel.find(query)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .lean();

    return properties.map((prop) => this.toDomain(prop));
  }

  // Count properties with filters
  async count(filters: Partial<QueryPropertyInput>): Promise<number> {
    const query = this.buildQuery(filters);
    return PropertyModel.countDocuments(query);
  }

  // Update property
  async update(
    id: string,
    data: UpdatePropertyInput
  ): Promise<Property | null> {
    const property = await PropertyModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    return property ? this.toDomain(property) : null;
  }

  // Delete property
  async delete(id: string): Promise<boolean> {
    const result = await PropertyModel.findByIdAndDelete(id);
    return result !== null;
  }

  // Soft delete (mark as inactive)
  async softDelete(id: string): Promise<boolean> {
    const result = await PropertyModel.findByIdAndUpdate(
      id,
      { $set: { active: false } },
      { new: true }
    );
    return result !== null;
  }

  // Increment a field (e.g., views)
  async incrementField(
    id: string,
    field: string,
    value: number = 1
  ): Promise<void> {
    await PropertyModel.findByIdAndUpdate(id, { $inc: { [field]: value } });
  }

  // Search properties by text
  async search(query: string, limit: number = 10): Promise<Property[]> {
    const properties = await PropertyModel.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(limit)
      .lean();

    return properties.map((prop) => this.toDomain(prop));
  }

  // Get properties by location with radius
  async findByLocation(
    coordinates: { lat: number; lng: number },
    radiusInKm: number = 10,
    limit: number = 10
  ): Promise<Property[]> {
    const properties = await PropertyModel.find({
      coordinates: {
        $geoWithin: {
          $centerSphere: [
            [coordinates.lng, coordinates.lat],
            radiusInKm / 6378.1, // Convert km to radians
          ],
        },
      },
      active: true,
    })
      .limit(limit)
      .lean();

    return properties.map((prop) => this.toDomain(prop));
  }

  // Get similar properties
  async getSimilar(propertyId: string, limit: number = 5): Promise<Property[]> {
    const property = await PropertyModel.findById(propertyId);
    if (!property) return [];

    const properties = await PropertyModel.find({
      _id: { $ne: propertyId },
      $or: [
        { propertyType: property.propertyType },
        { locationId: property.locationId },
        { tags: { $in: property.tags } },
      ],
      active: true,
    })
      .limit(limit)
      .lean();

    return properties.map((prop) => this.toDomain(prop));
  }

  // Helper method to build query from filters
  private buildQuery(filters: Partial<QueryPropertyInput>) {
    const query: any = { active: true };

    if (filters.search) {
      query.$text = { $search: filters.search };
    }
    if (filters.propertyType) {
      query.propertyType = filters.propertyType;
    }
    if (filters.locationId) {
      query.locationId = filters.locationId;
    }
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.featured !== undefined) {
      query.featured = filters.featured;
    }
    if (filters.active !== undefined) {
      query.active = filters.active;
    }
    if (filters.tags) {
      query.tags = { $in: filters.tags.split(",") };
    }
    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) {
        query.price.$gte = filters.minPrice;
      }
      if (filters.maxPrice) {
        query.price.$lte = filters.maxPrice;
      }
    }
    if (filters.minArea || filters.maxArea) {
      query.area = {};
      if (filters.minArea) {
        query.area.$gte = filters.minArea;
      }
      if (filters.maxArea) {
        query.area.$lte = filters.maxArea;
      }
    }

    return query;
  }

  // Convert database document to domain object
  private toDomain(doc: any): Property {
    return {
      _id: doc._id.toString(),
      title: doc.title,
      slug: doc.slug,
      description: doc.description,
      price: doc.price,
      locationId: doc.locationId.toString(),
      propertyType: doc.propertyType,
      bedrooms: doc.bedrooms,
      bathrooms: doc.bathrooms,
      area: doc.area,
      floors: doc.floors,
      images: doc.images,
      amenities: doc.amenities,
      features: doc.features,
      coordinates: doc.coordinates,
      status: doc.status,
      featured: doc.featured,
      active: doc.active,
      unitConfiguration: doc.unitConfiguration,
      aboutProject: doc.aboutProject,
      legalApprovals: doc.legalApprovals,
      registrationCosts: doc.registrationCosts,
      propertyManagement: doc.propertyManagement,
      financialReturns: doc.financialReturns,
      investmentBenefits: doc.investmentBenefits,
      nearbyInfrastructure: doc.nearbyInfrastructure,
      plotSize: doc.plotSize,
      constructionStatus: doc.constructionStatus,
      emiOptions: doc.emiOptions,
      tags: doc.tags,
      views: doc.views,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
