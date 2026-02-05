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

export type ActivityType =
  | "email_sent"
  | "email_received"
  | "whatsapp_sent"
  | "whatsapp_received"
  | "call_logged"
  | "call_received"
  | "site_visit"
  | "note_added"
  | "task_created"
  | "status_changed"
  | "meeting_scheduled";

export type ActivityChannel = "email" | "whatsapp" | "call" | "sms" | "system";

export interface Activity {
  _id: string;
  activity_type: ActivityType;
  title: string;
  description?: string;
  channel: ActivityChannel;
  related_to: {
    type: string;
    id: string;
  };
  communication_id?: string;
  performed_by?: {
    _id: string;
    name: string;
    email: string;
  };
  assigned_to?: {
    _id: string;
    name: string;
    email: string;
  };
  meta?: Record<string, any>;
  created_at: string;
}

export interface CreateActivityInput {
  activity_type: ActivityType;
  title: string;
  description?: string;
  channel: ActivityChannel;
  related_to: {
    type: "lead" | "customer" | "deal" | "property";
    id: string;
  };
  meta?: Record<string, any>;
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

  // Activity methods
  getEntityTimeline: async (entityType: string, entityId: string, limit = 50) => {
    const response = await api.get<{ success: boolean; data: Activity[] }>(
      `/communications/activities/entity/${entityType}/${entityId}`,
      { params: { limit } }
    );
    return response;
  },

  createActivity: async (data: CreateActivityInput) => {
    const response = await api.post<{ success: boolean; data: Activity }>(
      "/communications/activities",
      data
    );
    return response.data.data;
  },

  getActivities: async (params?: { entityType?: string; entityId?: string; limit?: number }) => {
    const response = await api.get<{
      success: boolean;
      data: { activities: Activity[]; total: number };
    }>("/communications/activities", { params });
    return response.data;
  },
};

export default communicationService;
