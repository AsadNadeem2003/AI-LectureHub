import { z } from "zod";

// ── Auth Schemas ────────────────────────────────────────────────────────────
export const inviteUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["ADMIN", "TEACHER", "STUDENT"]),
});

export const setPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ── Course Schemas ──────────────────────────────────────────────────────────
export const createCourseSchema = z.object({
  title: z.string().min(3, "Course title must be at least 3 characters").max(200),
  description: z.string().max(2000).optional(),
});

export const assignUserSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  role: z.enum(["TEACHER", "STUDENT"]),
});

// ── Lecture Schemas ─────────────────────────────────────────────────────────
export const createLectureSchema = z.object({
  title: z.string().min(3, "Lecture title must be at least 3 characters").max(200),
  courseId: z.string().uuid("Invalid course ID"),
});

// ── Question Schemas ────────────────────────────────────────────────────────
export const askQuestionSchema = z.object({
  questionText: z.string().min(5, "Question must be at least 5 characters").max(2000),
  timestampMs: z.number().int().min(0),
});

export const resolveQuestionSchema = z.object({
  answerText: z.string().min(1, "Answer cannot be empty").max(5000),
});

// ── Progress Schema ─────────────────────────────────────────────────────────
export const updateProgressSchema = z.object({
  lastPositionMs: z.number().int().min(0),
});

// ── Types derived from schemas ──────────────────────────────────────────────
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type SetPasswordInput = z.infer<typeof setPasswordSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type AssignUserInput = z.infer<typeof assignUserSchema>;
export type CreateLectureInput = z.infer<typeof createLectureSchema>;
export type AskQuestionInput = z.infer<typeof askQuestionSchema>;
export type ResolveQuestionInput = z.infer<typeof resolveQuestionSchema>;
export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;
