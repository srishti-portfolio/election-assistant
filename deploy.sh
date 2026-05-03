#!/bin/bash
# ============================================================
# ElectIQ — Google Cloud Run Deployment Script
# ============================================================
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh
# ============================================================

set -e

# ── Config ──────────────────────────────────────────────────
PROJECT_ID="${GCP_PROJECT_ID:-your-gcp-project-id}"
REGION="${GCP_REGION:-us-central1}"
REPO="gcr.io/${PROJECT_ID}"
GEMINI_API_KEY="${GEMINI_API_KEY:-}"

BACKEND_IMAGE="${REPO}/electiq-backend:latest"
FRONTEND_IMAGE="${REPO}/electiq-frontend:latest"

# ── Auth & project ───────────────────────────────────────────
echo "🔐 Configuring project: $PROJECT_ID"
gcloud config set project "$PROJECT_ID"
gcloud auth configure-docker --quiet

# ── Enable APIs ──────────────────────────────────────────────
echo "⚙️  Enabling required APIs..."
gcloud services enable \
  run.googleapis.com \
  containerregistry.googleapis.com \
  translate.googleapis.com \
  aiplatform.googleapis.com \
  --quiet

# ── Build & Push Backend ─────────────────────────────────────
echo "🐍 Building backend image..."
docker build -t "$BACKEND_IMAGE" ./backend
docker push "$BACKEND_IMAGE"

# ── Deploy Backend ───────────────────────────────────────────
echo "🚀 Deploying backend to Cloud Run..."
BACKEND_URL=$(gcloud run deploy electiq-backend \
  --image "$BACKEND_IMAGE" \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars "GEMINI_API_KEY=${GEMINI_API_KEY}" \
  --format "value(status.url)" \
  --quiet)

echo "✅ Backend deployed at: $BACKEND_URL"

# ── Build & Push Frontend ────────────────────────────────────
echo "⚛️  Building frontend image (pointing to: $BACKEND_URL)..."
docker build \
  --build-arg VITE_API_URL="$BACKEND_URL" \
  -t "$FRONTEND_IMAGE" \
  ./frontend
docker push "$FRONTEND_IMAGE"

# ── Deploy Frontend ──────────────────────────────────────────
echo "🚀 Deploying frontend to Cloud Run..."
FRONTEND_URL=$(gcloud run deploy electiq-frontend \
  --image "$FRONTEND_IMAGE" \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --format "value(status.url)" \
  --quiet)

echo ""
echo "=============================================="
echo "🎉 ElectIQ deployed successfully!"
echo "=============================================="
echo "Frontend: $FRONTEND_URL"
echo "Backend:  $BACKEND_URL"
echo "API docs: $BACKEND_URL/docs"
echo "=============================================="