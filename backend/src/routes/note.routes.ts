import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { authenticateToken } from "../middlewares/auth.js";
import noteService from "../services/note.service.js";
import { NoteVisibility, NoteEntityType } from "../models/Note.js";

const router = Router();

// Validation schemas
const createNoteSchema = z.object({
  content: z.string().min(1, "Content is required").trim(),
  entity_type: z.nativeEnum(NoteEntityType),
  entity_id: z.string().min(1, "Entity ID is required"),
  visibility: z.nativeEnum(NoteVisibility).optional(),
  is_pinned: z.boolean().optional(),
  tags: z.array(z.string().trim()).optional(),
});

const updateNoteSchema = z.object({
  content: z.string().min(1).trim().optional(),
  visibility: z.nativeEnum(NoteVisibility).optional(),
  is_pinned: z.boolean().optional(),
  tags: z.array(z.string().trim()).optional(),
});

/**
 * POST /api/notes
 * Create a new note
 */
router.post(
  "/",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validationResult = createNoteSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationResult.error.issues,
        });
      }

      const note = await noteService.createNote(
        validationResult.data,
        (req as any).user.id
      );

      res.status(201).json({
        success: true,
        data: note,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/notes/entity/:entityType/:entityId
 * Get notes for an entity with role-based access
 */
router.get(
  "/entity/:entityType/:entityId",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { entityType, entityId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const user = (req as any).user;

      const notes = await noteService.getEntityNotes(
        entityType as NoteEntityType,
        entityId,
        user.id,
        user.role,
        limit
      );

      res.json({
        success: true,
        data: notes,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/notes/:id
 * Update a note
 */
router.put(
  "/:id",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validationResult = updateNoteSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationResult.error.issues,
        });
      }

      const user = (req as any).user;
      const note = await noteService.updateNote(
        req.params.id,
        user.id,
        user.role,
        validationResult.data
      );

      if (!note) {
        return res.status(404).json({
          success: false,
          message: "Note not found",
        });
      }

      res.json({
        success: true,
        data: note,
      });
    } catch (error: any) {
      if (error.message === "Not authorized to update this note") {
        return res.status(403).json({ success: false, message: error.message });
      }
      next(error);
    }
  }
);

/**
 * DELETE /api/notes/:id
 * Delete a note
 */
router.delete(
  "/:id",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const deleted = await noteService.deleteNote(
        req.params.id,
        user.id,
        user.role
      );

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Note not found",
        });
      }

      res.json({
        success: true,
        message: "Note deleted",
      });
    } catch (error: any) {
      if (error.message === "Not authorized to delete this note") {
        return res.status(403).json({ success: false, message: error.message });
      }
      next(error);
    }
  }
);

/**
 * PATCH /api/notes/:id/pin
 * Toggle pin status
 */
router.patch(
  "/:id/pin",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const note = await noteService.togglePin(req.params.id, user.id, user.role);

      if (!note) {
        return res.status(404).json({
          success: false,
          message: "Note not found",
        });
      }

      res.json({
        success: true,
        data: note,
      });
    } catch (error: any) {
      if (error.message === "Not authorized to pin this note") {
        return res.status(403).json({ success: false, message: error.message });
      }
      next(error);
    }
  }
);

export default router;
