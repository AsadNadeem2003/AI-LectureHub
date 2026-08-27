# 🎓 AI LectureHub — Next-Gen AI University Lecture Platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.19-lightgrey?logo=express)](https://expressjs.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-CPU%20Optimized-EE4C2C?logo=pytorch)](https://pytorch.org/)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-VectorStore-orange)](https://www.trychroma.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

AI LectureHub is an enterprise-grade educational platform that automates university lecture delivery by converting static academic materials (PDFs & PPTXs) into **thematically clustered, studio-narrated AI lecture masterclasses**. It synchronizes visual slides with studio neural audio, generates real-time RAG-grounded answers for student queries using Groq Llama 3.3 70B, and provides a direct human-in-the-loop escalation pipeline for instructors.

---

## 🌐 Live Production Deployment

* **🔒 Live Secure HTTPS Portal:** [https://3.89.86.157.sslip.io](https://3.89.86.157.sslip.io)
* **📚 Interactive Client & API Docs:** [https://3.89.86.157.sslip.io/docs](https://3.89.86.157.sslip.io/docs)
* **Alternative Domain Mirror:** [https://3.89.86.157.nip.io](https://3.89.86.157.nip.io)
* **Hosting Cloud Infrastructure:** AWS EC2 (`us-east-1`, Ubuntu 24.04 LTS, Docker Compose Multi-Service Stack)

---

## 🌟 Key Product Features

| Feature | Description |
| :--- | :--- |
| **Thematic Cognitive Chunking** | Condenses lengthy 40+ page slide decks into 8–14 high-impact conceptual modules, preserving 100% of diagrams and visual context. |
| **Studio Neural Voice Synthesis** | Microsoft Edge Neural Speech (`en-US-ChristopherNeural`) with FFmpeg `libmp3lame` broadcast stream packaging and zero rate limits. |
| **Precision RAG Q&A Assistant** | Dual-LLM intelligence powered by **Groq (Llama 3.3 70B)** with Google Gemini hot-standby, grounded against ChromaDB vector embeddings. |
| **Human-in-the-Loop Escalation** | Students can escalate complex queries directly to the course instructor's inbox for review. |
| **Role-Based Access Control (RBAC)** | Strict security partitions and dedicated workflows for **Admin**, **Teacher**, and **Student** workspaces. |
| **Automated Zero-Config HTTPS** | Caddy reverse proxy with automated Let's Encrypt / ZeroSSL TLS certificate issuance (`sslip.io` / `nip.io`). |
| **Push-to-Deploy CI/CD** | Automated GitHub Actions pipeline deploying updates to AWS EC2 with sequential Docker builds. |

---

## 🧭 How It Works — Step-by-Step User Journeys

### 👑 1. Admin Workflow
1. **Sign In:** Access the Admin Dashboard via secure JWT authentication.
2. **Course Provisioning:** Create academic courses with unique codes (e.g. `CS-301`) and titles.
3. **Faculty Assignment:** Assign registered teachers to lead specific courses.
4. **User Lifecycle:** Manage, invite, and audit student and teacher accounts.

### 👨‍🏫 2. Teacher Workflow
1. **Course Selection:** Open an assigned course in the Teacher Studio.
2. **Slide Ingestion:** Drag and drop `.pdf` or `.pptx` presentations.
3. **Automated AI Processing:** The system extracts diagrams, chunks modules, generates neural voice narration, and indexes slide vectors.
4. **Escalation Inbox:** Review and reply to unresolved student questions with 1-click answers.

### 🎓 3. Student Workflow
1. **Enrollment & Discovery:** Browse enrolled courses and interactive lecture modules.
2. **Synchronized Studio:** Listen to studio neural voice narration while visual slides advance automatically in sync with the live transcript.
3. **RAG AI Assistant:** Ask questions about specific slides to receive immediate, grounded explanations with confidence ratings.
4. **Ask Instructor:** Escalate deep questions directly to the teacher's queue with attached slide context.

---

## 🏗️ Repository Architecture

```text
AI-LectureHub/
├── frontend/               # Next.js 14 (App Router) + Tailwind CSS + Lucide Icons
│   ├── src/app/docs/       # Enterprise Client Documentation Portal
│   ├── src/app/student/    # Student Lecture Studio & RAG Assistant
│   ├── src/app/teacher/    # Teacher Studio & Question Escalation Inbox
│   └── src/app/admin/      # Admin User & Course Management
├── backend/                # Express.js + Prisma ORM + PostgreSQL 16 + Redis 7
│   ├── src/routes/         # Auth, Course, Lecture, Q&A, and Analytics routes
│   └── src/jobs/           # BullMQ background workers for async processing
├── ai-service/             # FastAPI + ChromaDB + PyTorch + Groq + Edge-TTS
│   ├── app/parsers/        # PyMuPDF and python-pptx slide extractors
│   ├── app/services/       # Script generator and Edge-TTS audio synthesizer
│   └── app/vectorstore/    # ChromaDB manager with SentenceTransformers
├── Caddyfile               # Production Auto-HTTPS Reverse Proxy & Ingress
├── docker-compose.prod.yml # Containerized Multi-Service Production Stack
└── .github/workflows/      # Automated GitHub Actions SSH CI/CD Pipeline
```

---

## 📊 The 4 Core Architectural Diagrams

### 1. Full-Stack System Architecture
```text
[ Client Browsers ] ── HTTPS :443 ──► [ Caddy Reverse Proxy ]
                                             │
      ┌──────────────────────────────────────┼──────────────────────────────────┐
      ▼                                      ▼                                  ▼
[ Next.js 14 Frontend ]           [ Express.js REST API ]           [ FastAPI AI Service ]
(App Router, Tailwind)            (Prisma ORM, JWT, Rate Limiter)    (ChromaDB, PyTorch, Groq)
                                             │                                  │
                                             ▼                                  ▼
                                  [ PostgreSQL 16 DB ]              [ Redis 7 BullMQ Worker ]
```

### 2. Thematic Cognitive Chunking & Speech Pipeline
```text
Raw PDF/PPTX (46 Slides)
   │
   ▼ PyMuPDF OCR (150 DPI)
Extracted Text & Diagrams
   │
   ▼ Cognitive Clustering
8–12 Thematic Lecture Modules
   │
   ▼ Edge-TTS (en-US-ChristopherNeural) & FFmpeg
Broadcast-Quality MP3 Stream + Millisecond Sync Timestamps
   │
   ▼ ChromaDB Vector Indexing (Paraphrase-Multilingual-MiniLM-L12-v2)
Indexed Vector Space (Ready for Student RAG Q&A)
```

### 3. PostgreSQL Database ERD Schema
* **`User`:** `id`, `email`, `name`, `passwordHash`, `role` (`ADMIN` | `TEACHER` | `STUDENT`), `createdAt`.
* **`Course`:** `id`, `code`, `title`, `description`, `teacherId` (FK $\rightarrow$ `User.id`).
* **`Enrollment`:** `id`, `studentId` (FK $\rightarrow$ `User.id`), `courseId` (FK $\rightarrow$ `Course.id`).
* **`Lecture`:** `id`, `courseId` (FK $\rightarrow$ `Course.id`), `title`, `audioUrl`, `status`, `totalDurationMs`.
* **`LectureSegment`:** `id`, `lectureId`, `segmentIndex`, `pageNumber`, `startTimeMs`, `endTimeMs`, `segmentText`, `imageUrls[]`.
* **`Question`:** `id`, `lectureId`, `studentId`, `questionText`, `aiAnswer`, `confidenceScore`, `isEscalated`, `teacherReply`.

### 4. Student RAG Q&A & Escalation Sequence Flow
```text
Student Query ──► [ Conversational Greeting Filter ]
                         │ (If not greeting)
                         ▼
                  [ ChromaDB Cosine Vector Search ] ──► (Top-5 Slide Contexts)
                         │
                         ▼
                  [ Groq Llama 3.3 70B Grounding ] ──► Answer + Confidence Score (e.g. 94%)
                         │
                         ▼ (If Student clicks "Ask Teacher")
                  [ Teacher Escalation Inbox Queue ]
```

---

## ⚡ Comprehensive REST & AI API Reference

### 🔐 Authentication (`/api/v1/auth`)
* `POST /api/v1/auth/login`: Authenticate email and password, returning JWT token and role claims.
* `POST /api/v1/auth/register`: Register new student or teacher account.
* `GET /api/v1/auth/me`: Retrieve currently authenticated user session.
* `POST /api/v1/auth/set-password`: First-time password initialization from invitation link.

### 📚 Courses (`/api/v1/courses`)
* `GET /api/v1/courses`: List all enrolled or assigned courses.
* `POST /api/v1/courses`: Create a new course and assign a teacher (Requires `ADMIN`).
* `GET /api/v1/courses/:id`: Get detailed course syllabus and lecture playlist.
* `POST /api/v1/courses/:id/enroll`: Enroll a student into a course.

### 🎙️ Lectures (`/api/v1/lectures`)
* `POST /api/v1/lectures/upload`: Upload slide deck (PDF/PPTX) and trigger BullMQ processing (Requires `TEACHER`).
* `GET /api/v1/lectures/:id`: Get full lecture metadata, audio URL, and synchronized segment timings.
* `GET /api/v1/lectures/:id/status`: Poll real-time background processing stage.

### 💬 Q&A & Teacher Escalation (`/api/v1/qa`)
* `POST /api/v1/qa/ask-question`: Execute ChromaDB vector search and synthesize Groq RAG answer.
* `POST /api/v1/qa/escalate`: Escalate unresolved question to the course instructor's inbox.
* `GET /api/v1/qa/teacher/escalations`: Fetch all pending student questions for the teacher.
* `POST /api/v1/qa/:id/reply`: Post teacher's verified answer to student question.

### 🤖 AI Microservice Endpoints (`ai_service:8001`)
* `POST /ai/extract`: PyMuPDF text & diagram extraction from uploaded slides.
* `POST /ai/script`: Thematic cognitive clustering and lecture script generation.
* `POST /ai/tts`: Edge-TTS neural speech synthesis and FFmpeg stream encoding.
* `POST /ai/qa`: ChromaDB cosine vector search and Groq Llama 3.3 70B RAG reasoning.
* `GET /ai/health`: Microservice health check and model readiness probe.

---

## 🛡️ Role-Based Access Control (RBAC) Matrix

| Platform Capability | Admin | Teacher | Student |
| :--- | :---: | :---: | :---: |
| User Provisioning & Invites | ✅ Full | ❌ | ❌ |
| Course Creation & Teacher Assignment | ✅ Full | ❌ | ❌ |
| Upload Slides & Generate AI Lectures | ❌ | ✅ Full | ❌ |
| Review & Reply to Escalated Questions | ❌ | ✅ Full | ❌ |
| Synchronized Lecture Studio & AI Q&A | ❌ | 👁️ Preview | ✅ Full |
| Progress & Watch History Tracking | ❌ | ❌ | ✅ Full |

---

## 🚀 Local Development Quickstart

### 1. Prerequisites
* Node.js v18+ & Python 3.10+
* Docker & Docker Compose
* PostgreSQL 16 & Redis 7

### 2. Clone and Setup Environment
```bash
git clone https://github.com/AsadNadeem2003/AI-LectureHub.git
cd AI-LectureHub

# Configure Backend
cp backend/.env.example backend/.env

# Configure AI Microservice
cp ai-service/.env.example ai-service/.env
```

### 3. Run with Docker Compose
```bash
# Launch production stack locally
docker compose -f docker-compose.prod.yml up --build -d
```

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
