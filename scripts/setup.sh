#!/bin/bash

# CloudWatch ELK Setup Script
set -e

echo "🚀 Setting up CloudWatch ELK Monitoring System..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p elk/elasticsearch/data
mkdir -p elk/logstash/logs
mkdir -p elk/kibana/logs

# Set permissions for Elasticsearch data directory
echo "🔐 Setting permissions..."
sudo chown -R 1000:1000 elk/elasticsearch/data

# Start ELK Stack
echo "🐳 Starting ELK Stack..."
docker-compose up -d elasticsearch

# Wait for Elasticsearch to be ready
echo "⏳ Waiting for Elasticsearch to be ready..."
until curl -s http://localhost:9200/_cluster/health | grep -q '"status":"green\|yellow"'; do
    echo "Waiting for Elasticsearch..."
    sleep 10
done

echo "✅ Elasticsearch is ready!"

# Start Kibana and Logstash
echo "🐳 Starting Kibana and Logstash..."
docker-compose up -d kibana logstash

# Wait for Kibana to be ready
echo "⏳ Waiting for Kibana to be ready..."
until curl -s http://localhost:5601/api/status | grep -q '"overall":{"level":"available"'; do
    echo "Waiting for Kibana..."
    sleep 10
done

echo "✅ Kibana is ready!"

# Start Metricbeat
echo "🐳 Starting Metricbeat..."
docker-compose up -d metricbeat

echo "✅ ELK Stack is running!"

# Setup Elasticsearch indices and templates
echo "🔧 Setting up Elasticsearch indices..."
curl -X PUT "localhost:9200/_index_template/cloudwatch-logs" \
  -H "Content-Type: application/json" \
  -u "elastic:changeme123" \
  -d '{
    "index_patterns": ["cloudwatch-logs-*"],
    "template": {
      "settings": {
        "number_of_shards": 1,
        "number_of_replicas": 0,
        "index.refresh_interval": "5s"
      },
      "mappings": {
        "properties": {
          "@timestamp": { "type": "date" },
          "message": { "type": "text" },
          "level": { "type": "keyword" },
          "host": {
            "properties": {
              "name": { "type": "keyword" },
              "ip": { "type": "ip" }
            }
          }
        }
      }
    }
  }'

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📊 Access URLs:"
echo "   - Kibana: http://localhost:5601"
echo "   - Elasticsearch: http://localhost:9200"
echo "   - API Backend: http://localhost:8080 (after starting)"
echo "   - Frontend: http://localhost:3000 (after starting)"
echo ""
echo "🔑 Default credentials:"
echo "   - Elasticsearch: elastic / changeme123"
echo "   - Dashboard: admin / admin123"
echo ""
echo "🚀 Next steps:"
echo "   1. cd backend && go mod tidy && go run cmd/main.go"
echo "   2. cd frontend && npm install && npm run dev"
echo ""
