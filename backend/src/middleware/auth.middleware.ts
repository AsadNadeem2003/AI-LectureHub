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
      res.status(401).json({ success: false, code: "NO_TOKEN", message: "No token provided. Please log in." });
      return;
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "supersecretkey123";

    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch (jwtErr: any) {
      if (jwtErr.name === "TokenExpiredError") {
        res.status(401).json({ success: false, code: "TOKEN_EXPIRED", message: "Token has expired. Please log in again." });
        return;
      }
      res.status(401).json({ success: false, code: "INVALID_TOKEN", message: "Invalid authentication token." });
      return;
    }

    const userId = decoded.id || decoded.userId;

    if (!userId) {
      res.status(401).json({ success: false, code: "INVALID_PAYLOAD", message: "Invalid token payload" });
      return;
    }

    // Verify user still exists in database
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(401).json({ success: false, code: "USER_NOT_FOUND", message: "User account not found" });
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
    res.status(401).json({ success: false, code: "AUTH_ERROR", message: "Authentication failed" });
  }
};

/**
 * Role-based authorization middleware.
 */
export const authorize = (allowedRoles: Array<"ADMIN" | "TEACHER" | "STUDENT">) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthenticated" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden. Role '${req.user.role}' is not authorized for this resource.`,
      });
      return;
    }

    next();
  };
};

export const requireRole = authorize;
