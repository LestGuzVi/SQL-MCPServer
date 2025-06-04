<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# MCP Server Development Guidelines

This is an MCP (Model Context Protocol) server project built with Express.js and Node.js.

## Key Context

- This project implements the MCP protocol using JSON-RPC 2.0
- The server provides weather-related tools using the National Weather Service API
- Main endpoints follow MCP specification for tools, resources, and capabilities
- Use Express.js patterns and Node.js best practices
- Weather data comes from official US government APIs (no API key required)

## Code Style Guidelines

- Use modern JavaScript (ES6+) features where appropriate
- Follow Express.js conventions for routing and middleware
- Implement proper error handling with try-catch blocks
- Use consistent JSON-RPC 2.0 response formats
- Include comprehensive logging for debugging
- Maintain backward compatibility with the MCP protocol

## Architecture Notes

- `server.js` contains the main Express application and MCP protocol implementation
- Weather tools are implemented as async functions that call NWS APIs
- HTTP transport is used for MCP Inspector connectivity
- Web test interface provides manual testing capabilities

## Testing

- Use the built-in test client (`test-client.js`) for protocol testing
- Web interface (`/test`) for manual verification
- Ensure all MCP methods return proper JSON-RPC 2.0 responses

You can find more info and examples at https://modelcontextprotocol.io/llms-full.txt
