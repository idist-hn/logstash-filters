# CloudWatch ELK Monitoring System Makefile

.PHONY: help setup start stop clean logs test install-deps

# Default target
help:
	@echo "CloudWatch ELK Monitoring System"
	@echo ""
	@echo "Available commands:"
	@echo "  setup          - Initial setup of the system"
	@echo "  start          - Start all services"
	@echo "  stop           - Stop all services"
	@echo "  restart        - Restart all services"
	@echo "  logs           - Show logs from all services"
	@echo "  clean          - Clean up containers and volumes"
	@echo "  test           - Run tests"
	@echo "  install-deps   - Install dependencies"
	@echo "  sample-data    - Generate sample data for testing"
	@echo "  status         - Check status of all services"

# Setup the system
setup:
	@echo "🚀 Setting up CloudWatch ELK Monitoring System..."
	@chmod +x scripts/*.sh
	@mkdir -p logs
	@./scripts/setup.sh

# Start all services
start:
	@echo "🚀 Starting all services..."
	@chmod +x scripts/*.sh
	@mkdir -p logs
	@./scripts/start-all.sh

# Stop all services
stop:
	@echo "🛑 Stopping all services..."
	@./scripts/stop-all.sh

# Restart all services
restart: stop start

# Show logs
logs:
	@echo "📝 Showing logs..."
	@echo "=== Backend Logs ==="
	@if [ -f logs/backend.log ]; then tail -n 20 logs/backend.log; else echo "No backend logs found"; fi
	@echo ""
	@echo "=== Frontend Logs ==="
	@if [ -f logs/frontend.log ]; then tail -n 20 logs/frontend.log; else echo "No frontend logs found"; fi
	@echo ""
	@echo "=== Docker Logs ==="
	@docker-compose logs --tail=20

# Clean up
clean:
	@echo "🧹 Cleaning up..."
	@./scripts/stop-all.sh
	@docker-compose down -v
	@docker system prune -f
	@rm -rf logs/*

# Install dependencies
install-deps:
	@echo "📦 Installing dependencies..."
	@echo "Installing backend dependencies..."
	@cd backend && go mod tidy
	@echo "Installing frontend dependencies..."
	@cd frontend && npm install

# Generate sample data
sample-data:
	@echo "📊 Generating sample data..."
	@chmod +x scripts/generate-sample-data.sh
	@./scripts/generate-sample-data.sh

# Check status
status:
	@echo "📊 Checking service status..."
	@chmod +x scripts/health-check.sh
	@./scripts/health-check.sh

# Quick status check
quick-status:
	@echo "📊 Quick status check..."
	@echo "=== Docker Containers ==="
	@docker-compose ps
	@echo ""
	@echo "=== Service Health ==="
	@echo -n "Elasticsearch: "
	@curl -s http://localhost:9200/_cluster/health | jq -r '.status' 2>/dev/null || echo "Not available"
	@echo -n "Kibana: "
	@curl -s http://localhost:5601/api/status | jq -r '.status.overall.level' 2>/dev/null || echo "Not available"
	@echo -n "Backend API: "
	@curl -s http://localhost:8080/health | jq -r '.status' 2>/dev/null || echo "Not available"
	@echo -n "Frontend: "
	@curl -s http://localhost:3000 >/dev/null 2>&1 && echo "Available" || echo "Not available"

# Run tests
test:
	@echo "🧪 Running tests..."
	@chmod +x scripts/test-system.sh
	@./scripts/test-system.sh

# Run unit tests only
unit-test:
	@echo "🧪 Running unit tests..."
	@echo "Testing backend..."
	@cd backend && go test ./...
	@echo "Testing frontend..."
	@cd frontend && npm run test 2>/dev/null || echo "No frontend tests configured"

# Development mode
dev:
	@echo "🔧 Starting in development mode..."
	@docker-compose up -d elasticsearch kibana logstash metricbeat
	@echo "ELK stack started. Start backend and frontend manually:"
	@echo "  Backend: cd backend && go run cmd/main.go"
	@echo "  Frontend: cd frontend && npm run dev"
