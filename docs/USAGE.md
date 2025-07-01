# Usage Guide - CloudWatch ELK System

## 📋 Hướng dẫn sử dụng

Hướng dẫn chi tiết cách sử dụng CloudWatch ELK System để monitoring, filtering và analyzing database metrics.

## 🚀 Quick Start

### **1. Khởi động hệ thống**
```bash
# Start all services
docker-compose up -d

# Check services status
docker-compose ps

# Setup data streams
./scripts/setup-data-streams.sh
```

### **2. Truy cập giao diện**
- **Kibana Dashboard**: http://localhost:5601
- **Elasticsearch API**: http://localhost:9200
- **Logstash Monitoring**: http://localhost:9600

### **3. Login credentials**
```
Username: elastic
Password: changeme123
```

## 📊 Monitoring Dashboard

### **1. Kibana Setup**

#### **1.1 Create Index Patterns**
```bash
# Navigate to Kibana > Stack Management > Index Patterns
# Create patterns:
- metrics-allow-*    (Allowed events)
- metrics-block-*    (Blocked events)
```

#### **1.2 Import Dashboards**
```bash
# Import pre-built dashboards
curl -X POST "localhost:5601/api/saved_objects/_import" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  --form file=@kibana/dashboards/database-monitoring.ndjson
```

### **2. Key Metrics Dashboards**

#### **2.1 Database Performance Dashboard**
- **MySQL Metrics**: Connections, queries/sec, slow queries
- **PostgreSQL Metrics**: Active connections, database size, query performance
- **Elasticsearch Metrics**: Cluster health, node stats, index performance

#### **2.2 System Monitoring Dashboard**
- **CPU Usage**: Total, user, system, iowait percentages
- **Memory Usage**: RAM, swap utilization
- **Disk I/O**: Read/write operations, throughput
- **Network**: Traffic, errors, dropped packets

#### **2.3 Security Dashboard**
- **Blocked Events**: Count by service, metricset, reason
- **Removed Fields**: Audit trail of filtered sensitive data
- **Filter Performance**: Processing speed, success rate

## 🔍 Data Analysis

### **1. Query Examples**

#### **1.1 MySQL Performance Analysis**
```json
# High connection count
GET metrics-allow-*/_search
{
  "query": {
    "bool": {
      "must": [
        {"term": {"service.type": "mysql"}},
        {"term": {"metricset.name": "status"}},
        {"range": {"mysql.status.threads_connected": {"gte": 100}}}
      ]
    }
  }
}

# Slow query detection
GET metrics-allow-*/_search
{
  "query": {
    "bool": {
      "must": [
        {"term": {"service.type": "mysql"}},
        {"range": {"mysql.status.slow_queries": {"gte": 10}}}
      ]
    }
  }
}
```

#### **1.2 System Resource Analysis**
```json
# High CPU usage
GET metrics-allow-*/_search
{
  "query": {
    "bool": {
      "must": [
        {"term": {"service.type": "system"}},
        {"term": {"metricset.name": "cpu"}},
        {"range": {"system.cpu.total.pct": {"gte": 0.8}}}
      ]
    }
  }
}

# Memory pressure
GET metrics-allow-*/_search
{
  "query": {
    "bool": {
      "must": [
        {"term": {"service.type": "system"}},
        {"term": {"metricset.name": "memory"}},
        {"range": {"system.memory.used.pct": {"gte": 0.9}}}
      ]
    }
  }
}
```

#### **1.3 Security Analysis**
```json
# Blocked events analysis
GET metrics-block-*/_search
{
  "aggs": {
    "blocked_by_service": {
      "terms": {"field": "service.type"}
    },
    "blocked_by_reason": {
      "terms": {"field": "block_reasons"}
    }
  }
}
```

### **2. Alerting Setup**

