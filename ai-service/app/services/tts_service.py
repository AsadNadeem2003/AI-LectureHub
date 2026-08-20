"""Text-To-Speech (TTS) synthesis service for generating lecture audio and calculating timestamps."""

import os
import re
import asyncio
import subprocess
from typing import List, Dict, Any, Optional
from app.config import settings

AUDIO_OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "audio"))
os.makedirs(AUDIO_OUTPUT_DIR, exist_ok=True)


class TTSService:
    """Service to convert conceptual lecture scripts to MP3 audio and generate synced timestamps."""

    def _clean_text_for_speech(self, text: str) -> str:
        """Clean and normalize text for natural TTS pronunciation."""
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

    def _synthesize_single_slide(self, text: str, output_path: str) -> bool:
        """Synthesize a single slide audio using Edge-TTS (primary) or gTTS (fallback)."""
        # Try Edge-TTS first (ultra-fast neural professor voice)
        try:
            import edge_tts
            voice = "en-US-ChristopherNeural"

            async def _run_edge():
                communicate = edge_tts.Communicate(text, voice)
                await communicate.save(output_path)

            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    import concurrent.futures
                    with concurrent.futures.ThreadPoolExecutor() as executor:
                        future = executor.submit(asyncio.run, _run_edge())
                        future.result(timeout=15)
                else:
                    loop.run_until_complete(_run_edge())
            except RuntimeError:
                asyncio.run(_run_edge())

            if os.path.exists(output_path) and os.path.getsize(output_path) > 100:
                return True
        except Exception as e:
            print(f"[INFO] Edge-TTS fallback to gTTS: {e}")

        # Fallback to gTTS
        try:
            from gtts import gTTS
            tts = gTTS(text=text, lang="en", slow=False)
            tts.save(output_path)
            if os.path.exists(output_path) and os.path.getsize(output_path) > 100:
                return True
        except Exception as e:
            print(f"[WARN] gTTS synthesis failed: {e}")

        return False

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
        generated_slide_files = []

        for slide in slide_scripts:
            p_num = slide.get("page_number", 1)
            raw_text = slide.get("script_text", "").strip() or f"Slide {p_num}"

            # Clean text for natural TTS pronunciation
            text = self._clean_text_for_speech(raw_text)

            audio_filename = f"{lecture_id}_p{p_num}.mp3"
            audio_filepath = os.path.join(AUDIO_OUTPUT_DIR, audio_filename)

            actual_duration_ms = max(3000, len(text.split()) * 400)

            success = self._synthesize_single_slide(text, audio_filepath)

            if success and os.path.exists(audio_filepath):
                generated_slide_files.append(audio_filepath)
                try:
                    from mutagen.mp3 import MP3
                    audio_info = MP3(audio_filepath)
                    actual_duration_ms = max(1000, int(audio_info.info.length * 1000))
                except Exception as e:
                    print(f"[WARN] Failed to read exact duration for {audio_filepath}: {e}")

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

        # Save combined full lecture MP3 audio file cleanly via ffmpeg concat
        main_audio_filename = f"{lecture_id}_full.mp3"
        main_audio_filepath = os.path.join(AUDIO_OUTPUT_DIR, main_audio_filename)

        combined_success = False
        if generated_slide_files:
            # Method 1: Clean ffmpeg concatenation (proper MP3 frame synchronization)
            concat_list_path = os.path.join(AUDIO_OUTPUT_DIR, f"{lecture_id}_concat.txt")
            try:
                with open(concat_list_path, "w", encoding="utf-8") as f:
                    for s_path in generated_slide_files:
                        safe_path = s_path.replace("\\", "/")
                        f.write(f"file '{safe_path}'\n")

                cmd = [
                    "ffmpeg", "-y", "-f", "concat", "-safe", "0",
                    "-i", concat_list_path,
                    "-c:a", "libmp3lame", "-b:a", "128k",
                    main_audio_filepath
                ]
                res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=30)
                if res.returncode == 0 and os.path.exists(main_audio_filepath) and os.path.getsize(main_audio_filepath) > 500:
                    combined_success = True
                    print(f"[OK] Successfully combined {len(generated_slide_files)} audio slides with ffmpeg: {main_audio_filename}")
            except Exception as e:
                print(f"[WARN] ffmpeg concatenation error: {e}")
            finally:
                if os.path.exists(concat_list_path):
                    try:
                        os.remove(concat_list_path)
                    except Exception:
                        pass

            # Method 2: Fallback byte concatenation if ffmpeg fails
            if not combined_success:
                try:
                    with open(main_audio_filepath, "wb") as outfile:
                        for s_path in generated_slide_files:
                            with open(s_path, "rb") as infile:
                                outfile.write(infile.read())
                    combined_success = True
                except Exception as e:
                    print(f"[ERROR] Byte concatenation fallback failed: {e}")

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
                    resource_type="video",
                    public_id=f"lecturehub/audio/{filename}"
                )
                return res.get("secure_url")
            except Exception as e:
                print(f"[WARN] Cloudinary audio upload failed: {e}")
        return None


# Global instance
tts_service = TTSService()
