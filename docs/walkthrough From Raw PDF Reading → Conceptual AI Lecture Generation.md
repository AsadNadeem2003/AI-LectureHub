# Walkthrough: From Raw PDF Reading → Conceptual AI Lecture Generation

## What Changed & Why

### The Problem (Before)
When a teacher uploaded a PDF, the system was generating audio by literally reading the raw slide text out loud. If slide 3 had these bullet points:
```
• Neural Networks
• Activation Functions  
• Backpropagation
```
The audio would say: *"Neural Networks. Activation Functions. Backpropagation."*

This is not a lecture. That is a reading exercise. A real teacher analyzes what these concepts mean, connects them, and explains them conversationally.

---

## Step-by-Step Changes Made

### Step 1 — Identified the Root Cause
- Looked at `ai-service/app/services/script_generator.py`
- Found the code had a `_call_gemini_api()` path and a `_fallback_single_page()` path
- The Gemini API key was **invalid** (quota limit = 0), so the system was always hitting the dumb fallback
- The fallback just did: `f"Welcome to slide {p_num}. Specifically, {raw_text}"` — literally injecting raw text

---

### Step 2 — Designed the Professor-Grade AI Prompt
**File:** [`ai-service/app/services/script_generator.py`](file:///d:/Amperor%20Tech%20Internship%20Projects/AI%20Lecture%20Hub/ai-service/app/services/script_generator.py)

The core of this upgrade is the `_build_professor_prompt()` method. Here are the exact critical instructions sent to the AI:

```
CRITICAL INSTRUCTIONS:
1. DO NOT read or copy the slide text word for word.
2. ANALYZE each slide's content. Understand the underlying concept.
3. EXPLAIN each concept in a clear, engaging, conversational spoken tone.
4. INTRODUCE the concept → EXPLAIN with depth/analogy → BRIDGE to next slide.
5. Use smooth transitions: "Now that we've established...", "Building on that...", etc.
6. If a slide has bullet points, synthesize them into a coherent flowing explanation.
7. If a slide is a diagram, describe what it illustrates and its significance.
8. The lecture should sound smooth when read aloud — like a podcast, not a reading exercise.
```

The AI is also given a **System Role** as part of the API call:
> *"You are a world-class university professor with deep expertise in your subject. You never robotically read slides — you explain, connect ideas, and inspire understanding."*

---

### Step 3 — Tested & Rejected Gemini API (Quota = 0)
- Tested 3 different Gemini API keys — all returned `quota limit: 0`
- Root cause: Google Cloud project region was blocking the free tier
- Decision: Switch to a free alternative

---

### Step 4 — Tested & Rejected xAI Grok (No Free Credits)
- Tested xAI Grok API key (`xai-...`)
- Key was valid and authenticated, but returned:
  > `403: Your newly created team doesn't have any credits or licenses yet`
- Decision: Switch to Groq

---

### Step 5 — Integrated Groq (Llama 3.3 70B) ✅

**Why Groq?**
- Completely **free** with no credit card
- Runs **Llama 3.3 70B** — one of the most capable open-source models in the world, excellent for educational explanation generation
- Uses the **OpenAI-compatible API format** — minimal code change required

**Files Changed:**

#### `ai-service/.env`
```env
# Groq LLM API (Primary — for conceptual lecture generation)
GROQ_API_KEY=gsk_REDACTED
GROQ_BASE_URL=https://api.groq.com/openai/v1
GROQ_MODEL=llama-3.3-70b-versatile

# Google Gemini LLM API (Secondary Fallback)
GEMINI_API_KEY=...
```

#### `ai-service/app/config.py`
Added three new settings fields:
```python
GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
GROQ_BASE_URL: str = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1")
GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
```

#### `ai-service/requirements.txt`
Added `openai>=1.40.0` (the Groq API uses the same OpenAI Python SDK with a different `base_url`).

#### `ai-service/app/services/script_generator.py` — **Full Rewrite**
The class was completely restructured with a **3-tier fallback architecture**:

```
Groq (Primary) → Gemini (Fallback) → Offline Structured (Last Resort)
```

---

### Step 6 — Built the 3-Tier Fallback Architecture

```python
def generate_lecture_script(lecture_title, pages):
    # 1. Try Groq (Llama 3.3 70B) — primary
    if self._groq_ready:
        return self._call_groq(lecture_title, pages)
    
    # 2. Try Gemini — fallback
    if self._gemini_ready:
        return self._call_gemini(lecture_title, pages)
    
    # 3. Offline structured generator — final safety net
    return self._offline_fallback(lecture_title, pages)
```

The offline fallback was also upgraded — instead of dumping raw text, it now builds a natural-sounding intro with transition phrases between slides.

---

### Step 7 — Improved Keyword Extraction
Cleaned up the `_extract_keywords()` method by adding lecture-style stopwords (`"turning"`, `"building"`, `"professor"`, `"university"` etc.) so the concept tags displayed to students are genuinely academic terms, not filler words.

---

## Final State — What Happens Now When a Teacher Uploads a PDF

```
Teacher uploads PDF
       ↓
PDF text extracted page by page (PyMuPDF)
       ↓
Pages sent to ScriptGenerator.generate_lecture_script()
       ↓
Groq (Llama 3.3 70B) receives professor-grade prompt
       ↓
AI ANALYZES concepts → delivers natural, conversational lecture script
       ↓
[SLIDE_1] ... [SLIDE_2] ... parsed from AI output
       ↓
gTTS synthesizes audio for each slide's script
       ↓
Audio + slide images synchronized & stored
       ↓
Student hears a REAL lecture, not a reading session
```

> [!NOTE]
> API Key is stored **only** in `ai-service/.env` which is listed in `.gitignore`.
> It is never exposed in the codebase, frontend, or any logs.

> [!TIP]
> To confirm Groq is active: restart the AI service and check the startup logs. You should see:
> `[INFO] Groq engine ready. Model: llama-3.3-70b-versatile`
