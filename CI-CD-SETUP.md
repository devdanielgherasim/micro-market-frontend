# CI/CD Pipeline Setup for Azure Container Registry

This document explains how to set up the GitLab CI/CD pipeline to build and push Docker images to Azure Container Registry.

## Prerequisites

1. An Azure Container Registry (ACR) instance
2. A Service Principal with permissions to push to ACR
3. GitLab repository with CI/CD enabled

## Azure Container Registry Setup

### Create an Azure Container Registry

If you don't already have an Azure Container Registry, you can create one using the Azure Portal or Azure CLI:

```bash
az acr create --resource-group <resource-group-name> --name <registry-name> --sku Basic
```

### Create a Service Principal for ACR Authentication

Create a Service Principal with AcrPush role:

```bash
# Get the ACR registry ID
ACR_ID=$(az acr show --name <registry-name> --resource-group <resource-group-name> --query id --output tsv)

# Create the service principal with AcrPush role
SP_PASSWORD=$(az ad sp create-for-rbac --name "micro-market-frontend-cicd" \
  --scopes $ACR_ID \
  --role AcrPush \
  --query password \
  --output tsv)

# Get the service principal ID
SP_APP_ID=$(az ad sp list --display-name "micro-market-frontend-cicd" --query [].appId --output tsv)

# Output the credentials
echo "Service principal ID: $SP_APP_ID"
echo "Service principal password: $SP_PASSWORD"
```

Save these credentials securely, as you'll need them for the GitLab CI/CD pipeline.

## GitLab CI/CD Configuration

### Set Up Environment Variables

In your GitLab repository, go to Settings > CI/CD > Variables and add the following variables:

1. `AZURE_REGISTRY_NAME`: Your Azure Container Registry URL (e.g., `myregistry.azurecr.io`)
2. `ARM_CLIENT_ID`: The Service Principal ID (appId) from the previous step
3. `ARM_CLIENT_SECRET`: The Service Principal password from the previous step

Make sure to mark `ARM_CLIENT_SECRET` as "Masked" to prevent it from being displayed in logs.

### Pipeline Configuration

The `.gitlab-ci.yml` file in this repository is already configured to:

1. Build a Docker image from the application
2. Push the Docker image to Azure Container Registry
3. Tag the image with both the Git commit SHA and 'latest'

The pipeline will run automatically on commits to the main/master branch and when tags are created.

## Troubleshooting

If you encounter issues with the pipeline:

1. Check that all environment variables are correctly set in GitLab
2. Verify that the Service Principal has the correct permissions on the Azure Container Registry
3. Check the GitLab CI/CD logs for specific error messages

## Security Considerations

- The Service Principal credentials are sensitive and should be kept secure
- Consider rotating the Service Principal credentials periodically
- Use GitLab's protected variables feature to restrict access to sensitive variables