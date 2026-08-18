# AI Lecture Hub - Agent Context File

Welcome, Agent. This file provides the end-to-end context, architectural overview, and technological stack of the **AI Lecture Hub** repository. Use this information to understand the project structure and make informed, consistent coding decisions.

## 1. Project Overview

AI Lecture Hub is a role-based, premium educational platform connecting teachers and students through AI. It features interactive lecture studios, automated PDF-to-script generation, and a local Retrieval-Augmented Generation (RAG) AI assistant for real-time student Q&A.

## 2. Tech Stack & Directories

This is a monorepo consisting of three primary services:

### `frontend/` (Next.js Application)

- **Framework:** React / Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Custom glassmorphism design system; _Avoid heavy UI libraries like full Shadcn unless explicitly required_)
- **State/Auth:** Context API, JWT stored securely.

### `backend/` (Node.js REST API)

- **Framework:** Express.js
- **Language:** TypeScript
- **Database ORM:** Prisma
- **Database:** PostgreSQL (Hosted via Supabase)
- **Queues/Workers:** BullMQ + Redis for asynchronous background jobs.
- **Auth:** JWT with strict Role-Based Access Control (RBAC: ADMIN, TEACHER, STUDENT).
- **Docs:** swagger-jsdoc & swagger-ui-express.

### `ai-service/` (Python Microservice)

- **Framework:** FastAPI
- **Language:** Python
- **Vector DB:** ChromaDB (Local vector storage)
- **Embedding Model:** Hugging Face `paraphrase-multilingual-MiniLM-L12-v2` via SentenceTransformers.
- **Document Parsing:** PyMuPDF (`fitz`) for PDF text and image extraction.
- **LLM Integration:** Groq / Gemini for script generation and RAG answering.

## 3. End-to-End Core Workflows

### The Lecture Generation Pipeline

1. **Upload:** Teacher uploads a PDF via the Frontend.
2. **Queueing:** Node.js backend saves the file and pushes a job to **BullMQ / Redis** to prevent HTTP blocking.
3. **Processing (Python):**
   - `ai-service` picks up the file.
   - Extracts text and images (via PyMuPDF).
   - Generates a script via LLM.
   - Embeds text into vectors (Hugging Face) and stores in **ChromaDB**.
   - Generates Audio (TTS).
4. **Completion:** Python service posts results back to PostgreSQL via the Node backend, and the frontend updates via polling.

### The RAG Student Assistant Pipeline

1. Student asks a question in the interactive player.
2. Node backend forwards the question to the Python `ai-service`.
3. Python service embeds the question, queries ChromaDB to **Retrieve** the exact slide text.
4. Python service **Augments** a prompt with the slide text and asks the LLM to **Generate** a strictly bounded answer.

## 4. Agent Directives & Coding Guidelines

When modifying this codebase, strictly adhere to the following rules:

- **TypeScript First:** Ensure strict typing across frontend and backend. Avoid `any`.
- **UI/UX Aesthetics:** The frontend must maintain a premium, dynamic, glassmorphism aesthetic. Do not use generic plain colors.
- **Asynchronous Operations:** Never block the Node.js main thread with heavy processing; offload to BullMQ or the Python microservice.
- **Security:** Ensure all new backend routes implement the `authenticate` and `requireRole` middlewares where applicable.

## 5. Recent System Enhancements

