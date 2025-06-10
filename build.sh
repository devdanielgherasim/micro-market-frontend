#!/bin/bash
# build.sh - Script to build and push Docker images to Azure Container Registry

AZURE_REGISTRY_NAME=
ARM_CLIENT_ID=
ARM_CLIENT_SECRET=
PROJECT_NAME="microservices1691716"
DOCKER_IMAGE_NAME="micro-market-frontend"
DOCKER_IMAGE_TAG="test"

echo "===== Building Docker Image ====="
echo "Image: $DOCKER_IMAGE_NAME:$DOCKER_IMAGE_TAG"

# Build the Docker image
docker build -t $DOCKER_IMAGE_NAME:$DOCKER_IMAGE_TAG .
docker tag $DOCKER_IMAGE_NAME:$DOCKER_IMAGE_TAG $DOCKER_IMAGE_NAME:latest
echo "Docker image built successfully"

# Tag images for Azure Container Registry
echo "===== Tagging Docker Image for ACR ====="
docker tag $DOCKER_IMAGE_NAME:$DOCKER_IMAGE_TAG $AZURE_REGISTRY_NAME/$PROJECT_NAME/$DOCKER_IMAGE_NAME:$DOCKER_IMAGE_TAG
docker tag $DOCKER_IMAGE_NAME:$DOCKER_IMAGE_TAG $AZURE_REGISTRY_NAME/$PROJECT_NAME/$DOCKER_IMAGE_NAME:latest
echo "Docker image tagged successfully"

# Login to Azure Container Registry if credentials are provided
if [ ! -z "$ARM_CLIENT_ID" ] && [ ! -z "$ARM_CLIENT_SECRET" ]; then
  echo "===== Logging in to Azure Container Registry ====="
  echo "$ARM_CLIENT_SECRET" | docker login $AZURE_REGISTRY_NAME -u "$ARM_CLIENT_ID" --password-stdin
  if [ $? -ne 0 ]; then
    echo "Error: Failed to log in to Azure Container Registry"
    exit 1
  fi
else
  echo "===== Assuming you're already logged in to ACR ====="
fi

# Push images to Azure Container Registry
echo "===== Pushing Docker Image to ACR ====="
docker push $AZURE_REGISTRY_NAME/$PROJECT_NAME/$DOCKER_IMAGE_NAME:$DOCKER_IMAGE_TAG
docker push $AZURE_REGISTRY_NAME/$PROJECT_NAME/$DOCKER_IMAGE_NAME:latest
echo "===== Docker image pushed successfully to $AZURE_REGISTRY_NAME ====="