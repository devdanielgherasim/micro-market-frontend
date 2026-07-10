#!/usr/bin/env bash
set -euo pipefail

# build.sh for the micro-market-frontend service.
# Cloud-provider-aware. Called directly by .github/workflows/ci.yml (which
# sets MAIN_SCRIPT_LOGIN=true after logging in via the cloud-registry-login
# composite action, so the login block below is skipped in CI) or run
# standalone for a local/manual build.

CLOUD_PROVIDER="${CLOUD_PROVIDER:-aws}"
ENVIRONMENT="${ENVIRONMENT:-dev}"
PROJECT_NAMESPACE="${PROJECT_NAMESPACE:-danielgherasim-microservices}"
CI_COMMIT_SHA="${CI_COMMIT_SHA:-$(git rev-parse --short HEAD 2>/dev/null || echo test)}"
CI_PROJECT_NAME="${CI_PROJECT_NAME:-micro-market-frontend}"

# Resolve the registry host, unless a calling workflow (e.g. cloud-registry-login)
# already resolved and exported CONTAINER_REGISTRY_NAME.
if [[ -z "${CONTAINER_REGISTRY_NAME:-}" ]]; then
  case "${CLOUD_PROVIDER}" in
    aws)
      : "${AWS_ACCOUNT_ID:?Set AWS_ACCOUNT_ID for AWS ECR image builds}"
      : "${AWS_REGION:?Set AWS_REGION for AWS ECR image builds}"
      CONTAINER_REGISTRY_NAME="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
      ;;
    azure)
      AZURE_ACR_PROJECT="${PROJECT_NAMESPACE//-/}"
      CONTAINER_REGISTRY_NAME="acr${AZURE_ACR_PROJECT}${ENVIRONMENT}.azurecr.io"
      ;;
    gcp)
      : "${GCP_REGION:?Set GCP_REGION for GCP Artifact Registry image builds}"
      : "${GCP_PROJECT_ID:?Set GCP_PROJECT_ID for GCP Artifact Registry image builds}"
      CONTAINER_REGISTRY_NAME="${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}"
      ;;
    *)
      echo "Error: Unsupported CLOUD_PROVIDER '${CLOUD_PROVIDER}' (expected aws, azure, or gcp)" >&2
      exit 1
      ;;
  esac
fi

# Image path "group" segment, matching each cloud's registry layout exactly:
#   aws:   one ECR repo per service, named "<namespace>/<environment>/<service>"
#          (see infrastructure/terraform/aws/main.tf: aws_ecr_repository.application)
#   azure: single ACR, images pushed as "<namespace>/<service>"
#          (see infrastructure/terraform/azure/main.tf: azurerm_container_registry.this)
#   gcp:   single Artifact Registry repo "<namespace>-<environment>", image named "<service>"
#          (see infrastructure/terraform/gcp/main.tf: google_artifact_registry_repository.this)
case "${CLOUD_PROVIDER}" in
  aws)   IMAGE_GROUP="${PROJECT_NAMESPACE}/${ENVIRONMENT}" ;;
  azure) IMAGE_GROUP="${PROJECT_NAMESPACE}" ;;
  gcp)   IMAGE_GROUP="${PROJECT_NAMESPACE}-${ENVIRONMENT}" ;;
esac

