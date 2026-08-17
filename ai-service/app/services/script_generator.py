"""
AI Lecture Script Generator
----------------------------
Primary LLM  : Groq (Llama 3.3 70B) — Free, fast, powerful
Fallback LLM : Google Gemini (hot-standby)
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
        self._groq_client = None

        # ── Google Gemini (Hot Standby — always initialized as fallback) ───────
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

        # Always initialize Gemini as hot-standby (even if Groq is ready)
        if self.gemini_api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.gemini_api_key)
                self._gemini_ready = True
                print("[INFO] Gemini engine ready (hot-standby fallback).")
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
                print("[INFO] Generating conceptual lecture script via Groq (Llama 3.3 70B)...")
                return self._call_groq(lecture_title, pages)
            except Exception as e:
                print(f"[WARN] Groq call failed: {e}. Trying Gemini fallback...")

        # 2. Try Gemini (Fallback)
        if self._gemini_ready:
            try:
                print("[INFO] Generating conceptual lecture script via Gemini (fallback)...")
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
                        "You are a world-class university professor who has been teaching for 20+ years. "
                        "You are brilliant at taking dry slide content and transforming it into engaging, "
                        "deeply conceptual spoken explanations that make students truly understand the material. "
                        "You NEVER read slides aloud — you TEACH from them. You use analogies, real-world examples, "
                        "cause-and-effect reasoning, and conversational warmth. Your explanations make students think "
                        "\"wow, now I actually understand this\" rather than just hearing words repeated back at them. "
                        "You speak naturally, as if in a live classroom — with energy, clarity, and genuine passion "
                        "for helping students grasp difficult concepts."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.78,
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
            generation_config={"temperature": 0.78, "top_p": 0.9, "max_output_tokens": 8192}
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
        return f"""You are delivering a live university lecture titled: "{lecture_title}".

CRITICAL INSTRUCTIONS — READ CAREFULLY:
1. DO NOT read or copy the slide text word-for-word. The slides are YOUR reference notes, not a script.
2. For each slide, UNDERSTAND what concept it is trying to teach — then EXPLAIN that concept in your own words as if you are teaching a student who is hearing it for the first time.
3. Use real-world analogies, comparisons, and examples to make abstract ideas concrete. For instance, if a slide mentions "TCP/IP layers", don't just list the layers — explain WHY they exist using an analogy like a postal system or assembly line.
4. For each slide: INTRODUCE the topic naturally → EXPLAIN the core idea with depth → Give a PRACTICAL EXAMPLE or analogy → BRIDGE smoothly to the next slide.
5. Use warm, natural transitions between slides: "Now that we understand why this matters...", "Building on that foundation...", "Here's where it gets really interesting...", "This naturally connects to our next concept...", "Think of it this way..."
6. If a slide has bullet points, DO NOT read them as a list. Instead, SYNTHESIZE them into a flowing spoken explanation that connects the dots between the points.
7. If a slide is a diagram or has minimal text, describe what it likely shows and explain its significance in the context of the lecture.
8. Keep the tone professional but conversational — like a passionate professor in a small classroom, not a robotic audiobook narrator.
9. Each slide's lecture segment should be 3-6 sentences of SPOKEN content — enough to genuinely teach the concept, not just mention it.
10. The narration should sound natural and smooth when read aloud by a text-to-speech engine. Avoid complex punctuation, parenthetical asides, or formatting that would sound awkward when spoken.

FORMAT RULE: Begin each slide's lecture segment with exactly [SLIDE_X] where X is the slide number.

SLIDE CONTENT TO LECTURE FROM:
{slide_context}

Now deliver the full conceptual lecture below:"""

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
                print(f"[WARN] LLM did not produce output for slide {p_num}. Using conceptual fallback.")
                script_text = self._conceptual_fallback_slide(p_num, page.text, lecture_title)

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
        Generates a structured, conceptual script offline — no API needed.
        Used only when all LLM APIs are unavailable.
        Synthesizes bullet points and raw text into flowing spoken explanations.
        """
        slide_scripts = []
        full_transcript_parts = []

        for i, page in enumerate(pages):
            p_num = page.page_number
            script_text = self._conceptual_fallback_slide(p_num, page.text, lecture_title)

            # Add natural transitions between slides
            if i > 0 and script_text:
                transition = self._get_transition(i, len(pages))
                script_text = transition + script_text[0].lower() + script_text[1:]

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

    def _get_transition(self, slide_index: int, total_slides: int) -> str:
        """Returns a natural, varied transition phrase based on slide position."""
        transitions = [
            "Building on what we just discussed, ",
            "Now here is where it gets interesting. ",
            "Let us take this a step further. ",
            "With that foundation in place, ",
            "This naturally leads us to the next important idea. ",
            "Now, connecting this to the broader picture, ",
            "Think about how this relates to what comes next. ",
            "Having established that concept, let us explore ",
        ]
        # Use different transitions to avoid repetition
        return transitions[slide_index % len(transitions)]

    def _conceptual_fallback_slide(self, page_number: int, page_text: str, lecture_title: str) -> str:
        """
        Generates a conceptual, teaching-style fallback script for one slide.
        Instead of reading text, it synthesizes bullet points and fragments into
        a flowing explanation as a professor would deliver it.
        """
        clean = page_text.strip()

        if not clean:
            return (
                f"On this slide we have an important visual that supports our understanding of {lecture_title}. "
                f"Take a moment to study the diagram or illustration shown here. "
                f"Notice how it captures the relationships between the key ideas we have been building upon. "
                f"These visual representations are crucial because they help us see the big picture "
                f"and understand how individual concepts connect together."
            )

        # Split into meaningful chunks (sentences or bullet-like fragments)
        lines = [line.strip() for line in clean.split('\n') if line.strip()]
        # Remove very short lines that are likely headers or numbering
        content_lines = [l for l in lines if len(l) > 10]

        if not content_lines:
            content_lines = lines

        if len(content_lines) == 1:
            # Single concept slide
            concept = content_lines[0]
            return (
                f"Let us focus on a fundamental concept here. {concept}. "
                f"Now, why does this matter? In the context of {lecture_title}, "
                f"this is one of the building blocks that everything else rests on. "
                f"Make sure you understand this clearly before we move forward."
            )

        # Multiple points — synthesize into a flowing explanation
        intro = content_lines[0]
        body_points = content_lines[1:]

        # Create a synthesized explanation instead of listing
        synthesized = f"The key idea on this slide is: {intro}. "

        if len(body_points) <= 3:
            synthesized += "To break this down further, "
            synthesized += " Additionally, ".join(body_points[:3]) + ". "
        else:
            synthesized += f"There are several important aspects to understand here. "
            synthesized += f"First, {body_points[0]}. "
            synthesized += f"Second, {body_points[1]}. "
            if len(body_points) > 2:
                synthesized += f"And importantly, {body_points[2]}. "
            remaining = body_points[3:]
            if remaining:
                synthesized += f"Beyond that, {' '.join(remaining[:2])}. "

        synthesized += (
            f"Understanding these points together gives us a much clearer picture "
            f"of how this fits into the broader topic of {lecture_title}."
        )

        return synthesized

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
