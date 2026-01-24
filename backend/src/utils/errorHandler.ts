// utils/errorHandler.ts
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, error?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    if (error) {
      console.error("AppError details:", error);
    }

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handling middleware
export const errorHandler = (err: any, req: any, res: any, next: any) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Zod validation errors
  // If a Zod error bubbles up, format it into a friendly shape
  if (err && (err.name === "ZodError" || Array.isArray(err?.errors))) {
    const rawErrors = err?.errors || [];
    const errors = rawErrors.map((e: any) => {
      let message = e.message;

      // Enhance message for common Zod issues
      if (e.code === 'invalid_type') {
        message = `${e.path.join('.')} expected ${e.expected}, received ${e.received}`;
      } else if (e.code === 'too_small') {
        message = `${e.path.join('.')} must be at least ${e.minimum} ${e.type === 'string' ? 'characters' : 'units'}`;
      } else if (e.code === 'too_big') {
        message = `${e.path.join('.')} must be at most ${e.maximum} ${e.type === 'string' ? 'characters' : 'units'}`;
      }

      return {
        path: Array.isArray(e.path) ? e.path.join(".") : e.path || "",
        message: message,
        code: e.code,
        ...(e.expected && { expected: e.expected }),
        ...(e.received && { received: e.received })
      };
    });

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Duplicate field value entered",
    });
  }

  // JSON / Syntax errors (e.g. JSON.parse inside a transform)
  if (err instanceof SyntaxError) {
    return res.status(400).json({
      success: false,
      message: "Invalid input: malformed JSON or syntax error",
      error: err.message,
    });
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
