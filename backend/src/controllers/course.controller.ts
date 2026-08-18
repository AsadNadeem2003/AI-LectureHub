import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const createCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, teacherId } = req.body;
    const user = (req as any).user;
    const userId = user?.id || user?.userId;
    const userRole = user?.role;

    if (!userId) {
      res.status(401).json({ error: "User authentication missing" });
      return;
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        createdById: userId,
      },
    });

    // If teacherId is provided and the user is ADMIN, assign the specified teacher.
    // Otherwise, assign the creator as a TEACHER to this course by default.
    const assignedUserId = (userRole === "ADMIN" && teacherId) ? teacherId : userId;

    await prisma.courseAssignment.create({
      data: {
        userId: assignedUserId,
        courseId: course.id,
        role: "TEACHER",
      },
    });

    res.status(201).json({ message: "Course created successfully", course });
  } catch (error: any) {
    console.error("Create Course Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: courseId } = req.params;
    const { title, description } = req.body;

    const existing = await prisma.course.findUnique({ where: { id: courseId } });
    if (!existing) {
      res.status(404).json({ error: "Course not found" });
      return;
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
      },
    });

    res.status(200).json({ message: "Course updated successfully", course: updated });
  } catch (error: any) {
    console.error("Update Course Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const getCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const userId = user?.id || user?.userId;
    const role = user?.role;

    let courses;
    if (role === "ADMIN") {
      // Admin sees all courses with lecture and enrolled student counts
      courses = await prisma.course.findMany({
        include: {
          createdBy: { select: { name: true, email: true } },
          _count: {
            select: {
              lectures: true,
              assignments: { where: { role: "STUDENT" } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Teachers and Students see courses they are assigned to
      const assignments = await prisma.courseAssignment.findMany({
        where: { userId },
        include: {
          course: {
            include: {
              createdBy: { select: { name: true, email: true } },
              _count: {
                select: {
                  lectures: true,
                  assignments: { where: { role: "STUDENT" } },
                },
              },
            },
          },
        },
      });
      courses = assignments.map((a) => ({
        ...a.course,
        userRoleInCourse: a.role,
        assignedAt: a.assignedAt,
      }));
    }

    res.status(200).json({ courses });
  } catch (error: any) {
    console.error("Get Courses Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const assignUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: courseId } = req.params;
    const { userId, role } = req.body;

    // Verify course exists
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return;
    }

    const assignment = await prisma.courseAssignment.upsert({
      where: {
        userId_courseId: { userId, courseId },
      },
      update: { role },
      create: { userId, courseId, role },
    });

    res.status(200).json({ message: "User assigned successfully", assignment });
  } catch (error: any) {
    console.error("Assign User Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const unassignUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: courseId, assignmentId } = req.params;

    await prisma.courseAssignment.delete({
      where: {
        id: assignmentId,
        courseId,
      },
    });

    res.status(200).json({ message: "User unassigned successfully" });
  } catch (error: any) {
    console.error("Unassign User Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const getCourseStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: courseId } = req.params;

    const assignments = await prisma.courseAssignment.findMany({
      where: {
        courseId,
        role: "STUDENT",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            progress: {
              where: {
                lecture: { courseId },
              },
              select: {
                isCompleted: true,
                lastPositionMs: true,
                updatedAt: true,
              },
            },
          },
        },
      },
      orderBy: {
        assignedAt: "desc",
      },
    });

    const students = assignments.map((a: any) => {
      const progressList: any[] = a.user?.progress || [];
      const completedCount = progressList.filter((p: any) => p.isCompleted).length;

      return {
        id: a.user.id,
        name: a.user.name,
        email: a.user.email,
        assignedAt: a.assignedAt,
        completedLectures: completedCount,
      };
    });

    res.status(200).json({ students, totalStudents: students.length });
  } catch (error: any) {
    console.error("Get Course Students Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};
