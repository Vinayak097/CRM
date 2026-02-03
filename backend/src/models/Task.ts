import mongoose, { Schema, Document } from "mongoose";

/**
 * Task Status Enum
 * - PENDING: Task waiting to be processed
 * - COMPLETED: Task successfully completed
 * - OVERDUE: Task past due date (marked by scheduler)
 */
export enum TaskStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  OVERDUE = "OVERDUE",
}

/**
 * Task Type Enum
 * Defines the nature/purpose of the task
 */
export enum TaskType {
  FOLLOW_UP = "FOLLOW_UP",
  CALL = "CALL",
  MEETING = "MEETING",
  SYSTEM_CHECK = "SYSTEM_CHECK",
}

/**
 * Entity Type Enum
 * Defines what entity this task is associated with
 */
export enum EntityType {
  LEAD = "LEAD",
  CUSTOMER = "CUSTOMER",
}

/**
 * ITask Interface
 * Defines the Task document structure for TypeScript
 */
export interface ITask extends Document {
  // Task identifier and metadata
  taskId: string; // UUID for external references
  type: TaskType;
  status: TaskStatus;
  
  // Timing
  dueAt: Date; // ISO datetime when task is due
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date | null;
  
  // Assignment and entity reference
  assignedAgentId: mongoose.Types.ObjectId; // Reference to User
  entityType: EntityType;
  entityId: mongoose.Types.ObjectId; // Reference to Lead or Customer
  
  // Task details
  title: string;
  description?: string;
  priority: "LOW" | "MEDIUM" | "HIGH"; // Default: MEDIUM
  
  // Google Calendar integration (optional, non-blocking)
  googleEventId?: string | null;
  googleSyncEnabled: boolean;
  lastSyncAt?: Date | null;
  googleSyncError?: string | null;
  
  // Audit trail
  notes?: string;
  completionNotes?: string | null;
}

/**
 * Task Schema
 * MongoDB schema for task persistence
 * 
 * Indexes:
 * - (status, dueAt): For finding overdue tasks efficiently
 * - (entityType, entityId): For querying tasks by entity
 * - (assignedAgentId, status): For agent dashboards
 */
const taskSchema = new Schema<ITask>(
  {
    taskId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(TaskType),
      required: [true, "Task type is required"],
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.PENDING,
      index: true,
    },
    dueAt: {
      type: Date,
      required: [true, "Due date is required"],
      index: true,
    },
    assignedAgentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Assigned agent is required"],
      index: true,
    },
    entityType: {
      type: String,
      enum: Object.values(EntityType),
      required: [true, "Entity type is required"],
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Entity ID is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },
    // Google Calendar integration fields
    googleEventId: {
      type: String,
      default: null,
      sparse: true, // Allow multiple null values
    },
    googleSyncEnabled: {
      type: Boolean,
      default: false,
    },
    lastSyncAt: {
      type: Date,
      default: null,
    },
    googleSyncError: {
      type: String,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
    },
    completionNotes: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

/**
 * Compound indexes for efficient querying
 * These are critical for the scheduler's performance
 */
taskSchema.index({ status: 1, dueAt: 1 }); // Find overdue tasks efficiently
taskSchema.index({ entityType: 1, entityId: 1 }); // Query tasks by entity
taskSchema.index({ assignedAgentId: 1, status: 1 }); // Agent dashboard queries

export default mongoose.model<ITask>("Task", taskSchema);
