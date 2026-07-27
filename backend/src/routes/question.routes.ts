import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth.middleware";
import {
  escalateQuestion,
  getTeacherEscalatedQuestions,
  replyToQuestion,
  getStudentQuestions,
} from "../controllers/question.controller";

const router = Router();

router.use(authenticate);

// Student escalates question to teacher
router.post("/escalate", escalateQuestion);

// Teacher lists pending questions
router.get("/teacher", requireRole(["TEACHER", "ADMIN"]), getTeacherEscalatedQuestions);

// Teacher replies to question
router.post("/:id/reply", requireRole(["TEACHER", "ADMIN"]), replyToQuestion);

// Student gets their questions
router.get("/student", getStudentQuestions);

export default router;