#### **2.1 Watcher Alerts**
```json
# High connection alert
PUT _watcher/watch/high_mysql_connections
{
  "trigger": {
    "schedule": {"interval": "1m"}
  },
  "input": {
    "search": {
      "request": {
        "search_type": "query_then_fetch",
        "indices": ["metrics-allow-*"],
        "body": {
          "query": {
            "bool": {
              "must": [
                {"term": {"service.type": "mysql"}},
                {"range": {"mysql.status.threads_connected": {"gte": 8000}}}
              ]
            }
          }
        }
      }
    }
  },
  "condition": {
    "compare": {"ctx.payload.hits.total": {"gt": 0}}
  },
  "actions": {
    "send_email": {
      "email": {
        "to": ["admin@company.com"],
        "subject": "High MySQL Connections Alert",
        "body": "MySQL connections exceeded threshold"
      }
    }
  }
}
```

## 🧪 Testing & Validation

### **1. Test Data Injection**

#### **1.1 MySQL Test Data**
```bash
# Allowed MySQL status data
echo '{
  "@timestamp": "2025-06-26T12:00:00.000Z",
  "agent": {"type": "metricbeat"},
  "service": {"type": "mysql"},
  "metricset": {"name": "status"},
  "host": {"name": "mysql-server-01"},
  "mysql": {
    "status": {
      "threads_connected": 150,
      "queries": 1000000,
      "slow_queries": 5
    }
  },
  "test_marker": "MYSQL_STATUS_TEST"
}' | nc localhost 5001

# Blocked MySQL data (wrong metricset)
echo '{
  "@timestamp": "2025-06-26T12:00:00.000Z",
  "agent": {"type": "metricbeat"},
  "service": {"type": "mysql"},
  "metricset": {"name": "invalid_metricset"},
  "test_marker": "MYSQL_BLOCKED_TEST"
}' | nc localhost 5001
```

#### **1.2 System Test Data**
```bash
# Allowed system CPU data
echo '{
  "@timestamp": "2025-06-26T12:00:00.000Z",
  "agent": {"type": "metricbeat"},
  "service": {"type": "system"},
  "metricset": {"name": "cpu"},
  "host": {"name": "server-01"},
  "system": {
    "cpu": {
      "total": {"pct": 0.45},
      "user": {"pct": 0.30},
      "system": {"pct": 0.15}
    }
  },
  "test_marker": "SYSTEM_CPU_TEST"
}' | nc localhost 5001

# Blocked system data (sensitive fields)
echo '{
  "@timestamp": "2025-06-26T12:00:00.000Z",
  "agent": {"type": "metricbeat"},
  "service": {"type": "system"},
  "metricset": {"name": "process"},
  "system": {
    "process": {
      "cmdline": "/usr/bin/secret-app --password=secret123",
      "username": "admin"
    }
  },
  "test_marker": "SYSTEM_SENSITIVE_TEST"
}' | nc localhost 5001
```

### **2. Monitoring Scripts**

#### **2.1 Real-time Monitoring**
```bash
# Monitor allowed events
./scripts/monitor-whitelist.sh

# Monitor blocked events  
./scripts/monitor-results.sh

# Filter performance monitoring
watch -n 5 'curl -s "localhost:9600/_node/stats/pipelines" | jq ".pipelines.main.events"'
```

#### **2.2 Custom Monitoring Script**
```bash
#!/bin/bash
# monitor-custom.sh

echo "=== CloudWatch ELK Monitoring ==="
echo "Timestamp: $(date)"
echo

# Elasticsearch health
echo "📊 Elasticsearch Health:"
curl -s "localhost:9200/_cluster/health" | jq '{status, number_of_nodes, active_primary_shards}'
echo

# Data streams status
echo "📈 Data Streams:"
curl -s "localhost:9200/_data_stream" | jq '.data_streams[] | {name, status, indices_count}'
echo

# Logstash pipeline stats
echo "⚙️ Logstash Pipeline:"
curl -s "localhost:9600/_node/stats/pipelines" | jq '.pipelines.main.events | {in, filtered, out}'
echo

# Recent events count
echo "📋 Recent Events (last 5 minutes):"
curl -s "localhost:9200/metrics-allow-*/_count?q=@timestamp:[now-5m TO now]" | jq '.count'
echo "Allowed events"

curl -s "localhost:9200/metrics-block-*/_count?q=@timestamp:[now-5m TO now]" | jq '.count'
echo "Blocked events"
```

