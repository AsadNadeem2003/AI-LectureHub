"""FastAPI routes for Gemini Script Generation, TTS Synthesis, and Slide Alignment Processing."""

import os
import traceback
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional, List

from app.models import (
    GenerateScriptRequest,
    GenerateScriptResponse,
    SynthesizeTTSRequest,
    SynthesizeTTSResponse,
    ProcessLectureResponse,
    SlideScript,
    SlideTiming,
    ExtractedPage
)
from app.services.script_generator import script_generator
from app.services.tts_service import tts_service
from app.services.segment_mapper import segment_mapper
from app.vectorstore.chroma_manager import vector_manager
from app.parsers.pdf_parser import parse_pdf
from app.parsers.pptx_parser import parse_pptx
from app.parsers.docx_parser import parse_docx

router = APIRouter(prefix="/api/v1/process", tags=["Processing Engine"])


@router.post("/generate-script", response_model=GenerateScriptResponse)
def generate_script(payload: GenerateScriptRequest):
    """Generate educational lecture script from extracted pages using Gemini LLM."""
    if not payload.pages:
        raise HTTPException(status_code=400, detail="No pages provided for script generation.")

    try:
        res = script_generator.generate_lecture_script(
            lecture_title=payload.lecture_title,
            pages=payload.pages
        )
        slide_scripts = [
            SlideScript(
                page_number=item["page_number"],
                script_text=item["script_text"],
                keywords=item["keywords"]
            )
            for item in res["slide_scripts"]
        ]
        return GenerateScriptResponse(
            full_transcript=res["full_transcript"],
            slide_scripts=slide_scripts
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Script generation failed: {str(e)}"
        )


@router.post("/synthesize-tts", response_model=SynthesizeTTSResponse)
def synthesize_tts(payload: SynthesizeTTSRequest):
    """Synthesize TTS audio and calculate timestamps for slide scripts."""
    if not payload.slide_scripts:
        raise HTTPException(status_code=400, detail="No slide scripts provided for TTS synthesis.")

    try:
        raw_scripts = [item.model_dump() for item in payload.slide_scripts]
        res = tts_service.synthesize_slide_scripts(
            lecture_id=payload.lecture_id,
            slide_scripts=raw_scripts
        )
        timings = [
            SlideTiming(
                page_number=t["page_number"],
                script_text=t["script_text"],
                keywords=t["keywords"],
                start_time_ms=t["start_time_ms"],
                end_time_ms=t["end_time_ms"],
                duration_ms=t["duration_ms"],
                audio_url=t["audio_url"]
            )
            for t in res["slide_timings"]
        ]
        return SynthesizeTTSResponse(
            full_audio_url=res["full_audio_url"],
            total_duration_ms=res["total_duration_ms"],
            slide_timings=timings
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"TTS synthesis failed: {str(e)}"
        )


@router.post("/process-lecture", response_model=ProcessLectureResponse)
def process_lecture(
    file: UploadFile = File(...),
    lecture_id: str = Form(...),
    title: str = Form(...)
):
    """Full End-to-End Processing Pipeline:
    1. Parse document (PDF / PPTX / DOCX) page by page.
    2. Index text into ChromaDB vectorstore.
    3. Generate Gemini LLM educational script.
    4. Synthesize TTS audio with timestamps.
    5. Construct synchronized slide segments.
    """
    try:
        filename = file.filename or "lecture_file"
        ext = os.path.splitext(filename)[1].lower().lstrip(".")

        if ext not in ["pdf", "pptx", "docx"]:
            raise HTTPException(status_code=400, detail=f"Unsupported file format '.{ext}'. Must be pdf, pptx, or docx")

        file_bytes = file.file.read()
        if not file_bytes:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        # Step 1: Parse Document
        if ext == "pdf":
            extraction = parse_pdf(file_bytes)
        elif ext == "pptx":
            extraction = parse_pptx(file_bytes)
        else:
            extraction = parse_docx(file_bytes)

        pages = extraction.pages

        if not pages:
            raise HTTPException(status_code=400, detail="No readable text or pages found in document.")

        # Step 2: Index into ChromaDB vector store
        total_chunks = vector_manager.index_lecture_pages(
            lecture_id=lecture_id,
            pages=pages
        )

        # Step 3: Generate Gemini Script
        script_res = script_generator.generate_lecture_script(
            lecture_title=title,
            pages=pages
        )

        # Step 4: Synthesize TTS Audio & Timestamps
        tts_res = tts_service.synthesize_slide_scripts(
            lecture_id=lecture_id,
            slide_scripts=script_res["slide_scripts"]
        )

        # Step 5: Construct Synchronized Segments
        segments = segment_mapper.create_synchronized_segments(
            pages=pages,
            slide_timings=tts_res["slide_timings"]
        )

        return ProcessLectureResponse(
            lecture_id=lecture_id,
            status="completed",
            total_pages=len(pages),
            total_chunks_indexed=total_chunks,
            transcript=script_res["full_transcript"],
            audio_url=tts_res["full_audio_url"],
            total_duration_ms=tts_res["total_duration_ms"],
            segments=segments
        )

    except HTTPException:
        raise
    except Exception as e:
        tb = traceback.format_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Lecture processing failed: {str(e)}\n\n{tb}"
        )
