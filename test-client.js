const axios = require('axios');

class MCPTestClient {
    constructor(baseUrl = 'http://localhost:8000') {
        this.baseUrl = baseUrl;
        this.mcpEndpoint = `${baseUrl}/mcp/stream`;
    }

    async makeRequest(method, params = {}, id = null) {
        const request = {
            jsonrpc: '2.0',
            method,
            params,
            id: id || Math.floor(Math.random() * 1000)
        };

        try {
            console.log(`\n🔄 Sending request: ${method}`);
            console.log('Request:', JSON.stringify(request, null, 2));
            
            const response = await axios.post(this.mcpEndpoint, request);
            
            console.log('✅ Response received:');
            console.log(JSON.stringify(response.data, null, 2));
            
            return response.data;
        } catch (error) {
            console.error('❌ Error:', error.message);
            if (error.response) {
                console.error('Response data:', error.response.data);
            }
            throw error;
        }
    }

    async testInitialize() {
        console.log('\n=== Testing Initialize ===');
        return await this.makeRequest('initialize', {});
    }

    async testListTools() {
        console.log('\n=== Testing List Tools ===');
        return await this.makeRequest('tools/list');
    }

    async testGetAlerts(state = 'CA') {
        console.log('\n=== Testing Weather Alerts ===');
        return await this.makeRequest('tools/call', {
            name: 'get_alerts',
            arguments: { state }
        });
    }

    async testGetForecast(latitude = 37.7749, longitude = -122.4194) {
        console.log('\n=== Testing Weather Forecast ===');
        return await this.makeRequest('tools/call', {
            name: 'get_forecast',
            arguments: { latitude, longitude }
        });
    }

    async testListResources() {
        console.log('\n=== Testing List Resources ===');
        return await this.makeRequest('resources/list');
    }

    async testReadResource(uri = 'mcp://server/sample') {
        console.log('\n=== Testing Read Resource ===');
        return await this.makeRequest('resources/read', { uri });
    }

    async checkHealth() {
        console.log('\n=== Checking Server Health ===');
        try {
            const response = await axios.get(`${this.baseUrl}/health`);
            console.log('✅ Health check passed:');
            console.log(JSON.stringify(response.data, null, 2));
            return response.data;
        } catch (error) {
            console.error('❌ Health check failed:', error.message);
            throw error;
        }
    }

    async runAllTests() {
        console.log('🚀 Starting MCP Server Tests');
        console.log('================================');

        try {
            // Check server health first
            await this.checkHealth();

            // Test MCP protocol methods
            await this.testInitialize();
            await this.testListTools();
            await this.testListResources();
            await this.testReadResource();
            
            // Test weather tools
            await this.testGetAlerts('CA');
            await this.testGetForecast(37.7749, -122.4194); // San Francisco
            
            console.log('\n🎉 All tests completed successfully!');
        } catch (error) {
            console.error('\n💥 Test suite failed:', error.message);
            process.exit(1);
        }
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const client = new MCPTestClient();
    
    // Parse command line arguments
    const args = process.argv.slice(2);
    const serverUrl = args.find(arg => arg.startsWith('--url='))?.split('=')[1] || 'http://localhost:8000';
    
    if (serverUrl !== 'http://localhost:8000') {
        client.baseUrl = serverUrl;
        client.mcpEndpoint = `${serverUrl}/mcp/stream`;
        console.log(`🌐 Testing server at: ${serverUrl}`);
    }
    
    client.runAllTests();
}

module.exports = MCPTestClient;
