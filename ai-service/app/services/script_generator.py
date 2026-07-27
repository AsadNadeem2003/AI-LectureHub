"""Gemini LLM Script Generator service for converting document slides into continuous educational lecture transcripts."""

import os
import re
from typing import List, Dict, Any
from app.models import ExtractedPage
from app.config import settings


class GeminiScriptGenerator:
    """Service to generate natural educational lecture scripts using Google Gemini API."""

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
        self._genai_configured = False
        self._init_client()

    def _init_client(self):
        if self.api_key and not self._genai_configured:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self._genai_configured = True
            except Exception as e:
                print(f"[WARN] Failed to configure Gemini API: {e}")

    def generate_lecture_script(self, lecture_title: str, pages: List[ExtractedPage]) -> Dict[str, Any]:
        """Generate structured slide-by-slide lecture transcript.
        
        Returns:
            Dict containing:
                - full_transcript: str
                - slide_scripts: List[Dict] with page_number, script_text, keywords
        """
        if self._genai_configured and self.api_key:
            try:
                return self._call_gemini_api(lecture_title, pages)
            except Exception as e:
                print(f"[WARN] Gemini API call failed or rate-limited ({e}). Using structured script fallback...")

        return self._generate_structured_fallback(lecture_title, pages)

    def _call_gemini_api(self, lecture_title: str, pages: List[ExtractedPage]) -> Dict[str, Any]:
        """Call Gemini LLM to rewrite slides into a smooth educational transcript."""
        import google.generativeai as genai

        prompt = f"You are an expert university professor delivering a lecture titled: '{lecture_title}'.\n\n"
        prompt += "Below are the extracted slide contents page by page. Rewrite this material into a clear, continuous, engaging spoken lecture script.\n"
        prompt += "For each page, start your output section with [SLIDE_X] (where X is the page number).\n\n"

        for page in pages:
            prompt += f"--- [SLIDE_{page.page_number}] ---\n"
            prompt += f"{page.text.strip() or 'Visual slide / diagram content.'}\n\n"

        prompt += "\nFormat instructions:\n"
        prompt += "1. Output each slide's script under tag [SLIDE_X].\n"
        prompt += "2. Make the language clear, natural, educational, and easy to follow when spoken aloud.\n"

        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(prompt)
        raw_text = response.text or ""

        slide_scripts = []
        full_transcript_parts = []

        for page in pages:
            p_num = page.page_number
            pattern = rf"\[SLIDE_{p_num}\](.*?)(?=\[SLIDE_\d+\]|$)"
            match = re.search(pattern, raw_text, re.DOTALL | re.IGNORECASE)

            if match and match.group(1).strip():
                script_text = match.group(1).strip()
            else:
                script_text = self._fallback_single_page(p_num, page.text, lecture_title)

            keywords = self._extract_core_academic_concepts(page.text, script_text, lecture_title)
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

    def _generate_structured_fallback(self, lecture_title: str, pages: List[ExtractedPage]) -> Dict[str, Any]:
        """Structured offline fallback generator."""
        slide_scripts = []
        full_transcript_parts = []

        for page in pages:
            p_num = page.page_number
            script_text = self._fallback_single_page(p_num, page.text, lecture_title)
            keywords = self._extract_core_academic_concepts(page.text, script_text, lecture_title)

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

    def _fallback_single_page(self, page_number: int, page_text: str, lecture_title: str) -> str:
        clean_text = page_text.strip()
        if not clean_text:
            return f"On slide {page_number} of {lecture_title}, we examine the key visual diagram and concept illustrated here."
        
        first_sentence = clean_text.split(".")[0]
        return f"Welcome to slide {page_number}. In this section of {lecture_title}, we focus on {first_sentence}. Specifically, {clean_text}"

    def _extract_core_academic_concepts(self, raw_page_text: str, script_text: str, lecture_title: str) -> List[str]:
        """Extract high-impact core academic concepts, filtering out filler words."""
        combined_text = f"{raw_page_text} {script_text} {lecture_title}"

        # 1. First, search for Multi-Word Technical Capitalized Phrases (e.g. "Deep Learning", "Neural Networks", "Gradient Descent")
        multi_word_matches = re.findall(r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b", raw_page_text)
        
        filler_phrases = {
            "slide", "welcome", "section", "lecture",
            "particular facts", "cross cases", "judicial consensus", "ratio decidendi",
            "tentatively assess", "single incident", "opposite party", "mere assertion"
        }

        concepts = []
        for phrase in multi_word_matches:
            clean_phrase = phrase.strip()
            if clean_phrase.lower() not in filler_phrases and len(clean_phrase) > 4:
                if clean_phrase not in concepts:
                    concepts.append(clean_phrase)

        # 2. Extract Single Academic Nouns/Keywords (deduplicate if already in multi-word concepts)
        single_words = re.findall(r"\b[A-Za-z]{4,}\b", combined_text)
        stopwords = {
            "this", "that", "with", "from", "have", "here", "were", "what", "when", "your",
            "more", "also", "into", "page", "slide", "welcome", "section", "focus", "specifically",
            "appears", "consensus", "application", "principles", "particular", "facts", "circumstances",
            "proposition", "illustrated", "cases", "constitute", "assertion", "counter", "enough",
            "courts", "tentatively", "assess", "parties", "venue", "transaction", "result", "incident",
            "narrated", "opposing", "rationale", "frivolous", "false", "exaggerated", "gain", "advantage",
            "examine", "overview", "summary", "introduction", "about", "there"
        }

        for w in single_words:
            w_cap = w.capitalize()
            is_in_concept = any(w.lower() in c.lower() for c in concepts)
            if w.lower() not in stopwords and not is_in_concept and w_cap not in concepts and len(w) > 3:
                concepts.append(w_cap)

        # 3. Always ensure fallback academic concept from lecture title if empty
        if not concepts:
            title_keywords = [w.capitalize() for w in re.findall(r"\b[A-Za-z]{4,}\b", lecture_title) if w.lower() not in stopwords]
            concepts.extend(title_keywords)

        # Return top 4 distinct core concepts
        return concepts[:4] or ["Core Concept", "Key Principles"]


# Global instance
script_generator = GeminiScriptGenerator()
