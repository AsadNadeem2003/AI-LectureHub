"""FastAPI routes for ChromaDB VectorStore indexing and similarity retrieval."""

import traceback
from fastapi import APIRouter, HTTPException
from app.models import (
    VectorIndexRequest,
    VectorIndexResponse,
    VectorQueryRequest,
    VectorQueryResponse,
)
from app.vectorstore.chroma_manager import vector_manager

router = APIRouter(prefix="/api/v1", tags=["VectorStore"])


@router.post("/index-vectorstore", response_model=VectorIndexResponse)
def index_vectorstore(payload: VectorIndexRequest):
    """Chunk and index extracted lecture pages into ChromaDB."""
    if not payload.pages:
        raise HTTPException(status_code=400, detail="No pages provided to index.")

    try:
        total_chunks = vector_manager.index_lecture_pages(
            lecture_id=payload.lecture_id,
            pages=payload.pages
        )
        return VectorIndexResponse(
            lecture_id=payload.lecture_id,
            total_chunks=total_chunks,
            status="success"
        )
    except Exception as e:
        full_tb = traceback.format_exc()
        raise HTTPException(
            status_code=500,
            detail=f"FULL_TRACE:\n{full_tb}"
        )


@router.post("/query-vectorstore", response_model=VectorQueryResponse)
def query_vectorstore(payload: VectorQueryRequest):
    """Retrieve relevant chunks for a lecture query (RAG context retrieval)."""
    try:
        results = vector_manager.query_similar_chunks(
            lecture_id=payload.lecture_id,
            query=payload.query,
            top_k=payload.top_k
        )
        return VectorQueryResponse(
            lecture_id=payload.lecture_id,
            results=results
        )
    except Exception as e:
        full_tb = traceback.format_exc()
        raise HTTPException(
            status_code=500,
            detail=f"FULL_TRACE:\n{full_tb}"
        )
