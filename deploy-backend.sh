#!/bin/zsh

set -e

# Name of the Cloud Run service
SERVICE_NAME="express-backend"

# Get current project ID
PROJECT_ID=$(gcloud config get-value project)
REGION="asia-south1"

# Build the Docker image using Google Cloud Build
echo "🛠  Building Docker image..."
gcloud builds submit \
  --tag "gcr.io/${PROJECT_ID}/${SERVICE_NAME}" \
  .

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --image "gcr.io/${PROJECT_ID}/${SERVICE_NAME}" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated

echo "✅ Done!"
