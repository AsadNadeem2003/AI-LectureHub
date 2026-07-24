// ── Enums ────────────────────────────────────────────────────────────────────

export type Role = "ADMIN" | "TEACHER" | "STUDENT";

export type ProcessingStatus = "PROCESSING" | "READY" | "FAILED";

export type QuestionStatus =
  | "PENDING"
  | "ANSWERED_BY_AI"
  | "ESCALATED_TO_TEACHER"
  | "RESOLVED_BY_TEACHER";

// ── Entity Types ─────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  createdById: string;
  createdBy?: User;
  createdAt: string;
  updatedAt: string;
}

export interface CourseAssignment {
  id: string;
  userId: string;
  courseId: string;
  role: Role;
  assignedAt: string;
  user?: User;
  course?: Course;
}

export interface Lecture {
  id: string;
  courseId: string;
  uploadedById: string;
  title: string;
  sourceFileUrl: string;
  status: ProcessingStatus;
  scriptContent?: string;
  audioUrl?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  course?: Course;
  uploadedBy?: User;
  segments?: LectureSegment[];
}

export interface LectureSegment {
  id: string;
  lectureId: string;
  segmentIndex: number;
  segmentText: string;
  pageNumber: number;
  imageUrls: string[];
  startTimeMs: number;
  endTimeMs: number;
  keywords?: string[];
}

export interface StudentProgress {
  id: string;
  userId: string;
  lectureId: string;
  lastPositionMs: number;
  isCompleted: boolean;
  updatedAt: string;
}

export interface Question {
  id: string;
  lectureId: string;
  studentId: string;
  timestampMs: number;
  questionText: string;
  answerText?: string;
  confidenceScore?: number;
  status: QuestionStatus;
  answeredById?: string;
  createdAt: string;
  updatedAt: string;
  student?: User;
  answeredBy?: User;
}

// ── Auth Types ───────────────────────────────────────────────────────────────

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

// ── Dashboard Types ──────────────────────────────────────────────────────────

export interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalTeachers: number;
  totalLectures: number;
  totalQuestions: number;
  escalatedQuestions: number;
}

export interface LecturePlaybackData {
  lecture: Lecture;
  segments: LectureSegment[];
  progress: StudentProgress | null;
}
