from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def root():
    return {
        "status": "online",
        "service": "AI LectureHub Python Microservice",
        "version": "1.0.0",
    }


@router.get("/health")
def health_check():
    return {"status": "healthy"}
