# MCP Weather Server - Node.js Version
# PowerShell startup script

Write-Host "🌤️ Starting MCP Weather Server (Node.js)" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if dependencies are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
}

Write-Host "🚀 Starting server..." -ForegroundColor Yellow
Write-Host "Server will be available at:" -ForegroundColor Cyan
Write-Host "  • Main: http://localhost:8000" -ForegroundColor White
Write-Host "  • Health: http://localhost:8000/health" -ForegroundColor White
Write-Host "  • MCP Endpoint: http://localhost:8000/mcp/stream" -ForegroundColor White
Write-Host "  • Test Interface: http://localhost:8000/test" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "=======================================" -ForegroundColor Cyan

# Start the server
npm run dev
