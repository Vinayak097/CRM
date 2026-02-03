import api from "./api";

export type CommunicationChannel = "email" | "whatsapp" | "call" | "sms";
export type CommunicationDirection = "inbound" | "outbound";
export type CommunicationStatus = "sent" | "delivered" | "read" | "failed";

export interface Communication {
  _id: string;
  channel: CommunicationChannel;
  direction: CommunicationDirection;
  subject?: string;
  message: string;
  status: CommunicationStatus;
  from: {
    name: string;
    email?: string;
    phone?: string;
  };
  to: Array<{
    name: string;
    email?: string;
    phone?: string;
  }>;
  related_to: {
    type: string;
    id: string;
  };
  attachments?: Array<{
    file_name: string;
    file_url: string;
    file_type: string;
  }>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCommunicationInput {
  channel: CommunicationChannel;
  direction: CommunicationDirection;
  subject?: string;
  message: string;
  from: {
    name: string;
    email?: string;
    phone?: string;
  };
  to: Array<{
    name: string;
    email?: string;
    phone?: string;
  }>;
  related_to: {
    type: string;
    id: string;
  };
}

export interface CommunicationQueryParams {
  channel?: CommunicationChannel;
  direction?: CommunicationDirection;
  status?: CommunicationStatus;
  skip?: number;
  limit?: number;
}

export const communicationService = {
  getCommunications: async (params?: CommunicationQueryParams) => {
    const response = await api.get<{
      success: boolean;
      data: Communication[];
      pagination: { total: number; skip: number; limit: number; pages: number };
    }>("/communications", { params });
    return response.data;
  },

  getCommunicationById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Communication }>(
      `/communications/${id}`
    );
    return response.data.data;
  },

  createCommunication: async (data: CreateCommunicationInput) => {
    const response = await api.post<{ success: boolean; data: Communication }>(
      "/communications",
      data
    );
    return response.data.data;
  },

  deleteCommunication: async (id: string) => {
    const response = await api.delete(`/communications/${id}`);
    return response.data;
  },

  getCommunicationsByEntity: async (entityType: string, entityId: string) => {
    const response = await api.get<{ success: boolean; data: Communication[] }>(
      `/communications/entity/${entityType}/${entityId}`
    );
    return response.data.data;
  },
};

export default communicationService;
