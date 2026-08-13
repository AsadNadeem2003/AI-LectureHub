import { Router } from "express";
import { createCourse, getCourses, assignUser, unassignUser, getCourseStudents, updateCourse } from "../controllers/course.controller";
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

/**
 * @swagger
 * /api/v1/courses:
 *   get:
 *     summary: Get all courses for the authenticated user
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of courses
 */
router.get("/", getCourses);

// Admin and Teacher only
/**
 * @swagger
 * /api/v1/courses:
 *   post:
 *     summary: Create a new course (Admin/Teacher only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               teacherId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Course created
 */
router.post("/", requireRole(["ADMIN", "TEACHER"]), validate(createCourseSchema), createCourse);
router.post("/:id/assign", requireRole(["ADMIN", "TEACHER"]), validate(assignUserSchema), assignUser);
router.delete("/:id/assignments/:assignmentId", requireRole(["ADMIN", "TEACHER"]), unassignUser);
router.get("/:id/students", requireRole(["ADMIN", "TEACHER"]), getCourseStudents);
router.patch("/:id", requireRole(["ADMIN", "TEACHER"]), updateCourse);

export default router;