## 🔧 Maintenance Tasks

### **1. Index Management**

#### **1.1 Check Index Health**
```bash
# List all indices
curl -X GET "localhost:9200/_cat/indices?v"

# Check specific data stream
curl -X GET "localhost:9200/_data_stream/metrics-allow"
```

#### **1.2 Manual Rollover**
```bash
# Force rollover for allow stream
curl -X POST "localhost:9200/metrics-allow/_rollover"

# Force rollover for block stream  
curl -X POST "localhost:9200/metrics-block/_rollover"
```

### **2. Performance Optimization**

#### **2.1 Clear Cache**
```bash
# Clear field data cache
curl -X POST "localhost:9200/_cache/clear?fielddata=true"

# Clear query cache
curl -X POST "localhost:9200/_cache/clear?query=true"
```

#### **2.2 Optimize Indices**
```bash
# Force merge old indices
curl -X POST "localhost:9200/metrics-allow-*/_forcemerge?max_num_segments=1"
```

### **3. Backup & Restore**

#### **3.1 Create Snapshot**
```bash
# Register snapshot repository
curl -X PUT "localhost:9200/_snapshot/backup_repo" \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "fs",
    "settings": {
      "location": "/usr/share/elasticsearch/backup"
    }
  }'

# Create snapshot
curl -X PUT "localhost:9200/_snapshot/backup_repo/snapshot_$(date +%Y%m%d)" \
  -H 'Content-Type: application/json' \
  -d '{
    "indices": "metrics-*",
    "ignore_unavailable": true,
    "include_global_state": false
  }'
```

## 📈 Performance Tuning

### **1. Query Optimization**
```bash
# Use time-based queries
GET metrics-allow-*/_search
{
  "query": {
    "bool": {
      "filter": [
        {"range": {"@timestamp": {"gte": "now-1h"}}},
        {"term": {"service.type": "mysql"}}
      ]
    }
  }
}

# Use aggregations for analytics
GET metrics-allow-*/_search
{
  "size": 0,
  "aggs": {
    "avg_cpu": {
      "avg": {"field": "system.cpu.total.pct"}
    },
    "max_connections": {
      "max": {"field": "mysql.status.threads_connected"}
    }
  }
}
```

### **2. Resource Monitoring**
```bash
# Monitor JVM heap usage
curl -s "localhost:9200/_nodes/stats/jvm" | jq '.nodes[].jvm.mem.heap_used_percent'

# Monitor Logstash performance
curl -s "localhost:9600/_node/stats" | jq '.jvm.mem.heap_used_percent'
```

## 🔍 Troubleshooting

### **1. Common Issues**

#### **1.1 No data in Kibana**
```bash
# Check data streams
curl -X GET "localhost:9200/_data_stream"

# Check recent data
curl -X GET "localhost:9200/metrics-allow-*/_search?size=1&sort=@timestamp:desc"
```

#### **1.2 High memory usage**
```bash
# Check field data usage
curl -X GET "localhost:9200/_nodes/stats/indices/fielddata"

# Clear cache if needed
curl -X POST "localhost:9200/_cache/clear"
```

### **2. Debug Mode**
```bash
# Enable debug logging
docker-compose exec logstash \
  curl -X PUT "localhost:9600/_node/logging?logger=logstash.filters.ruby&level=debug"
```

## 📚 Advanced Usage

### **1. Custom Filters**
- Modify `logstash/config/database-filter-rules.yml`
- Add new services or metricsets
- Configure field-level filtering

### **2. Custom Dashboards**
- Create visualizations in Kibana
- Export/import dashboard configurations
- Set up custom alerts

### **3. API Integration**
- Use Elasticsearch REST API
- Integrate with external monitoring tools
- Custom data export/import

## 📞 Support

- **Real-time Monitoring**: `./scripts/monitor-whitelist.sh`
- **Performance Check**: `curl localhost:9600/_node/stats`
- **Health Check**: `curl localhost:9200/_cluster/health`
- **Documentation**: `/docs` directory
