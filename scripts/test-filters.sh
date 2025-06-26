#!/bin/bash

# Script để test filter system với các test cases khác nhau
# Sử dụng: ./test-filters.sh [test-type]

set -e

# Configuration
LOGSTASH_HTTP_URL="http://localhost:8080"
LOGSTASH_TCP_PORT="5000"
API_BASE_URL="http://localhost:8081/api/v1"
LOG_FILE="logs/filter-test.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[PASS]${NC} $1" | tee -a "$LOG_FILE"
    ((PASSED_TESTS++))
}

fail() {
    echo -e "${RED}[FAIL]${NC} $1" | tee -a "$LOG_FILE"
    ((FAILED_TESTS++))
}

warning() {
    echo -e "${YELLOW}[WARN]${NC} $1" | tee -a "$LOG_FILE"
}

# Create log directory
mkdir -p "$(dirname "$LOG_FILE")"

# Test function
run_test() {
    local test_name="$1"
    local test_data="$2"
    local expected_result="$3"
    
    ((TOTAL_TESTS++))
    log "Running test: $test_name"
    
    # Send test event
    response=$(curl -s -w "%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d "$test_data" \
        "$LOGSTASH_HTTP_URL" 2>/dev/null || echo "000")
    
    if [ "$response" = "200" ]; then
        if [ "$expected_result" = "pass" ]; then
            success "$test_name - Event accepted as expected"
        else
            fail "$test_name - Event should have been filtered but was accepted"
        fi
    else
        if [ "$expected_result" = "filter" ]; then
            success "$test_name - Event filtered as expected"
        else
            fail "$test_name - Event should have been accepted but was filtered (HTTP $response)"
        fi
    fi
}

# Test cases
test_valid_metrics() {
    log "=== Testing Valid Metrics ==="
    
    # Valid CPU metric
    run_test "Valid CPU Metric" '{
        "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'",
        "type": "metric",
        "metric_name": "cpu",
        "value": 45.5,
        "host": "prod-server-01",
        "unit": "percent"
    }' "pass"
    
    # Valid Memory metric
    run_test "Valid Memory Metric" '{
        "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'",
        "type": "metric", 
        "metric_name": "memory",
        "value": 62.3,
        "host": "prod-server-01",
        "unit": "percent"
    }' "pass"
}

test_invalid_metrics() {
    log "=== Testing Invalid Metrics ==="
    
    # CPU value too high
    run_test "CPU Value Too High" '{
        "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'",
        "type": "metric",
        "metric_name": "cpu", 
        "value": 150.0,
        "host": "prod-server-01"
    }' "filter"
    
    # Memory value negative
    run_test "Memory Value Negative" '{
        "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'",
        "type": "metric",
        "metric_name": "memory",
        "value": -10.0,
        "host": "prod-server-01"
    }' "filter"
    
    # Missing required field
    run_test "Missing Required Field" '{
        "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'",
        "type": "metric",
        "metric_name": "cpu",
        "value": 45.0
    }' "filter"
}

test_log_levels() {
    log "=== Testing Log Levels ==="
    
    # Valid log levels
    for level in "DEBUG" "INFO" "WARN" "ERROR" "FATAL"; do
        run_test "Valid Log Level: $level" '{
            "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'",
            "level": "'$level'",
            "message": "Test message for '$level' level",
            "host": "test-host",
            "application": "test-app"
        }' "pass"
    done
    
    # Invalid log level
    run_test "Invalid Log Level" '{
        "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'",
        "level": "INVALID",
        "message": "Test message with invalid level",
        "host": "test-host"
    }' "filter"
}

test_source_filtering() {
    log "=== Testing Source Filtering ==="
    
    # Allowed application
    run_test "Allowed Application" '{
        "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'",
        "level": "INFO",
        "message": "Test message from allowed app",
        "application": "api-gateway",
        "host": "prod-server-01"
    }' "pass"
    
    # Blocked application
    run_test "Blocked Application" '{
        "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'",
        "level": "INFO", 
        "message": "Test message from blocked app",
        "application": "test-app",
        "host": "prod-server-01"
    }' "filter"
    
    # Allowed host
    run_test "Allowed Host" '{
        "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'",
        "level": "INFO",
        "message": "Test message from allowed host",
        "host": "prod-server-01",
        "application": "api-gateway"
    }' "pass"
    
    # Blocked host
    run_test "Blocked Host" '{
        "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'",
        "level": "INFO",
        "message": "Test message from blocked host", 
        "host": "dev-server",
        "application": "api-gateway"
    }' "filter"
}

