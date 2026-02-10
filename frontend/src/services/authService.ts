import api from "./api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: "admin" | "developer" | "sales_agent" | "sales_manager" | "onboarding_agent" | "business_head";
}

export interface OnboardingItem {
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  rejectionReason?: string;
  updatedAt: string;
}

export interface AssignedProperty extends OnboardingItem {
  propertyId: string;
}

export interface AssignedProject extends OnboardingItem {
  projectId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "developer" | "sales_agent" | "sales_manager" | "onboarding_agent" | "business_head";
  isActive?: boolean;
  lastLogin?: string | null;
  assignedProperties?: AssignedProperty[];
  assignedProjects?: AssignedProject[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
}

export interface VerifySessionResponse {
  valid: boolean;
  user: User;
}

export const authService = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/register", data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", data);
    return response.data;
  },

  verifySession: async (): Promise<VerifySessionResponse> => {
    const response = await api.get<VerifySessionResponse>("/auth/verify");
    return response.data;
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    const response = await api.get<{ user: User }>("/auth/me");
    return response.data;
  },

  logout: async (): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>("/auth/logout");
    return response.data;
  },
};

export default authService;
