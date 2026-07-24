# AI LectureHub — Incremental Implementation Plan & Roadmap

This document outlines the complete, step-by-step implementation phases for building **AI LectureHub**, an automated educational platform with AI-generated synced lectures, RAG question answering, and human teacher escalation.

---

## 📅 Overview of Implementation Phases

| Phase | Module | Focus Area | Deliverables |
|---|---|---|---|
| **Phase 1** | Foundation | Monorepo Setup & Schema | Package files, Environment configs, Prisma schema setup |
| **Phase 2** | Backend API | Auth, Roles & Course Mgmt | JWT Auth, Role middleware, Course & User APIs, Resend email |
| **Phase 3** | AI Microservice | Content Extraction & Vectors | FastAPI app, PDF/PPTX parsing, ChromaDB & Embeddings |
| **Phase 4** | AI Microservice | Script Gen, TTS & Sync | Gemini script prompt, Google Cloud TTS, Cloudinary, Segment mapper |
| **Phase 5** | Integration | Queue & Orchestration | BullMQ + Redis job worker, polling APIs, microservice IPC |
| **Phase 6** | Frontend | Modern UI & Dashboards | Next.js 14 layout, Shadcn components, Role dashboards (Admin/Teacher/Student) |
| **Phase 7** | Frontend | Synced Audio/Visual Player | React HTML5 Audio player wrapper, slide sync engine, 10s auto-save progress |
| **Phase 8** | AI & Backend | RAG Q&A & Escalation Queue | Hybrid Q&A engine, confidence thresholding (≥0.7), Teacher resolution workflow |
| **Phase 9** | Frontend & API | Analytics & Metrics | Student completion tracking, Teacher engagement metrics, Admin overview |
| **Phase 10** | Quality & Ops | Edge Cases, Hardening & Testing| Network retries, text-only PDF fallbacks, long PDF streaming support |

---

## 🛠️ Detailed Step-by-Step Phase Breakdown

---

### 🔹 Phase 1: Monorepo Foundation & Database Schema
**Goal**: Set up the complete repository structure, dependency manifests, configuration files, and PostgreSQL database schema using Prisma.

1. **Initialize Directory Tree**:
   - Create `/backend` (Express TypeScript).
   - Create `/ai-service` (Python FastAPI).
   - Create `/frontend` (Next.js 14 App Router with Tailwind CSS & Shadcn UI).

2. **Backend Database Schema (`backend/prisma/schema.prisma`)**:
   - `User`: `id`, `email`, `passwordHash`, `name`, `role` (`ADMIN`, `TEACHER`, `STUDENT`), `createdAt`, `updatedAt`.
   - `Course`: `id`, `title`, `description`, `createdById`, `createdAt`, `updatedAt`.
   - `CourseAssignment`: `id`, `userId`, `courseId`, `role` (`TEACHER`, `STUDENT`), `assignedAt`.
   - `Lecture`: `id`, `courseId`, `uploadedById`, `title`, `sourceFileUrl`, `status` (`PROCESSING`, `READY`, `FAILED`), `scriptContent`, `audioUrl`, `errorMessage`, `createdAt`, `updatedAt`.
   - `LectureSegment`: `id`, `lectureId`, `segmentIndex`, `segmentText`, `pageNumber`, `imageUrls` (JSON array), `startTimeMs`, `endTimeMs`, `keywords` (JSON array).
   - `StudentProgress`: `id`, `userId`, `lectureId`, `lastPositionMs`, `isCompleted`, `updatedAt`.
   - `Question`: `id`, `lectureId`, `studentId`, `timestampMs`, `questionText`, `answerText`, `confidenceScore`, `status` (`PENDING`, `ANSWERED_BY_AI`, `ESCALATED_TO_TEACHER`, `RESOLVED_BY_TEACHER`), `answeredById`, `createdAt`, `updatedAt`.

3. **Environment Templates**:
   - Setup `.env.example` files for root, backend, ai-service, and frontend.

---

### 🔹 Phase 2: Core Authentication, User Onboarding & Course APIs
**Goal**: Implement secure JWT authentication, admin invitation workflow via Resend, role-based access control, and course management APIs.

1. **Authentication Engine (`/backend/src/controllers/auth.controller.ts`)**:
   - `POST /auth/invite`: Admin sends email invite with a password reset token via Resend API.
   - `POST /auth/set-password`: Invited user sets password using the secure token.
   - `POST /auth/login`: Authenticate user and issue JWT signed with user role and ID.

