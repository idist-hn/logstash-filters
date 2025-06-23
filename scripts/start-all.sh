#!/bin/bash

# Start all services
set -e

echo "🚀 Starting CloudWatch ELK Monitoring System..."

# Start ELK Stack
echo "🐳 Starting ELK Stack..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check Elasticsearch health
echo "🔍 Checking Elasticsearch health..."
until curl -s http://localhost:9200/_cluster/health | grep -q '"status":"green\|yellow"'; do
    echo "Waiting for Elasticsearch..."
    sleep 5
done
echo "✅ Elasticsearch is healthy!"

# Check Kibana health
echo "🔍 Checking Kibana health..."
until curl -s http://localhost:5601/api/status | grep -q '"overall":{"level":"available"'; do
    echo "Waiting for Kibana..."
    sleep 5
done
echo "✅ Kibana is healthy!"

# Start Backend API
echo "🚀 Starting Backend API..."
cd backend
if [ ! -f "go.mod" ]; then
    echo "Initializing Go module..."
    go mod init cloudwatch-backend
fi
go mod tidy
nohup go run cmd/main.go > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../logs/backend.pid
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 10

# Check backend health
until curl -s http://localhost:8080/health | grep -q '"status":"ok"'; do
    echo "Waiting for backend API..."
    sleep 5
done
echo "✅ Backend API is healthy!"

# Start Frontend
echo "🚀 Starting Frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi
nohup npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../logs/frontend.pid
cd ..

echo ""
echo "🎉 All services are running!"
echo ""
echo "📊 Access URLs:"
echo "   - Frontend Dashboard: http://localhost:3000"
echo "   - Kibana: http://localhost:5601"
echo "   - Backend API: http://localhost:8080"
echo "   - Elasticsearch: http://localhost:9200"
echo ""
echo "🔑 Login credentials:"
echo "   - Dashboard: admin / admin123"
echo "   - Elasticsearch: elastic / changeme123"
echo ""
echo "📝 Logs:"
echo "   - Backend: logs/backend.log"
echo "   - Frontend: logs/frontend.log"
echo ""
echo "🛑 To stop all services: ./scripts/stop-all.sh"
echo ""
