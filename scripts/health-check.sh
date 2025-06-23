#!/bin/bash

# Health check script for CloudWatch ELK system
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🏥 CloudWatch ELK Health Check${NC}"
echo "=================================="

# Function to check service health
check_service() {
    local service_name="$1"
    local url="$2"
    local auth="$3"
    local expected_pattern="$4"
    
    echo -n "Checking $service_name... "
    
    if [ -n "$auth" ]; then
        response=$(curl -s -u "$auth" "$url" 2>/dev/null || echo "ERROR")
    else
        response=$(curl -s "$url" 2>/dev/null || echo "ERROR")
    fi
    
    if [[ "$response" == "ERROR" ]]; then
        echo -e "${RED}UNREACHABLE${NC}"
        return 1
    elif [[ "$response" =~ $expected_pattern ]]; then
        echo -e "${GREEN}HEALTHY${NC}"
        return 0
    else
        echo -e "${YELLOW}DEGRADED${NC}"
        return 1
    fi
}

# Function to check Docker container
check_container() {
    local container_name="$1"
    echo -n "Checking $container_name container... "
    
    if docker-compose ps "$container_name" | grep -q "Up"; then
        echo -e "${GREEN}RUNNING${NC}"
        return 0
    else
        echo -e "${RED}STOPPED${NC}"
        return 1
    fi
}

# Function to get container stats
get_container_stats() {
    local container_name="$1"
    echo -n "  └─ Resource usage: "
    
    if docker stats "$container_name" --no-stream --format "table {{.CPUPerc}}\t{{.MemUsage}}" 2>/dev/null | tail -n 1 | read cpu memory; then
        echo -e "${BLUE}CPU: $cpu, Memory: $memory${NC}"
    else
        echo -e "${YELLOW}N/A${NC}"
    fi
}

echo ""
echo "🐳 Docker Containers:"
echo "--------------------"

# Check Docker containers
check_container "elasticsearch" && get_container_stats "elasticsearch"
check_container "kibana" && get_container_stats "kibana"
check_container "logstash" && get_container_stats "logstash"
check_container "metricbeat" && get_container_stats "metricbeat"

echo ""
echo "🌐 Service Endpoints:"
echo "--------------------"

# Check service endpoints
check_service "Elasticsearch" "http://localhost:9200/_cluster/health" "elastic:changeme123" '"status":"(green|yellow)"'
check_service "Kibana" "http://localhost:5601/api/status" "" '"level":"available"'
check_service "Backend API" "http://localhost:8080/health" "" '"status":"ok"'
check_service "Frontend" "http://localhost:3000" "" "<!DOCTYPE html>"

echo ""
echo "📊 System Metrics:"
echo "-----------------"

# Get Elasticsearch cluster info
echo -n "Elasticsearch cluster status: "
cluster_status=$(curl -s -u elastic:changeme123 http://localhost:9200/_cluster/health 2>/dev/null | jq -r '.status' 2>/dev/null || echo "unknown")
case $cluster_status in
    "green") echo -e "${GREEN}$cluster_status${NC}" ;;
    "yellow") echo -e "${YELLOW}$cluster_status${NC}" ;;
    "red") echo -e "${RED}$cluster_status${NC}" ;;
    *) echo -e "${YELLOW}$cluster_status${NC}" ;;
esac

# Get node count
echo -n "Active nodes: "
node_count=$(curl -s -u elastic:changeme123 http://localhost:9200/_cluster/health 2>/dev/null | jq -r '.number_of_nodes' 2>/dev/null || echo "unknown")
echo -e "${BLUE}$node_count${NC}"

# Get index count
echo -n "Total indices: "
index_count=$(curl -s -u elastic:changeme123 http://localhost:9200/_cat/indices 2>/dev/null | wc -l || echo "unknown")
echo -e "${BLUE}$index_count${NC}"

# Get document count
echo -n "Total documents: "
doc_count=$(curl -s -u elastic:changeme123 http://localhost:9200/_cat/count/*?v 2>/dev/null | tail -n 1 | awk '{print $3}' || echo "unknown")
echo -e "${BLUE}$doc_count${NC}"

echo ""
echo "💾 Storage Info:"
echo "---------------"

# Disk usage
echo -n "Disk usage: "
disk_usage=$(df -h . | tail -n 1 | awk '{print $5}')
echo -e "${BLUE}$disk_usage${NC}"

# Elasticsearch data size
echo -n "Elasticsearch data size: "
es_size=$(curl -s -u elastic:changeme123 http://localhost:9200/_cat/allocation?v 2>/dev/null | tail -n 1 | awk '{print $2}' || echo "unknown")
echo -e "${BLUE}$es_size${NC}"

echo ""
echo "🔍 Recent Activity:"
echo "------------------"

# Recent logs count
echo -n "Logs in last hour: "
recent_logs=$(curl -s -u elastic:changeme123 "http://localhost:9200/cloudwatch-logs-*/_count" \
    -H "Content-Type: application/json" \
    -d '{
        "query": {
            "range": {
                "@timestamp": {
                    "gte": "now-1h"
                }
            }
        }
    }' 2>/dev/null | jq -r '.count' 2>/dev/null || echo "unknown")
echo -e "${BLUE}$recent_logs${NC}"

# Recent metrics count
echo -n "Metrics in last hour: "
recent_metrics=$(curl -s -u elastic:changeme123 "http://localhost:9200/metricbeat-*/_count" \
    -H "Content-Type: application/json" \
    -d '{
        "query": {
            "range": {
                "@timestamp": {
                    "gte": "now-1h"
                }
            }
        }
    }' 2>/dev/null | jq -r '.count' 2>/dev/null || echo "unknown")
echo -e "${BLUE}$recent_metrics${NC}"

echo ""
echo "🚨 Alerts & Issues:"
echo "------------------"

# Check for errors in logs
error_count=$(curl -s -u elastic:changeme123 "http://localhost:9200/cloudwatch-logs-*/_count" \
    -H "Content-Type: application/json" \
    -d '{
        "query": {
            "bool": {
                "must": [
                    {"term": {"level.keyword": "error"}},
                    {"range": {"@timestamp": {"gte": "now-1h"}}}
                ]
            }
        }
    }' 2>/dev/null | jq -r '.count' 2>/dev/null || echo "0")

echo -n "Errors in last hour: "
if [ "$error_count" -gt 0 ]; then
    echo -e "${RED}$error_count${NC}"
else
    echo -e "${GREEN}$error_count${NC}"
fi

# System load check
echo -n "System load: "
load_avg=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
echo -e "${BLUE}$load_avg${NC}"

echo ""
echo "📋 Summary:"
echo "----------"

# Overall health assessment
all_services_up=true

# Check if all containers are running
for container in elasticsearch kibana logstash metricbeat; do
    if ! docker-compose ps "$container" | grep -q "Up"; then
        all_services_up=false
        break
    fi
done

# Check if services are responding
for url in "http://localhost:9200/_cluster/health" "http://localhost:5601/api/status" "http://localhost:8080/health"; do
    if ! curl -s "$url" >/dev/null 2>&1; then
        all_services_up=false
        break
    fi
done

if $all_services_up; then
    echo -e "${GREEN}✅ System is healthy and operational${NC}"
    exit 0
else
    echo -e "${RED}❌ System has issues that need attention${NC}"
    exit 1
fi
