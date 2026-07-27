"""PDF Parser using PyMuPDF (fitz) to extract text and high-res page slide images."""

import fitz  # PyMuPDF
import base64
import os
from typing import List
from app.models import ExtractedPage, ExtractionResult


def parse_pdf(file_path_or_bytes: bytes | str) -> ExtractionResult:
    """Extract text and high-resolution slide images from a PDF file per page.
    
    Args:
        file_path_or_bytes: File path or raw bytes of the PDF.
        
    Returns:
        ExtractionResult containing page-by-page text and base64 slide images.
    """
    if isinstance(file_path_or_bytes, bytes):
        doc = fitz.open(stream=file_path_or_bytes, filetype="pdf")
    else:
        doc = fitz.open(file_path_or_bytes)

    extracted_pages: List[ExtractedPage] = []

    for page_idx in range(len(doc)):
        page = doc.load_page(page_idx)
        text = page.get_text("text").strip()

        images = []

        # 1. Render high-res 150 DPI page pixmap so visual slides/graphics display perfectly
        try:
            pix = page.get_pixmap(dpi=150)
            page_bytes = pix.tobytes("png")
            b64_page = base64.b64encode(page_bytes).decode("utf-8")
            images.append(f"data:image/png;base64,{b64_page}")
        except Exception as e:
            print(f"[WARN] Failed page pixmap render for page {page_idx+1}: {e}")

        # 2. Extract embedded images if any
        try:
            image_list = page.get_images(full=True)
            for img_idx, img in enumerate(image_list):
                xref = img[0]
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                image_ext = base_image["ext"]

                b64_str = base64.b64encode(image_bytes).decode("utf-8")
                data_uri = f"data:image/{image_ext};base64,{b64_str}"
                images.append(data_uri)
        except Exception as e:
            print(f"[WARN] Embedded image extraction fallback for page {page_idx+1}: {e}")

        extracted_pages.append(
            ExtractedPage(
                page_number=page_idx + 1,
                text=text or f"Slide {page_idx + 1} presentation content",
                images=images
            )
        )

    doc.close()

    return ExtractionResult(
        file_type="pdf",
        total_pages=len(extracted_pages),
        pages=extracted_pages,
        metadata={"filename": str(file_path_or_bytes) if isinstance(file_path_or_bytes, str) else "stream.pdf"}
    )
