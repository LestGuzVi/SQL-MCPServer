# Node.js MCP Weather Server with Azure Deployment

A Model Context Protocol (MCP) server built with Express.js and Node.js that provides weather information using the National Weather Service API. Ready for deployment to Azure App Service with Azure Developer CLI (azd).

## 🌟 Features

- **Express.js Framework**: Fast, unopinionated web framework for Node.js
- **MCP Protocol Compliance**: Full support for JSON-RPC 2.0 MCP protocol
- **HTTP Transport**: HTTP-based communication for web connectivity
- **Weather Tools**:
  - `get_alerts`: Get weather alerts for any US state
  - `get_forecast`: Get detailed weather forecast for any location
- **Azure Ready**: Pre-configured for Azure App Service deployment
- **Web Test Interface**: Built-in HTML interface for testing
- **National Weather Service API**: Real-time weather data from official US government source

## 🚀 Quick Deploy to Azure

### Prerequisites
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- [Azure Developer CLI (azd)](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/install-azd)
- Active Azure subscription

### Deploy in 3 Commands

```bash
# 1. Login to Azure
azd auth login

# 2. Initialize the project
azd init

# 3. Deploy to Azure
azd up
```

After deployment, your MCP server will be available at:
- **Health Check**: `https://<your-app>.azurewebsites.net/health`
- **MCP Capabilities**: `https://<your-app>.azurewebsites.net/mcp/capabilities`
- **Test Interface**: `https://<your-app>.azurewebsites.net/test`

## 🧪 Test the Live Server

Once deployed, test the weather tools:

```bash
# Get weather alerts for California
curl -X POST "https://<your-app>.azurewebsites.net/mcp" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "get_alerts", "arguments": {"state": "CA"}}}'

# Get weather forecast for San Francisco
curl -X POST "https://<your-app>.azurewebsites.net/mcp" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": "get_forecast", "arguments": {"latitude": 37.7749, "longitude": -122.4194}}}'
```

## 💻 Local Development

### Prerequisites
- **Node.js 22+** (or Node.js 18+)
- **npm** (Node Package Manager)

### Setup & Run

1. **Clone and install dependencies**:
   ```bash
   git clone <your-repo-url>
   cd remote-mcp-webapp-node
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Access the server**:
   - Server: http://localhost:8000
   - Health Check: http://localhost:8000/health
   - Test Interface: http://localhost:8000/test

## 🏗️ Architecture

- **`server.js`**: Main Express application with MCP protocol implementation
- **`infra/`**: Azure Bicep templates for infrastructure as code
- **`azure.yaml`**: Azure Developer CLI configuration
- **`public/`**: Static assets for the web test interface

## ⚙️ Configuration

The server uses these environment variables:
- `PORT`: Server port (default: 8000)
- `NODE_ENV`: Environment mode (default: development)

Azure App Service automatically configures:
- Node.js 22 runtime
- Premium v3 (P0V3) App Service Plan
- Health check monitoring

## 🔌 MCP Integration

### Connect to MCP Inspector

Use this configuration to connect to your deployed server:

```json
{
  "mcpServers": {
    "weather-server": {
      "transport": {
        "type": "http",
        "url": "https://<your-app>.azurewebsites.net/mcp"
      },
      "name": "Weather MCP Server",
      "description": "Weather forecast and alerts tools"
    }
  }
}
```

For local development, use `http://localhost:8000/mcp`.

## 🛠️ API Endpoints

- **GET `/health`** - Server health check
- **GET `/mcp/capabilities`** - MCP server capabilities  
- **POST `/mcp`** - Main MCP JSON-RPC endpoint
- **GET `/test`** - Web test interface

## 📖 Available Tools

### `get_alerts`
Get weather alerts for any US state.

**Parameters:**
- `state` (string): Two-letter state code (e.g., "CA", "NY")

### `get_forecast`  
Get detailed weather forecast for any location.

**Parameters:**
- `latitude` (number): Latitude coordinate
- `longitude` (number): Longitude coordinate

## 🧪 Testing

### Web Interface
Visit `/test` endpoint for an interactive testing interface.

### Command Line
```bash
# List available tools
curl -X POST "http://localhost:8000/mcp" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}'

# Get weather forecast
curl -X POST "http://localhost:8000/mcp" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "get_forecast", "arguments": {"latitude": 37.7749, "longitude": -122.4194}}, "id": 2}'
```

## 🌦️ Data Source

This server uses the **National Weather Service (NWS) API**:
- Real-time weather alerts and warnings
- Detailed weather forecasts
- Official US government weather data  
- No API key required
- High reliability and accuracy

## � Development Scripts

```bash
npm run dev         # Start development server with auto-reload
npm start          # Start production server
npm test           # Run test client against local server
```

## 📂 Project Structure

```
remote-mcp-webapp-node/
├── server.js              # Main Express.js server with MCP implementation
├── test-client.js         # MCP protocol test client
├── package.json           # Dependencies and scripts
├── azure.yaml             # Azure Developer CLI configuration
├── infra/                 # Azure Bicep infrastructure templates
├── public/                # Static web assets
└── README.md              # This documentation
```

## 🤝 Contributing

This is a sample project demonstrating MCP server implementation with Azure deployment. Feel free to:

- Fork and customize for your needs
- Add new MCP tools
- Improve the Azure deployment template
- Submit issues and suggestions

---

**Ready to deploy?** Run `azd up` and have your MCP weather server live on Azure in minutes! 🚀

## � License

MIT License - feel free to use this project for your own applications.
