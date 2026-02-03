import express, { Router, Request, Response, NextFunction } from "express";
import { authenticateToken } from "../middlewares/auth.js";
import TaskService from "../services/task.service.js";
import GoogleCalendarService from "../services/googleCalendar.service.js";
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  taskQuerySchema,
} from "../schemas/task.schema.js";
import { ZodError } from "zod";

const router = Router();

/**
 * Task Routes
 * 
 * All routes require authentication
 * Validation is performed using Zod schemas
 */

/**
 * POST /api/tasks
 * Create a new task
 * 
 * Body:
 * {
 *   type: "FOLLOW_UP" | "CALL" | "MEETING" | "SYSTEM_CHECK",
 *   dueAt: ISO datetime,
 *   assignedAgentId: ObjectId,
 *   entityType: "LEAD" | "CUSTOMER",
 *   entityId: ObjectId,
 *   title: string,
 *   description?: string,
 *   priority?: "LOW" | "MEDIUM" | "HIGH",
 *   googleSyncEnabled?: boolean
 * }
 */
router.post("/", authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const validationResult = createTaskSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.issues.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }

    // Create task
    const task = await TaskService.createTask(validationResult.data);

    // Optionally sync with Google Calendar (non-blocking)
    if (validationResult.data.googleSyncEnabled) {
      // In production, get agent email from DB
      const agentEmail = "agent@example.com";
      GoogleCalendarService.syncTaskWithCalendar(
        task._id.toString(),
        agentEmail,
        undefined,
        "create"
      ).catch((error) => {
        console.error("[TASKS] Calendar sync failed:", error);
        // Don't block task creation if calendar sync fails
      });
    }

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tasks
 * Query tasks with filtering and pagination
 * 
 * Query parameters:
 * - status: PENDING | COMPLETED | OVERDUE
 * - type: FOLLOW_UP | CALL | MEETING | SYSTEM_CHECK
 * - entityType: LEAD | CUSTOMER
 * - entityId: ObjectId
 * - assignedAgentId: ObjectId
 * - priority: LOW | MEDIUM | HIGH
 * - overdue: true | false (find PENDING tasks past due date)
 * - skip: number (default: 0)
 * - limit: number (default: 20, max: 100)
 */
router.get(
  "/",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate query parameters
      const validationResult = taskQuerySchema.safeParse(req.query);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationResult.error.issues.map((err: any) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }

      // Get tasks
      const result = await TaskService.getTasks(validationResult.data);

      res.status(200).json({
        success: true,
        data: result.tasks,
        pagination: {
          total: result.total,
          skip: result.skip,
          limit: result.limit,
          pages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/tasks/agent/:agentId
 * Get tasks assigned to specific agent
 * 
 * Returns PENDING and OVERDUE tasks, sorted by due date
 */
router.get(
  "/agent/:agentId",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { agentId } = req.params;

      const tasks = await TaskService.getAgentTasks(agentId, 20);

      res.status(200).json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/tasks/stats
 * Get task statistics
 * 
 * Query parameters:
 * - agentId?: ObjectId (filter by agent)
 * 
 * Returns: { total, pending, overdue, completed }
 */
router.get(
  "/stats",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { agentId } = req.query;

      const stats = await TaskService.getTaskStats(
        typeof agentId === "string" ? agentId : undefined
      );

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/tasks/:taskId
 * Get single task by ID
 */
router.get(
  "/:taskId",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { taskId } = req.params;

      const task = await TaskService.getTaskById(taskId);

      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/tasks/:taskId
 * Update task
 * 
 * All fields are optional
 */
router.patch(
  "/:taskId",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { taskId } = req.params;

      // Validate request body
      const validationResult = updateTaskSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationResult.error.issues.map((err: any) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }

      // Update task
      const task = await TaskService.updateTask(taskId, validationResult.data);

      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      // Sync with Google Calendar if needed (non-blocking)
      if (validationResult.data.dueAt || validationResult.data.title) {
        GoogleCalendarService.syncTaskWithCalendar(
          taskId,
          "agent@example.com",
          undefined,
          "update"
        ).catch((error) => {
          console.error("[TASKS] Calendar sync failed:", error);
        });
      }

      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/tasks/:taskId/status
 * Update task status (mark complete, overdue, etc)
 * 
 * Body:
 * {
 *   status: "PENDING" | "COMPLETED" | "OVERDUE",
 *   completionNotes?: string
 * }
 */
router.patch(
  "/:taskId/status",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { taskId } = req.params;

      // Validate request body
      const validationResult = updateTaskStatusSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationResult.error.issues.map((err: any) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }

      // Update status
      const task = await TaskService.updateTaskStatus(
        taskId,
        validationResult.data.status,
        validationResult.data.completionNotes
      );

      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/tasks/:taskId/sync-calendar
 * Manually sync task with Google Calendar
 * 
 * Body:
 * {
 *   agentEmail: string,
 *   accessToken?: string,
 *   operation: "create" | "update" | "delete"
 * }
 */
router.post(
  "/:taskId/sync-calendar",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { taskId } = req.params;
      const { agentEmail, accessToken, operation = "create" } = req.body;

      if (!agentEmail) {
        return res.status(400).json({
          success: false,
          message: "agentEmail is required",
        });
      }

      const task = await GoogleCalendarService.syncTaskWithCalendar(
        taskId,
        agentEmail,
        accessToken,
        operation
      );

      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found or sync failed",
        });
      }

      res.status(200).json({
        success: true,
        data: task,
        message: `Calendar sync ${operation} completed`,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/tasks/:taskId
 * Delete task (and remove from Google Calendar if applicable)
 */
router.delete(
  "/:taskId",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { taskId } = req.params;

      // Get task to check for Google Calendar event
      const task = await TaskService.getTaskById(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      // Delete from Google Calendar if applicable (non-blocking)
      if (task.googleEventId) {
        GoogleCalendarService.syncTaskWithCalendar(
          taskId,
          "agent@example.com",
          undefined,
          "delete"
        ).catch((error) => {
          console.error("[TASKS] Calendar deletion failed:", error);
        });
      }

      // Delete task from database
      const deleted = await TaskService.deleteTask(taskId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Task deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/tasks/bulk/status
 * Bulk update task status
 * 
 * Body:
 * {
 *   taskIds: string[],
 *   status: "PENDING" | "COMPLETED" | "OVERDUE"
 * }
 */
router.post(
  "/bulk/status",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { taskIds, status } = req.body;

      if (!Array.isArray(taskIds) || taskIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "taskIds must be a non-empty array",
        });
      }

      const count = await TaskService.bulkUpdateStatus(taskIds, status);

      res.status(200).json({
        success: true,
        data: {
          updated: count,
          total: taskIds.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
