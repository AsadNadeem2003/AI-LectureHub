"""Pydantic models for API request/response validation."""

from pydantic import BaseModel
from typing import List, Optional


class ProcessLectureRequest(BaseModel):
    """Request body for the /ai/process-lecture endpoint."""
    lecture_id: str
    file_url: str
    file_type: str  # "pdf" or "pptx"
    title: str
    callback_url: Optional[str] = None  # URL to notify backend when done


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
    """Response from the processing pipeline."""
    lecture_id: str
    status: str  # "success" or "failed"
    transcript: Optional[str] = None
    audio_url: Optional[str] = None
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


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
