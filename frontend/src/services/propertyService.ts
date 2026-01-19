import api from "./api";
import type { Property, PropertyStatus } from "../types/property";

export type { Property, PropertyStatus };

export interface QueryPropertyParams {
  page?: number;
  limit?: number;
  search?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  locationId?: string;
  status?: PropertyStatus;
  featured?: boolean;
  active?: boolean;
  tags?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export type CreatePropertyData = Omit<Property, "_id" | "created_at" | "updated_at" | "createdAt" | "updatedAt">;

export const propertyService = {
  getProperties: async (
    params: QueryPropertyParams = {},
  ): Promise<PaginatedResponse<Property>> => {
    const queryParams = new URLSearchParams();
    // Always include page and limit (required by backend schema)
    queryParams.append("page", (params.page || 1).toString());
    queryParams.append("limit", (params.limit || 20).toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.propertyType)
      queryParams.append("propertyType", params.propertyType);
    if (params.minPrice)
      queryParams.append("minPrice", params.minPrice.toString());
    if (params.maxPrice)
      queryParams.append("maxPrice", params.maxPrice.toString());
    if (params.minArea)
      queryParams.append("minArea", params.minArea.toString());
    if (params.maxArea)
      queryParams.append("maxArea", params.maxArea.toString());
    if (params.locationId) queryParams.append("locationId", params.locationId);
    if (params.status) queryParams.append("status", params.status);
    if (params.featured !== undefined)
      queryParams.append("featured", params.featured.toString());
    if (params.active !== undefined)
      queryParams.append("active", params.active.toString());
    if (params.tags) queryParams.append("tags", params.tags);

    const response = await api.get(`/properties?${queryParams}`);
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  },

  getPropertyById: async (id: string): Promise<{ data: Property }> => {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  },

  createProperty: async (
    data: CreatePropertyData,
  ): Promise<{ data: Property; message: string }> => {
    const response = await api.post("/properties", data);
    return response.data;
  },

  updateProperty: async (
    id: string,
    data: Partial<CreatePropertyData>,
  ): Promise<{ data: Property; message: string }> => {
    const response = await api.put(`/properties/${id}`, data);
    return response.data;
  },

  deleteProperty: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/properties/${id}`);
    return response.data;
  },

  getFeaturedProperties: async (limit: number = 6): Promise<Property[]> => {
    const response = await api.get(`/properties/featured?limit=${limit}`);
    return response.data.data;
  },

  searchProperties: async (
    query: string,
    limit: number = 10,
  ): Promise<Property[]> => {
    const response = await api.get(
      `/properties/search?q=${encodeURIComponent(query)}&limit=${limit}`,
    );
    return response.data.data;
  },

  getPropertiesByType: async (
    type: string,
    params: QueryPropertyParams = {},
  ): Promise<PaginatedResponse<Property>> => {
    const queryParams = new URLSearchParams();
    // Always include page and limit (required by backend schema)
    queryParams.append("page", (params.page || 1).toString());
    queryParams.append("limit", (params.limit || 20).toString());
    if (params.search) queryParams.append("search", params.search);

    const response = await api.get(`/properties/type/${type}?${queryParams}`);
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  },

  getPropertiesByLocation: async (
    locationId: string,
    limit: number = 10,
  ): Promise<Property[]> => {
    const response = await api.get(
      `/properties/location/${locationId}?limit=${limit}`,
    );
    return response.data.data;
  },
};
