import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { enqueueLectureJob } from '../jobs/lecture.queue';
import { uploadToCloudinary } from '../lib/cloudinary';
import path from 'path';
import fs from 'fs';

/**
 * POST /api/v1/lectures/upload
 * Sub-second response: Creates DB entry, enqueues background job, returns 201 Created immediately.
 */
export async function uploadLecture(req: Request, res: Response, next: NextFunction) {
  try {
    const file = req.file;
    const { courseId, title } = req.body;
    const teacherId = (req as any).user?.id;

    if (!file) {
      return res.status(400).json({ error: 'No document file uploaded' });
    }
    if (!courseId || !title) {
      return res.status(400).json({ error: 'courseId and title are required' });
    }

    // Verify course exists
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const filename = file.filename || file.originalname;
    const ext = path.extname(filename).toLowerCase().replace('.', '');

    if (!['pdf', 'pptx', 'docx'].includes(ext)) {
      return res.status(400).json({ error: 'Invalid file format. Supported: .pdf, .pptx, .docx' });
    }

    // Local saved file path
    const localFilePath = file.path;

    // Upload source document to Cloudinary CDN
    const cloudUrl = await uploadToCloudinary(localFilePath, 'lecturehub/source_files');

    // Create Lecture row in PostgreSQL with status = PROCESSING
    const lecture = await prisma.lecture.create({
      data: {
        courseId,
        uploadedById: teacherId,
        title,
        sourceFileUrl: cloudUrl || `/uploads/${filename}`,
        status: 'PROCESSING',
        isStarted: false,
      },
    });

    // Enqueue background processing job (BullMQ or Async Fallback Queue)
    await enqueueLectureJob({
      lectureId: lecture.id,
      filePath: localFilePath,
      fileType: ext,
      title: lecture.title,
    });

    // Return sub-second response to caller
    return res.status(201).json({
      message: 'Lecture file uploaded successfully. Processing started in background.',
      lecture: {
        id: lecture.id,
        courseId: lecture.courseId,
        title: lecture.title,
        status: lecture.status,
        createdAt: lecture.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/lectures/:id/status
 * Poll status of a processing lecture.
 */
export async function getLectureStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const lecture = await prisma.lecture.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        status: true,
        isStarted: true,
        errorMessage: true,
        updatedAt: true,
        _count: { select: { segments: true } },
      },
    });

    if (!lecture) {
      return res.status(404).json({ error: 'Lecture not found' });
    }

    return res.json({
      id: lecture.id,
      title: lecture.title,
      status: lecture.status,
      isStarted: lecture.isStarted,
      totalSegments: lecture._count.segments,
      errorMessage: lecture.errorMessage,
      updatedAt: lecture.updatedAt,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/lectures/:id/start
 * Teacher activates lecture once processing is READY.
 */
export async function startLecture(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const teacherId = (req as any).user?.id;

    const lecture = await prisma.lecture.findUnique({ where: { id } });
    if (!lecture) {
      return res.status(404).json({ error: 'Lecture not found' });
    }

    // Check status
    if (lecture.status !== 'READY') {
      return res.status(400).json({ error: `Cannot start lecture. Current status is ${lecture.status}` });
    }

    const updated = await prisma.lecture.update({
      where: { id },
      data: { isStarted: true },
    });

    return res.json({
      message: 'Lecture activated successfully. Students can now access interactive audio player.',
      lecture: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/lectures/:id
 * Return complete lecture details, audio URL, and synchronized segments.
 */
export async function getLectureById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const lecture = await prisma.lecture.findUnique({
      where: { id },
      include: {
        segments: {
          orderBy: { segmentIndex: 'asc' },
        },
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!lecture) {
      return res.status(404).json({ error: 'Lecture not found' });
    }

    return res.json(lecture);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/courses/:courseId/lectures
 * List lectures for a course.
 */
export async function getCourseLectures(req: Request, res: Response, next: NextFunction) {
  try {
    const { courseId } = req.params;
    const user = (req as any).user;

    const whereClause: any = { courseId };
    // If student, only show lectures where isStarted = true
    if (user?.role === 'STUDENT') {
      whereClause.isStarted = true;
      whereClause.status = 'READY';
    }

    const lectures = await prisma.lecture.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        isStarted: true,
        sourceFileUrl: true,
        audioUrl: true,
        createdAt: true,
        uploadedBy: { select: { name: true } },
      },
    });

    return res.json({ lectures });
  } catch (error) {
    next(error);
  }
}
