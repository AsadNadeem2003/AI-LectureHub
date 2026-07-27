import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

load_dotenv()

# Ensure required directories exist
os.makedirs("./data/audio", exist_ok=True)
os.makedirs("./data/chroma", exist_ok=True)

app = FastAPI(
    title="AI LectureHub Microservice",
    description="Handles PDF/PPTX/DOCX document extraction, ChromaDB vector indexing, Gemini transcript generation, Google TTS, and RAG Q&A",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static Audio File Serving ───────────────────────────────────────────────
app.mount("/data/audio", StaticFiles(directory="./data/audio"), name="audio")

# ── Route registration ─────────────────────────────────────────────────────
from app.routes import health, extract_routes, vector_routes, process, qa  # noqa: E402

app.include_router(health.router, tags=["Health"])
app.include_router(extract_routes.router)
app.include_router(vector_routes.router)
app.include_router(process.router)
app.include_router(qa.router, tags=["Q&A"])

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8001"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
