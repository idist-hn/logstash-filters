@echo off
REM CloudWatch ELK Setup Script for Windows
setlocal enabledelayedexpansion

echo 🚀 Setting up CloudWatch ELK Monitoring System...

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

REM Create necessary directories
echo 📁 Creating directories...
if not exist "elk\elasticsearch\data" mkdir elk\elasticsearch\data
if not exist "elk\logstash\logs" mkdir elk\logstash\logs
if not exist "elk\kibana\logs" mkdir elk\kibana\logs
if not exist "logs" mkdir logs

REM Start ELK Stack
echo 🐳 Starting ELK Stack...
docker-compose up -d elasticsearch

REM Wait for Elasticsearch to be ready
echo ⏳ Waiting for Elasticsearch to be ready...
:wait_es
timeout /t 10 /nobreak >nul
curl -s http://localhost:9200/_cluster/health >nul 2>&1
if errorlevel 1 (
    echo Waiting for Elasticsearch...
    goto wait_es
)

echo ✅ Elasticsearch is ready!

REM Start Kibana and Logstash
echo 🐳 Starting Kibana and Logstash...
docker-compose up -d kibana logstash

REM Wait for Kibana to be ready
echo ⏳ Waiting for Kibana to be ready...
:wait_kibana
timeout /t 10 /nobreak >nul
curl -s http://localhost:5601/api/status >nul 2>&1
if errorlevel 1 (
    echo Waiting for Kibana...
    goto wait_kibana
)

echo ✅ Kibana is ready!

REM Start Metricbeat
echo 🐳 Starting Metricbeat...
docker-compose up -d metricbeat

echo ✅ ELK Stack is running!

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📊 Access URLs:
echo    - Kibana: http://localhost:5601
echo    - Elasticsearch: http://localhost:9200
echo    - API Backend: http://localhost:8080 (after starting)
echo    - Frontend: http://localhost:3000 (after starting)
echo.
echo 🔑 Default credentials:
echo    - Elasticsearch: elastic / changeme123
echo    - Dashboard: admin / admin123
echo.
echo 🚀 Next steps:
echo    1. cd backend && go mod tidy && go run cmd/main.go
echo    2. cd frontend && npm install && npm run dev
echo.
