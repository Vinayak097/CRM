import Task, { TaskStatus, TaskType, EntityType, type ITask } from "../models/Task.js";
import Activity, { ActivityType, ActivityChannel, ActivityEntityType } from "../models/Activity.js";
import type {
  CreateTaskInput,
  UpdateTaskInput,
  TaskQueryParams
} from "../schemas/task.schema.js";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";

/**
 * Task Service
 * 
 * Handles all task CRUD operations and business logic
 * Database abstraction layer for task management
 */
export class TaskService {
  /**
   * Create a new task
   * 
   * @param input Task creation input
   * @returns Created task document
   */
  static async createTask(input: CreateTaskInput): Promise<ITask> {
    const taskData = {
      ...input,
      taskId: uuidv4(), // Generate unique task ID
      dueAt: typeof input.dueAt === "string" ? new Date(input.dueAt) : input.dueAt,
      assignedAgentId: new mongoose.Types.ObjectId(input.assignedAgentId),
      entityId: new mongoose.Types.ObjectId(input.entityId),
    };

    const task = new Task(taskData);
    await task.save();

    // Create activity entry for the task
    try {
      const entityType = input.entityType.toLowerCase() as ActivityEntityType;
      const activity = new Activity({
        activity_type: ActivityType.TASK_CREATED,
        title: `Task created: ${input.title}`,
        description: input.description || `${input.type} task due ${new Date(input.dueAt).toLocaleDateString()}`,
        channel: ActivityChannel.SYSTEM,
        related_to: {
          type: entityType,
          id: new mongoose.Types.ObjectId(input.entityId),
        },
        performed_by: new mongoose.Types.ObjectId(input.assignedAgentId),
        meta: {
          taskId: task._id,
          taskType: input.type,
          priority: input.priority,
          dueAt: input.dueAt,
        },
      });
      await activity.save();
    } catch (err) {
      console.error("Failed to create activity for task:", err);
    }

    return task.toObject();
  }

  /**
   * Get task by ID
   * 
   * @param taskId Task document ID
   * @returns Task document or null
   */
  static async getTaskById(taskId: string): Promise<ITask | null> {
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return null;
    }

