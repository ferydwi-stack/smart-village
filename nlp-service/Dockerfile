# Stage 1: Builder and Training
FROM python:3.11-slim AS builder

WORKDIR /app

# Install system dependencies if needed (e.g., for building some python packages)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install dependencies to user directory to make copying easier
RUN pip install --user --no-cache-dir -r requirements.txt

# Copy all application code
COPY . .

# Create models directory
RUN mkdir -p models

# Run training script during build to pre-train and save the ML model
RUN python train_model.py


# Stage 2: Final Image
FROM python:3.11-slim

WORKDIR /app

# Copy installed python packages from builder
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

# Copy pre-downloaded NLTK data from builder
COPY --from=builder /root/nltk_data /root/nltk_data

# Copy application code and trained models from builder
COPY --from=builder /app /app

# Expose port
EXPOSE 8000

# Run with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
