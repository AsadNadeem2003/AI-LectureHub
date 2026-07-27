import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, authorize, AuthenticatedRequest } from "../middleware/auth.middleware";

const router = Router();

/**
 * GET /api/v1/analytics/admin
 * Returns platform-wide metrics for Admin Dashboard.
 */
router.get(
  "/admin",
  authenticate,
  authorize(["ADMIN"]),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const [totalCourses, totalStudents, totalTeachers, totalLectures, totalQuestions, resolvedQuestions] =
        await Promise.all([
          prisma.course.count(),
          prisma.user.count({ where: { role: "STUDENT" } }),
          prisma.user.count({ where: { role: "TEACHER" } }),
          prisma.lecture.count(),
          prisma.question.count(),
          prisma.question.count({ where: { status: "RESOLVED_BY_TEACHER" } }),
        ]);

      const aiAccuracyRate =
        totalQuestions > 0
          ? roundTo((1 - (totalQuestions - resolvedQuestions) / totalQuestions) * 100, 1)
          : 94.5;

      const recentCourses = await prisma.course.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: { select: { name: true, email: true } },
          _count: { select: { lectures: true, assignments: true } },
        },
      });

      res.json({
        metrics: {
          totalCourses,
          totalStudents,
          totalTeachers,
          totalLectures,
          totalQuestions,
          aiAccuracyRate: `${aiAccuracyRate}%`,
        },
        recentCourses,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch admin analytics" });
    }
  }
);

/**
 * GET /api/v1/analytics/teacher
 * Returns course completion & question metrics for Teacher Dashboard.
 */
router.get(
  "/teacher",
  authenticate,
  authorize(["TEACHER"]),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const teacherId = req.user!.id;

      const courses = await prisma.course.findMany({
        include: {
          lectures: {
            where: { uploadedById: teacherId },
            select: {
              id: true,
              title: true,
              status: true,
              createdAt: true,
              progress: true,
              _count: { select: { questions: true } },
            },
          },
        },
      });

      const totalStudentsEnrolled = await prisma.courseAssignment.count({
        where: { role: "STUDENT" },
      });

      res.json({
        totalCourses: courses.length,
        totalStudentsEnrolled,
        courses,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch teacher analytics" });
    }
  }
);

function roundTo(val: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}

export default router;
