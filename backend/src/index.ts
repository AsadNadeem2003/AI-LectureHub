import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import courseRoutes from "./routes/course.routes";
// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

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
// Route Registration
// ---------------------------------------------------------------------------
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/courses", courseRoutes);
// app.use("/api/v1/lectures", lectureRoutes);
// app.use("/api/lectures", lectureRoutes);
// app.use("/api/questions", questionRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/teacher", teacherRoutes);

// ---------------------------------------------------------------------------
// Global Error Handler
// ---------------------------------------------------------------------------
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("❌ Unhandled error:", err.message);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message,
  });
});

// ---------------------------------------------------------------------------
// Start Server
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`🚀 AI LectureHub Backend running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
