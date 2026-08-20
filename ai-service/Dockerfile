# ==========================================
# Production Dockerfile: AI Microservice
# ==========================================
FROM python:3.11-slim

# Prevent Python from writing .pyc files and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8001

WORKDIR /app

# Install minimal OS dependencies for PyMuPDF, audio processing, and networking
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ffmpeg \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install lightweight CPU-only PyTorch (150MB instead of 2GB CUDA) to prevent OOM on t3.micro
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Install remaining Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY main.py .
COPY app ./app

# Create local data cache directory
RUN mkdir -p /app/data

EXPOSE 8001

# Healthcheck to ensure FastAPI is responding
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:8001/ || exit 1

# Start FastAPI server via Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
