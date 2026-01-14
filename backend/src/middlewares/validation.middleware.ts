// middlewares/validation.middleware.ts
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

// Use the base ZodSchema type which accepts any Zod schema
export const validateRequest = (
  schema: z.ZodSchema<any>, // Accept any Zod schema
  property: "body" | "query" | "params" = "body"
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req[property]);
      next();
    } catch (error) {
      next(error);
    }
  };
};
