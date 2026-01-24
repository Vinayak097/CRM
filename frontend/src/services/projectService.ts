import api from "./api";
import type { PropertyProject, ProjectStatus } from "../types/project";

export interface QueryProjectParams {
    page?: number;
    limit?: number;
    project_status?: ProjectStatus;
    project_type?: string;
    location_id?: string;
    developer_id?: string;
    min_price?: string;
    max_price?: string;
    search?: string;
    sort?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const projectService = {
    getProjects: async (
        params: QueryProjectParams = {},
    ): Promise<PaginatedResponse<PropertyProject>> => {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.project_status) queryParams.append("project_status", params.project_status);
        if (params.project_type) queryParams.append("project_type", params.project_type);
        if (params.location_id) queryParams.append("location_id", params.location_id);
        if (params.developer_id) queryParams.append("developer_id", params.developer_id);
        if (params.min_price) queryParams.append("min_price", params.min_price);
        if (params.max_price) queryParams.append("max_price", params.max_price);
        if (params.search) queryParams.append("search", params.search);
        if (params.sort) queryParams.append("sort", params.sort);

        const response = await api.get(`/projects?${queryParams}`);
        return {
            data: response.data.data,
            pagination: response.data.pagination,
        };
    },

    getProjectById: async (id: string): Promise<{ data: PropertyProject }> => {
        const response = await api.get(`/projects/${id}`);
        return response.data;
    },

    createProject: async (
        data: Partial<PropertyProject>,
    ): Promise<{ data: PropertyProject; message: string }> => {
        const response = await api.post("/projects", data);
        return response.data;
    },

    updateProject: async (
        id: string,
        data: Partial<PropertyProject>,
    ): Promise<{ data: PropertyProject; message: string }> => {
        const response = await api.put(`/projects/${id}`, data);
        return response.data;
    },

    deleteProject: async (id: string, permanent: boolean = false): Promise<{ message: string }> => {
        const response = await api.delete(`/projects/${id}?permanent=${permanent}`);
        return response.data;
    },

    getLuxuryProjects: async (): Promise<{ data: PropertyProject[]; count: number }> => {
        const response = await api.get("/projects/luxury");
        return response.data;
    },

    getProjectsByDeveloper: async (developerId: string): Promise<{ data: PropertyProject[]; count: number }> => {
        const response = await api.get(`/projects/developer/${developerId}`);
        return response.data;
    },

    bulkCreateProjects: async (projects: Partial<PropertyProject>[]): Promise<{ data: PropertyProject[]; message: string }> => {
        const response = await api.post("/projects/bulk", { projects });
        return response.data;
    }
};
