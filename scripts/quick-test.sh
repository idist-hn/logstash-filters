#!/bin/bash

# Quick Test Script for Database Metrics Filtering
# Gửi các test cases nhanh để kiểm tra filter system

echo "🚀 Quick Test - Database Metrics Filtering"
echo "=========================================="

LOGSTASH_TCP_PORT=5001
LOGSTASH_HTTP_PORT=8090

# Test 1: Normal MySQL metrics (should be allowed)
echo "📊 Test 1: Normal MySQL Metrics"
cat << 'EOF' | nc localhost $LOGSTASH_TCP_PORT
{
  "@timestamp": "2025-06-26T06:35:00.000Z",
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
      "slow_queries": 2
    }
  }
}
EOF

sleep 2

# Test 2: MySQL with sensitive data (should be filtered)
echo "🔒 Test 2: MySQL with Sensitive Data"
cat << 'EOF' | nc localhost $LOGSTASH_TCP_PORT
{
  "@timestamp": "2025-06-26T06:35:10.000Z",
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
      "queries": 20000
    }
  }
}
EOF

sleep 2

# Test 3: PostgreSQL normal metrics (should be allowed)
echo "🐘 Test 3: Normal PostgreSQL Metrics"
curl -X POST "http://localhost:$LOGSTASH_HTTP_PORT" \
  -H "Content-Type: application/json" \
  -d '{
    "@timestamp": "2025-06-26T06:35:20.000Z",
    "agent": {"type": "metricbeat", "version": "8.11.0", "name": "test-postgres"},
    "service": {"type": "postgresql", "name": "postgresql"},
    "metricset": {"name": "database"},
    "host": {"name": "postgres-server-01"},
    "postgresql": {
      "database": {
        "name": "production_db",
        "number_of_backends": 15,
        "transactions": {"commit": 5000, "rollback": 10},
        "blocks": {"read": 25000, "hit": 225000}
      }
    }
  }'

sleep 2

# Test 4: PostgreSQL with sensitive query (should be filtered)
echo "🔍 Test 4: PostgreSQL with Sensitive Query"
curl -X POST "http://localhost:$LOGSTASH_HTTP_PORT" \
  -H "Content-Type: application/json" \
  -d '{
    "@timestamp": "2025-06-26T06:35:30.000Z",
    "agent": {"type": "metricbeat", "version": "8.11.0", "name": "test-postgres"},
    "service": {"type": "postgresql", "name": "postgresql"},
    "metricset": {"name": "activity"},
    "host": {"name": "postgres-server-01"},
    "postgresql": {
      "activity": {
        "query": "SELECT * FROM users WHERE password = '\''admin123'\'' AND api_key = '\''secret-key'\''",
        "user": {"name": "admin", "password": "encrypted_hash"},
        "client": {"address": "192.168.1.50"}
      },
      "database": {"connection_string": "postgresql://admin:secret123@localhost:5432/db"}
    }
  }'

sleep 2

# Test 5: High connection count (should trigger alert)
echo "⚠️  Test 5: High Connection Count"
cat << 'EOF' | nc localhost $LOGSTASH_TCP_PORT
{
  "@timestamp": "2025-06-26T06:35:40.000Z",
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

sleep 2

# Test 6: Invalid data (missing required fields)
echo "❌ Test 6: Invalid Data (Missing Required Fields)"
cat << 'EOF' | nc localhost $LOGSTASH_TCP_PORT
{
  "@timestamp": "2025-06-26T06:35:50.000Z",
  "service": {"type": "mysql"},
  "mysql": {"status": {"connections": 100}}
}
EOF

sleep 2

# Test 7: System metrics (should be allowed)
echo "💻 Test 7: System Metrics"
curl -X POST "http://localhost:$LOGSTASH_HTTP_PORT" \
  -H "Content-Type: application/json" \
  -d '{
    "@timestamp": "2025-06-26T06:36:00.000Z",
    "agent": {"type": "metricbeat", "version": "8.11.0", "name": "test-system"},
    "service": {"type": "system", "name": "system"},
    "metricset": {"name": "cpu"},
    "host": {"name": "app-server-01"},
    "system": {
      "cpu": {
        "user": {"pct": 0.45},
        "system": {"pct": 0.15},
        "idle": {"pct": 0.40}
      }
    }
  }'

sleep 2

echo ""
echo "✅ All test cases sent!"
echo "📊 Check results in:"
echo "   - Logstash logs: docker logs logstash --tail 50"
echo "   - Elasticsearch indices: curl -X GET 'http://localhost:9200/_cat/indices?v' -u 'elastic:changeme123'"
echo "   - Kibana: http://localhost:5601"
echo ""
echo "🔍 Expected results:"
echo "   ✅ Normal metrics should be allowed and indexed"
echo "   🔒 Sensitive data should be removed/blocked"
echo "   ⚠️  High connections should trigger alerts"
echo "   ❌ Invalid data should be blocked"