- **Swagger Documentation:** OpenAPI 3.0 specification generated via `swagger-jsdoc` and interactive UI served at `/api-docs`.
- **Validation & Limits:** Applied strict length limits (Title: 80 chars, Description: 500 chars) with live UI counters and server-side Zod validation.
- **Course Administration:** Added `PATCH /api/v1/courses/:id` endpoint and modal UI for course details editing.
- **Teacher Dashboard Enrollment Clarity:** Explicit course selection added to Teacher Student Enrollment form and dynamic analytics binding.
- **Smooth Scroll Fix:** Integrated `lenis/dist/lenis.css` and adjusted root viewport heights (`min-h-screen`) to prevent scrollbar locks.
- **Role-Based Route Guards:** Enforced client-side role guards on all dashboards (`/student`, `/teacher`, `/admin`) to eliminate cross-role rendering glitches and ensure strict role isolation.
- **Core Web Vitals & Skeleton Loaders:** Added animated skeleton loaders for courses and lectures on dashboard views to eliminate Cumulative Layout Shift (CLS) and optimize Largest Contentful Paint (LCP).
- **Mobile Responsiveness Overhaul:** Added collapsible mobile drawer navigation in `GlobalNavbar`, responsive flex-wrapping on audio scrubber controls, adaptive height scaling for the interactive playback studio, and stacked grid layouts across all dashboards.
- **Conceptual Lecture Generation (AI Professor Mode):** Enhanced `script_generator.py` with a deep professor-persona prompt that instructs Groq/Gemini to TEACH from slides rather than read them verbatim. Added TTS text preprocessor (`_clean_text_for_speech`) that strips markdown artifacts, replaces abbreviations, and normalizes text for natural spoken narration. Gemini is now a hot-standby (always initialized) for instant failover. Offline fallback now synthesizes bullet points into flowing explanations.
- **Zero-Cost Instant Account Activation:** Added direct activation link generation in `auth.controller.ts` and UI link clipboard copy in `AdminDashboard`. Admins can now invite any user and copy their direct set-password link immediately without requiring a custom email domain or paid transactional email tier.
- **Gmail SMTP Real Email Delivery:** Integrated `nodemailer` with Gmail SMTP using Google App Passwords. Outbound invitations now successfully deliver real emails directly into any student or teacher inbox (Gmail, Yahoo, Outlook, University domains) with zero domain restrictions and 100% free delivery.
- **Strict Role Boundary Enforced:** Refined RBAC middlewares so that document uploads (`/upload`) and lecture publishing (`/:id/start`) are strictly restricted to `TEACHER` only. Admins manage courses, faculty assignments, and student enrollments.
- **Backend Security Hardening (Phase 1):** Integrated `helmet` for HTTP security headers (Clickjacking, XSS, MIME sniffing protection, X-Powered-By concealment). Configured `express-rate-limit` with strict authentication throttling (5 attempts / 15 mins) and general API throttling (50 reqs / min). Configured `trust proxy` for cloud load balancer IP detection. Added Swagger production guard to conceal `/api-docs` on production environments.
- **Authentication & Token Hardening (Phase 2):** Upgraded authentication to short-lived 15-minute Access Tokens and 7-day `httpOnly`, `Secure`, `SameSite=Strict` Refresh Token Cookies. Implemented `POST /api/v1/auth/refresh` for cryptographic token rotation and `POST /api/v1/auth/logout`. Enhanced frontend `apiClient.ts` with silent automatic 401 token refresh retry and `credentials: 'include'` support.
- **Code Health & Diagnostics Optimization:** Cleared all 17 IDE linter warnings across Python dynamic imports (`type: ignore`) and normalized arbitrary CSS declarations to canonical Tailwind v4 standards (`bg-linear-to-*`, `aspect-video`, canonical min/max dimensions) across all player and dashboard components.
- **Teacher Assigned Courses & Student Roster System:** 
  - **Backend:** Enriched `GET /api/v1/courses` with lecture count and enrolled student count aggregations (`_count`) for instructors. Enhanced `GET /api/v1/courses/:id/students` with student enrollment timestamps and completed lecture tracking.
  - **Frontend Studio:** Added an interactive "My Assigned Academic Courses" card gallery allowing teachers to view every course assigned to them by the Admin, along with total enrolled students and lectures. Added an interactive "Enrolled Students Roster" with search filtering, avatar initials, enrollment dates, and lecture completion indicators.
- **Processing Copy & Enrollment UX Refinement:**
  - Upgraded lecture processing copy in `LectureUploader.tsx` to clean, enterprise-grade phrasing without exposing internal framework/vendor names.
  - Enhanced student enrollment dropdown to automatically mark and disable already-enrolled students (`— (Already Enrolled)`).
  - Added session mismatch warning for cross-tab token overwrites (`HTTP 403`).

---

_End of Context._
