const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MCP Server Implementation
class MCPServer {
    constructor() {
        this.tools = [
            {
                name: 'get_alerts',
                description: 'Get weather alerts for a US state.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        state: {
                            type: 'string',
                            description: 'Two-letter US state code (e.g. CA, NY)'
                        }
                    },
                    required: ['state']
                }
            },
            {
                name: 'get_forecast',
                description: 'Get weather forecast for a location.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        latitude: {
                            type: 'number',
                            description: 'Latitude of the location'
                        },
                        longitude: {
                            type: 'number',
                            description: 'Longitude of the location'
                        }
                    },
                    required: ['latitude', 'longitude']
                }
            }
        ];
        
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
        
        try {
            let result;
            switch (name) {
                case 'get_alerts':
                    result = await this.getAlerts(args.state);
                    break;
                case 'get_forecast':
                    result = await this.getForecast(args.latitude, args.longitude);
                    break;
                default:
                    return this.createErrorResponse(id, -32602, 'Invalid tool name');
            }
            
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

    async getAlerts(state) {
        try {
            const response = await axios.get(`https://api.weather.gov/alerts/active?area=${state.toUpperCase()}`);
            const alerts = response.data.features;
            
            if (alerts.length === 0) {
                return `No active weather alerts for ${state.toUpperCase()}.`;
            }
            
            let alertsText = `Active weather alerts for ${state.toUpperCase()}:\n\n`;
            alerts.forEach((alert, index) => {
                const properties = alert.properties;
                alertsText += `${index + 1}. ${properties.headline}\n`;
                alertsText += `   Severity: ${properties.severity}\n`;
                alertsText += `   Urgency: ${properties.urgency}\n`;
                alertsText += `   Event: ${properties.event}\n`;
                alertsText += `   Description: ${properties.description}\n`;
                if (properties.instruction) {
                    alertsText += `   Instructions: ${properties.instruction}\n`;
                }
                alertsText += '\n';
            });
            
            return alertsText;
        } catch (error) {
            throw new Error(`Failed to fetch weather alerts: ${error.message}`);
        }
    }

    async getForecast(latitude, longitude) {
        try {
            // First, get the grid point
            const pointResponse = await axios.get(`https://api.weather.gov/points/${latitude},${longitude}`);
            const forecastUrl = pointResponse.data.properties.forecast;
            
            // Then get the forecast
            const forecastResponse = await axios.get(forecastUrl);
            const periods = forecastResponse.data.properties.periods;
            
            let forecastText = `Weather forecast for ${latitude}, ${longitude}:\n\n`;
            periods.slice(0, 10).forEach((period, index) => {
                forecastText += `${period.name}:\n`;
                forecastText += `  Temperature: ${period.temperature}°${period.temperatureUnit}\n`;
                forecastText += `  Wind: ${period.windSpeed} ${period.windDirection}\n`;
                forecastText += `  Forecast: ${period.detailedForecast}\n\n`;
            });
            
            return forecastText;
        } catch (error) {
            throw new Error(`Failed to fetch weather forecast: ${error.message}`);
        }
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

const mcpServer = new MCPServer();

// Routes
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/mcp/capabilities', (req, res) => {
    res.json({
        protocolVersion: '2024-11-05',
        capabilities: {
            tools: {},
            resources: {}
        },
        serverInfo: {
            name: 'Weather MCP Server (Node.js)',
            version: '1.0.0'
        }
    });
});

// Main MCP endpoint with streamable HTTP
app.post('/mcp/stream', async (req, res) => {
    try {
        const response = await mcpServer.handleRequest(req.body);
        res.json(response);
    } catch (error) {
        console.error('MCP Stream Error:', error);
        res.status(500).json({
            jsonrpc: '2.0',
            id: req.body.id || null,
            error: {
                code: -32603,
                message: 'Internal error'
            }
        });
    }
});

// Legacy MCP endpoint
app.post('/mcp', async (req, res) => {
    try {
        const response = await mcpServer.handleRequest(req.body);
        res.json(response);
    } catch (error) {
        console.error('MCP Error:', error);
        res.status(500).json({
            jsonrpc: '2.0',
            id: req.body.id || null,
            error: {
                code: -32603,
                message: 'Internal error'
            }
        });
    }
});

// Web test interface
app.get('/test', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'test.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`MCP Weather Server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`MCP Endpoint: http://localhost:${PORT}/mcp/stream`);
    console.log(`Web Test Interface: http://localhost:${PORT}/test`);
    console.log(`API Documentation: http://localhost:${PORT}/mcp/capabilities`);
});
