"""Pydantic models for API request/response validation."""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class ProcessLectureRequest(BaseModel):
    """Request body for processing a lecture."""
    lecture_id: str
    file_url: str
    file_type: str = Field(..., description="File format: pdf, pptx, docx")
    title: str
    callback_url: Optional[str] = None


class ExtractedPage(BaseModel):
    """Extracted text and images for a single page/slide/section."""
    page_number: int
    text: str
    images: List[str] = []  # base64 data URLs or stored file paths


class ExtractionResult(BaseModel):
    """Result of extracting content from a document."""
    file_type: str
    total_pages: int
    pages: List[ExtractedPage] = []
    metadata: Dict[str, Any] = {}


class VectorIndexRequest(BaseModel):
    """Request body to index extracted pages into ChromaDB vectorstore."""
    lecture_id: str
    pages: List[ExtractedPage]


class VectorIndexResponse(BaseModel):
    """Response after vectorstore indexing."""
    lecture_id: str
    total_chunks: int
    status: str = "success"


class VectorQueryRequest(BaseModel):
    """Request body for vector similarity search."""
    lecture_id: str
    query: str
    top_k: int = 3


class VectorQueryResult(BaseModel):
    """Result chunk from vector query."""
    chunk_text: str
    page_number: int
    score: float


class VectorQueryResponse(BaseModel):
    """Response containing retrieved source chunks."""
    lecture_id: str
    results: List[VectorQueryResult] = []


class SlideScript(BaseModel):
    """Generated script for a single slide."""
    page_number: int
    script_text: str
    keywords: List[str] = []


class GenerateScriptRequest(BaseModel):
    """Request body for Gemini LLM script generation."""
    lecture_title: str
    pages: List[ExtractedPage]


class GenerateScriptResponse(BaseModel):
    """Response containing generated lecture script."""
    full_transcript: str
    slide_scripts: List[SlideScript] = []


class SynthesizeTTSRequest(BaseModel):
    """Request body for TTS synthesis."""
    lecture_id: str
    slide_scripts: List[SlideScript]


class SlideTiming(BaseModel):
    """TTS timing data for a single slide."""
    page_number: int
    script_text: str
    keywords: List[str] = []
    start_time_ms: int
    end_time_ms: int
    duration_ms: int
    audio_url: str


class SynthesizeTTSResponse(BaseModel):
    """Response containing synthesized audio data."""
    full_audio_url: str
    total_duration_ms: int
    slide_timings: List[SlideTiming] = []


class LectureSegmentOut(BaseModel):
    """A single lecture segment with sync data."""
    segment_index: int
    segment_text: str
    page_number: int
    image_urls: List[str]
    start_time_ms: int
    end_time_ms: int
    keywords: List[str] = []


class ProcessLectureResponse(BaseModel):
    """Response from the end-to-end processing pipeline."""
    lecture_id: str
    status: str
    total_pages: int = 0
    total_chunks_indexed: int = 0
    transcript: Optional[str] = None
    audio_url: Optional[str] = None
    total_duration_ms: int = 0
    segments: List[LectureSegmentOut] = []
    error_message: Optional[str] = None


class AskQuestionRequest(BaseModel):
    """Request body for the /ai/ask endpoint."""
    lecture_id: str
    question: str
    timestamp_ms: int = 0


class AskQuestionResponse(BaseModel):
    """Response from the RAG Q&A engine."""
    answer: Optional[str] = None
    confidence: float
    sources: List[str] = []
    escalated: bool = False
