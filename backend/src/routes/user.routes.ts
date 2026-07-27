import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

/**
 * GET /api/v1/users
 * Admin only route to list all platform users (Teachers and Students)
 */
router.get(
  "/",
  authenticate,
  authorize(["ADMIN"]),
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const users = await prisma.user.findMany({
        where: {
          role: { in: ["TEACHER", "STUDENT"] },
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      res.status(200).json({ users });
    } catch (error: any) {
      console.error("Fetch Users Error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch users" });
    }
  }
);

export default router;
