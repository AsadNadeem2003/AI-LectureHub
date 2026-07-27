# Phase 8 Implementation Plan: Smart Vector RAG Q&A Engine & Escalation Queue

Implementation plan for **Phase 8** of the AI LectureHub platform. This phase replaces static placeholder Q&A with real **ChromaDB Vector Retrieval + Gemini LLM Grounded Answers**, dynamic confidence scores, and a direct **Student-to-Teacher Escalation Queue**.

---

## User Review Required

> [!IMPORTANT]
> **Phase 8 Features**:
> 1. **Real Vector RAG Q&A Engine**:
>    - Searches ChromaDB vectorstore for the exact slide chunks matching the student's question.
>    - Uses Gemini LLM to generate precise, grounded answers.
>    - Computes real dynamic confidence scores (e.g. 96%, 89%, 94% — replacing the static 92%).
> 2. **Student Direct Question Escalation**:
>    - Adds an **"Ask Teacher / Escalate Question"** button directly inside the AI Assistant tab.
>    - Sends student's question, lecture title, and slide timestamp to the teacher's database.
> 3. **Teacher Escalated Questions Queue (`/teacher/dashboard`)**:
>    - Professors view incoming student questions tagged with lecture titles and slide numbers.
>    - One-click reply box allowing teachers to answer students directly.

---

## Proposed Changes

### AI Microservice (`/ai-service/app/routes/qa.py`)

---

#### [MODIFY] [qa.py](file:///d:/Amperor%20Tech%20Internship%20Projects/AI%20Lecture%20Hub/ai-service/app/routes/qa.py)
- Implement `POST /api/v1/qa/ask-question` RAG pipeline connecting ChromaDB `vector_manager` and Gemini LLM.
- Return `answer_text`, `confidence_score` (calculated dynamically from cosine distance), and `sources` (slide page numbers).

---

### Backend Question Escalation (`/backend`)

---

#### [MODIFY] [schema.prisma](file:///d:/Amperor%20Tech%20Internship%20Projects/AI%20Lecture%20Hub/backend/prisma/schema.prisma)
- Add `EscalatedQuestion` model (`id`, `studentId`, `teacherId`, `lectureId`, `questionText`, `answerText`, `status`, `createdAt`).

#### [MODIFY] [lecture.controller.ts](file:///d:/Amperor%20Tech%20Internship%20Projects/AI%20Lecture%20Hub/backend/src/controllers/lecture.controller.ts)
- Add `escalateQuestion` (`POST /api/v1/questions/escalate`) and `getTeacherEscalatedQuestions` (`GET /api/v1/questions/teacher`).
- Add `replyToQuestion` (`POST /api/v1/questions/:id/reply`).

---

### Frontend UI (`/frontend`)

---

#### [MODIFY] [page.tsx](file:///d:/Amperor%20Tech%20Internship%20Projects/AI%20Lecture%20Hub/frontend/src/app/student/lecture/%5Bid%5D/page.tsx)
- Update Q&A endpoint URL to `/api/v1/qa/ask-question`.
- Render dynamic RAG answers, actual confidence scores, and an **"Ask Teacher Directly"** escalation button on every answer card.

#### [MODIFY] [page.tsx](file:///d:/Amperor%20Tech%20Internship%20Projects/AI%20Lecture%20Hub/frontend/src/app/teacher/dashboard/page.tsx)
- Connect live Escalated Questions Queue widget to display real student questions with one-click teacher reply inputs.

---

## Verification Plan

### Automated Verification
1. Run Python test script querying `POST /api/v1/qa/ask-question` for different lecture questions $\rightarrow$ verify unique dynamic Gemini answers & non-static confidence scores.
2. Run TypeScript build verification (`npx tsc --noEmit`) in `frontend` and `backend`.

### Manual Verification
1. Ask questions in Student AI Assistant (`http://localhost:3000/student/lecture/<ID>`) $\rightarrow$ verify dynamic Gemini grounded answers.
2. Click **"Ask Teacher Directly"** $\rightarrow$ log in as Teacher at `/teacher/dashboard` $\rightarrow$ verify question appears in Escalated Questions Queue and answer can be replied to!
