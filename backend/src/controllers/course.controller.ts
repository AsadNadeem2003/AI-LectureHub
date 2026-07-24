import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const createCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description } = req.body;
    const userId = (req as any).user.userId;

    const course = await prisma.course.create({
      data: {
        title,
        description,
        createdById: userId,
      },
    });

    // Assign the creator as a TEACHER to this course by default
    await prisma.courseAssignment.create({
      data: {
        userId,
        courseId: course.id,
        role: "TEACHER",
      },
    });

    res.status(201).json({ message: "Course created successfully", course });
  } catch (error) {
    console.error("Create Course Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, role } = (req as any).user;

    let courses;
    if (role === "ADMIN") {
      // Admin sees all courses
      courses = await prisma.course.findMany({
        include: { createdBy: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Teachers and Students see courses they are assigned to
      const assignments = await prisma.courseAssignment.findMany({
        where: { userId },
        include: {
          course: {
            include: { createdBy: { select: { name: true, email: true } } },
          },
        },
      });
      courses = assignments.map((a) => ({ ...a.course, userRoleInCourse: a.role }));
    }

    res.status(200).json({ courses });
  } catch (error) {
    console.error("Get Courses Error:", error);
    res.status(500).json({ error: "Internal server error" });
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
  } catch (error) {
    console.error("Assign User Error:", error);
    res.status(500).json({ error: "Internal server error" });
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
  } catch (error) {
    console.error("Unassign User Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
