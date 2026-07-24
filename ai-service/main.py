import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI(
    title="AI LectureHub Microservice",
    description="Handles document extraction, vector indexing, Gemini transcript generation, Google TTS, and RAG Q&A",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Route registration ─────────────────────────────────────────────────────
from app.routes import health, process, qa  # noqa: E402

app.include_router(health.router, tags=["Health"])
app.include_router(process.router, prefix="/ai", tags=["Processing"])
app.include_router(qa.router, prefix="/ai", tags=["Q&A"])

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
