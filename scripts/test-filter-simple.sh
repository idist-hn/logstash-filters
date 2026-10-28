#!/bin/bash

# Simple Filter Test Script
# Test filter system bằng cách gửi data qua TCP input với agent.type = metricbeat

echo "🧪 Testing Database Metrics Filter System"
echo "========================================"

LOGSTASH_TCP_PORT=5001

# Test 1: Normal MySQL metrics (should be allowed)
echo "📊 Test 1: Normal MySQL Metrics (should be allowed)"
cat << 'EOF' | nc localhost $LOGSTASH_TCP_PORT
{
  "@timestamp": "2025-06-26T07:00:00.000Z",
  "agent": {"type": "metricbeat", "version": "8.11.0", "name": "test-mysql"},
  "service": {"type": "mysql", "name": "mysql"},
  "metricset": {"name": "status"},
  "host": {"name": "mysql-server-01"},
  "mysql": {
    "status": {
      "connections": 150,
      "max_connections": 1000,
      "threads_connected": 25,
      "queries": 15000,
      "slow_queries": 2,
      "com_select": 8000,
      "com_insert": 500
    }
  }
}
EOF

sleep 3

# Test 2: MySQL with sensitive data (should be filtered)
echo "🔒 Test 2: MySQL with Sensitive Data (should be filtered)"
cat << 'EOF' | nc localhost $LOGSTASH_TCP_PORT
{
  "@timestamp": "2025-06-26T07:00:10.000Z",
  "agent": {"type": "metricbeat", "version": "8.11.0", "name": "test-mysql"},
  "service": {"type": "mysql", "name": "mysql"},
  "metricset": {"name": "status"},
  "host": {"name": "mysql-server-01"},
  "mysql": {
    "status": {
      "connections": 200,
      "ssl_cipher": "AES256-SHA",
      "ssl_key": "secret-ssl-key-12345",
      "user_password": "admin123",
      "api_secret": "mysql-secret-token",
      "queries": 20000,
      "max_connections": 1000
    }
  }
}
EOF

sleep 3

# Test 3: PostgreSQL normal (should be allowed)
echo "🐘 Test 3: Normal PostgreSQL Metrics (should be allowed)"
cat << 'EOF' | nc localhost $LOGSTASH_TCP_PORT
{
  "@timestamp": "2025-06-26T07:00:20.000Z",
  "agent": {"type": "metricbeat", "version": "8.11.0", "name": "test-postgres"},
  "service": {"type": "postgresql", "name": "postgresql"},
  "metricset": {"name": "database"},
  "host": {"name": "postgres-server-01"},
  "postgresql": {
    "database": {
      "name": "production_db",
      "number_of_backends": 15,
      "transactions": {"commit": 5000, "rollback": 10},
      "blocks": {"read": 25000, "hit": 225000},
      "rows": {"returned": 50000, "fetched": 25000, "inserted": 500}
    }
  }
}
EOF

sleep 3

# Test 4: PostgreSQL with sensitive query (should be filtered)
echo "🔍 Test 4: PostgreSQL with Sensitive Query (should be filtered)"
cat << 'EOF' | nc localhost $LOGSTASH_TCP_PORT
{
  "@timestamp": "2025-06-26T07:00:30.000Z",
  "agent": {"type": "metricbeat", "version": "8.11.0", "name": "test-postgres"},
  "service": {"type": "postgresql", "name": "postgresql"},
  "metricset": {"name": "activity"},
  "host": {"name": "postgres-server-01"},
  "postgresql": {
    "activity": {
      "query": "SELECT * FROM users WHERE password = 'admin123' AND api_key = 'secret-key'",
      "user": {"name": "admin", "password": "encrypted_hash"},
      "client": {"address": "192.168.1.50"}
    },
    "database": {
      "connection_string": "postgresql://admin:secret123@localhost:5432/db"
    }
  }
}
EOF

sleep 3

# Test 5: High connection count (should trigger alert)
echo "⚠️  Test 5: High Connection Count (should trigger alert)"
cat << 'EOF' | nc localhost $LOGSTASH_TCP_PORT
{
  "@timestamp": "2025-06-26T07:00:40.000Z",
  "agent": {"type": "metricbeat", "version": "8.11.0", "name": "test-mysql"},
  "service": {"type": "mysql", "name": "mysql"},
  "metricset": {"name": "status"},
  "host": {"name": "mysql-server-01"},
  "mysql": {
    "status": {
      "connections": 9500,
      "max_connections": 10000,
      "threads_connected": 9000,
      "queries": 100000
    }
  }
}
EOF

sleep 3

# Test 6: Invalid data (missing required fields - should be blocked)
echo "❌ Test 6: Invalid Data - Missing Required Fields (should be blocked)"
cat << 'EOF' | nc localhost $LOGSTASH_TCP_PORT
{
  "@timestamp": "2025-06-26T07:00:50.000Z",
  "agent": {"type": "metricbeat"},
  "service": {"type": "mysql"},
  "mysql": {"status": {"connections": 100}}
}
EOF

sleep 3

# Test 7: Non-metricbeat data (should be dropped by filter)
echo "🚫 Test 7: Non-Metricbeat Data (should be dropped)"
cat << 'EOF' | nc localhost $LOGSTASH_TCP_PORT
{
  "@timestamp": "2025-06-26T07:01:00.000Z",
  "agent": {"type": "filebeat", "version": "8.11.0"},
  "service": {"type": "mysql"},
  "message": "This is a log message, not metrics"
}
EOF

sleep 3

echo ""
echo "✅ All test cases sent!"
echo ""
echo "🔍 Expected Results:"
echo "   ✅ Tests 1, 3: Normal metrics should be allowed"
echo "   🔒 Tests 2, 4: Sensitive fields should be removed"
echo "   ⚠️  Test 5: High connections should trigger alert"
echo "   ❌ Test 6: Invalid data should be blocked"
echo "   🚫 Test 7: Non-metricbeat data should be dropped"
echo ""
echo "📊 Check results:"
echo "   ./scripts/monitor-results.sh"
echo "   docker logs logstash --tail 30 | grep filter"
echo ""
echo "🔍 Search for test data:"
echo "   curl -X GET 'http://localhost:9200/cloudwatch-logs-*/_search?q=mysql OR postgresql&size=10' -u 'elastic:changeme123'"
