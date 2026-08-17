"""Text-To-Speech (TTS) synthesis service for generating lecture audio and calculating timestamps."""

import os
import re
from typing import List, Dict, Any, Optional
from app.config import settings

AUDIO_OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "audio"))
os.makedirs(AUDIO_OUTPUT_DIR, exist_ok=True)


class TTSService:
    """Service to convert conceptual lecture scripts to MP3 audio and generate synced timestamps."""

    def _clean_text_for_speech(self, text: str) -> str:
        """
        Clean and normalize text for natural TTS pronunciation.
        Removes formatting artifacts that sound awkward when spoken aloud.
        """
        cleaned = text

        # Remove markdown-style formatting (bold, italic, headers)
        cleaned = re.sub(r'\*\*(.+?)\*\*', r'\1', cleaned)
        cleaned = re.sub(r'\*(.+?)\*', r'\1', cleaned)
        cleaned = re.sub(r'^#+\s*', '', cleaned, flags=re.MULTILINE)

        # Remove [SLIDE_X] tags if they leaked through
        cleaned = re.sub(r'\[SLIDE_\d+\]', '', cleaned, flags=re.IGNORECASE)

        # Replace bullet point markers with natural pauses
        cleaned = re.sub(r'^[\-•*]\s*', '', cleaned, flags=re.MULTILINE)

        # Replace abbreviations that TTS engines mispronounce
        abbreviations = {
            "e.g.": "for example",
            "i.e.": "that is",
            "etc.": "and so on",
            "vs.": "versus",
            "Dr.": "Doctor",
            "Prof.": "Professor",
            "Fig.": "Figure",
            "approx.": "approximately",
        }
        for abbr, replacement in abbreviations.items():
            cleaned = cleaned.replace(abbr, replacement)

        # Collapse excessive whitespace and newlines into single spaces
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()

        # Remove any remaining special characters that cause TTS glitches
        cleaned = re.sub(r'[{}\[\]<>|\\^~`]', '', cleaned)

        return cleaned

    def synthesize_slide_scripts(
        self,
        lecture_id: str,
        slide_scripts: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Synthesize TTS audio for each conceptual lecture script and combine into full lecture audio.
        
        Args:
            lecture_id: Identifier for the lecture
            slide_scripts: List of dicts containing page_number, script_text, keywords
            
        Returns:
            Dict containing:
                - full_audio_url: local path or Cloudinary URL
                - total_duration_ms: total duration of lecture audio
                - slide_timings: List[Dict] with page_number, start_time_ms, end_time_ms, audio_path
        """
        slide_timings = []
        current_time_ms = 0
        all_audio_bytes = bytearray()

        for slide in slide_scripts:
            p_num = slide.get("page_number", 1)
            raw_text = slide.get("script_text", "").strip() or f"Slide {p_num}"

            # Clean text for natural TTS pronunciation
            text = self._clean_text_for_speech(raw_text)

            # Generate MP3 using gTTS
            audio_filename = f"{lecture_id}_p{p_num}.mp3"
            audio_filepath = os.path.join(AUDIO_OUTPUT_DIR, audio_filename)

            slide_bytes = b""
            actual_duration_ms = 4000  # Fallback default
            
            try:
                from gtts import gTTS
                tts = gTTS(text=text, lang="en", slow=False)
                tts.save(audio_filepath)
                
                # Get the EXACT duration using mutagen to fix syncing mismatch
                try:
                    from mutagen.mp3 import MP3
                    audio_info = MP3(audio_filepath)
                    actual_duration_ms = int(audio_info.info.length * 1000)
                except Exception as e:
                    print(f"[WARN] Failed to read exact duration for {audio_filepath}: {e}")
                    # Fallback to estimation if mutagen fails
                    word_count = max(1, len(text.split()))
                    actual_duration_ms = max(4000, word_count * 400)

                with open(audio_filepath, "rb") as f:
                    slide_bytes = f.read()
            except Exception as e:
                print(f"[WARN] gTTS synthesis fallback for page {p_num}: {e}")
                slide_bytes = b""

            if slide_bytes:
                all_audio_bytes.extend(slide_bytes)

            start_ms = current_time_ms
            end_ms = current_time_ms + actual_duration_ms
            current_time_ms = end_ms

            audio_url = f"/data/audio/{audio_filename}"

            slide_timings.append({
                "page_number": p_num,
                "script_text": text,
                "keywords": slide.get("keywords", []),
                "start_time_ms": start_ms,
                "end_time_ms": end_ms,
                "duration_ms": actual_duration_ms,
                "audio_url": audio_url
            })

        # Save combined full lecture MP3 audio file
        main_audio_filename = f"{lecture_id}_full.mp3"
        main_audio_filepath = os.path.join(AUDIO_OUTPUT_DIR, main_audio_filename)

        if all_audio_bytes:
            with open(main_audio_filepath, "wb") as f:
                f.write(all_audio_bytes)
            print(f"[OK] Created combined full audio file: {main_audio_filename} ({len(all_audio_bytes)} bytes)")
        else:
            with open(main_audio_filepath, "wb") as outfile:
                for slide in slide_scripts:
                    p_num = slide.get("page_number", 1)
                    pf = os.path.join(AUDIO_OUTPUT_DIR, f"{lecture_id}_p{p_num}.mp3")
                    if os.path.exists(pf):
                        with open(pf, "rb") as infile:
                            outfile.write(infile.read())

        main_audio_url = f"/data/audio/{main_audio_filename}"

        # Optional Cloudinary upload
        cloudinary_url = self._upload_to_cloudinary(main_audio_filepath, main_audio_filename)
        if cloudinary_url:
            main_audio_url = cloudinary_url

        return {
            "full_audio_url": main_audio_url,
            "total_duration_ms": current_time_ms,
            "slide_timings": slide_timings
        }

    def _upload_to_cloudinary(self, filepath: str, filename: str) -> Optional[str]:
        """Upload audio file to Cloudinary if credentials are configured."""
        if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET:
            try:
                import cloudinary
                import cloudinary.uploader
                cloudinary.config(
                    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
                    api_key=settings.CLOUDINARY_API_KEY,
                    api_secret=settings.CLOUDINARY_API_SECRET
                )
                res = cloudinary.uploader.upload(
                    filepath,
                    resource_type="video",  # Audio files use video resource_type in Cloudinary
                    public_id=f"lecturehub/audio/{filename}"
                )
                return res.get("secure_url")
            except Exception as e:
                print(f"[WARN] Cloudinary audio upload failed: {e}")
        return None


# Global instance
tts_service = TTSService()
