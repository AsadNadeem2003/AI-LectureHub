import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import {
  uploadLecture,
  getLectureStatus,
  startLecture,
  getLectureById,
  getCourseLectures,
  saveStudentProgress,
  getLecturePlayData,
} from '../controllers/lecture.controller';

const router = Router();

// Ensure upload directory exists
const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
});

// All lecture routes require JWT auth
router.use(authenticate);

// Teacher upload endpoint: ONLY TEACHER role can upload slide documents
router.post('/upload', upload.single('file'), requireRole(['TEACHER']), uploadLecture);

// Status polling endpoint
router.get('/:id/status', getLectureStatus);

// Teacher start/publish lecture endpoint: ONLY TEACHER role can publish lectures to students
router.post('/:id/start', requireRole(['TEACHER']), startLecture);

// Get complete lecture play payload (including saved student progress position)
router.get('/:id/play', getLecturePlayData);

// Save student progress endpoint
router.post('/:id/progress', saveStudentProgress);

// Get complete lecture details with segments and audio
router.get('/:id', getLectureById);

// Get lectures list for a course
router.get('/course/:courseId', getCourseLectures);

export default router;
