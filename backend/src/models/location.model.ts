// repositories/location.repository.ts
import mongoose from "mongoose";

// Location Schema
const locationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    image: { type: String },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    highlights: [{ type: String }],
    amenities: [
      {
        name: { type: String },
        icon: { type: String },
      },
    ],
    featured: { type: Boolean, default: false, index: true },
    propertyCount: { type: Number, default: 0 },
    active: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
  }
);

// Create model
export const LocationModel = mongoose.model("Location", locationSchema);

// Types
export interface Location {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  highlights: string[];
  amenities: Array<{
    name: string;
    icon: string;
  }>;
  featured: boolean;
  propertyCount: number;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateLocationInput {
  name: string;
  slug: string;
  description: string;
  image?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  highlights: string[];
  amenities: Array<{
    name: string;
    icon: string;
  }>;
  featured?: boolean;
  active?: boolean;
}

export interface UpdateLocationInput extends Partial<CreateLocationInput> {}

export interface QueryLocationInput {
  page?: number;
  limit?: number;
  search?: string;
  featured?: boolean;
  active?: boolean;
}

export class LocationRepository {
  // Create location
  async create(data: CreateLocationInput): Promise<Location> {
    const location = new LocationModel(data);
    await location.save();
    return this.toDomain(location);
  }

  // Find location by ID
  async findById(id: string): Promise<Location | null> {
    const location = await LocationModel.findById(id);
    return location ? this.toDomain(location) : null;
  }

  // Find location by slug
  async findBySlug(slug: string): Promise<Location | null> {
    const location = await LocationModel.findOne({ slug });
    return location ? this.toDomain(location) : null;
  }

  // Find locations with filters
  async find(
    filters: Partial<QueryLocationInput>,
    skip: number = 0,
    limit: number = 20,
    sort: Record<string, 1 | -1> = { name: 1 }
  ): Promise<Location[]> {
    const query = this.buildQuery(filters);

    const locations = await LocationModel.find(query)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .lean();

    return locations.map((loc) => this.toDomain(loc));
  }

  // Count locations
  async count(filters: Partial<QueryLocationInput>): Promise<number> {
    const query = this.buildQuery(filters);
    return LocationModel.countDocuments(query);
  }

  // Update location
  async update(
    id: string,
    data: UpdateLocationInput
  ): Promise<Location | null> {
    const location = await LocationModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    return location ? this.toDomain(location) : null;
  }

  // Delete location
  async delete(id: string): Promise<boolean> {
    // Check if any properties reference this location
    const propertyCount = await mongoose.model("Property").countDocuments({
      locationId: id,
    });

    if (propertyCount > 0) {
      throw new Error(
        "Cannot delete location that has properties associated with it"
      );
    }

    const result = await LocationModel.findByIdAndDelete(id);
    return result !== null;
  }

  // Increment property count
  async incrementPropertyCount(id: string): Promise<void> {
    await LocationModel.findByIdAndUpdate(id, { $inc: { propertyCount: 1 } });
  }

  // Decrement property count
  async decrementPropertyCount(id: string): Promise<void> {
    await LocationModel.findByIdAndUpdate(id, { $inc: { propertyCount: -1 } });
  }

  // Get featured locations
  async getFeatured(limit: number = 6): Promise<Location[]> {
    const locations = await LocationModel.find({ featured: true, active: true })
      .limit(limit)
      .sort({ propertyCount: -1 })
      .lean();

    return locations.map((loc) => this.toDomain(loc));
  }

  // Search locations
  async search(query: string, limit: number = 10): Promise<Location[]> {
    const locations = await LocationModel.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { highlights: { $in: [new RegExp(query, "i")] } },
      ],
      active: true,
    })
      .limit(limit)
      .lean();

    return locations.map((loc) => this.toDomain(loc));
  }

  // Build query
  private buildQuery(filters: Partial<QueryLocationInput>) {
    const query: any = {};

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
      ];
    }
    if (filters.featured !== undefined) {
      query.featured = filters.featured;
    }
    if (filters.active !== undefined) {
      query.active = filters.active;
    }

    return query;
  }

  // Convert to domain
  private toDomain(doc: any): Location {
    return {
      _id: doc._id?.toString(),
      name: doc.name,
      slug: doc.slug,
      description: doc.description,
      image: doc.image,
      coordinates: doc.coordinates,
      highlights: doc.highlights,
      amenities: doc.amenities,
      featured: doc.featured,
      propertyCount: doc.propertyCount,
      active: doc.active,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
