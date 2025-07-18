const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const MCPServer = require('./mcp/server');
const mcpServer = new MCPServer();

// Importa las rutas segmentadas
const mcpRoutes = require('./routes/mcp')(mcpServer);
const healthRoutes = require('./routes/health');
const testRoutes = require('./routes/test');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Usa las rutas segmentadas
app.use('/mcp', mcpRoutes);
app.use('/health', healthRoutes);
app.use('/test', testRoutes);

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`MCP Weather Server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`MCP Endpoint: http://localhost:${PORT}/mcp/stream`);
    console.log(`Web Test Interface: http://localhost:${PORT}/test`);
    console.log(`API Documentation: http://localhost:${PORT}/mcp/capabilities`);
});
