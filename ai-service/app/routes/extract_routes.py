"""FastAPI routes for document extraction (PDF, PPTX, DOCX)."""

from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from typing import Optional
import os
from app.models import ExtractionResult
from app.parsers.pdf_parser import parse_pdf
from app.parsers.pptx_parser import parse_pptx
from app.parsers.docx_parser import parse_docx

router = APIRouter(prefix="/api/v1", tags=["Extraction"])


@router.post("/extract", response_model=ExtractionResult)
async def extract_document(
    file: UploadFile = File(...),
    file_type: Optional[str] = Form(None)
):
    """Extract slide/page text and images from uploaded PDF, PPTX, or DOCX document.
    
    Supports:
    - .pdf -> PyMuPDF
    - .pptx / .ppt -> python-pptx
    - .docx / .doc -> python-docx
    """
    filename = file.filename or "uploaded_file"
    file_ext = filename.split(".")[-1].lower() if "." in filename else ""

    # Infer extension smartly: ignore Swagger UI default placeholder "string"
    if file_type and file_type.strip().lower() not in ["string", "null", "none", ""]:
        ext = file_type.strip().lower().lstrip(".")
    else:
        ext = file_ext

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        if ext == "pdf":
            result = parse_pdf(content)
        elif ext in ["pptx", "ppt"]:
            result = parse_pptx(content)
        elif ext in ["docx", "doc"]:
            result = parse_docx(content)
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file format '.{ext}'. Supported formats: .pdf, .pptx, .docx"
            )

        result.metadata["filename"] = filename
        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to extract document content: {str(e)}"
        )
