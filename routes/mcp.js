const express = require('express');
const router = express.Router();

module.exports = (mcpServer) => {
    router.post('/stream', async (req, res) => {
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

    router.post('/', async (req, res) => {
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

    router.get('/capabilities', (req, res) => {
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

    return router;
};