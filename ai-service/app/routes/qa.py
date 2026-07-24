from fastapi import APIRouter

router = APIRouter()


@router.post("/ask")
async def ask_question():
    """
    RAG-based question answering endpoint.
    Full implementation in Phase 8.
    """
    return {"status": "not_implemented", "message": "Q&A engine coming in Phase 8"}
