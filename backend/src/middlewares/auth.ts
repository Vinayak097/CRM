import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "../models/User.js";
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
  let token = req.cookies?.token;

  // Check for Bearer token if no cookie
  const authHeader = req.headers.authorization;
  if (!token && authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

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
      // Token invalid
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
