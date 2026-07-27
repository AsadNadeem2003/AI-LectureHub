# Phase 7 Implementation Plan: Synced Lecture Playback Engine & Progress Tracking

Implementation plan for **Phase 7** of the AI LectureHub platform. This phase constructs the flagship **Interactive Lecture Studio** where students listen to synthesized AI voice narration, view real-time synchronized slide images, click auto-scrolling transcript sentences to jump timestamps, and save their progress automatically.

---

## User Review Required

> [!IMPORTANT]
> **Split-Screen Interactive Studio (`/student/lecture/[id]`)**:
> - **Left 2/3 Column**: High-definition slide viewer + custom floating HTML5 audio player.
> - **Right 1/3 Column**: Dual-tab panel containing **Live Auto-Scrolling Transcript** (Click sentence to jump audio!) and **Smart AI Q&A Assistant**.
> - **Real-Time Sync**: Audio `timeupdate` event drives slide visual switching and active transcript highlighting.

---

## Proposed Changes

### Frontend Components (`/frontend/src/components/player`)

---

#### [NEW] [AudioPlayer.tsx](file:///d:/Amperor%20Tech%20Internship%20Projects/AI%20Lecture%20Hub/frontend/src/components/player/AudioPlayer.tsx)
- Custom HTML5 audio player with play/pause, timeline scrubber, playback speed (`1x`, `1.25x`, `1.5x`, `2x`), and timestamp emitter (`currentTimeMs`).

#### [NEW] [SlideViewer.tsx](file:///d:/Amperor%20Tech%20Internship%20Projects/AI%20Lecture%20Hub/frontend/src/components/player/SlideViewer.tsx)
- Renders active slide image or visual text card synchronized to `currentTimeMs`.
- Displays page numbers, total slide count, and keyword tags.

#### [NEW] [TranscriptViewer.tsx](file:///d:/Amperor%20Tech%20Internship%20Projects/AI%20Lecture%20Hub/frontend/src/components/player/TranscriptViewer.tsx)
- Renders slide segments.
- Highlights active spoken sentence and auto-scrolls smooth to keep it centered.
- Clicking any segment sentence updates audio player `currentTimeMs` instantly.

#### [NEW] [useProgressTracker.ts](file:///d:/Amperor%20Tech%20Internship%20Projects/AI%20Lecture%20Hub/frontend/src/hooks/useProgressTracker.ts)
- Custom React hook that auto-saves student position every 10 seconds to `POST /api/v1/lectures/:id/progress` and resumes on page load.

---

### Frontend Pages (`/frontend/src/app/student/lecture/[id]`)

---

#### [NEW] [page.tsx](file:///d:/Amperor%20Tech%20Internship%20Projects/AI%20Lecture%20Hub/frontend/src/app/student/lecture/%5Bid%5D/page.tsx)
- Interactive Lecture Studio page assembling `SlideViewer`, `AudioPlayer`, `TranscriptViewer`, and progress tracking.

---

### Backend Progress Endpoints (`/backend/src/controllers` & `/backend/src/routes`)

---

#### [MODIFY] [lecture.controller.ts](file:///d:/Amperor%20Tech%20Internship%20Projects/AI%20Lecture%20Hub/backend/src/controllers/lecture.controller.ts)
- Implement `saveProgress` (`POST /api/v1/lectures/:id/progress`) and `getLecturePlayData` (`GET /api/v1/lectures/:id/play`).

---

## Verification Plan

### Automated Verification
1. Validate TypeScript compilation in `frontend` (`npx tsc --noEmit`).
2. Test progress endpoints `POST /api/v1/lectures/:id/progress` via Node test script.

### Manual Verification
1. Open `/student/lecture/[id]` in browser.
2. Verify audio playback, slide image switching, and clicking transcript sentences to jump timestamps.
