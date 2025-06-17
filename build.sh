#!/bin/bash

CONTAINER_REGISTRY_NAME=${CONTAINER_REGISTRY_NAME:-""}
ARM_CLIENT_ID=${ARM_CLIENT_ID:-""}
ARM_CLIENT_SECRET=${ARM_CLIENT_SECRET:-""}
CI_COMMIT_SHA=${CI_COMMIT_SHA:-"test"}
CI_PROJECT_NAME=${CI_PROJECT_NAME:-""}
PROJECT_NAMESPACE=${PROJECT_NAMESPACE:-"microservices1691719"}

DOCKER_IMAGE_TAG=$CI_COMMIT_SHA
DOCKER_IMAGE_NAME=$CI_PROJECT_NAME
PROJECT_NAME=$PROJECT_NAMESPACE

if [ -z "$CONTAINER_REGISTRY_NAME" ]; then
  echo "Error: CONTAINER_REGISTRY_NAME environment variable is not set"
  exit 1
fi

if [ -z "$MAIN_SCRIPT_LOGIN" ]; then
  if [ ! -z "$ARM_CLIENT_ID" ] && [ ! -z "$ARM_CLIENT_SECRET" ]; then
    echo "===== Logging in to Container Registry ====="
    echo "$ARM_CLIENT_SECRET" | docker login $CONTAINER_REGISTRY_NAME -u "$ARM_CLIENT_ID" --password-stdin
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

docker build -t $DOCKER_IMAGE_NAME:$DOCKER_IMAGE_TAG .
docker tag $DOCKER_IMAGE_NAME:$DOCKER_IMAGE_TAG $DOCKER_IMAGE_NAME:latest
echo "Docker image built successfully"

echo "===== Tagging Docker Image for ACR ====="
docker tag $DOCKER_IMAGE_NAME:$DOCKER_IMAGE_TAG $CONTAINER_REGISTRY_NAME/$PROJECT_NAME/$DOCKER_IMAGE_NAME:$DOCKER_IMAGE_TAG
docker tag $DOCKER_IMAGE_NAME:$DOCKER_IMAGE_TAG $CONTAINER_REGISTRY_NAME/$PROJECT_NAME/$DOCKER_IMAGE_NAME:latest
echo "Docker image tagged successfully"

echo "===== Pushing Docker Image to ACR ====="
docker push $CONTAINER_REGISTRY_NAME/$PROJECT_NAME/$DOCKER_IMAGE_NAME:$DOCKER_IMAGE_TAG
docker push $CONTAINER_REGISTRY_NAME/$PROJECT_NAME/$DOCKER_IMAGE_NAME:latest
echo "===== Docker image pushed successfully to $CONTAINER_REGISTRY_NAME ====="