import api from "./api";

export interface Lead {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  source: "Portal" | "Website" | "Referral" | "Social" | "Walk-in";
  budgetRange?: "<50L" | "50-75L" | "75L-1Cr" | "1Cr+";
  classification: "Cold" | "Warm" | "Hot" | "Void";
  voidReason?: string;
  customVoidReason?: string;
  assignedAgent?: {
    _id: string;
    name: string;
    email: string;
  };
  isDuplicate: boolean;
  duplicateTag?: string;
  lastContactedAt?: string;
  isConverted: boolean;
  createdAt: string;
  updatedAt: string;
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

export interface CreateLeadData {
  name: string;
  phone: string;
  email?: string;
  source?: string;
  budgetRange?: string;
  assignedAgent?: string;
}

export const leadService = {
  getLeads: async (
    page = 1,
    limit = 10,
    search = ""
  ): Promise<PaginatedResponse<Lead>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.append("search", search);
    const response = await api.get(`/leads?${params}`);
    return response.data;
  },

  getLeadById: async (id: string): Promise<{ data: Lead }> => {
    const response = await api.get(`/leads/${id}`);
    return response.data;
  },

  createLead: async (data: CreateLeadData): Promise<Lead> => {
    const response = await api.post("/leads", data);
    return response.data;
  },

  updateLead: async (
    id: string,
    data: Partial<CreateLeadData & { classification?: string ,voidReson?:string,customVoidReason?:string }>
  ): Promise<Lead> => {
    const response = await api.put(`/leads/${id}`, data);
    return response.data;
  },

  assignAgent: async (leadId: string, agentId: string): Promise<Lead> => {
    const response = await api.post(`/leads/${leadId}/assign`, { agentId });
    return response.data;
  },
};
