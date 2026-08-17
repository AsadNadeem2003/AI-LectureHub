import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import authRoutes from "./routes/auth.routes";
import courseRoutes from "./routes/course.routes";
import lectureRoutes from "./routes/lecture.routes";
import questionRoutes from "./routes/question.routes";
import analyticsRoutes from "./routes/analytics.routes";
import userRoutes from "./routes/user.routes";
import swaggerUi from "swagger-ui-express";
import { specs } from "./swagger";

import helmet from "helmet";
import { apiLimiter } from "./middleware/rateLimiter.middleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";

// Enable trust proxy for accurate rate limiting and IP detection behind reverse proxies / GCP load balancers
app.set("trust proxy", 1);

// ---------------------------------------------------------------------------
// Security & Core Middleware
// ---------------------------------------------------------------------------
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Apply general API rate limiter (50 requests/min) to all /api routes
app.use("/api", apiLimiter);

// Static file serving for uploads
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

// ---------------------------------------------------------------------------
// Health Check
// ---------------------------------------------------------------------------
app.get("/", (_req, res) => {
  res.json({
    status: "online",
    service: "AI LectureHub Backend API",
    version: "1.0.0",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------------
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/lectures", lectureRoutes);
app.use("/api/v1/questions", questionRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/users", userRoutes);

// Swagger Documentation - Available in development; concealed in production
if (!isProduction) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
  console.log(`📄 Swagger documentation mounted on http://localhost:${PORT}/api-docs`);
} else {
  app.use("/api-docs", (_req, res) => {
    res.status(404).json({ error: "Documentation is not publicly accessible in production" });
  });
}

// ---------------------------------------------------------------------------
// 404 Handler
// ---------------------------------------------------------------------------
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ---------------------------------------------------------------------------
// Global Error Handler
// ---------------------------------------------------------------------------
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("❌ Global Error Handler:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// ---------------------------------------------------------------------------
// Start Express Server
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`🚀 Express Backend running on http://localhost:${PORT}`);
});
