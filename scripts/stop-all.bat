@echo off
REM Stop all services for Windows
setlocal enabledelayedexpansion

echo 🛑 Stopping CloudWatch ELK Monitoring System...

REM Stop Node.js processes (Frontend)
echo 🛑 Stopping Frontend...
taskkill /f /im node.exe >nul 2>&1

REM Stop Go processes (Backend)
echo 🛑 Stopping Backend...
for /f "tokens=2" %%i in ('tasklist /fi "imagename eq go.exe" /fo csv ^| find "go.exe"') do (
    taskkill /f /pid %%i >nul 2>&1
)

REM Stop Docker containers
echo 🛑 Stopping Docker containers...
docker-compose down

echo ✅ All services stopped!
