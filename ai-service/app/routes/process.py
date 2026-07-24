from fastapi import APIRouter

router = APIRouter()


@router.post("/process-lecture")
async def process_lecture():
    """
    Endpoint called by BullMQ worker to process an uploaded lecture file.
    Full implementation in Phase 3 & 4.
    """
    return {"status": "not_implemented", "message": "Processing pipeline coming in Phase 3"}
