@echo off
echo 🌤️ Starting MCP Weather Server (Node.js)
echo =======================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js is installed

REM Check if dependencies are installed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed successfully
)

echo 🚀 Starting server...
echo Server will be available at:
echo   • Main: http://localhost:8000
echo   • Health: http://localhost:8000/health
echo   • MCP Endpoint: http://localhost:8000/mcp/stream
echo   • Test Interface: http://localhost:8000/test
echo.
echo Press Ctrl+C to stop the server
echo =======================================

REM Start the server
npm run dev
