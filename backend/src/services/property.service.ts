// services/property.service.ts
import { PropertyRepository } from "@/models/property.model.js";
import {
  type CreatePropertyInput,
  type UpdatePropertyInput,
  type QueryPropertyInput,
  type Property,
  propertySchema,
} from "../schemas/property.schema.js";

export class PropertyService {
  private propertyRepository: PropertyRepository;

  constructor() {
    this.propertyRepository = new PropertyRepository();
  }

  async createProperty(data: CreatePropertyInput): Promise<Property> {
    if (data.listing_id) {
      const existing = await this.propertyRepository.findByListingId(
        data.listing_id,
      );
      if (existing) {
        throw new Error(`Property with listing ID ${data.listing_id} already exists`);
      }
    }
    return this.propertyRepository.create({
      ...data,
      isVerified: false, // Start as pending verification
    });
  }

  async approveProperty(id: string): Promise<Property | null> {
    return this.propertyRepository.update(id, {
      isVerified: true,
      published_at: new Date().toISOString(),
    });
  }

  async getPropertyByListingId(listingId: string): Promise<Property | null> {
    return this.propertyRepository.findByListingId(listingId);
  }

  async getPropertyById(id: string): Promise<Property | null> {
    return this.propertyRepository.findById(id);
  }

  async getProperties(query: QueryPropertyInput): Promise<{
    properties: Property[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page, limit, ...filters } = query;
    const skip = (page - 1) * limit;

    // By default, if no is_deleted filter is specified, we might want to return only published ones (0)
    // but in CRM, admins might want to see all. Let's let the controller/middleware handle role-based filtering
    // or just pass through the filter if provided.

    const [properties, total] = await Promise.all([
      this.propertyRepository.find(filters, skip, limit),
      this.propertyRepository.count(filters),
    ]);

    return {
      properties,
      total,
      page,
      limit,
    };
  }

  async updateProperty(
    id: string,
    data: UpdatePropertyInput
  ): Promise<Property | null> {
    return this.propertyRepository.update(id, {
      ...data,
      updated_at: new Date().toISOString(),
    });
  }

  async deleteProperty(id: string): Promise<boolean> {
    return this.propertyRepository.delete(id);
  }

  async incrementViews(id: string): Promise<void> {
    await this.propertyRepository.incrementField(id, "views", 1);
  }

  async getFeaturedProperties(limit: number): Promise<Property[]> {
    return this.propertyRepository.find(
      { featured: true, active: true },
      0,
      limit,
      { created_at: -1 }
    );
  }

  async getPropertiesByLocation(
    locationId: string,
    limit: number
  ): Promise<Property[]> {
    return this.propertyRepository.find(
      { locationId, active: true },
      0,
      limit,
      { created_at: -1 }
    );
  }

  async searchProperties(query: string, limit: number): Promise<Property[]> {
    return this.propertyRepository.search(query, limit);
  }

  async getPropertiesByType(
    type: string,
    query: QueryPropertyInput
  ): Promise<{
    properties: Property[];
    total: number;
    page: number;
    limit: number;
  }> {
    const filters = { ...query, propertyType: type };
    return this.getProperties(filters);
  }
}
