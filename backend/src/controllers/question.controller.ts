import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";

/**
 * POST /api/v1/questions/escalate
 * Student sends a question directly to the course teacher.
 */
export async function escalateQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    const { lectureId, questionText, timestampMs } = req.body;
    const user = (req as any).user;
    const studentId = user?.id || user?.userId;

    if (!studentId) {
      return res.status(401).json({ error: "User authentication missing" });
    }

    if (!lectureId || !questionText) {
      return res.status(400).json({ error: "lectureId and questionText are required" });
    }

    const question = await prisma.question.create({
      data: {
        lectureId,
        studentId,
        questionText,
        timestampMs: timestampMs || 0,
        status: "ESCALATED_TO_TEACHER",
      },
      include: {
        lecture: { select: { title: true } },
        student: { select: { name: true, email: true } },
      },
    });

    return res.status(201).json({
      message: "Question escalated to teacher successfully",
      question,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/questions/teacher
 * Teacher lists escalated questions for their assigned courses.
 */
export async function getTeacherEscalatedQuestions(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    const teacherId = user?.id || user?.userId;

    const questions = await prisma.question.findMany({
      where: {
        status: "ESCALATED_TO_TEACHER",
      },
      orderBy: { createdAt: "desc" },
      include: {
        lecture: {
          select: { id: true, title: true, courseId: true },
        },
        student: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return res.json({ questions });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/questions/:id/reply
 * Teacher submits answer to an escalated question.
 */
export async function replyToQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { answerText } = req.body;
    const user = (req as any).user;
    const teacherId = user?.id || user?.userId;

    if (!answerText) {
      return res.status(400).json({ error: "answerText is required" });
    }

    const updated = await prisma.question.update({
      where: { id },
      data: {
        answerText,
        answeredById: teacherId,
        status: "RESOLVED_BY_TEACHER",
      },
    });

    return res.json({
      message: "Question replied and marked resolved successfully",
      question: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/questions/student
 * Student fetches their escalated questions and teacher replies for a lecture.
 */
export async function getStudentQuestions(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    const studentId = user?.id || user?.userId;
    const { lectureId } = req.query;

    if (!studentId || !lectureId) {
      return res.status(400).json({ error: "lectureId is required" });
    }

    const questions = await prisma.question.findMany({
      where: {
        studentId,
        lectureId: String(lectureId),
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ questions });
  } catch (error) {
    next(error);
  }
}