    return Task.findById(taskId)
      .populate("assignedAgentId", "name email role")
      .lean();
  }

  /**
   * Get task by taskId (UUID)
   * 
   * @param taskId Task UUID
   * @returns Task document or null
   */
  static async getTaskByTaskId(taskId: string): Promise<ITask | null> {
    return Task.findOne({ taskId })
      .populate("assignedAgentId", "name email role")
      .lean();
  }

  /**
   * Query tasks with filtering and pagination
   * 
   * @param params Query parameters
   * @returns Paginated task list with metadata
   */
  static async getTasks(params: TaskQueryParams): Promise<{
    tasks: ITask[];
    total: number;
    skip: number;
    limit: number;
  }> {
    const { skip = 0, limit = 20, overdue, ...filters } = params;

    // Build query filter
    const query: Record<string, any> = {};

    if (filters.status) query.status = filters.status;
    if (filters.type) query.type = filters.type;
    if (filters.entityType) query.entityType = filters.entityType;
    if (filters.priority) query.priority = filters.priority;

    if (filters.entityId && mongoose.Types.ObjectId.isValid(filters.entityId)) {
      query.entityId = new mongoose.Types.ObjectId(filters.entityId);
    }

    if (filters.assignedAgentId && mongoose.Types.ObjectId.isValid(filters.assignedAgentId)) {
      query.assignedAgentId = new mongoose.Types.ObjectId(filters.assignedAgentId);
    }

    // Overdue filter: PENDING tasks where dueAt <= now
    if (overdue === true) {
      query.status = TaskStatus.PENDING;
      query.dueAt = { $lte: new Date() };
    }

    // Execute query with pagination
    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate("assignedAgentId", "name email role")
        .sort({ createdAt: -1, dueAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Task.countDocuments(query),
    ]);

    return { tasks, total, skip, limit };
  }

  /**
   * Update task
   * 
   * @param taskId Task document ID
   * @param input Update input
   * @returns Updated task
   */
  static async updateTask(
    taskId: string,
    input: UpdateTaskInput
  ): Promise<ITask | null> {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return null;
    }

    const updateData: Record<string, any> = { ...input };

    // Convert date string to Date object if provided
    if (typeof updateData.dueAt === "string") {
      updateData.dueAt = new Date(updateData.dueAt);
    }

    // Convert IDs to ObjectIds if provided
    if (updateData.assignedAgentId) {
      updateData.assignedAgentId = new mongoose.Types.ObjectId(updateData.assignedAgentId);
    }

    if (updateData.entityId) {
      updateData.entityId = new mongoose.Types.ObjectId(updateData.entityId);
    }

    const task = await Task.findByIdAndUpdate(
      taskId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate("assignedAgentId", "name email role")
      .lean();

    return task;
  }

  /**
   * Update task status
   * 
   * @param taskId Task document ID
   * @param status New status
   * @param completionNotes Optional notes on completion
   * @returns Updated task
   */
  static async updateTaskStatus(
    taskId: string,
    status: TaskStatus,
    completionNotes?: string
  ): Promise<ITask | null> {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return null;
    }

    const updateData: Record<string, any> = {
      status,
      updatedAt: new Date(),
    };

    // Set completedAt when marking as COMPLETED
    if (status === TaskStatus.COMPLETED) {
      updateData.completedAt = new Date();
      if (completionNotes) {
        updateData.completionNotes = completionNotes;
      }
    }

    const task = await Task.findByIdAndUpdate(
      taskId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate("assignedAgentId", "name email role")
      .lean();

    return task;
  }

  /**
   * Delete task
   * 
   * @param taskId Task document ID
   * @returns true if deleted, false if not found
   */
  static async deleteTask(taskId: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return false;
    }

    const result = await Task.findByIdAndDelete(taskId);
    return !!result;
  }

  /**
   * Get tasks for agent dashboard
   * Shows PENDING and OVERDUE tasks for a specific agent
   * 
   * @param agentId Agent user ID
   * @param limit Number of tasks to return
   * @returns List of tasks
   */
  static async getAgentTasks(agentId: string, limit: number = 10): Promise<ITask[]> {
    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      return [];
    }

    return Task.find({
      assignedAgentId: new mongoose.Types.ObjectId(agentId),
      status: { $in: [TaskStatus.PENDING, TaskStatus.OVERDUE] },
    })
      .populate("assignedAgentId", "name email")
      .sort({ dueAt: 1 })
      .limit(limit)
      .lean();
  }

  /**
   * Get overdue tasks for a specific entity
   * Useful for displaying task status in lead/customer profiles
   * 
   * @param entityType Type of entity (LEAD or CUSTOMER)
   * @param entityId Entity ID
   * @returns List of overdue tasks
   */
  static async getOverdueTasksByEntity(
    entityType: EntityType,
    entityId: string
  ): Promise<ITask[]> {
    if (!mongoose.Types.ObjectId.isValid(entityId)) {
      return [];
    }

    return Task.find({
      entityType,
      entityId: new mongoose.Types.ObjectId(entityId),
      status: TaskStatus.OVERDUE,
    })
      .populate("assignedAgentId", "name email")
      .sort({ dueAt: 1 })
      .lean();
  }

  /**
   * Bulk update task status
   * Useful for bulk operations (e.g., mark all tasks complete)
   * 
   * @param taskIds Array of task document IDs
   * @param status New status
   * @returns Number of modified tasks
   */
  static async bulkUpdateStatus(
    taskIds: string[],
    status: TaskStatus
  ): Promise<number> {
    const validIds = taskIds.filter((id) => mongoose.Types.ObjectId.isValid(id));

    if (validIds.length === 0) {
      return 0;
    }

    const result = await Task.updateMany(
      { _id: { $in: validIds.map((id) => new mongoose.Types.ObjectId(id)) } },
      {
        $set: {
          status,
          updatedAt: new Date(),
          ...(status === TaskStatus.COMPLETED && { completedAt: new Date() }),
        },
      }
    );

    return result.modifiedCount;
  }

  /**
   * Get task statistics for dashboard
   * 
   * @param agentId Optional: filter by agent
   * @returns Task statistics
   */
  static async getTaskStats(agentId?: string | string[]): Promise<{
    total: number;
    pending: number;
    overdue: number;
    completed: number;
  }> {
    let query = {};

    if (Array.isArray(agentId)) {
      query = { assignedAgentId: { $in: agentId.map(id => new mongoose.Types.ObjectId(id)) } };
    } else if (agentId && mongoose.Types.ObjectId.isValid(agentId)) {
      query = { assignedAgentId: new mongoose.Types.ObjectId(agentId) };
    }

    const stats = await Task.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", TaskStatus.PENDING] }, 1, 0] },
          },
          overdue: {
            $sum: { $cond: [{ $eq: ["$status", TaskStatus.OVERDUE] }, 1, 0] },
          },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", TaskStatus.COMPLETED] }, 1, 0] },
          },
        },
      },
    ]);

    if (stats.length === 0) {
      return { total: 0, pending: 0, overdue: 0, completed: 0 };
    }

    return stats[0];
  }
}

export default TaskService;
