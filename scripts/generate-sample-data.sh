#!/bin/bash

# Generate sample data for testing
set -e

echo "📊 Generating sample data for CloudWatch ELK..."

# Wait for Elasticsearch to be ready
until curl -s http://localhost:9200/_cluster/health | grep -q '"status":"green\|yellow"'; do
    echo "Waiting for Elasticsearch..."
    sleep 5
done

# Generate sample log data
echo "📝 Generating sample logs..."
for i in {1..50}; do
    TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")
    LEVELS=("info" "warn" "error" "debug")
    LEVEL=${LEVELS[$RANDOM % ${#LEVELS[@]}]}
    HOSTS=("web-server-1" "web-server-2" "api-server-1" "database-1")
    HOST=${HOSTS[$RANDOM % ${#HOSTS[@]}]}
    MESSAGES=(
        "User login successful"
        "Database connection established"
        "API request processed"
        "Cache miss occurred"
        "Memory usage high"
        "Disk space warning"
        "Network timeout detected"
        "Service started successfully"
    )
    MESSAGE=${MESSAGES[$RANDOM % ${#MESSAGES[@]}]}
    
    curl -X POST "localhost:9200/cloudwatch-logs-$(date +%Y.%m.%d)/_doc" \
        -H "Content-Type: application/json" \
        -u "elastic:changeme123" \
        -d "{
            \"@timestamp\": \"$TIMESTAMP\",
            \"level\": \"$LEVEL\",
            \"message\": \"$MESSAGE\",
            \"host\": {
                \"name\": \"$HOST\",
                \"ip\": \"192.168.1.$((RANDOM % 254 + 1))\"
            },
            \"service\": \"cloudwatch-demo\",
            \"environment\": \"production\"
        }" > /dev/null
    
    if [ $((i % 10)) -eq 0 ]; then
        echo "Generated $i log entries..."
    fi
    
    sleep 0.1
done

echo "✅ Generated 50 sample log entries!"

# Generate some error logs for testing
echo "🚨 Generating error scenarios..."
for i in {1..10}; do
    TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")
    ERROR_MESSAGES=(
        "Database connection failed"
        "Out of memory error"
        "Authentication failed"
        "Service unavailable"
        "Timeout error"
    )
    MESSAGE=${ERROR_MESSAGES[$RANDOM % ${#ERROR_MESSAGES[@]}]}
    HOST="error-prone-server-$((RANDOM % 3 + 1))"
    
    curl -X POST "localhost:9200/cloudwatch-logs-$(date +%Y.%m.%d)/_doc" \
        -H "Content-Type: application/json" \
        -u "elastic:changeme123" \
        -d "{
            \"@timestamp\": \"$TIMESTAMP\",
            \"level\": \"error\",
            \"message\": \"$MESSAGE\",
            \"host\": {
                \"name\": \"$HOST\",
                \"ip\": \"192.168.1.$((RANDOM % 254 + 1))\"
            },
            \"service\": \"cloudwatch-demo\",
            \"environment\": \"production\",
            \"error\": {
                \"type\": \"SystemError\",
                \"stack_trace\": \"Error at line 123 in service.go\"
            }
        }" > /dev/null
    
    sleep 0.2
done

echo "✅ Generated 10 error scenarios!"

# Refresh indices
echo "🔄 Refreshing indices..."
curl -X POST "localhost:9200/cloudwatch-logs-*/_refresh" \
    -u "elastic:changeme123" > /dev/null

echo ""
echo "🎉 Sample data generation completed!"
echo ""
echo "📊 You can now:"
echo "   1. View logs in Kibana: http://localhost:5601"
echo "   2. Check the dashboard: http://localhost:3000"
echo "   3. Search for specific logs using the search functionality"
echo ""
