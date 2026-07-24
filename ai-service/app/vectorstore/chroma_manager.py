"""ChromaDB VectorStore Manager using SentenceTransformers for multilingual vector indexing."""

import os
import chromadb
from sentence_transformers import SentenceTransformer
from langchain_text_splitters import RecursiveCharacterTextSplitter
from typing import List, Optional
from app.models import ExtractedPage, VectorQueryResult

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "chroma"))
os.makedirs(DATA_DIR, exist_ok=True)

COLLECTION_NAME = "lecture_chunks_v3"


class ChromaVectorManager:
    """Singleton manager for ChromaDB vector store and embeddings."""

    def __init__(self):
        # Pre-load client & collection on main process thread
        self.client = chromadb.PersistentClient(path=DATA_DIR)
        self.collection = self.client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
            embedding_function=None
        )
        # Pre-load SentenceTransformer on main process thread to avoid PyTorch Windows mmap thread error ([Errno 22])
        print("[INFO] Loading SentenceTransformer embedding model on main thread...")
        self.embedding_model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
        print("[INFO] SentenceTransformer model loaded successfully.")

        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
            separators=["\n\n", "\n", ".", " ", ""]
        )

    def index_lecture_pages(self, lecture_id: str, pages: List[ExtractedPage]) -> int:
        """Chunk lecture page text, generate vector embeddings, and save to ChromaDB."""
        documents = []
        metadatas = []
        ids = []

        chunk_counter = 0

        for page in pages:
            if not page.text or not page.text.strip():
                continue

            chunks = self.text_splitter.split_text(page.text)

            for idx, chunk_text in enumerate(chunks):
                chunk_id = f"{lecture_id}_p{page.page_number}_c{idx}"
                documents.append(chunk_text)
                metadatas.append({
                    "lecture_id": lecture_id,
                    "page_number": page.page_number,
                    "chunk_index": idx
                })
                ids.append(chunk_id)
                chunk_counter += 1

        if documents:
            embeddings = self.embedding_model.encode(documents, convert_to_numpy=True).tolist()
            self.collection.upsert(
                documents=documents,
                embeddings=embeddings,
                metadatas=metadatas,
                ids=ids
            )

        return chunk_counter

    def query_similar_chunks(self, lecture_id: str, query: str, top_k: int = 3) -> List[VectorQueryResult]:
        """Perform vector similarity search for a given lecture."""
        query_embedding = self.embedding_model.encode([query], convert_to_numpy=True).tolist()

        results = self.collection.query(
            query_embeddings=query_embedding,
            n_results=top_k,
            where={"lecture_id": lecture_id}
        )

        query_results: List[VectorQueryResult] = []

        if results and results.get("documents") and len(results["documents"]) > 0:
            docs = results["documents"][0]
            metas = results["metadatas"][0]
            distances = results["distances"][0] if results.get("distances") else [0.0] * len(docs)

            for doc, meta, dist in zip(docs, metas, distances):
                score = round(max(0.0, 1.0 - float(dist)), 4)
                query_results.append(
                    VectorQueryResult(
                        chunk_text=doc,
                        page_number=meta.get("page_number", 1),
                        score=score
                    )
                )

        return query_results


# Global manager instance initialized on main thread at app start
vector_manager = ChromaVectorManager()
