# API Reference - CloudWatch ELK System

## 📋 Tổng quan API

CloudWatch ELK System cung cấp các REST API để monitoring, quản lý và tương tác với hệ thống.

## 🔗 Endpoints chính

### **Base URLs**
- **Elasticsearch**: `http://localhost:9200`
- **Kibana**: `http://localhost:5601`
- **Logstash**: `http://localhost:9600`

### **Authentication**
```bash
# Elasticsearch & Kibana
Username: elastic
Password: changeme123

# API Key (alternative)
Authorization: ApiKey <base64(id:api_key)>
```

## 📊 Elasticsearch APIs

### **1. Cluster Management**

#### **1.1 Cluster Health**
```bash
GET /_cluster/health
```
```json
{
  "cluster_name": "cloudwatch-cluster",
  "status": "green",
  "timed_out": false,
  "number_of_nodes": 1,
  "number_of_data_nodes": 1,
  "active_primary_shards": 2,
  "active_shards": 2,
  "relocating_shards": 0,
  "initializing_shards": 0,
  "unassigned_shards": 0
}
```

#### **1.2 Node Stats**
```bash
GET /_nodes/stats
```
```json
{
  "nodes": {
    "node_id": {
      "name": "cloudwatch-node-1",
      "indices": {
        "docs": {"count": 1000000},
        "store": {"size_in_bytes": 1073741824}
      },
      "jvm": {
        "mem": {
          "heap_used_percent": 45,
          "heap_max_in_bytes": 34359738368
        }
      }
    }
  }
}
```

### **2. Data Stream Management**

#### **2.1 List Data Streams**
```bash
GET /_data_stream
```
```json
{
  "data_streams": [
    {
      "name": "metrics-allow",
      "timestamp_field": "@timestamp",
      "indices": [
        {
          "index_name": "metrics-allow-000001",
          "index_uuid": "uuid-here"
        }
      ],
      "generation": 1,
      "status": "green"
    }
  ]
}
```

#### **2.2 Data Stream Stats**
```bash
GET /_data_stream/metrics-allow/_stats
```
```json
{
  "data_streams": [
    {
      "data_stream": "metrics-allow",
      "backing_indices": 1,
      "store_size_bytes": 1073741824,
      "maximum_timestamp": 1640995200000
    }
  ]
}
```

#### **2.3 Rollover Data Stream**
```bash
POST /metrics-allow/_rollover
```
```json
{
  "acknowledged": true,
  "shards_acknowledged": true,
  "old_index": "metrics-allow-000001",
  "new_index": "metrics-allow-000002",
  "rolled_over": true,
  "dry_run": false
}
```

### **3. Search APIs**

#### **3.1 Search Allowed Events**
```bash
GET /metrics-allow-*/_search
```
```json
{
  "query": {
    "bool": {
      "must": [
        {"term": {"service.type": "mysql"}},
        {"range": {"@timestamp": {"gte": "now-1h"}}}
      ]
    }
  },
  "sort": [{"@timestamp": {"order": "desc"}}],
  "size": 100
}
```

#### **3.2 Search Blocked Events**
```bash
GET /metrics-block-*/_search
```
```json
{
  "query": {
    "bool": {
      "must": [
        {"exists": {"field": "block_reasons"}},
        {"range": {"@timestamp": {"gte": "now-1h"}}}
      ]
    }
  },
  "aggs": {
    "blocked_by_reason": {
      "terms": {"field": "block_reasons"}
    }
  }
}
```

#### **3.3 Aggregation Queries**
```bash
GET /metrics-allow-*/_search
```
```json
{
  "size": 0,
  "query": {
    "range": {"@timestamp": {"gte": "now-24h"}}
  },
  "aggs": {
    "services": {
      "terms": {"field": "service.type"}
    },
    "avg_cpu": {
      "avg": {"field": "system.cpu.total.pct"}
    },
    "max_connections": {
      "max": {"field": "mysql.status.threads_connected"}
    },
    "timeline": {
      "date_histogram": {
        "field": "@timestamp",
        "calendar_interval": "1h"
      }
    }
  }
}
```

### **4. Index Management**

#### **4.1 Index Templates**
```bash
GET /_index_template/allow-template
PUT /_index_template/allow-template
```
```json
{
  "index_patterns": ["metrics-allow-*"],
  "data_stream": {},
  "priority": 200,
  "template": {
    "settings": {
      "index": {
        "number_of_shards": 1,
        "number_of_replicas": 0,
        "lifecycle": {"name": "allow-policy"}
      }
    }
  }
}
```

#### **4.2 ILM Policies**
```bash
GET /_ilm/policy/allow-policy
PUT /_ilm/policy/allow-policy
```
```json
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_size": "10gb",
            "max_age": "1d"
          }
        }
      },
      "delete": {
        "min_age": "90d"
      }
    }
  }
}
```

## ⚙️ Logstash APIs

### **1. Node Information**

