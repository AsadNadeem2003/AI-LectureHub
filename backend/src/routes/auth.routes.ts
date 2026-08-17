import { Router } from "express";
import { login, refresh, logout, invite, setPassword, getMe } from "../controllers/auth.controller";
import { authenticate, requireRole } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { authLimiter } from "../middleware/rateLimiter.middleware";
import { z } from "zod";

const router = Router();

// Validation Schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const inviteSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(["TEACHER", "STUDENT", "ADMIN"]),
});

const setPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6),
});

// Routes

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 */
router.post("/login", authLimiter, validate(loginSchema), login);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh access token using httpOnly cookie
 *     tags: [Auth]
 */
router.post("/refresh", refresh);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout and clear refresh token cookie
 *     tags: [Auth]
 */
router.post("/logout", logout);

/**
 * @swagger
 * /api/v1/auth/set-password:
 *   post:
 *     summary: Set a new password via invite token
 *     tags: [Auth]
 */
router.post("/set-password", authLimiter, validate(setPasswordSchema), setPassword);

// Protected routes

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns current user
 */
router.get("/me", authenticate, getMe);
/**
 * @swagger
 * /api/v1/auth/invite:
 *   post:
 *     summary: Invite a new user (Admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [TEACHER, STUDENT, ADMIN]
 *     responses:
 *       200:
 *         description: Invite sent successfully
 */
router.post("/invite", authenticate, requireRole(["ADMIN"]), validate(inviteSchema), invite);

export default router;
