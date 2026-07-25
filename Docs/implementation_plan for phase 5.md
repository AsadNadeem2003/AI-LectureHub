# Phase 5 Implementation Plan: Asynchronous Queue Processing (BullMQ & Redis)

Implementation plan for **Phase 5** of the AI LectureHub platform. This phase decouples heavy AI processing (document extraction, vector indexing, Gemini script generation, TTS synthesis) from HTTP request handlers using Redis background queues and BullMQ workers.

---

## User Review Required

> [!IMPORTANT]
> **Redis Connection & Fallback**:
> - **BullMQ & Redis**: Uses Redis server (`REDIS_URL` or `localhost:6379`).
> - **Graceful Async Fallback**: If Redis is not locally installed/running during manual testing, the queue system automatically falls back to an asynchronous event background worker so `POST /lectures/upload` always responds in **< 1 second** without crashing!

---

## Open Questions

> [!NOTE]
> 1. **File Upload Handling**: In Phase 5, file uploads on `POST /api/v1/lectures/upload` will accept multipart form data (`file`, `courseId`, `title`), save the uploaded source file locally/Cloudinary, create the `Lecture` record in PostgreSQL with status `PROCESSING`, and dispatch the job to the background worker.

---

## Proposed Changes

### Backend Library & Jobs (`/backend/src/lib` & `/backend/src/jobs`)

---

#### [NEW] [redis.ts](file:///d:/Amperor%20Tech%20Internship%20Projects/AI%20Lecture%20Hub/backend/src/lib/redis.ts)
- Configure Redis connection client using `ioredis`.

#### [NEW] [lecture.queue.ts](file:///d:/Amperor%20Tech%20Internship%20Projects/AI%20Lecture%20Hub/backend/src/jobs/lecture.queue.ts)
- Define `lectureProcessingQueue` for background processing jobs.

#### [NEW] [lecture.worker.ts](file:///d:/Amperor%20Tech%20Internship%20Projects/AI%20Lecture%20Hub/backend/src/jobs/lecture.worker.ts)
- BullMQ worker that processes background jobs.
- Triggers HTTP call to AI Microservice (`POST /api/v1/process/process-lecture`).
- Updates PostgreSQL `Lecture` status (`READY` / `FAILED`) and bulk creates `LectureSegment` rows.

---

### Backend Controllers & Routes (`/backend/src/controllers` & `/backend/src/routes`)

---

#### [NEW] [lecture.controller.ts](file:///d:/Amperor%20Tech%20Internship%20Projects/AI%20Lecture%20Hub/backend/src/controllers/lecture.controller.ts)
- Implement lecture endpoints:
  - `uploadLecture`: Save file, create DB record (`status: PROCESSING`), add job to queue, return `201 Created` in < 1 second.
  - `getLectureStatus`: Expose status (`PROCESSING`, `READY`, `FAILED`) and segment summary.
  - `startLecture`: Teacher activates lecture (`isStarted: true`).
  - `getLectureById`: Return complete lecture details, audio URL, and synchronized segments.

#### [NEW] [lecture.routes.ts](file:///d:/Amperor%20Tech%20Internship%20Projects/AI%20Lecture%20Hub/backend/src/routes/lecture.routes.ts)
- Register lecture routes with authentication (`requireAuth`) and role-based access middleware (`requireRole(["TEACHER", "ADMIN"])`).

#### [MODIFY] [index.ts](file:///d:/Amperor%20Tech%20Internship%20Projects/AI%20Lecture%20Hub/backend/src/index.ts)
- Mount `/api/v1/lectures` router and initialize BullMQ worker process.

---

## Verification Plan

### Automated Verification
1. Run Node.js test script to simulate teacher lecture file upload.
2. Verify sub-second response on `POST /api/v1/lectures/upload`.
3. Verify status polling `GET /api/v1/lectures/:id/status` until status changes to `READY`.
4. Verify created `Lecture` and `LectureSegment` rows in PostgreSQL via Prisma.

### Manual Verification
1. Test lecture upload, status polling, and starting a lecture in Express API / Postman.