#### **1.1 Node Stats**
```bash
GET /_node/stats
```
```json
{
  "host": "logstash-container",
  "version": "8.13.2",
  "http_address": "0.0.0.0:9600",
  "id": "node-uuid",
  "name": "cloudwatch-logstash",
  "ephemeral_id": "ephemeral-uuid",
  "status": "green",
  "snapshot": false,
  "pipeline": {
    "workers": 32,
    "batch_size": 2000,
    "batch_delay": 50
  }
}
```

#### **1.2 Pipeline Stats**
```bash
GET /_node/stats/pipelines
```
```json
{
  "pipelines": {
    "main": {
      "events": {
        "duration_in_millis": 1000,
        "in": 1000000,
        "filtered": 950000,
        "out": 950000,
        "queue_push_duration_in_millis": 100
      },
      "plugins": {
        "inputs": [
          {
            "id": "tcp_input",
            "events": {"out": 500000}
          }
        ],
        "filters": [
          {
            "id": "ruby_filter",
            "events": {"in": 1000000, "out": 950000}
          }
        ],
        "outputs": [
          {
            "id": "elasticsearch_output",
            "events": {"in": 950000, "out": 950000}
          }
        ]
      }
    }
  }
}
```

### **2. Pipeline Management**

#### **2.1 Reload Pipeline**
```bash
POST /_reload
```
```json
{
  "acknowledged": true
}
```

#### **2.2 Hot Reload**
```bash
PUT /_node/pipeline/main
```
```json
{
  "pipeline": {
    "config.string": "input { tcp { port => 5001 } } output { stdout {} }"
  }
}
```

### **3. JVM Stats**
```bash
GET /_node/stats/jvm
```
```json
{
  "jvm": {
    "threads": {
      "count": 45,
      "peak_count": 50
    },
    "mem": {
      "heap_used_in_bytes": 15032385536,
      "heap_used_percent": 44,
      "heap_committed_in_bytes": 34359738368,
      "heap_max_in_bytes": 34359738368,
      "non_heap_used_in_bytes": 157286400,
      "non_heap_committed_in_bytes": 184549376
    },
    "gc": {
      "collectors": {
        "old": {
          "collection_count": 5,
          "collection_time_in_millis": 500
        },
        "young": {
          "collection_count": 100,
          "collection_time_in_millis": 2000
        }
      }
    }
  }
}
```

## 📊 Kibana APIs

### **1. Saved Objects**

#### **1.1 Export Dashboards**
```bash
POST /api/saved_objects/_export
```
```json
{
  "type": ["dashboard", "visualization", "search"],
  "includeReferencesDeep": true
}
```

#### **1.2 Import Dashboards**
```bash
POST /api/saved_objects/_import
Content-Type: application/json
kbn-xsrf: true

{
  "objects": [
    {
      "id": "dashboard-id",
      "type": "dashboard",
      "attributes": {...}
    }
  ]
}
```

### **2. Index Patterns**

#### **2.1 Create Index Pattern**
```bash
POST /api/saved_objects/index-pattern
```
```json
{
  "attributes": {
    "title": "metrics-allow-*",
    "timeFieldName": "@timestamp"
  }
}
```

#### **2.2 List Index Patterns**
```bash
GET /api/saved_objects/_find?type=index-pattern
```

### **3. Alerting**

#### **3.1 Create Alert**
```bash
POST /api/alerting/rule
```
```json
{
  "name": "High CPU Alert",
  "consumer": "alerts",
  "enabled": true,
  "rule_type_id": ".index-threshold",
  "schedule": {"interval": "1m"},
  "params": {
    "index": ["metrics-allow-*"],
    "timeField": "@timestamp",
    "aggType": "avg",
    "aggField": "system.cpu.total.pct",
    "threshold": [0.8],
    "thresholdComparator": ">"
  },
  "actions": [
    {
      "id": "email-action-id",
      "group": "threshold met",
      "params": {
        "to": ["admin@company.com"],
        "subject": "High CPU Alert",
        "message": "CPU usage exceeded 80%"
      }
    }
  ]
}
```

## 🧪 Testing APIs

### **1. Send Test Data**
```bash
# TCP endpoint
echo '{"@timestamp": "2025-06-26T12:00:00.000Z", "agent": {"type": "metricbeat"}, "service": {"type": "mysql"}, "metricset": {"name": "status"}, "mysql": {"status": {"threads_connected": 100}}, "test_marker": "API_TEST"}' | nc localhost 5001

# HTTP endpoint (if configured)
curl -X POST "localhost:5001" \
  -H "Content-Type: application/json" \
  -d '{"@timestamp": "2025-06-26T12:00:00.000Z", "agent": {"type": "metricbeat"}, "service": {"type": "mysql"}, "metricset": {"name": "status"}, "test": true}'
```

### **2. Validate Data**
```bash
# Check if test data arrived
curl -X GET "localhost:9200/metrics-allow-*/_search" \
  -H "Content-Type: application/json" \
  -u "elastic:changeme123" \
  -d '{
    "query": {
      "term": {"test_marker": "API_TEST"}
    },
    "sort": [{"@timestamp": {"order": "desc"}}],
    "size": 1
  }'
```

