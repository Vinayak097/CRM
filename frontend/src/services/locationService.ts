import api from "./api";
import type { Location, CreateLocationInput, UpdateLocationInput } from "../types/location";

export const locationService = {
  searchLocations: async (q: string, limit: number = 10) => {
    const response = await api.get(
      `/locations/search?q=${encodeURIComponent(q)}&limit=${limit}`,
    );
    return response.data; 
  },
  
  getAll: async (params?: { search?: string; featured?: boolean; active?: boolean }) => {
    const response = await api.get("/locations", { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/locations/${id}`);
    return response.data;
  },

  create: async (data: CreateLocationInput) => {
    const response = await api.post("/locations", data);
    return response.data;
  },

  update: async (id: string, data: UpdateLocationInput) => {
    const response = await api.put(`/locations/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/locations/${id}`);
    return response.data;
  },
};

