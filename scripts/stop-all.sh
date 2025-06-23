#!/bin/bash

# Stop all services
set -e

echo "🛑 Stopping CloudWatch ELK Monitoring System..."

# Stop frontend
if [ -f "logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null; then
        echo "🛑 Stopping Frontend..."
        kill $FRONTEND_PID
        rm logs/frontend.pid
    fi
fi

# Stop backend
if [ -f "logs/backend.pid" ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    if ps -p $BACKEND_PID > /dev/null; then
        echo "🛑 Stopping Backend..."
        kill $BACKEND_PID
        rm logs/backend.pid
    fi
fi

# Stop Docker containers
echo "🛑 Stopping Docker containers..."
docker-compose down

echo "✅ All services stopped!"
