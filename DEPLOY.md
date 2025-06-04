# Azure Deployment Guide

Deploy the Node.js MCP Weather Server to Azure App Service using Azure Developer CLI (azd).

## Prerequisites

- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- [Azure Developer CLI (azd)](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/install-azd)  
- Active Azure subscription

## Quick Deploy

### 1. Login to Azure
```bash
azd auth login
```

### 2. Initialize Project
```bash
azd init
```
Choose:
- **Environment name**: `mcp-weather` (or your preferred name)
- **Azure subscription**: Select your subscription  
- **Azure location**: Choose a region (e.g., East US)

### 3. Deploy to Azure
```bash
azd up
```

This command will:
- Provision Azure resources (Resource Group, App Service Plan P0V3, App Service)
- Install Node.js dependencies
- Deploy your application
- Configure environment variables

### 4. Access Your Deployment

After deployment, you'll receive:
- **App Service URL**: `https://<your-app-name>.azurewebsites.net`
- **Health Check**: `https://<your-app-name>.azurewebsites.net/health`
- **Test Interface**: `https://<your-app-name>.azurewebsites.net/test`

## Infrastructure Details

The deployment creates:
- **Resource Group**: Contains all resources
- **App Service Plan**: Premium v3 (P0V3) for production workloads
- **App Service**: Node.js 22 runtime with your MCP server

## Management Commands

```bash
azd deploy      # Deploy code changes only
azd provision   # Update infrastructure only  
azd show        # View deployment status
azd down        # Delete all Azure resources
```

## Environment Variables

The deployment automatically configures:
- `PORT`: 8000
- `NODE_ENV`: production
- `WEBSITE_NODE_DEFAULT_VERSION`: ~22
- `SCM_DO_BUILD_DURING_DEPLOYMENT`: true

## Testing Your Deployment

### Health Check
```bash
curl https://<your-app-name>.azurewebsites.net/health
```

### Test MCP Tools
```bash
# Get weather alerts for California
curl -X POST "https://<your-app-name>.azurewebsites.net/mcp" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "get_alerts", "arguments": {"state": "CA"}}}'

# Get weather forecast for San Francisco  
curl -X POST "https://<your-app-name>.azurewebsites.net/mcp" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": "get_forecast", "arguments": {"latitude": 37.7749, "longitude": -122.4194}}}'
```

### Web Interface
Visit `https://<your-app-name>.azurewebsites.net/test` for an interactive testing interface.

## Troubleshooting

### Common Issues
- **Deployment timeout**: Check the Azure portal for detailed logs
- **Application errors**: View logs with `az webapp log tail --name <app-name> --resource-group <resource-group>`
- **Build failures**: Ensure `package.json` has all required dependencies

### Get Help
- View deployment status: `azd show`
- Check Azure portal: Resource Groups → `rg-<environment-name>`
- Review logs in Azure portal under App Service → Log stream
