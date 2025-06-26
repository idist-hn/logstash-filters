#!/bin/bash

# Demo Filter System Script
# Tạo dữ liệu demo và hiển thị kết quả filter system

echo "🎯 Database Metrics Filter System - DEMO"
echo "========================================"

LOGSTASH_TCP_PORT=5001

# Function to send data and show result
send_and_check() {
    local test_name="$1"
    local data="$2"
    local expected="$3"
    
    echo ""
    echo "📊 $test_name"
    echo "Expected: $expected"
    echo "Sending data..."
    
    # Send data
    echo "$data" | nc localhost $LOGSTASH_TCP_PORT
    
    # Wait for processing
    sleep 3
    
    # Check recent logs
    echo "Recent Logstash output:"
    docker logs logstash --tail 5 | grep -E "(filter_status|mysql|postgresql)" | tail -2
    
    echo "---"
}

# Demo 1: Normal MySQL metrics (should be allowed)
send_and_check "Normal MySQL Metrics" '{
  "@timestamp": "2025-06-26T07:15:00.000Z",
  "agent": {"type": "metricbeat", "version": "8.11.0"},
  "service": {"type": "mysql", "name": "mysql"},
  "metricset": {"name": "status"},
  "host": {"name": "mysql-server-01"},
  "mysql": {
    "status": {
      "connections": 150,
      "max_connections": 1000,
      "threads_connected": 25,
      "queries": 15000
    }
  }
}' "✅ ALLOWED"

# Demo 2: MySQL with sensitive data (should be filtered)
send_and_check "MySQL with Sensitive Data" '{
  "@timestamp": "2025-06-26T07:15:10.000Z",
  "agent": {"type": "metricbeat", "version": "8.11.0"},
  "service": {"type": "mysql", "name": "mysql"},
  "metricset": {"name": "status"},
  "host": {"name": "mysql-server-01"},
  "mysql": {
    "status": {
      "connections": 200,
      "user_password": "admin123",
      "api_secret": "mysql-secret-token",
      "ssl_key": "secret-key-12345",
      "queries": 20000
    }
  }
}' "🔒 FILTERED (sensitive fields removed)"

# Demo 3: PostgreSQL with sensitive query (should be filtered)
send_and_check "PostgreSQL with Sensitive Query" '{
  "@timestamp": "2025-06-26T07:15:20.000Z",
  "agent": {"type": "metricbeat", "version": "8.11.0"},
  "service": {"type": "postgresql", "name": "postgresql"},
  "metricset": {"name": "activity"},
  "host": {"name": "postgres-server-01"},
  "postgresql": {
    "activity": {
      "query": "SELECT * FROM users WHERE password = '\''admin123'\'' AND api_key = '\''secret-key'\''",
      "user": {"name": "admin"},
      "client": {"address": "192.168.1.50"}
    }
  }
}' "🔍 FILTERED (sensitive query removed)"

# Demo 4: High connection count (should trigger alert)
send_and_check "High Connection Count" '{
  "@timestamp": "2025-06-26T07:15:30.000Z",
  "agent": {"type": "metricbeat", "version": "8.11.0"},
  "service": {"type": "mysql", "name": "mysql"},
  "metricset": {"name": "status"},
  "host": {"name": "mysql-server-01"},
  "mysql": {
    "status": {
      "connections": 9500,
      "max_connections": 10000,
      "threads_connected": 9000
    }
  }
}' "⚠️ BLOCKED (connection limit exceeded)"

# Demo 5: Invalid data (missing required fields)
send_and_check "Invalid Data (Missing Required Fields)" '{
  "@timestamp": "2025-06-26T07:15:40.000Z",
  "agent": {"type": "metricbeat"},
  "service": {"type": "mysql"},
  "mysql": {"status": {"connections": 100}}
}' "❌ BLOCKED (missing required fields)"

echo ""
echo "🎯 DEMO COMPLETED!"
echo ""
echo "📊 Summary of Filter System Capabilities:"
echo "   ✅ Normal metrics: Allowed and indexed"
echo "   🔒 Sensitive data: Fields removed automatically"
echo "   🔍 Sensitive queries: Blocked for security"
echo "   ⚠️  High values: Blocked when exceeding limits"
echo "   ❌ Invalid data: Blocked when missing required fields"
echo ""
echo "📋 Check detailed results:"
echo "   - Logstash logs: docker logs logstash --tail 50"
echo "   - Elasticsearch data: curl -X GET 'http://localhost:9200/_cat/indices?v' -u 'elastic:changeme123'"
echo "   - Kibana dashboard: http://localhost:5601"
echo ""
echo "🔧 Filter rules configured in:"
echo "   - logstash/config/database-filter-rules.yml"
echo "   - logstash/pipeline/simple.conf (filter section)"
