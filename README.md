# 🎓 AI LectureHub — Next-Gen AI University Lecture Platform

AI LectureHub is an enterprise-grade, full-stack educational platform that transforms static academic slide decks (PDF/PPTX) into immersive, interactive AI-narrated lecture experiences. It features real-time slide synchronization, studio-grade neural voice synthesis, thematic cognitive chunking, and intelligent RAG-grounded student Q&A with teacher escalation workflows.

---

## 🌟 Key Features

- **Thematic Cognitive Chunking Engine:** Intelligently condenses lengthy 40+ page slide decks into 8–14 conceptual masterclass modules while preserving 100% of diagrams and visual context.
- **Studio Neural Voice Synthesis:** Microsoft Edge Neural Voice (`en-US-ChristopherNeural`) with FFmpeg stream packaging for crystal-clear playback across mobile and desktop browsers.
- **Precision RAG Q&A Assistant:** Dual-engine intelligence powered by **Groq (Llama 3.3 70B)** with Google Gemini hot-standby, grounded against ChromaDB vector embeddings with confidence scoring.
- **Human-in-the-Loop Escalation:** Students can escalate complex queries directly to the course instructor's inbox for review.
- **Role-Based Access Control (RBAC):** Strict security partitions for **Admin**, **Teacher**, and **Student** workspaces.
- **Automated HTTPS & SSL:** Zero-configuration TLS encryption via Caddy reverse proxy with automated Let's Encrypt provisioning (`sslip.io` / `nip.io`).
- **Production CI/CD Pipeline:** Fully automated push-to-deploy pipeline via GitHub Actions directly to AWS EC2.

---

## 🏗️ Architecture & Technology Stack

```text
AI-LectureHub/
├── frontend/           # Next.js 14 (App Router) + Tailwind CSS + Lucide Icons
├── backend/            # Express.js + Prisma ORM + PostgreSQL 16 + Redis 7 BullMQ
├── ai-service/         # Python 3.11 FastAPI + ChromaDB + SentenceTransformers + Groq + Edge-TTS
├── Caddyfile           # Production Ingress, Auto-HTTPS Reverse Proxy & Gzip/Zstd Compression
├── docker-compose.prod.yml # Containerized Multi-Service Production Stack
└── .github/workflows/  # Automated GitHub Actions SSH CI/CD Pipeline
```

### 1. Frontend (`/frontend`)
- **Framework:** Next.js 14 (App Router, React 18, TypeScript)
- **Styling:** Vanilla CSS & Tailwind CSS with rich glassmorphism aesthetics
- **Interactive Player:** Custom multi-track audio player with live synchronized transcript viewer and container-isolated chat scrolling

### 2. Backend API (`/backend`)
- **Runtime:** Node.js 20, Express, TypeScript
- **Database:** PostgreSQL 16 managed via Prisma ORM
- **Queueing & Background Workers:** BullMQ + Redis 7 for asynchronous document processing
- **Authentication & Rate Limiting:** JWT-based auth with sliding-window anti-bruteforce protection

### 3. AI Microservice (`/ai-service`)
- **Framework:** FastAPI (Python 3.11)
- **Vector Search:** ChromaDB with `paraphrase-multilingual-MiniLM-L12-v2` embeddings
- **Text & Slide Extraction:** PyMuPDF (`fitz`) and `python-pptx`
- **Speech Engine:** Microsoft Edge Neural TTS + FFmpeg `libmp3lame` stream packaging
- **LLM Reasoning:** Groq (Llama 3.3 70B Versatile) + Google Gemini 2.0 Flash

---

## 🌐 Live Production Deployment

- **Live Secure URL:** [https://3.89.86.157.sslip.io](https://3.89.86.157.sslip.io)
- **Alternative Mirror:** [https://3.89.86.157.nip.io](https://3.89.86.157.nip.io)
- **Cloud Infrastructure:** AWS EC2 (`us-east-1`, Ubuntu 24.04 LTS)

---

## 🚀 Local Development Setup

### 1. Prerequisites
- Node.js v18+
- Python 3.10+
- Docker & Docker Compose
- PostgreSQL & Redis

### 2. Clone and Configure
```bash
git clone https://github.com/AsadNadeem2003/AI-LectureHub.git
cd AI-LectureHub

# Setup Backend Environment
cp backend/.env.example backend/.env

# Setup AI Service Environment
cp ai-service/.env.example ai-service/.env
```

### 3. Run with Docker Compose
```bash
# Launch full stack locally
docker compose -f docker-compose.prod.yml up --build -d
```

---

## 📄 License
This project is licensed under the MIT License.
