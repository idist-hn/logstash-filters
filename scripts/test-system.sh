#!/bin/bash

# System Integration Test Script
set -e

echo "🧪 Testing CloudWatch ELK Monitoring System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -n "Testing $test_name... "
    
    if eval "$test_command" >/dev/null 2>&1; then
        echo -e "${GREEN}PASS${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}FAIL${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Function to test HTTP endpoint
test_http() {
    local url="$1"
    local expected_status="$2"
    local auth="$3"
    
    if [ -n "$auth" ]; then
        status=$(curl -s -o /dev/null -w "%{http_code}" -u "$auth" "$url")
    else
        status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    fi
    
    [ "$status" = "$expected_status" ]
}

# Function to test JSON response
test_json_response() {
    local url="$1"
    local auth="$2"
    
    if [ -n "$auth" ]; then
        response=$(curl -s -u "$auth" "$url")
    else
        response=$(curl -s "$url")
    fi
    
    echo "$response" | jq . >/dev/null 2>&1
}

echo "🔍 Running system integration tests..."
echo ""

# Test 1: Docker containers are running
echo "=== Docker Container Tests ==="
run_test "Elasticsearch container" "docker-compose ps elasticsearch | grep -q 'Up'"
run_test "Kibana container" "docker-compose ps kibana | grep -q 'Up'"
run_test "Logstash container" "docker-compose ps logstash | grep -q 'Up'"
run_test "Metricbeat container" "docker-compose ps metricbeat | grep -q 'Up'"

echo ""

# Test 2: Service health checks
echo "=== Service Health Tests ==="
run_test "Elasticsearch health" "test_http 'http://localhost:9200/_cluster/health' '200' 'elastic:changeme123'"
run_test "Kibana health" "test_http 'http://localhost:5601/api/status' '200'"
run_test "Backend API health" "test_http 'http://localhost:8080/health' '200'"

echo ""

# Test 3: API endpoints
echo "=== API Endpoint Tests ==="

# Get auth token
echo "Getting authentication token..."
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}' | jq -r '.token' 2>/dev/null)

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
    echo -e "${GREEN}Authentication successful${NC}"
    
    run_test "Dashboard endpoint" "test_http 'http://localhost:8080/api/v1/dashboard' '200' '' -H 'Authorization: Bearer $TOKEN'"
    run_test "Metrics endpoint" "test_http 'http://localhost:8080/api/v1/metrics/system' '200' '' -H 'Authorization: Bearer $TOKEN'"
    run_test "Cluster health endpoint" "test_http 'http://localhost:8080/api/v1/metrics/cluster' '200' '' -H 'Authorization: Bearer $TOKEN'"
else
    echo -e "${RED}Authentication failed${NC}"
    ((TESTS_FAILED+=3))
fi

echo ""

# Test 4: Elasticsearch indices
echo "=== Elasticsearch Index Tests ==="
run_test "Metricbeat indices exist" "curl -s -u elastic:changeme123 'http://localhost:9200/_cat/indices/metricbeat-*' | grep -q metricbeat"

# Test 5: Data ingestion
echo "=== Data Ingestion Tests ==="

# Create test log entry
TEST_LOG='{
    "@timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'",
    "level": "info",
    "message": "Test log entry from integration test",
    "host": {"name": "test-host"},
    "service": "integration-test"
}'

echo "Creating test log entry..."
curl -s -X POST "http://localhost:9200/cloudwatch-logs-$(date +%Y.%m.%d)/_doc" \
    -H "Content-Type: application/json" \
    -u "elastic:changeme123" \
    -d "$TEST_LOG" >/dev/null

sleep 2

# Refresh index
curl -s -X POST "http://localhost:9200/cloudwatch-logs-*/_refresh" \
    -u "elastic:changeme123" >/dev/null

# Search for test log
run_test "Test log ingestion" "curl -s -u elastic:changeme123 'http://localhost:9200/cloudwatch-logs-*/_search?q=integration-test' | jq '.hits.total.value' | grep -q '[1-9]'"

echo ""

# Test 6: Frontend accessibility
echo "=== Frontend Tests ==="
run_test "Frontend accessibility" "test_http 'http://localhost:3000' '200'"

echo ""

# Test 7: Search functionality
echo "=== Search Functionality Tests ==="
if [ -n "$TOKEN" ]; then
    run_test "Search API" "curl -s -H 'Authorization: Bearer $TOKEN' 'http://localhost:8080/api/v1/search?q=test&index=*' | jq '.hits' >/dev/null"
else
    echo -e "${YELLOW}Skipping search test (no auth token)${NC}"
fi

echo ""

# Test 8: Performance tests
echo "=== Performance Tests ==="

# Test response times
echo "Testing API response times..."
DASHBOARD_TIME=$(curl -s -w "%{time_total}" -o /dev/null -H "Authorization: Bearer $TOKEN" "http://localhost:8080/api/v1/dashboard")
METRICS_TIME=$(curl -s -w "%{time_total}" -o /dev/null -H "Authorization: Bearer $TOKEN" "http://localhost:8080/api/v1/metrics/system")

echo "Dashboard response time: ${DASHBOARD_TIME}s"
echo "Metrics response time: ${METRICS_TIME}s"

# Check if response times are reasonable (< 5 seconds)
run_test "Dashboard response time < 5s" "[ $(echo \"$DASHBOARD_TIME < 5\" | bc -l) -eq 1 ]"
run_test "Metrics response time < 5s" "[ $(echo \"$METRICS_TIME < 5\" | bc -l) -eq 1 ]"

echo ""

# Test 9: Memory and disk usage
echo "=== Resource Usage Tests ==="

# Check Elasticsearch memory usage
ES_MEMORY=$(docker stats elasticsearch --no-stream --format "table {{.MemUsage}}" | tail -n 1 | cut -d'/' -f1 | sed 's/[^0-9.]//g')
echo "Elasticsearch memory usage: ${ES_MEMORY}MB"

# Check disk usage
DISK_USAGE=$(df -h . | tail -n 1 | awk '{print $5}' | sed 's/%//')
echo "Disk usage: ${DISK_USAGE}%"

run_test "Disk usage < 90%" "[ $DISK_USAGE -lt 90 ]"

echo ""

# Summary
echo "=== Test Summary ==="
echo -e "Tests passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests failed: ${RED}$TESTS_FAILED${NC}"
echo -e "Total tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed! System is working correctly.${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed. Please check the system configuration.${NC}"
    exit 1
fi