## 📈 Monitoring APIs

### **1. Health Check Endpoint**
```bash
#!/bin/bash
# health-check-api.sh

# Combined health check
curl -X GET "localhost:9200/_cluster/health" -u "elastic:changeme123" | jq '{
  elasticsearch: {
    status: .status,
    nodes: .number_of_nodes,
    shards: .active_primary_shards
  }
}'

curl -X GET "localhost:9600/_node/stats" | jq '{
  logstash: {
    status: .status,
    events_in: .pipelines.main.events.in,
    events_out: .pipelines.main.events.out
  }
}'

curl -X GET "localhost:5601/api/status" | jq '{
  kibana: {
    status: .status.overall.state
  }
}'
```

### **2. Metrics Collection**
```bash
#!/bin/bash
# collect-metrics.sh

# Elasticsearch metrics
ES_METRICS=$(curl -s "localhost:9200/_nodes/stats" -u "elastic:changeme123" | jq '{
  heap_used_percent: .nodes[].jvm.mem.heap_used_percent,
  docs_count: .nodes[].indices.docs.count,
  store_size_bytes: .nodes[].indices.store.size_in_bytes
}')

# Logstash metrics
LS_METRICS=$(curl -s "localhost:9600/_node/stats/pipelines" | jq '{
  events_in: .pipelines.main.events.in,
  events_filtered: .pipelines.main.events.filtered,
  events_out: .pipelines.main.events.out,
  duration_ms: .pipelines.main.events.duration_in_millis
}')

echo "Elasticsearch: $ES_METRICS"
echo "Logstash: $LS_METRICS"
```

## 🔧 Configuration APIs

### **1. Dynamic Settings**
```bash
# Update Elasticsearch settings
PUT /_cluster/settings
{
  "persistent": {
    "indices.recovery.max_bytes_per_sec": "100mb"
  }
}

# Update index settings
PUT /metrics-*/_settings
{
  "index": {
    "refresh_interval": "30s",
    "number_of_replicas": 0
  }
}
```

### **2. Template Management**
```bash
# Update template
PUT /_index_template/allow-template
{
  "index_patterns": ["metrics-allow-*"],
  "template": {
    "settings": {
      "index.refresh_interval": "5s"
    }
  }
}
```

## 📚 API Examples

### **1. Complete Monitoring Script**
```bash
#!/bin/bash
# api-monitoring.sh

API_BASE="localhost:9200"
AUTH="elastic:changeme123"

# Function to call API
call_api() {
    curl -s -u "$AUTH" "$API_BASE$1" | jq "$2"
}

echo "=== CloudWatch ELK API Monitoring ==="

# Cluster health
echo "Cluster Health:"
call_api "/_cluster/health" '{status, number_of_nodes, active_primary_shards}'

# Data stream stats
echo "Data Streams:"
call_api "/_data_stream" '.data_streams[] | {name, status, indices_count: (.indices | length)}'

# Recent events count
echo "Recent Events (last hour):"
ALLOW_COUNT=$(call_api "/metrics-allow-*/_count?q=@timestamp:[now-1h TO now]" '.count')
BLOCK_COUNT=$(call_api "/metrics-block-*/_count?q=@timestamp:[now-1h TO now]" '.count')
echo "Allowed: $ALLOW_COUNT, Blocked: $BLOCK_COUNT"

# Top blocked reasons
echo "Top Block Reasons:"
call_api "/metrics-block-*/_search" '{
  "size": 0,
  "aggs": {
    "reasons": {
      "terms": {"field": "block_reasons", "size": 5}
    }
  }
}' '.aggregations.reasons.buckets[] | {reason: .key, count: .doc_count}'
```

### **2. Automated Alerting**
```bash
#!/bin/bash
# api-alerting.sh

# Thresholds
MAX_HEAP=80
MAX_BLOCKED_PER_HOUR=1000

# Check heap usage
HEAP=$(curl -s "localhost:9200/_nodes/stats/jvm" -u "elastic:changeme123" | \
  jq '.nodes[].jvm.mem.heap_used_percent')

if (( $(echo "$HEAP > $MAX_HEAP" | bc -l) )); then
    echo "ALERT: High heap usage: $HEAP%"
    # Send alert via webhook/email
fi

# Check blocked events
BLOCKED=$(curl -s "localhost:9200/metrics-block-*/_count?q=@timestamp:[now-1h TO now]" \
  -u "elastic:changeme123" | jq '.count')

if [ "$BLOCKED" -gt "$MAX_BLOCKED_PER_HOUR" ]; then
    echo "ALERT: High blocked events: $BLOCKED/hour"
    # Send alert via webhook/email
fi
```

## 📞 API Support

- **Documentation**: Elasticsearch, Logstash, Kibana official docs
- **Testing**: Use curl, Postman, or custom scripts
- **Authentication**: Always use proper credentials
- **Rate Limiting**: Be mindful of API call frequency
- **Error Handling**: Check HTTP status codes and response messages