# Skip login if already performed by the calling workflow (the
# cloud-registry-login composite action sets MAIN_SCRIPT_LOGIN=true)
if [[ -z "${MAIN_SCRIPT_LOGIN:-}" ]]; then
  echo "===== Logging in to ${CLOUD_PROVIDER} container registry: ${CONTAINER_REGISTRY_NAME} ====="
  case "${CLOUD_PROVIDER}" in
    aws)
      : "${AWS_REGION:?Set AWS_REGION for AWS ECR login}"
      if [[ -n "${AWS_ROLE_ARN:-}" && -n "${CI_OIDC_TOKEN:-}" ]]; then
        CREDS="$(aws sts assume-role-with-web-identity \
          --role-arn "${AWS_ROLE_ARN}" \
          --role-session-name "ci-${CI_PROJECT_ID:-local}-${CI_PIPELINE_ID:-local}" \
          --web-identity-token "${CI_OIDC_TOKEN}" \
          --duration-seconds 3600)"
        export AWS_ACCESS_KEY_ID="$(echo "${CREDS}" | jq -r '.Credentials.AccessKeyId')"
        export AWS_SECRET_ACCESS_KEY="$(echo "${CREDS}" | jq -r '.Credentials.SecretAccessKey')"
        export AWS_SESSION_TOKEN="$(echo "${CREDS}" | jq -r '.Credentials.SessionToken')"
      fi
      aws ecr get-login-password --region "${AWS_REGION}" |
        docker login --username AWS --password-stdin "${CONTAINER_REGISTRY_NAME}"
      ;;
    azure)
      : "${ARM_CLIENT_ID:?Set ARM_CLIENT_ID for Azure Container Registry login}"
      if [[ "${ARM_USE_OIDC:-false}" == "true" ]]; then
        : "${ARM_TENANT_ID:?Set ARM_TENANT_ID for Azure OIDC login}"
        : "${CI_OIDC_TOKEN:?Set CI_OIDC_TOKEN for Azure OIDC login}"
        az login --service-principal \
          --username "${ARM_CLIENT_ID}" \
          --tenant "${ARM_TENANT_ID}" \
          --federated-token "${CI_OIDC_TOKEN}" >/dev/null
        az acr login --name "${CONTAINER_REGISTRY_NAME%%.azurecr.io}"
      else
        : "${ARM_CLIENT_SECRET:?Set ARM_CLIENT_SECRET for Azure Container Registry login}"
        docker login "${CONTAINER_REGISTRY_NAME}" -u "${ARM_CLIENT_ID}" -p "${ARM_CLIENT_SECRET}"
      fi
      ;;
    gcp)
      if [[ -n "${GCP_WORKLOAD_IDENTITY_PROVIDER:-}" && -n "${GCP_SERVICE_ACCOUNT_EMAIL:-}" && -n "${CI_OIDC_TOKEN:-}" ]]; then
        OIDC_TOKEN_FILE="${CI_PROJECT_DIR:-.}/ci-oidc-token"
        WIF_CREDENTIALS_FILE="${CI_PROJECT_DIR:-.}/gcp-wif-credentials.json"
        printf '%s' "${CI_OIDC_TOKEN}" > "${OIDC_TOKEN_FILE}"
        cat > "${WIF_CREDENTIALS_FILE}" <<EOF
{
  "type": "external_account",
  "audience": "//iam.googleapis.com/${GCP_WORKLOAD_IDENTITY_PROVIDER}",
  "subject_token_type": "urn:ietf:params:oauth:token-type:jwt",
  "token_url": "https://sts.googleapis.com/v1/token",
  "credential_source": {
    "file": "${OIDC_TOKEN_FILE}"
  },
  "service_account_impersonation_url": "https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${GCP_SERVICE_ACCOUNT_EMAIL}:generateAccessToken"
}
EOF
        gcloud auth login --cred-file="${WIF_CREDENTIALS_FILE}" --quiet
      fi
      gcloud auth configure-docker "${GCP_REGION}-docker.pkg.dev" --quiet
      ;;
  esac
fi

DOCKER_IMAGE_TAG="${CI_COMMIT_SHA}"
DOCKER_IMAGE_NAME="${CI_PROJECT_NAME}"

echo "===== Building Docker Image ====="
echo "Image: ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}"

docker build -t "${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}" .
echo "Docker image built successfully"

echo "===== Tagging Docker Image for ${CLOUD_PROVIDER} registry ====="
docker tag "${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}" "${CONTAINER_REGISTRY_NAME}/${IMAGE_GROUP}/${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}"
echo "Docker image tagged successfully"

echo "===== Pushing Docker Image to ${CONTAINER_REGISTRY_NAME} ====="
docker push "${CONTAINER_REGISTRY_NAME}/${IMAGE_GROUP}/${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}"
echo "===== Docker image pushed successfully to ${CONTAINER_REGISTRY_NAME} ====="
