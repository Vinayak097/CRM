// middlewares/validation.middleware.ts
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

// Use the base ZodSchema type which accepts any Zod schema
export const validateRequest = (
  schema: z.ZodSchema<any>, // Accept any Zod schema
  property: "body" | "query" | "params" = "body",
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const dataToValidate = req[property];

    // Check if data is undefined (e.g. missing body parser or empty body)
    if (dataToValidate === undefined) {
      console.error(`[Validation Error] ${property} is undefined!`, {
        method: req.method,
        path: req.path,
        headers: req.headers
      });
      return res.status(400).json({
        success: false,
        message: `Validation failed: ${property} is missing`,
        errors: [{ path: "", message: `${property} is required but received undefined` }]
      });
    }

    const result = schema.safeParse(dataToValidate);
    if (!result.success) {
      console.error(`[Validation Error] Property: ${property}`);
      console.error(`[Data to Validate]:`, JSON.stringify(dataToValidate, null, 2));

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
