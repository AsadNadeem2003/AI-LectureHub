import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()


@dataclass
class Settings:
    """Application settings loaded from environment variables."""

    # Server
    PORT: int = int(os.getenv("PORT", "8000"))

    # Groq LLM (Primary — Llama 3.3 70B)
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_BASE_URL: str = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    # Google Gemini LLM (Fallback)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # Google Cloud TTS
    GOOGLE_APPLICATION_CREDENTIALS: str = os.getenv(
        "GOOGLE_APPLICATION_CREDENTIALS", ""
    )

    # ChromaDB (vector store)
    CHROMA_DB_DIR: str = os.getenv("CHROMA_DB_DIR", "./chroma_db")

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = os.getenv("CLOUDINARY_CLOUD_NAME", "")
    CLOUDINARY_API_KEY: str = os.getenv("CLOUDINARY_API_KEY", "")
    CLOUDINARY_API_SECRET: str = os.getenv("CLOUDINARY_API_SECRET", "")

    # Embedding model
    EMBEDDING_MODEL: str = "paraphrase-multilingual-MiniLM-L12-v2"

    # RAG settings
    RAG_CONFIDENCE_THRESHOLD: float = 0.7
    RAG_TOP_K: int = 5

    # Chunk settings
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 50


settings = Settings()
