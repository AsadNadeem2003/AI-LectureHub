"""
AI Lecture Script Generator with Thematic Cognitive Chunking
--------------------------------------------------------------
Primary LLM  : Groq (Llama 3.3 70B) — Free, fast, powerful
Fallback LLM : Google Gemini (hot-standby)
Final Fallback: Structured offline generator (no API needed)

Features:
- Thematic Cognitive Chunking: Automatically clusters long slide decks (e.g. 20-50 pages)
  into 8-14 high-impact, cohesive educational lecture modules.
- Preserves 100% of diagrams, key visual artifacts, and technical concepts.
- Generates natural, professor-style spoken explanations rather than verbatim readings.
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
                from openai import OpenAI  # type: ignore[import]
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
                import google.generativeai as genai  # type: ignore[import]
                genai.configure(api_key=self.gemini_api_key)
                self._gemini_ready = True
                print("[INFO] Gemini engine ready (hot-standby fallback).")
            except Exception as e:
                print(f"[WARN] Gemini init failed: {e}")

        if not self._groq_ready and not self._gemini_ready:
            print("[WARN] No LLM API available. Offline structured fallback will be used.")

    # ─────────────────────────────────────────────────────────────────────────
    # THEMATIC COGNITIVE CHUNKING
    # ─────────────────────────────────────────────────────────────────────────

    def cluster_pages(self, pages: List[ExtractedPage]) -> List[Dict[str, Any]]:
        """
        Intelligently clusters multi-page documents (e.g. 20-50 pages) into 8-14 high-impact
        thematic lecture modules while preserving diagrams and core conceptual structure.
        """
        total = len(pages)
        if total <= 10:
            return [
                {
                    "module_index": i + 1,
                    "pages": [p],
                    "primary_page_number": p.page_number,
                    "start_page": p.page_number,
                    "end_page": p.page_number,
                    "combined_text": p.text,
                    "images": p.images or []
                }
                for i, p in enumerate(pages)
            ]

        # Target 8 to 14 thematic modules
        target_count = min(14, max(8, total // 4))
        chunk_size = max(1, total // target_count)

        modules = []
        for i in range(0, total, chunk_size):
            group = pages[i : i + chunk_size]
            if not group:
                continue

            # Pick the best page for visual representation:
            # Prefer a page with images/diagrams or significant content
            best_page = group[0]
            for p in group:
                if p.images and len(p.images) > 0:
                    best_page = p
                    break
                elif len(p.text.strip()) > len(best_page.text.strip()):
                    best_page = p

            combined_text = "\n\n".join(
                f"[Page {p.page_number}]: {p.text.strip()}"
                for p in group if p.text.strip()
            )

            all_images = []
            for p in group:
                for img in (p.images or []):
                    if img not in all_images:
                        all_images.append(img)

            modules.append({
                "module_index": len(modules) + 1,
                "pages": group,
                "primary_page_number": best_page.page_number,
                "start_page": group[0].page_number,
                "end_page": group[-1].page_number,
                "combined_text": combined_text,
                "images": all_images if all_images else (best_page.images or [])
            })

        return modules

    # ─────────────────────────────────────────────────────────────────────────
    # PUBLIC INTERFACE
    # ─────────────────────────────────────────────────────────────────────────

    def generate_lecture_script(self, lecture_title: str, pages: List[ExtractedPage]) -> Dict[str, Any]:
        """
        Main entry point with Thematic Cognitive Chunking.
        Tries Groq → Gemini → offline fallback in order.
        """
        modules = self.cluster_pages(pages)

        # 1. Try Groq (Primary)
        if self._groq_ready:
            try:
                print(f"[INFO] Generating conceptual lecture script via Groq ({len(modules)} thematic modules)...")
                return self._call_groq(lecture_title, modules)
            except Exception as e:
                print(f"[WARN] Groq call failed: {e}. Trying Gemini fallback...")

        # 2. Try Gemini (Fallback)
        if self._gemini_ready:
            try:
                print(f"[INFO] Generating conceptual lecture script via Gemini ({len(modules)} thematic modules)...")
                return self._call_gemini(lecture_title, modules)
            except Exception as e:
                print(f"[WARN] Gemini call failed: {e}. Using offline fallback...")

        # 3. Offline Structured Fallback
        print(f"[INFO] Using offline structured fallback ({len(modules)} thematic modules).")
        return self._offline_fallback(lecture_title, modules)

    # ─────────────────────────────────────────────────────────────────────────
    # PRIVATE: GROQ ENGINE (PRIMARY)
    # ─────────────────────────────────────────────────────────────────────────

    def _call_groq(self, lecture_title: str, modules: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calls Groq (Llama 3.3 70B) to generate a conceptual, professor-style lecture."""
        slide_context = self._build_slide_context(modules)
        prompt = self._build_professor_prompt(lecture_title, slide_context)

        response = self._groq_client.chat.completions.create(
            model=self.groq_model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a world-class university professor who has been teaching for 20+ years. "
                        "You are brilliant at transforming complex curriculum slides into engaging, "
                        "deeply conceptual spoken lecture modules. You NEVER read slides verbatim. "
                        "You explain ideas with clarity, real-world analogies, and smooth academic transitions."
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
        return self._parse_slide_scripts(raw_text, modules, lecture_title)

    # ─────────────────────────────────────────────────────────────────────────
    # PRIVATE: GEMINI ENGINE (FALLBACK)
    # ─────────────────────────────────────────────────────────────────────────

    def _call_gemini(self, lecture_title: str, modules: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calls Google Gemini to generate a professor-style lecture (fallback path)."""
        import google.generativeai as genai  # type: ignore[import]

        slide_context = self._build_slide_context(modules)
        prompt = self._build_professor_prompt(lecture_title, slide_context)

        model = genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            generation_config={"temperature": 0.78, "top_p": 0.9, "max_output_tokens": 8192}
        )
        response = model.generate_content(prompt)
        raw_text = response.text or ""
        return self._parse_slide_scripts(raw_text, modules, lecture_title)

    # ─────────────────────────────────────────────────────────────────────────
    # PRIVATE: SHARED HELPERS
    # ─────────────────────────────────────────────────────────────────────────

    def _build_slide_context(self, modules: List[Dict[str, Any]]) -> str:
        """Formats clustered modules into a clean context block for the LLM prompt."""
        context = ""
        for mod in modules:
            m_idx = mod["module_index"]
            start_p = mod.get("start_page", m_idx)
            end_p = mod.get("end_page", m_idx)
            page_label = f"Pages {start_p}–{end_p}" if start_p != end_p else f"Page {start_p}"
            context += f"--- MODULE {m_idx} ({page_label}) ---\n"
            context += f"{mod['combined_text'].strip() or '[Visual / Diagram Concept]'}\n\n"
        return context

    def _build_professor_prompt(self, lecture_title: str, slide_context: str) -> str:
        """Builds the detailed professor-persona prompt."""
        return f"""You are delivering a live university masterclass lecture titled: "{lecture_title}".

CRITICAL INSTRUCTIONS — READ CAREFULLY:
1. DO NOT read or copy the slide text word-for-word. The source material is your teaching reference notes.
2. For each module, UNDERSTAND what concept it teaches — then EXPLAIN that concept in your own words with depth, energy, and clarity.
3. Use real-world analogies, comparisons, and cause-and-effect reasoning to make abstract ideas concrete.
4. For each module: Introduce the concept naturally → Explain the core principles → Provide a practical example → Bridge smoothly to the next topic.
5. Use warm transitions between modules: "Building on that foundation...", "Now that we understand why this matters...", "Here is where this connects practically..."
6. Each module's narration should be 4-7 natural spoken sentences (around 30-50 seconds of spoken audio).
7. Format the language cleanly for natural Text-To-Speech pronunciation. Avoid complex markdown, bullet symbols, or robotic phrasing.

FORMAT RULE: Begin each module's spoken explanation with exactly [MODULE_X] where X is the module number.

LECTURE MODULES TO TEACH FROM:
{slide_context}

Now deliver the full conceptual lecture below:"""

    def _parse_slide_scripts(
        self, raw_text: str, modules: List[Dict[str, Any]], lecture_title: str
    ) -> Dict[str, Any]:
        """Parses the [MODULE_X] or [SLIDE_X] tagged output into structured slide scripts."""
        slide_scripts = []
        full_transcript_parts = []

        for mod in modules:
            m_idx = mod["module_index"]
            p_num = mod["primary_page_number"]
            start_p = mod.get("start_page", p_num)
            end_p = mod.get("end_page", p_num)

            pattern = rf"\[(?:MODULE|SLIDE)_{m_idx}\](.*?)(?=\[(?:MODULE|SLIDE)_\d+\]|$)"
            match = re.search(pattern, raw_text, re.DOTALL | re.IGNORECASE)

            if match and match.group(1).strip():
                script_text = match.group(1).strip()
            else:
                print(f"[WARN] LLM did not produce output for module {m_idx}. Using conceptual fallback.")
                script_text = self._conceptual_fallback_module(m_idx, mod["combined_text"], lecture_title, start_p, end_p)

            keywords = self._extract_keywords(mod["combined_text"], script_text, lecture_title)
            slide_scripts.append({
                "page_number": p_num,
                "script_text": script_text,
                "keywords": keywords,
                "images": mod.get("images", []),
                "start_page": start_p,
                "end_page": end_p
            })
            label = f"Topic {m_idx} (Pages {start_p}-{end_p})" if start_p != end_p else f"Slide {p_num}"
            full_transcript_parts.append(f"{label}: {script_text}")

        return {
            "full_transcript": "\n\n".join(full_transcript_parts),
            "slide_scripts": slide_scripts
        }

    # ─────────────────────────────────────────────────────────────────────────
    # PRIVATE: OFFLINE FALLBACK
    # ─────────────────────────────────────────────────────────────────────────

    def _offline_fallback(self, lecture_title: str, modules: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generates a structured, conceptual script offline when LLM APIs are unreachable."""
        slide_scripts = []
        full_transcript_parts = []

        for i, mod in enumerate(modules):
            m_idx = mod["module_index"]
            p_num = mod["primary_page_number"]
            start_p = mod.get("start_page", p_num)
            end_p = mod.get("end_page", p_num)

            script_text = self._conceptual_fallback_module(m_idx, mod["combined_text"], lecture_title, start_p, end_p)

            if i > 0 and script_text:
                transition = self._get_transition(i, len(modules))
                script_text = transition + script_text[0].lower() + script_text[1:]

            keywords = self._extract_keywords(mod["combined_text"], script_text, lecture_title)
            slide_scripts.append({
                "page_number": p_num,
                "script_text": script_text,
                "keywords": keywords,
                "images": mod.get("images", []),
                "start_page": start_p,
                "end_page": end_p
            })
            label = f"Topic {m_idx} (Pages {start_p}-{end_p})" if start_p != end_p else f"Slide {p_num}"
            full_transcript_parts.append(f"{label}: {script_text}")

        return {
            "full_transcript": "\n\n".join(full_transcript_parts),
            "slide_scripts": slide_scripts
        }

    def _get_transition(self, slide_index: int, total_slides: int) -> str:
        """Returns a natural, varied transition phrase based on module position."""
        transitions = [
            "Building on what we just discussed, ",
            "Now here is where it gets particularly interesting. ",
            "Let us take this concept a step further. ",
            "With that foundation in place, ",
            "This naturally leads us to the next critical idea. ",
            "Connecting this to the broader architecture, ",
            "Having established that concept, let us explore ",
        ]
        return transitions[slide_index % len(transitions)]

    def _conceptual_fallback_module(
        self, module_index: int, module_text: str, lecture_title: str, start_p: int, end_p: int
    ) -> str:
        """Generates a conceptual synthesis for a thematic module."""
        clean = module_text.strip()

        if not clean:
            return (
                f"In this section of {lecture_title}, we focus on key visual diagrams and architectures. "
                f"Take a moment to examine the representations shown here. "
                f"Notice how these elements illustrate the relationships between the foundational principles we are studying."
            )

        lines = [line.strip() for line in clean.split('\n') if line.strip() and not line.startswith('[Page')]
        content_lines = [l for l in lines if len(l) > 10]
        if not content_lines:
            content_lines = lines or [clean]

        intro = content_lines[0]
        body_points = content_lines[1:4]

        synthesized = f"The core concept in this module focuses on {intro}. "
        if body_points:
            synthesized += f"First, {body_points[0]}. "
            if len(body_points) > 1:
                synthesized += f"Additionally, {body_points[1]}. "
            if len(body_points) > 2:
                synthesized += f"Furthermore, {body_points[2]}. "

        synthesized += (
            f"Understanding these connected ideas provides a solid grasp of this section in {lecture_title}."
        )
        return synthesized

    # ─────────────────────────────────────────────────────────────────────────
    # PRIVATE: KEYWORD EXTRACTION
    # ─────────────────────────────────────────────────────────────────────────

    def _extract_keywords(
        self, raw_text: str, script_text: str, lecture_title: str
    ) -> List[str]:
        """Extracts high-impact academic keywords."""
        combined = f"{raw_text} {script_text} {lecture_title}"
        multi_word = re.findall(r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b", raw_text)
        stopwords = {
            "slide", "welcome", "section", "lecture", "building", "turning",
            "moving", "forward", "attention", "moment", "carefully", "understand",
            "clearly", "consider", "before", "covered", "professor", "university",
            "module", "pages", "page"
        }
        concepts: List[str] = []
        for phrase in multi_word:
            p = phrase.strip()
            if p.lower() not in stopwords and len(p) > 4 and p not in concepts:
                concepts.append(p)

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
