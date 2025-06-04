# Azure Developer CLI (azd) Deployment Guide

This project includes an Azure Developer CLI (azd) template for easy deployment to Azure App Service.

## Prerequisites

1. **Install Azure Developer CLI (azd)**:
   ```powershell
   # Install azd via PowerShell
   powershell -ex AllSigned -c "Invoke-RestMethod 'https://aka.ms/install-azd.ps1' | Invoke-Expression"
   ```

2. **Install Azure CLI**:
   ```powershell
   # Install Azure CLI
   winget install Microsoft.AzureCLI
   ```

3. **Login to Azure**:
   ```bash
   azd auth login
   az login
   ```

## Quick Deployment

1. **Initialize the project** (first time only):
   ```bash
   azd init
   ```

2. **Deploy to Azure**:
   ```bash
   azd up
   ```

   This command will:
   - Prompt you to select a subscription and location
   - Create all necessary Azure resources (Resource Group, App Service Plan, App Service)
   - Build and deploy your Node.js application
   - Provide you with the deployment URL

## Environment Management

- **Create a new environment**:
  ```bash
  azd env new <environment-name>
  ```

- **Select an environment**:
  ```bash
  azd env select <environment-name>
  ```

- **Deploy to existing environment**:
  ```bash
  azd deploy
  ```

## Monitoring and Management

- **View deployment logs**:
  ```bash
  azd monitor
  ```

- **Clean up resources**:
  ```bash
  azd down
  ```

## Configuration

The deployment is configured via:
- `azure.yaml` - Project configuration
- `infra/main.bicep` - Infrastructure as Code
- `infra/main.parameters.json` - Deployment parameters

## Environment Variables

The following environment variables are automatically set in production:
- `PORT=8000`
- `NODE_ENV=production`
- `WEBSITE_NODE_DEFAULT_VERSION=~18`

## Testing the Deployment

After deployment, test your MCP server:

1. **Health Check**:
   ```bash
   curl https://<your-app-name>.azurewebsites.net/health
   ```

2. **MCP Capabilities**:
   ```bash
   curl https://<your-app-name>.azurewebsites.net/mcp/capabilities
   ```

3. **Test Weather Tools**:
   Use the test client with your deployed URL:
   ```bash
   npm run test:azure
   ```
   (Update the URL in package.json first)

## Troubleshooting

- **Check deployment status**: `azd show`
- **View app logs**: Use Azure Portal or `az webapp log tail`
- **Redeploy**: `azd deploy` to deploy code changes
- **Rebuild infrastructure**: `azd provision` to update infrastructure only

## Cost Management

The default configuration uses:
- **App Service Plan**: B1 (Basic tier)
- **Estimated monthly cost**: ~$13-15 USD

To reduce costs, you can modify `infra/main.bicep` to use the F1 (Free tier), but note that the free tier has limitations on compute and uptime.
