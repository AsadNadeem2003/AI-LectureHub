# Phase 4 Implementation Plan: Script Generation, Google TTS & Slide Alignment Engine

Implementation plan for **Phase 4** of the AI LectureHub platform. This phase implements Gemini LLM educational script generation, Google Cloud TTS audio synthesis with timestamp calculations, and slide alignment synchronization.

---

## User Review Required

> [!IMPORTANT]
> **API Keys & Fallback Engine**:
> - **Google Gemini API**: Uses `GEMINI_API_KEY` from `.env` (`gemini-1.5-flash` / `gemini-2.0-flash`). If no API key is set in `.env`, the service uses a structured educational script fallback so that offline manual testing in Swagger UI works out of the box without crashing.
> - **Text-to-Speech (TTS)**: Supports Google Cloud TTS (`GOOGLE_APPLICATION_CREDENTIALS`) and includes `gTTS` (Google Text-to-Speech) as an active fallback.

---

## Open Questions

> [!NOTE]
> 1. **Audio Storage**: Audio files will be stored in `/ai-service/data/audio/` and optionally uploaded to Cloudinary if Cloudinary credentials are provided in `.env`.
> 2. **Execution Strategy**: Would you like end-to-end processing (`POST /api/v1/process/process-lecture`) to run both standalone and via BullMQ queue in Phase 5? (Currently building full standalone HTTP processing endpoint in Phase 4 for thorough Swagger UI manual testing).

---

## Proposed Changes

### AI Microservice Services (`ai-service/app/services`)

---

#### [NEW] [script_generator.py](file:///d:/Amperor%20Tech%20Internship%20Projects/AI%20Lecture%20Hub/ai-service/app/services/script_generator.py)
- Implement `GeminiScriptGenerator` class.
- Prompt Gemini to transform raw slide text into continuous, engaging, educational lecture scripts with clear slide markers (`[SLIDE_X]`).
- Includes graceful structured fallback synthesis when `GEMINI_API_KEY` is not present.

#### [NEW] [tts_service.py](file:///d:/Amperor%20Tech%20Internship%20Projects/AI%20Lecture%20Hub/ai-service/app/services/tts_service.py)
- Implement `TTSService` class using Google Cloud TTS / `gTTS`.
- Synthesizes audio MP3 files per slide segment or full lecture.
- Calculates exact duration (`start_time_ms`, `end_time_ms`) per slide segment.

#### [NEW] [segment_mapper.py](file:///d:/Amperor%20Tech%20Internship%20Projects/AI%20Lecture%20Hub/ai-service/app/services/segment_mapper.py)
- Implement `SegmentMapper` class.
- Combines page numbers, slide images, script text, and audio timing into structured `LectureSegmentOut` models.
- Extracts key terms/keywords per segment for student quick reference.

---

### AI Microservice Routes (`ai-service/app/routes`)

---

#### [MODIFY] [process.py](file:///d:/Amperor%20Tech%20Internship%20Projects/AI%20Lecture%20Hub/ai-service/app/routes/process.py)
- Implement endpoints:
  - `POST /api/v1/process/generate-script`: Accepts extracted pages $\rightarrow$ returns structured lecture script.
  - `POST /api/v1/process/synthesize-tts`: Accepts script text $\rightarrow$ generates MP3 audio & timestamps.
  - `POST /api/v1/process/process-lecture`: End-to-end pipeline (Extract $\rightarrow$ Index VectorStore $\rightarrow$ Script Gen $\rightarrow$ TTS $\rightarrow$ Slide Segment Alignment).

---

## Verification Plan

### Automated Verification
1. Run python verification test script to test script generation, TTS audio creation, and segment mapping.
2. Verify created audio files in `ai-service/data/audio/`.

### Manual Verification
1. Test `POST /api/v1/process/generate-script` in Swagger UI (`http://127.0.0.1:8001/docs`).
2. Test `POST /api/v1/process/synthesize-tts` in Swagger UI.
3. Test `POST /api/v1/process/process-lecture` end-to-end in Swagger UI and inspect the returned `segments` array and `audio_url`.
