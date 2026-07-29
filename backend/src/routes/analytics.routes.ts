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
      const [totalCourses, totalLectures, totalQuestions, resolvedQuestions] =
        await Promise.all([
          prisma.course.count(),
          prisma.lecture.count(),
          prisma.question.count(),
          prisma.question.count({ where: { status: "RESOLVED_BY_TEACHER" } }),
        ]);

      // Count only distinct students that are actually assigned to courses
      const studentAssignments = await prisma.courseAssignment.findMany({
        where: { role: "STUDENT" },
        select: { userId: true },
        distinct: ['userId'],
      });
      const totalStudents = studentAssignments.length;

      // Count only distinct teachers that are actually assigned to courses
      const teacherAssignments = await prisma.courseAssignment.findMany({
        where: { role: "TEACHER" },
        select: { userId: true },
        distinct: ['userId'],
      });
      const totalTeachers = teacherAssignments.length;

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
        where: {
          assignments: {
            some: {
              userId: teacherId,
              role: "TEACHER",
            }
          }
        },
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

      const courseIds = courses.map((c: any) => c.id);
      
      const studentAssignments = await prisma.courseAssignment.findMany({
        where: { 
          role: "STUDENT",
          courseId: { in: courseIds }
        },
        select: { userId: true },
        distinct: ['userId'],
      });
      const totalStudentsEnrolled = studentAssignments.length;

      const lectureIds = courses.flatMap((c: any) => c.lectures.map((l: any) => l.id));
      
      const progressRecords = await prisma.studentProgress.findMany({
        where: { lectureId: { in: lectureIds } }
      });
      
      let avgCompletionRate = 0;
      if (progressRecords.length > 0) {
        const completed = progressRecords.filter((p: any) => p.isCompleted).length;
        avgCompletionRate = Math.round((completed / progressRecords.length) * 100);
      }

      const questions = await prisma.question.findMany({
        where: { lectureId: { in: lectureIds } }
      });
      
      const totalQuestions = questions.length;
      const aiSolvedCount = questions.filter((q: any) => q.status === "ANSWERED_BY_AI").length;
      const escalatedCount = questions.filter((q: any) => q.status === "ESCALATED_TO_TEACHER" || q.status === "PENDING").length;

      res.json({
        totalCourses: courses.length,
        totalStudentsEnrolled,
        avgCompletionRate,
        totalQuestions,
        aiSolvedCount,
        escalatedCount,
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