2. **Role-Based Authorization Middleware (`/backend/src/middleware/auth.middleware.ts`)**:
   - Validate JWT token headers (`Bearer <token>`).
   - Enforce permission checks: `requireRole(['ADMIN'])`, `requireRole(['TEACHER'])`, etc.

3. **Course & User Assignment Management (`/backend/src/controllers/course.controller.ts`)**:
   - `POST /courses`: Create new course (Admin only).
   - `GET /courses`: Fetch courses filtered by user's assigned role and enrollment.
   - `POST /courses/:id/assign`: Assign teacher or student to a course.
   - `DELETE /courses/:id/assignments/:assignmentId`: Unassign user from course.

---

### 🔹 Phase 3: Python AI Microservice — File Extraction & Vector Indexing
**Goal**: Build the FastAPI service that parses PDF/PPTX files, extracts text & embedded images slide-by-slide, chunks text, and indexes embeddings into ChromaDB.

1. **FastAPI Initialization (`/ai-service/main.py`)**:
   - Setup CORS, health check endpoints, and exception handlers.

2. **Document Parsing Module (`/ai-service/parsers/`)**:
   - `pdf_parser.py`: Use PyMuPDF (`fitz`) to iterate through pages, extract raw text, and dump embedded raster images.
   - `pptx_parser.py`: Use `python-pptx` to iterate through slides, extract text shapes, and export slide images.

3. **Text Chunking & Multilingual Vector Storage (`/ai-service/vectorstore/`)**:
   - Use LangChain `RecursiveCharacterTextSplitter` to segment content into 500-character chunks with overlap.
   - Initialize `sentence-transformers` model: `paraphrase-multilingual-MiniLM-L12-v2`.
   - Setup persistent `ChromaDB` client to store document chunks, embeddings, and page metadata.

---

### 🔹 Phase 4: Script Generation, Google TTS & Slide Alignment
**Goal**: Implement Gemini LLM transcript generation, Google Cloud Text-to-Speech audio synthesis with timestamps, and segment alignment mapping.

1. **Gemini Script Generation (`/ai-service/services/script_generator.py`)**:
   - Construct prompt asking Gemini API to rewrite raw slide text into a continuous, natural, spoken lecture transcript suitable for educational delivery.
   - Return structured transcript sections linked to slide numbers.

2. **Google Cloud Text-to-Speech & Timestamp Generation (`/ai-service/services/tts_service.py`)**:
   - Send transcript to Google Cloud TTS API requesting audio output (MP3/WAV) and enable timepoint / word alignment marks.
   - Save generated audio and upload to Cloudinary.

3. **Lecture Segment Sync Engine (`/ai-service/services/segment_mapper.py`)**:
   - Map word-level timestamps back to original slide page numbers and image URLs.
   - Output structured JSON array of `LectureSegment` objects (`segmentIndex`, `startTimeMs`, `endTimeMs`, `pageNumber`, `imageUrls`, `segmentText`).

---

### 🔹 Phase 5: Asynchronous Queue Processing (BullMQ & Redis)
**Goal**: Decouple heavy AI processing from HTTP request handlers using Redis background jobs.

1. **BullMQ Worker Setup (`/backend/src/jobs/lecture.worker.ts`)**:
   - Define `lectureProcessingQueue` in Node.js backend.
   - Queue job on `POST /lectures` upload request.
   - Worker triggers HTTP call to `/ai/process-lecture` on the Python microservice.

2. **Status Polling & Microservice Contract (`/backend/src/controllers/lecture.controller.ts`)**:
   - `GET /lectures/:id/status`: Expose progress percentage and stage (`"Extracting content..."` → `"Generating transcript..."` → `"Converting to audio..."` → `"Ready"`).
   - `POST /lectures/:id/start`: Teacher activates lecture for enrolled students once processing status is `READY`.

---

### 🔹 Phase 6: Next.js 14 Frontend — Layout & Role Dashboards
**Goal**: Construct a modern UI using Next.js App Router, Tailwind CSS, and Shadcn UI components.

1. **Design System & Global Layout**:
   - CSS tokens, dark/light theme options, responsive glassmorphic cards, modern typography (Inter/Outfit).
   - Global layout with Navigation bar, user menu, and role badge.

