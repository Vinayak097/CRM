export interface Developer {
  _id: string;
  id: string;
  developer_name: string;
  developer_logo_url: string | null;
  developer_rating: number;
  developer_previous_projects: string[];
  developer_contact: {
    email: string | null;
    phone: string | null;
  };
  reputation: string;
  esgComplianceScore: number;
  projects: string[];
  properties: string[];
  created_at: string;
  updated_at: string;
  active: boolean;
}

export interface CreateDeveloperInput {
  developer_name: string;
  developer_logo_url?: string | null;
  developer_rating?: number;
  developer_previous_projects?: string[];
  developer_contact?: {
    email?: string | null;
    phone?: string | null;
  };
  reputation?: string;
  esgComplianceScore?: number;
  projects?: string[];
  properties?: string[];
  active?: boolean;
}

export interface UpdateDeveloperInput extends Partial<CreateDeveloperInput> {}
