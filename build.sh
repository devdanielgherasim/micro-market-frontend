#!/bin/bash
# build.sh for individual services (audit, catalog, orders)

# Use environment variables passed from main script or set defaults if not provided
AZURE_REGISTRY_NAME=${AZURE_REGISTRY_NAME:-""}
ARM_CLIENT_ID=${ARM_CLIENT_ID:-""}
ARM_CLIENT_SECRET=${ARM_CLIENT_SECRET:-""}
CI_COMMIT_SHA=${CI_COMMIT_SHA:-"test"}
CI_PROJECT_NAME=${CI_PROJECT_NAME:-""}
CI_PROJECT_NAMESPACE=${CI_PROJECT_NAMESPACE:-"microservices1691717"}

DOCKER_IMAGE_TAG=$CI_COMMIT_SHA
DOCKER_IMAGE_NAME=$CI_PROJECT_NAME
PROJECT_NAME=$CI_PROJECT_NAMESPACE

# Check if AZURE_REGISTRY_NAME is set
if [ -z "$AZURE_REGISTRY_NAME" ]; then
  echo "Error: AZURE_REGISTRY_NAME environment variable is not set"
  echo "Usage: AZURE_REGISTRY_NAME=myregistry.azurecr.io ./build.sh"
  exit 1
fi

# Skip login if already performed in the main script
if [ -z "$MAIN_SCRIPT_LOGIN" ]; then
  # Docker login if credentials are provided
  if [ ! -z "$ARM_CLIENT_ID" ] && [ ! -z "$ARM_CLIENT_SECRET" ]; then
    echo "===== Logging in to Container Registry ====="
    echo "$ARM_CLIENT_SECRET" | docker login $AZURE_REGISTRY_NAME -u "$ARM_CLIENT_ID" --password-stdin
    if [ $? -ne 0 ]; then
      echo "Error: Failed to log in to Container Registry"
      exit 1
    fi
  else
    echo "Warning: ARM_CLIENT_ID or ARM_CLIENT_SECRET not set. You may need to log in to ACR manually."
  fi
fi


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

# Push images to Azure Container Registry
echo "===== Pushing Docker Image to ACR ====="
docker push $AZURE_REGISTRY_NAME/$PROJECT_NAME/$DOCKER_IMAGE_NAME:$DOCKER_IMAGE_TAG
docker push $AZURE_REGISTRY_NAME/$PROJECT_NAME/$DOCKER_IMAGE_NAME:latest
echo "===== Docker image pushed successfully to $AZURE_REGISTRY_NAME ====="