"""
AI Lecture Script Generator
----------------------------
Primary LLM  : Groq (Llama 3.3 70B) — Free, fast, powerful
Fallback LLM : Google Gemini (if Groq key unavailable)
Final Fallback: Structured offline generator (no API needed)

The AI is instructed to act as a world-class professor — it analyzes the
slide content and delivers a natural, conceptual spoken lecture rather than
reading the slides verbatim.
"""

import os
import re
from typing import List, Dict, Any

from app.models import ExtractedPage
from app.config import settings


class ScriptGenerator:
    """
    Generates natural, professor-style educational lecture scripts from document pages.
    Uses Groq (Llama 3.3 70B) as the primary engine. Falls back to Gemini then offline.
    """

    def __init__(self):
        # ── Groq (Primary) ─────────────────────────────────────────────────────
        self.groq_api_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY", "")
        self.groq_base_url = settings.GROQ_BASE_URL or "https://api.groq.com/openai/v1"
        self.groq_model = settings.GROQ_MODEL or "llama-3.3-70b-versatile"
        self._groq_ready = False

        # ── Google Gemini (Fallback) ──────────────────────────────────────────
        self.gemini_api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
        self._gemini_ready = False

        self._init_clients()

    def _init_clients(self):
        """Initialize API clients and report which engines are available."""
        if self.groq_api_key:
            try:
                from openai import OpenAI
                self._groq_client = OpenAI(
                    api_key=self.groq_api_key,
                    base_url=self.groq_base_url
                )
                self._groq_ready = True
                print(f"[INFO] Groq engine ready. Model: {self.groq_model}")
            except Exception as e:
                print(f"[WARN] Groq init failed: {e}")

        if self.gemini_api_key and not self._groq_ready:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.gemini_api_key)
                self._gemini_ready = True
                print("[INFO] Gemini engine ready (fallback).")
            except Exception as e:
                print(f"[WARN] Gemini init failed: {e}")

        if not self._groq_ready and not self._gemini_ready:
            print("[WARN] No LLM API available. Offline structured fallback will be used.")

    # ─────────────────────────────────────────────────────────────────────────
    # PUBLIC INTERFACE
    # ─────────────────────────────────────────────────────────────────────────

    def generate_lecture_script(self, lecture_title: str, pages: List[ExtractedPage]) -> Dict[str, Any]:
        """
        Main entry point. Tries Groq → Gemini → offline fallback in order.

        Returns:
            {
                "full_transcript": str,
                "slide_scripts": [{"page_number": int, "script_text": str, "keywords": List[str]}]
            }
        """
        # 1. Try Groq (Primary)
        if self._groq_ready:
            try:
                print("[INFO] Generating lecture script via Groq (Llama 3.3 70B)...")
                return self._call_groq(lecture_title, pages)
            except Exception as e:
                print(f"[WARN] Groq call failed: {e}. Trying Gemini fallback...")

        # 2. Try Gemini (Fallback)
        if self._gemini_ready:
            try:
                print("[INFO] Generating lecture script via Gemini (fallback)...")
                return self._call_gemini(lecture_title, pages)
            except Exception as e:
                print(f"[WARN] Gemini call failed: {e}. Using offline fallback...")

        # 3. Offline Structured Fallback
        print("[INFO] Using offline structured fallback for script generation.")
        return self._offline_fallback(lecture_title, pages)

    # ───────────────────────────────────────────────────────────────────────
    # PRIVATE: GROQ ENGINE (PRIMARY)
    # ───────────────────────────────────────────────────────────────────────

    def _call_groq(self, lecture_title: str, pages: List[ExtractedPage]) -> Dict[str, Any]:
        """
        Calls Groq (Llama 3.3 70B) to generate a conceptual, professor-style lecture.
        The AI is explicitly instructed NOT to read the slides verbatim.
        """
        slide_context = self._build_slide_context(pages)
        prompt = self._build_professor_prompt(lecture_title, slide_context)

        response = self._groq_client.chat.completions.create(
            model=self.groq_model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a world-class university professor with deep expertise in your subject. "
                        "Your job is to deliver engaging, conceptual lectures that truly educate students. "
                        "You never robotically read slides — you explain, connect ideas, and inspire understanding."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.75,
            max_tokens=8000,
        )

        raw_text = response.choices[0].message.content or ""
        return self._parse_slide_scripts(raw_text, pages, lecture_title)

    # ─────────────────────────────────────────────────────────────────────────
    # PRIVATE: GEMINI ENGINE (FALLBACK)
    # ─────────────────────────────────────────────────────────────────────────

    def _call_gemini(self, lecture_title: str, pages: List[ExtractedPage]) -> Dict[str, Any]:
        """Calls Google Gemini to generate a professor-style lecture (fallback path)."""
        import google.generativeai as genai

        slide_context = self._build_slide_context(pages)
        prompt = self._build_professor_prompt(lecture_title, slide_context)

        model = genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            generation_config={"temperature": 0.75, "top_p": 0.9, "max_output_tokens": 8192}
        )
        response = model.generate_content(prompt)
        raw_text = response.text or ""
        return self._parse_slide_scripts(raw_text, pages, lecture_title)

    # ─────────────────────────────────────────────────────────────────────────
    # PRIVATE: SHARED HELPERS
    # ─────────────────────────────────────────────────────────────────────────

    def _build_slide_context(self, pages: List[ExtractedPage]) -> str:
        """Formats all slide pages into a clean context block for the LLM prompt."""
        context = ""
        for page in pages:
            context += f"--- SLIDE {page.page_number} ---\n"
            context += f"{page.text.strip() or '[Visual/Diagram Slide — No extractable text]'}\n\n"
        return context

    def _build_professor_prompt(self, lecture_title: str, slide_context: str) -> str:
        """
        Builds the detailed professor-persona prompt.
        This is the core of the conceptual lecture generation feature.
        """
        return f"""You are preparing and delivering a live university lecture titled: "{lecture_title}".

CRITICAL INSTRUCTIONS:
1. DO NOT read or copy the slide text word for word. Bullet points are notes for YOU, not a script to recite.
2. ANALYZE each slide's content. Understand the underlying concept it is presenting.
3. EXPLAIN each concept in a clear, engaging, conversational spoken tone — as if you are standing in front of a room full of intelligent students who need to truly understand, not just hear words.
4. For each slide: INTRODUCE the concept → EXPLAIN it with depth or a real-world analogy → BRIDGE naturally to the next slide.
5. Use smooth, natural transitions between slides: "Now that we've established...", "Building on that idea...", "This naturally leads us to...", "Let's now explore...", "Consider how this connects to..." etc.
6. If a slide has only bullet points, synthesize them into a coherent, flowing spoken explanation.
7. If a slide is a diagram or has no text, describe what it likely illustrates and explain its significance to the topic.
8. The lecture should sound smooth and professional when read aloud. Think of it as a podcast, not a reading exercise.

FORMAT RULE: Begin each slide's lecture segment with exactly [SLIDE_X] where X is the slide number.

SLIDE CONTENT TO LECTURE FROM:
{slide_context}

Now deliver the full lecture below:"""

    def _parse_slide_scripts(
        self, raw_text: str, pages: List[ExtractedPage], lecture_title: str
    ) -> Dict[str, Any]:
        """Parses the [SLIDE_X] tagged output from the LLM into structured slide scripts."""
        slide_scripts = []
        full_transcript_parts = []

        for page in pages:
            p_num = page.page_number
            pattern = rf"\[SLIDE_{p_num}\](.*?)(?=\[SLIDE_\d+\]|$)"
            match = re.search(pattern, raw_text, re.DOTALL | re.IGNORECASE)

            if match and match.group(1).strip():
                script_text = match.group(1).strip()
            else:
                print(f"[WARN] LLM did not produce output for slide {p_num}. Using local fallback.")
                script_text = self._fallback_single_slide(p_num, page.text, lecture_title)

            keywords = self._extract_keywords(page.text, script_text, lecture_title)
            slide_scripts.append({
                "page_number": p_num,
                "script_text": script_text,
                "keywords": keywords
            })
            full_transcript_parts.append(f"Slide {p_num}: {script_text}")

        return {
            "full_transcript": "\n\n".join(full_transcript_parts),
            "slide_scripts": slide_scripts
        }

    # ─────────────────────────────────────────────────────────────────────────
    # PRIVATE: OFFLINE FALLBACK
    # ─────────────────────────────────────────────────────────────────────────

    def _offline_fallback(self, lecture_title: str, pages: List[ExtractedPage]) -> Dict[str, Any]:
        """
        Generates a structured, semi-natural script offline — no API needed.
        Used only when all LLM APIs are unavailable.
        """
        slide_scripts = []
        full_transcript_parts = []
        transitions = [
            "",
            "Building on what we just covered, ",
            "Moving forward in our lecture, ",
            "Let us now turn our attention to this: ",
            "The next important idea is: ",
        ]

        for i, page in enumerate(pages):
            p_num = page.page_number
            script_text = self._fallback_single_slide(p_num, page.text, lecture_title)

            if i > 0 and script_text:
                prefix = transitions[i % len(transitions)]
                if prefix:
                    script_text = prefix + script_text[0].lower() + script_text[1:]

            keywords = self._extract_keywords(page.text, script_text, lecture_title)
            slide_scripts.append({
                "page_number": p_num,
                "script_text": script_text,
                "keywords": keywords
            })
            full_transcript_parts.append(f"Slide {p_num}: {script_text}")

        return {
            "full_transcript": "\n\n".join(full_transcript_parts),
            "slide_scripts": slide_scripts
        }

    def _fallback_single_slide(self, page_number: int, page_text: str, lecture_title: str) -> str:
        """Generates a clean, natural-sounding fallback script for one slide."""
        clean = page_text.strip()
        if not clean:
            return (
                f"On slide {page_number} we have an important visual or diagram supporting "
                f"the concepts of {lecture_title}. Take a moment to study it — "
                f"it captures the relationships between ideas we have been building."
            )
        sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', clean) if s.strip()]
        if len(sentences) == 1:
            return (
                f"Slide {page_number} focuses on a key concept in {lecture_title}. "
                f"{sentences[0]}. Let's make sure we fully understand this before moving on."
            )
        intro = sentences[0]
        rest = " ".join(sentences[1:])
        return (
            f"On slide {page_number}, the core idea is: {intro}. "
            f"To understand this fully, consider that {rest}"
        )

    # ─────────────────────────────────────────────────────────────────────────
    # PRIVATE: KEYWORD EXTRACTION
    # ─────────────────────────────────────────────────────────────────────────

    def _extract_keywords(
        self, raw_page_text: str, script_text: str, lecture_title: str
    ) -> List[str]:
        """Extracts high-impact academic keywords from slide + script content."""
        combined = f"{raw_page_text} {script_text} {lecture_title}"

        # Multi-word capitalized technical phrases (e.g. "Deep Learning", "Neural Networks")
        multi_word = re.findall(r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b", raw_page_text)
        stopwords = {
            "slide", "welcome", "section", "lecture", "building", "turning",
            "moving", "forward", "attention", "moment", "carefully", "understand",
            "clearly", "consider", "before", "covered", "professor", "university",
        }
        concepts: List[str] = []
        for phrase in multi_word:
            p = phrase.strip()
            if p.lower() not in stopwords and len(p) > 4 and p not in concepts:
                concepts.append(p)

        # Single academic keywords
        general_stops = {
            "this", "that", "with", "from", "have", "here", "were", "what", "when", "your",
            "more", "also", "into", "page", "appears", "application", "principles",
            "particular", "facts", "proposition", "illustrated", "cases", "constitute",
            "examine", "overview", "summary", "introduction", "about", "there",
        } | stopwords

        for w in re.findall(r"\b[A-Za-z]{4,}\b", combined):
            w_cap = w.capitalize()
            in_concept = any(w.lower() in c.lower() for c in concepts)
            if w.lower() not in general_stops and not in_concept and w_cap not in concepts:
                concepts.append(w_cap)

        if not concepts:
            concepts = [
                w.capitalize() for w in re.findall(r"\b[A-Za-z]{4,}\b", lecture_title)
                if w.lower() not in general_stops
            ]

        return concepts[:4] or ["Core Concept", "Key Principles"]


# ─── Global Singleton ────────────────────────────────────────────────────────
script_generator = ScriptGenerator()
