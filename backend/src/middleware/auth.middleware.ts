import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";

// Extend Express Request to carry user payload
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: "ADMIN" | "TEACHER" | "STUDENT";
    name: string;
  };
}

/**
 * Verify JWT token from Authorization header.
 * Attaches decoded user payload to `req.user`.
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ success: false, message: "No token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "supersecretkey123";
    const decoded = jwt.verify(token, secret) as any;

    const userId = decoded.id || decoded.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: "Invalid token payload" });
      return;
    }

    // Verify user still exists in database
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(401).json({ success: false, message: "User not found" });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

/**
 * Factory function for role-based access control.
 * Returns middleware that only allows specified roles through.
 */
export const requireRole = (allowedRoles: Array<"ADMIN" | "TEACHER" | "STUDENT">) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
      });
      return;
    }

    next();
  };
};
