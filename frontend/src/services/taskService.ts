import api from "./api";

export type TaskStatus = "PENDING" | "COMPLETED" | "OVERDUE";
export type TaskType = "FOLLOW_UP" | "CALL" | "MEETING" | "SYSTEM_CHECK";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Task {
  _id: string;
  taskId: string;
  type: TaskType;
  status: TaskStatus;
  dueAt: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  assignedAgentId: {
    _id: string;
    name: string;
    email: string;
  };
  entityType: "LEAD" | "CUSTOMER";
  entityId: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  notes?: string;
  completionNotes?: string;
}

export interface CreateTaskInput {
  type: TaskType;
  dueAt: string;
  assignedAgentId: string;
  entityType: "LEAD" | "CUSTOMER";
  entityId: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  notes?: string;
}

export interface TaskQueryParams {
  status?: TaskStatus;
  type?: TaskType;
  assignedAgentId?: string;
  entityType?: string;
  entityId?: string;
  skip?: number;
  limit?: number;
}

export const taskService = {
  getTasks: async (params?: TaskQueryParams) => {
    const response = await api.get<{
      success: boolean;
      data: Task[];
      pagination: { total: number; skip: number; limit: number; pages: number };
    }>("/tasks", { params });
    return response.data;
  },

  getTaskById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Task }>(
      `/tasks/${id}`
    );
    return response.data.data;
  },

  createTask: async (data: CreateTaskInput) => {
    const response = await api.post<{ success: boolean; data: Task }>(
      "/tasks",
      data
    );
    return response.data.data;
  },

  updateTask: async (id: string, data: Partial<CreateTaskInput>) => {
    const response = await api.patch<{ success: boolean; data: Task }>(
      `/tasks/${id}`,
      data
    );
    return response.data.data;
  },

  updateTaskStatus: async (id: string, status: TaskStatus, completionNotes?: string) => {
    const response = await api.patch<{ success: boolean; data: Task }>(
      `/tasks/${id}/status`,
      { status, completionNotes }
    );
    return response.data.data;
  },

  completeTask: async (id: string, completionNotes?: string) => {
    const response = await api.patch<{ success: boolean; data: Task }>(
      `/tasks/${id}/status`,
      { status: "COMPLETED", completionNotes }
    );
    return response.data.data;
  },

  deleteTask: async (id: string) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  getMyTasks: async () => {
    const response = await api.get<{ success: boolean; data: Task[] }>("/tasks/my");
    return response.data.data;
  },

  getTaskStats: async (agentId?: string) => {
    const response = await api.get<{
      success: boolean;
      data: { total: number; pending: number; overdue: number; completed: number };
    }>("/tasks/stats", { params: { agentId } });
    return response.data;
  },
};

export default taskService;
