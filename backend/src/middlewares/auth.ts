import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import "express-session";
import { Role } from "../models/User.js";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    userEmail?: string;
    userRole?: string;
    userName?: string;
  }
}

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  name?: string | undefined;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
    // 1. Check for session
    if (req.session?.userId) {
      req.user = {
        id: req.session.userId,
        email: req.session.userEmail!,
        role: req.session.userRole as Role,
        name: req.session.userName,
      };
      return next();
    }

    // 2. Check for Bearer token
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (token) {
        try {
          const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "your_jwt_secret_key_change_this"
          ) as any;
          
          req.user = {
            id: decoded.id || decoded.userId,
            email: decoded.email || decoded.userEmail,
            role: (decoded.role || decoded.userRole) as Role,
            name: decoded.name || decoded.userName,
          };
          return next();
        } catch (err) {
          // Token invalid, fall through to 401
        }
      }
    }

    res.status(401).json({ error: "Not authenticated" });
};

export const requireRole = (allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: "Insufficient permissions for this action",
      });
      return;
    }
    next();
  };
};
