import { z } from "zod";
import { TaskType, TaskStatus, EntityType } from "../models/Task.js";
import mongoose from "mongoose";

/**
 * Zod Validation Schemas for Task Management
 * 
 * These schemas provide runtime validation and type safety for:
 * - Creating tasks
 * - Updating tasks
 * - Querying tasks
 * - API request/response validation
 */

/**
 * Base task schema with common fields
 */
const baseTaskSchema = z.object({
  type: z.nativeEnum(TaskType),
  dueAt: z.string().datetime().or(z.date()),
  assignedAgentId: z.string().min(1, "Agent ID is required").refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid agent ID format",
  }),
  entityType: z.nativeEnum(EntityType),
  entityId: z.string().min(1, "Entity ID is required").refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid entity ID format",
  }),
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title cannot exceed 200 characters")
    .trim(),
  description: z
    .string()
    .max(2000, "Description cannot exceed 2000 characters")
    .trim()
    .optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  googleSyncEnabled: z.boolean().default(false),
  notes: z.string().trim().optional(),
});

/**
 * Schema for creating a new task
 * POST /api/tasks
 */
export const createTaskSchema = baseTaskSchema.strict().partial({
  priority: true,
  googleSyncEnabled: true,
  description: true,
  notes: true,
});

/**
 * Schema for updating a task
 * PATCH /api/tasks/:id
 * All fields are optional
 */
export const updateTaskSchema = baseTaskSchema.partial();

/**
 * Schema for task status update (mark complete, overdue, etc)
 * PATCH /api/tasks/:id/status
 */
export const updateTaskStatusSchema = z.object({
  status: z.nativeEnum(TaskStatus),
  completionNotes: z.string().trim().optional(),
});

/**
 * Schema for task query filters
 * GET /api/tasks?status=PENDING&assignedAgentId=xxx
 */
export const taskQuerySchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  type: z.nativeEnum(TaskType).optional(),
  entityType: z.nativeEnum(EntityType).optional(),
  entityId: z.string().optional(),
  assignedAgentId: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  overdue: z.union([z.literal("true"), z.literal("false")]).transform((val) => val === "true").optional(),
  skip: z.union([z.number(), z.string().transform(Number)]).default(0),
  limit: z.union([z.number(), z.string().transform(Number)]).default(20),
});

/**
 * Schema for Google Calendar sync configuration
 * POST /api/tasks/:id/sync-calendar
 */
export const taskGoogleSyncSchema = z.object({
  googleEventId: z.string().optional(),
  lastSyncAt: z.string().datetime({ offset: true }).optional(),
  syncError: z.string().optional(),
});

/**
 * Type inference for TypeScript
 * Exported for use in controllers and services
 */
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
export type TaskQueryParams = z.infer<typeof taskQuerySchema>;
export type TaskGoogleSyncInput = z.infer<typeof taskGoogleSyncSchema>;