2. **Role-Based Views (`/frontend/src/app/`)**:
   - `/auth/login` & `/auth/set-password`: Clean forms with validation.
   - `/admin/dashboard`: Course creation modal, user assignment matrix, enrollment stats.
   - `/teacher/dashboard`: Assigned courses list, lecture upload widget with progress bar, Escalated Questions Queue.
   - `/student/dashboard`: Enrolled courses grid, lecture list, progress progress indicators (% watched).

---

### 🔹 Phase 7: Synced Lecture Playback Engine & Progress Tracking
**Goal**: Build the interactive lecture player with real-time visual slide switching and background progress persistence.

1. **Custom Synchronized Audio Player Component (`/frontend/src/components/player/`)**:
   - Wraps HTML5 `<audio>` element with custom controls (play/pause, timeline slider, playback speed).
   - Listens to `timeupdate` event (in milliseconds).
   - Matches current audio time with `LectureSegment` `startTimeMs` and `endTimeMs`.
   - Displays corresponding slide image(s). If no image exists, renders smooth text overlay.

2. **Automatic Progress Saver (`/frontend/src/hooks/useProgressTracker.ts`)**:
   - Periodically sends `POST /lectures/:id/progress` every 10 seconds.
   - Fetches saved position on load via `GET /lectures/:id/play` to resume seamlessly.

---

### 🔹 Phase 8: RAG Q&A Engine & Teacher Escalation Queue
**Goal**: Enable in-lecture Q&A grounded in lecture content with confidence-based human escalation.

1. **Vector RAG Retrieval (`/ai-service/services/qa_service.py`)**:
   - Receive question + `lecture_id`.
   - Embed question using `paraphrase-multilingual-MiniLM-L12-v2`.
   - Perform vector search in ChromaDB filtered specifically by `lecture_id` metadata.
   - Retrieve top 3-5 segments and compute cosine similarity confidence score.

2. **Confidence-Based Routing**:
   - **Confidence ≥ 0.7**: Prompt Gemini LLM with context constraint ("Answer ONLY using provided text"). Store question as `ANSWERED_BY_AI` and return response instantly.
   - **Confidence < 0.7**: Mark question as `ESCALATED_TO_TEACHER`. Return message: *"Your teacher will respond to this soon."*

3. **Teacher Escalation Dashboard (`/frontend/src/components/teacher/EscalationQueue.tsx`)**:
   - Filterable list of escalated questions.
   - Detail view showing question text, student name, and relevant lecture segment context.
   - Input box for teacher response. Submitting updates question status to `RESOLVED_BY_TEACHER`.

---

### 🔹 Phase 9: System Analytics & Engagement Dashboard
**Goal**: Provide quantitative insights for Admins and Teachers.

1. **Admin Analytics (`/admin/dashboard`)**:
   - Total active courses, enrolled students, total teachers.
   - System-wide engagement metrics and total questions asked vs AI response success rate.

2. **Teacher Analytics (`/teacher/courses/[id]`)**:
   - Student completion rates per lecture (e.g. 75% completed).
   - Question distribution analysis (common confusing parts of a lecture).

---

### 🔹 Phase 10: Edge Cases, Hardening & Verification
**Goal**: Ensure system resilience against common real-world failures.

1. **Text-Only PDF Handling**:
   - Detect slides without images and dynamically fallback to rich text layout cards during playback.
2. **Large File & Timeout Protection**:
   - Support 50+ page documents asynchronously via BullMQ without HTTP request timeouts.
3. **RAG & API Fallbacks**:
   - Catch vector DB/LLM connection errors gracefully and auto-escalate to teacher queue without breaking UI.

---

## 🎯 Verification Matrix

| Module | Test / Verification Method | Expected Outcome |
|---|---|---|
| **Auth & Onboarding** | Unit test `POST /auth/invite` and verify token generation | User receives password reset token and successfully updates credentials |
| **Document Processing**| Upload sample PDF & PPTX files to Python parser | Text & images extracted per page with 100% slide accuracy |
| **Vector Storage** | Query ChromaDB vector store with test queries | Returns relevant lecture chunks with cosine similarity score |
| **TTS & Sync Engine** | Generate audio and check timestamp mapping | Visual slide changes match spoken audio within <200ms |
| **RAG Q&A** | Ask contextual question during playback | High confidence queries return Gemini AI answer; low confidence queries escalate to teacher |
| **Progress Persistence**| Play lecture, close browser at 02:15, reopen | Audio resumes automatically at 02:15 timestamp |
