import { Router } from "express";
import { createCourse, getCourses, assignUser, unassignUser, getCourseStudents } from "../controllers/course.controller";
import { authenticate, requireRole } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { z } from "zod";

const router = Router();

const createCourseSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  teacherId: z.string().uuid().optional(),
});

const assignUserSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["TEACHER", "STUDENT"]),
});

// All course routes require authentication
router.use(authenticate);

router.get("/", getCourses);

// Admin and Teacher only
router.post("/", requireRole(["ADMIN", "TEACHER"]), validate(createCourseSchema), createCourse);
router.post("/:id/assign", requireRole(["ADMIN", "TEACHER"]), validate(assignUserSchema), assignUser);
router.delete("/:id/assignments/:assignmentId", requireRole(["ADMIN", "TEACHER"]), unassignUser);
router.get("/:id/students", requireRole(["ADMIN", "TEACHER"]), getCourseStudents);

export default router;
