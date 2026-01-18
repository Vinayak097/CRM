// middlewares/validation.middleware.ts
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

// Use the base ZodSchema type which accepts any Zod schema
export const validateRequest = (
  schema: z.ZodSchema<any>, // Accept any Zod schema
  property: "body" | "query" | "params" = "body",
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Use safeParse so we can return structured validation errors
    const result = schema.safeParse(req[property]);
    if (!result.success) {
      const raw = result.error?.issues || [];
      const errors = raw.map((e) => ({
        path: Array.isArray(e.path) && e.path.length ? e.path.join(".") : "",
        message: e.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    // If parsing succeeded, continue to next middleware
    next();
  };
};
