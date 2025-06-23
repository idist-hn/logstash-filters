@echo off
REM Start all services for Windows
setlocal enabledelayedexpansion

echo 🚀 Starting CloudWatch ELK Monitoring System...

REM Create logs directory
if not exist "logs" mkdir logs

REM Start ELK Stack
echo 🐳 Starting ELK Stack...
docker-compose up -d

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 30 /nobreak >nul

REM Check Elasticsearch health
echo 🔍 Checking Elasticsearch health...
:wait_es_health
curl -s http://localhost:9200/_cluster/health >nul 2>&1
if errorlevel 1 (
    echo Waiting for Elasticsearch...
    timeout /t 5 /nobreak >nul
    goto wait_es_health
)
echo ✅ Elasticsearch is healthy!

REM Check Kibana health
echo 🔍 Checking Kibana health...
:wait_kibana_health
curl -s http://localhost:5601/api/status >nul 2>&1
if errorlevel 1 (
    echo Waiting for Kibana...
    timeout /t 5 /nobreak >nul
    goto wait_kibana_health
)
echo ✅ Kibana is healthy!

REM Start Backend API
echo 🚀 Starting Backend API...
cd backend
if not exist "go.mod" (
    echo Initializing Go module...
    go mod init cloudwatch-backend
)
go mod tidy
start /b cmd /c "go run cmd/main.go > ../logs/backend.log 2>&1"
cd ..

REM Wait for backend to start
echo ⏳ Waiting for backend to start...
timeout /t 10 /nobreak >nul

REM Check backend health
:wait_backend
curl -s http://localhost:8080/health >nul 2>&1
if errorlevel 1 (
    echo Waiting for backend API...
    timeout /t 5 /nobreak >nul
    goto wait_backend
)
echo ✅ Backend API is healthy!

REM Start Frontend
echo 🚀 Starting Frontend...
cd frontend
if not exist "node_modules" (
    echo Installing frontend dependencies...
    npm install
)
start /b cmd /c "npm run dev > ../logs/frontend.log 2>&1"
cd ..

echo.
echo 🎉 All services are running!
echo.
echo 📊 Access URLs:
echo    - Frontend Dashboard: http://localhost:3000
echo    - Kibana: http://localhost:5601
echo    - Backend API: http://localhost:8080
echo    - Elasticsearch: http://localhost:9200
echo.
echo 🔑 Login credentials:
echo    - Dashboard: admin / admin123
echo    - Elasticsearch: elastic / changeme123
echo.
echo 📝 Logs:
echo    - Backend: logs\backend.log
echo    - Frontend: logs\frontend.log
echo.
echo 🛑 To stop all services: scripts\stop-all.bat
echo.