test_sensitive_data() {
    log "=== Testing Sensitive Data Filtering ==="
    
    # Message with password
    run_test "Message with Password" '{
        "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'",
        "level": "INFO",
        "message": "User login failed, password: secret123",
        "host": "prod-server-01",
        "application": "api-gateway"
    }' "filter"
    
    # Message with API key
    run_test "Message with API Key" '{
        "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'",
        "level": "INFO",
        "message": "API request with api_key: abc123def456",
        "host": "prod-server-01",
        "application": "api-gateway"
    }' "filter"
    
    # Clean message
    run_test "Clean Message" '{
        "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'",
        "level": "INFO",
        "message": "User successfully logged in",
        "host": "prod-server-01",
        "application": "api-gateway"
    }' "pass"
}

test_size_limits() {
    log "=== Testing Size Limits ==="
    
    # Large message
    large_message=$(printf 'A%.0s' {1..70000})  # 70KB message
    run_test "Large Message" '{
        "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'",
        "level": "INFO",
        "message": "'$large_message'",
        "host": "prod-server-01"
    }' "filter"
    
    # Normal size message
    run_test "Normal Size Message" '{
        "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'",
        "level": "INFO",
        "message": "This is a normal sized message",
        "host": "prod-server-01",
        "application": "api-gateway"
    }' "pass"
}

test_required_fields() {
    log "=== Testing Required Fields ==="
    
    # Missing timestamp
    run_test "Missing Timestamp" '{
        "level": "INFO",
        "message": "Message without timestamp",
        "host": "prod-server-01"
    }' "filter"
    
    # Missing level
    run_test "Missing Level" '{
        "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'",
        "message": "Message without level",
        "host": "prod-server-01"
    }' "filter"
    
    # Missing message
    run_test "Missing Message" '{
        "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'",
        "level": "INFO",
        "host": "prod-server-01"
    }' "filter"
    
    # All required fields present
    run_test "All Required Fields" '{
        "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'",
        "level": "INFO",
        "message": "Complete message with all required fields",
        "host": "prod-server-01"
    }' "pass"
}

test_api_endpoints() {
    log "=== Testing API Endpoints ==="
    
    # Test get filter rules
    if curl -s "$API_BASE_URL/filters/rules" > /dev/null; then
        success "API: Get filter rules endpoint accessible"
    else
        fail "API: Get filter rules endpoint not accessible"
    fi
    
    # Test get filter stats
    if curl -s "$API_BASE_URL/filters/stats" > /dev/null; then
        success "API: Get filter stats endpoint accessible"
    else
        fail "API: Get filter stats endpoint not accessible"
    fi
    
    # Test get filter types
    if curl -s "$API_BASE_URL/filters/types" > /dev/null; then
        success "API: Get filter types endpoint accessible"
    else
        fail "API: Get filter types endpoint not accessible"
    fi
}

# Main execution
main() {
    local test_type="${1:-all}"
    
    log "Starting filter system tests (type: $test_type)"
    log "Logstash HTTP URL: $LOGSTASH_HTTP_URL"
    log "API Base URL: $API_BASE_URL"
    
    # Check if Logstash is running
    if ! curl -s "$LOGSTASH_HTTP_URL" > /dev/null; then
        warning "Logstash HTTP input not accessible at $LOGSTASH_HTTP_URL"
        warning "Make sure Logstash is running and HTTP input is enabled"
    fi
    
    case "$test_type" in
        "all")
            test_valid_metrics
            test_invalid_metrics
            test_log_levels
            test_source_filtering
            test_sensitive_data
            test_size_limits
            test_required_fields
            test_api_endpoints
            ;;
        "metrics")
            test_valid_metrics
            test_invalid_metrics
            ;;
        "logs")
            test_log_levels
            test_source_filtering
            test_sensitive_data
            ;;
        "content")
            test_sensitive_data
            test_size_limits
            test_required_fields
            ;;
        "api")
            test_api_endpoints
            ;;
        *)
            echo "Usage: $0 [all|metrics|logs|content|api]"
            exit 1
            ;;
    esac
    
    # Summary
    echo ""
    log "=== Test Summary ==="
    log "Total tests: $TOTAL_TESTS"
    success "Passed: $PASSED_TESTS"
    fail "Failed: $FAILED_TESTS"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        success "All tests passed!"
        exit 0
    else
        fail "Some tests failed. Check logs for details."
        exit 1
    fi
}

# Run main function
main "$@"
