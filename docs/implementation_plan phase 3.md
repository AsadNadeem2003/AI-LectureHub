# Implementation Plan - Phase 3: Python AI Microservice & Vector Indexing

**Goal**: Build the Python FastAPI AI Microservice responsible for parsing PDF, PPTX, and Word (`.docx`) course documents slide-by-slide / section-by-section, extracting text and embedded images, chunking text, and storing vector embeddings in a persistent ChromaDB vector store.

---

## User Review Required

> [!IMPORTANT]
> **Dependencies Installation**: You do **not** need to install anything manually! I will handle installing all Python dependencies (including `PyMuPDF`, `python-pptx`, `python-docx`, `chromadb`, `sentence-transformers`, `fastapi`) into the virtual environment automatically.

---

## Proposed Changes

### AI Service (`/ai-service`)

#### [MODIFY] [requirements.txt](file:///d:/Amperor%20Tech%20Internship%20Projects/AI%20Lecture%20Hub/ai-service/requirements.txt)
- Include dependencies: `fastapi`, `uvicorn`, `pydantic`, `PyMuPDF`, `python-pptx`, `python-docx`, `sentence-transformers`, `chromadb`, `langchain-text-splitters`, `python-multipart`.

#### [NEW] [main.py](file:///d:/Amperor%20Tech%20Internship%20Projects/AI%20Lecture%20Hub/ai-service/main.py)
- FastAPI application entry point.
- Endpoints:
  - `GET /health`: Health check endpoint.
  - `POST /api/v1/extract`: Accept uploaded PDF, PPTX, or DOCX file, extract structured text and inline images.
  - `POST /api/v1/index-vectorstore`: Process extracted text, generate embeddings, and index into ChromaDB.

#### [NEW] [parsers/pdf_parser.py](file:///d:/Amperor%20Tech%20Internship%20Projects/AI%20Lecture%20Hub/ai-service/parsers/pdf_parser.py)
- Page-by-page PDF reader using `fitz` (PyMuPDF).
- Extract text per page and save page images as PNG/JPEG.

#### [NEW] [parsers/pptx_parser.py](file:///d:/Amperor%20Tech%20Internship%20Projects/AI%20Lecture%20Hub/ai-service/parsers/pptx_parser.py)
- Slide-by-slide PPTX reader using `python-pptx`.
- Extract text shapes, notes, text boxes per slide, and extract embedded images.

#### [NEW] [parsers/docx_parser.py](file:///d:/Amperor%20Tech%20Internship%20Projects/AI%20Lecture%20Hub/ai-service/parsers/docx_parser.py)
- Paragraph and section reader for Word (`.docx`) documents using `python-docx`.
- Extract headings, paragraph text, bullet points, and inline images.

#### [NEW] [vectorstore/chroma_manager.py](file:///d:/Amperor%20Tech%20Internship%20Projects/AI%20Lecture%20Hub/ai-service/vectorstore/chroma_manager.py)
- ChromaDB persistent client wrapper.
- Initialize `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` embedding model.
- Document chunking using `RecursiveCharacterTextSplitter` (chunk_size=500, chunk_overlap=50).
- Index vectors with metadata (`lecture_id`, `page_number`, `chunk_index`, `doc_type`).

---

## Verification Plan

### Automated Tests
- Test FastAPI health route `GET http://127.0.0.1:8000/health`.
- Test document extraction `POST http://127.0.0.1:8000/api/v1/extract` with sample PDF, PPTX, and DOCX files.
- Test ChromaDB vector indexing and retrieval query `POST http://127.0.0.1:8000/api/v1/index-vectorstore`.

### Manual Verification
- Verify generated page images and extracted slide/paragraph text.
- Check ChromaDB sqlite storage file creation inside `/ai-service/data/chroma`.
