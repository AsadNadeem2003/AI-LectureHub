# AI LectureHub

AI LectureHub is an intelligent web-based educational platform that automates lecture delivery while maintaining human oversight for complex student queries. Teachers upload course materials (PDFs/PPTXs), an AI processing pipeline automatically converts them into narrated audio synchronized with visual slides, and students can pause playback at any time to ask RAG-grounded questions.

---

## 🏗️ Repository Architecture

The project is structured as a monorepo containing three core components:

```text
ai-lecturehub/
├── backend/            # Express.js + Prisma + TypeScript API Service
├── ai-service/         # Python FastAPI + LangChain + ChromaDB AI Microservice
├── frontend/           # Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
└── PROJECT_PHASES.md   # Step-by-step implementation guide
```

### 1. Backend Service (`/backend`)
- **Runtime & Framework**: Node.js, Express, TypeScript
- **Database & ORM**: PostgreSQL (Supabase) via Prisma ORM
- **Queueing & Async Jobs**: BullMQ + Redis
- **Auth & Storage**: JWT authentication, Cloudinary SDK for media storage
- **Email Service**: Resend API for onboarding and invitations

### 2. AI Microservice (`/ai-service`)
- **Framework**: Python 3.10+ FastAPI
- **Vector DB**: ChromaDB (Embedded local vector store)
- **Embeddings**: `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`
- **Text & Slide Extraction**: PyMuPDF (`fitz`) and `python-pptx`
- **LLM & Speech Generation**: Google Gemini API & Google Cloud Text-to-Speech API
- **RAG & Search**: LangChain vector search + confidence scoring for Q&A escalation

### 3. Frontend Application (`/frontend`)
- **Framework**: Next.js 14 (App Router), React 18
- **Styling & UI**: Tailwind CSS, Lucide Icons, shadcn/ui components
- **Audio & Visual Syncing**: Custom React Audio Player synchronized with timed slide overlays
- **Dashboards**: Dedicated interfaces for Admin, Teacher, and Student roles

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- Redis Server (local or Upstash)
- PostgreSQL Database (Supabase recommended)

### Setup Steps
Refer to [`PROJECT_PHASES.md`](./PROJECT_PHASES.md) for step-by-step execution details.
