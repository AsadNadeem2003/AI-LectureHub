import { Router } from "express";
import { login, invite, setPassword, getMe } from "../controllers/auth.controller";
import { authenticate, requireRole } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
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
router.post("/login", validate(loginSchema), login);
router.post("/set-password", validate(setPasswordSchema), setPassword);

// Protected routes
router.get("/me", authenticate, getMe);
router.post("/invite", authenticate, requireRole(["ADMIN"]), validate(inviteSchema), invite);

export default router;
