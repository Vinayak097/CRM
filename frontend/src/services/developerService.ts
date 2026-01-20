import api from "./api";
import type { Developer, CreateDeveloperInput, UpdateDeveloperInput } from "../types/developer";

export const developerService = {
  getAll: async (params?: { search?: string; active?: boolean }) => {
    const response = await api.get("/developers", { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/developers/${id}`);
    return response.data;
  },

  create: async (data: CreateDeveloperInput) => {
    const response = await api.post("/developers", data);
    return response.data;
  },

  update: async (id: string, data: UpdateDeveloperInput) => {
    const response = await api.put(`/developers/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/developers/${id}`);
    return response.data;
  },
};
