"""Text-To-Speech (TTS) synthesis service for generating lecture audio and calculating timestamps."""

import os
from typing import List, Dict, Any, Optional
from app.config import settings

AUDIO_OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "audio"))
os.makedirs(AUDIO_OUTPUT_DIR, exist_ok=True)


class TTSService:
    """Service to convert script text to MP3 audio files and generate timestamp alignments."""

    def synthesize_slide_scripts(
        self,
        lecture_id: str,
        slide_scripts: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Synthesize TTS audio for each slide script and combine into full lecture audio.
        
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
            text = slide.get("script_text", "").strip() or f"Slide {p_num}"

            # Calculate duration (approx 150 words per minute = 2.5 words per sec = ~400ms per word)
            word_count = max(1, len(text.split()))
            estimated_duration_ms = max(4000, word_count * 400)

            # Generate MP3 using gTTS
            audio_filename = f"{lecture_id}_p{p_num}.mp3"
            audio_filepath = os.path.join(AUDIO_OUTPUT_DIR, audio_filename)

            slide_bytes = b""
            try:
                from gtts import gTTS
                tts = gTTS(text=text, lang="en", slow=False)
                tts.save(audio_filepath)
                with open(audio_filepath, "rb") as f:
                    slide_bytes = f.read()
            except Exception as e:
                print(f"[WARN] gTTS synthesis fallback for page {p_num}: {e}")
                slide_bytes = b""

            if slide_bytes:
                all_audio_bytes.extend(slide_bytes)

            start_ms = current_time_ms
            end_ms = current_time_ms + estimated_duration_ms
            current_time_ms = end_ms

            audio_url = f"/data/audio/{audio_filename}"

            slide_timings.append({
                "page_number": p_num,
                "script_text": text,
                "keywords": slide.get("keywords", []),
                "start_time_ms": start_ms,
                "end_time_ms": end_ms,
                "duration_ms": estimated_duration_ms,
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
