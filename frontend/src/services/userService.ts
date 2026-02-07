import api from "./api";
import { Role } from "@/types";

export type UserRole = "admin" | "sales_agent" | "onboarding_agent" | "sales_manager" | "business_head" | "developer";

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  assignedLeadsCount: number;
  managedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
  managedBy?: string;
}

export const userService = {
  getUsers: async (
    page = 1,
    limit = 10,
    search = ""
  ): Promise<PaginatedResponse<User>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.append("search", search);
    const response = await api.get(`/users?${params}`);
    return response.data;
  },

  getUserById: async (id: string): Promise<{ data: User }> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (data: CreateUserData): Promise<User> => {
    const response = await api.post("/users", data);
    return response.data;
  },

  updateUser: async (
    id: string,
    data: Partial<CreateUserData>
  ): Promise<User> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
