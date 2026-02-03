import express, { Router, Request, Response, NextFunction } from "express";
import { authenticateToken } from "../middlewares/auth.js";
import communicationService from "../services/communication.service.js";
import activityService from "../services/activity.service.js";
import {
  createCommunicationSchema,
  updateCommunicationSchema,
  communicationQuerySchema,
  createActivitySchema,
  activityQuerySchema,
} from "../schemas/communication.schema.js";

const router = Router();

/**
 * Communication Routes
 */

/**
 * POST /api/communications
 * Create a new communication
 */
router.post(
  "/",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validationResult = createCommunicationSchema.safeParse(req.body);
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

      const communication = await communicationService.createCommunication(
        validationResult.data,
        (req as any).user.id
      );

      res.status(201).json({
        success: true,
        data: communication,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/communications
 * Get communications with filtering
 */
router.get(
  "/",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validationResult = communicationQuerySchema.safeParse(req.query);
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

      const result = await communicationService.getCommunications(
        validationResult.data
      );

      res.status(200).json({
        success: true,
        data: result.communications,
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
 * GET /api/communications/:id
 * Get a specific communication
 */
router.get(
  "/:id",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const communication = await communicationService.getCommunicationById(
        req.params.id
      );

      if (!communication) {
        return res.status(404).json({
          success: false,
          message: "Communication not found",
        });
      }

      res.status(200).json({
        success: true,
        data: communication,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/communications/:id
 * Update a communication
 */
router.patch(
  "/:id",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validationResult = updateCommunicationSchema.safeParse(req.body);
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

      const communication = await communicationService.updateCommunication(
        req.params.id,
        validationResult.data
      );

      if (!communication) {
        return res.status(404).json({
          success: false,
          message: "Communication not found",
        });
      }

      res.status(200).json({
        success: true,
        data: communication,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/communications/:id
 * Delete a communication
 */
router.delete(
  "/:id",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const success = await communicationService.deleteCommunication(
        req.params.id
      );

      if (!success) {
        return res.status(404).json({
          success: false,
          message: "Communication not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Communication deleted",
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/communications/entity/:entityType/:entityId
 * Get communications for a specific entity
 */
router.get(
  "/entity/:entityType/:entityId",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const communications =
        await communicationService.getCommunicationsByEntity(
          req.params.entityType,
          req.params.entityId
        );

      res.status(200).json({
        success: true,
        data: communications,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/communications/search/:query
 * Search communications
 */
router.get(
  "/search/:query",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const results = await communicationService.searchCommunications(
        req.params.query
      );

      res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/communications/stats/user
 * Get communication statistics for current user
 */
router.get(
  "/stats/user",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await communicationService.getStatistics((req as any).user.id);

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
 * Activity Routes (Timeline)
 */

/**
 * POST /api/activities
 * Create a new activity
 */
router.post(
  "/activities",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validationResult = createActivitySchema.safeParse(req.body);
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

      const activity = await activityService.createActivity(
        validationResult.data,
        (req as any).user.id
      );

      res.status(201).json({
        success: true,
        data: activity,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/activities
 * Get activities with filtering
 */
router.get(
  "/activities",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validationResult = activityQuerySchema.safeParse(req.query);
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

      const result = await activityService.getActivities(validationResult.data);

      res.status(200).json({
        success: true,
        data: result.activities,
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
 * GET /api/activities/entity/:entityType/:entityId
 * Get timeline for a specific entity
 */
router.get(
  "/activities/entity/:entityType/:entityId",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const activities = await activityService.getEntityTimeline(
        req.params.entityType,
        req.params.entityId
      );

      res.status(200).json({
        success: true,
        data: activities,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
