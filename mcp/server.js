const path = require('path');
const fs = require('fs');

// Carga dinámica de tools
const toolsDir = path.join(__dirname, '..', 'tools');
const toolFiles = fs.readdirSync(toolsDir).filter(f => f.endsWith('.js') || f.endsWith('.ts'));
const toolInstances = toolFiles.map(f => {
  const toolModule = require(path.join(toolsDir, f));
  // Soporta export default y module.exports
  if (toolModule && typeof toolModule === 'object') {
    if (typeof toolModule.run === 'function') return toolModule;
    if (typeof toolModule.handler === 'function') {
      // Si la tool usa 'handler' en vez de 'run', la adaptamos
      return { ...toolModule, run: toolModule.handler };
    }
    if (toolModule.default && typeof toolModule.default === 'object') {
      if (typeof toolModule.default.run === 'function') return toolModule.default;
      if (typeof toolModule.default.handler === 'function') {
        return { ...toolModule.default, run: toolModule.default.handler };
      }
    }
  }
  throw new Error(`Tool in file "${f}" does not export a 'run' or 'handler' function.`);
});


class MCPServer {
  constructor() {
    this.tools = toolInstances.map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    }));
    this.toolHandlers = {};
    console.log("Loaded tools:");
    toolInstances.forEach(tool => {
      console.log(`- ${tool.name}: ${tool.description}`);
      if (typeof tool.run !== "function") {
        throw new Error(`Tool "${tool.name}" does not export a 'run' function.`);
      }
      this.toolHandlers[tool.name] = tool.run.bind(tool);
    });

    this.resources = [
      {
        uri: 'mcp://server/sample',
        name: 'Sample Resource',
        description: 'Sample resource for demonstration',
        mimeType: 'text/plain'
      }
    ];
  }

  async handleRequest(request) {
    const { jsonrpc, method, params, id } = request;

    if (jsonrpc !== '2.0') {
      return this.createErrorResponse(id, -32600, 'Invalid Request');
    }

    try {
      switch (method) {
        case 'initialize':
          return this.handleInitialize(id, params);
        case 'tools/list':
          return this.handleToolsList(id);
        case 'tools/call':
          return await this.handleToolsCall(id, params);
        case 'resources/list':
          return this.handleResourcesList(id);
        case 'resources/read':
          return this.handleResourcesRead(id, params);
        default:
          return this.createErrorResponse(id, -32601, 'Method not found');
      }
    } catch (error) {
      console.error('Error handling request:', error);
      return this.createErrorResponse(id, -32603, 'Internal error');
    }
  }

  handleInitialize(id, params) {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
          resources: {}
        },
        serverInfo: {
          name: 'Weather MCP Server (Node.js)',
          version: '1.0.0'
        }
      }
    };
  }

  handleToolsList(id) {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        tools: this.tools
      }
    };
  }

  async handleToolsCall(id, params) {
    const { name, arguments: args } = params;
    const handler = this.toolHandlers[name];
    if (!handler) {
      return this.createErrorResponse(id, -32602, 'Invalid tool name');
    }
    try {
      const result = await handler(args);
      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: result
            }
          ]
        }
      };
    } catch (error) {
      return this.createErrorResponse(id, -32603, `Tool execution error: ${error.message}`);
    }
  }

  handleResourcesList(id) {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        resources: this.resources
      }
    };
  }

  handleResourcesRead(id, params) {
    const { uri } = params;

    if (uri === 'mcp://server/sample') {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          contents: [
            {
              uri,
              mimeType: 'text/plain',
              text: 'This is a sample resource from the MCP server.'
            }
          ]
        }
      };
    }

    return this.createErrorResponse(id, -32602, 'Resource not found');
  }

  createErrorResponse(id, code, message) {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code,
        message
      }
    };
  }
}

module.exports = MCPServer;