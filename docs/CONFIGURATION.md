# Configuration Guide - CloudWatch ELK System

## 📋 Tổng quan cấu hình

Hệ thống CloudWatch ELK sử dụng cấu hình phân tầng với các file YAML và JSON để quản lý filtering rules, performance settings và security policies.

## 🔧 Cấu hình chính

### **1. Database Filter Rules**
File: `logstash/config/database-filter-rules.yml`

#### **1.1 Global Settings**
```yaml
global:
  enabled: true
  default_action: "deny"  # WHITELIST MODE
  log_filtered_events: true
  debug_mode: false
  
  # Global blocked fields (áp dụng cho tất cả services)
  blocked_fields:
    - "*password*"
    - "*secret*"
    - "*key*"
    - "*token*"
    - "*auth*"
    - "*credential*"
    - "*private*"
    - "*ssl_*"
    - "*cert*"
    - "*.ip_address"
    - "*session*"
```

#### **1.2 MySQL Configuration**
```yaml
mysql:
  enabled: true
  
  # Allowed metricsets
  allowed_metricsets:
    - "status"
    - "galera_status"
    - "performance"
    - "query"
  
  # Field filtering
  field_filters:
    blocked_fields:
      - "mysql.status.ssl_*"
      - "mysql.status.rsa_*"
      - "mysql.status.*password*"
      - "mysql.status.version*"
      - "mysql.status.hostname"
      - "mysql.status.server_id"
  
  # Value limits
  value_limits:
    connections:
      min: 0
      max: 10000
    queries_per_second:
      min: 0
      max: 100000
```

#### **1.3 PostgreSQL Configuration**
```yaml
postgresql:
  enabled: true
  
  allowed_metricsets:
    - "database"
    - "bgwriter"
    - "activity"
    - "statement"
  
  field_filters:
    blocked_fields:
      - "postgresql.activity.query"
      - "postgresql.activity.client.address"
      - "postgresql.activity.user.name"
      - "postgresql.*password*"
      - "postgresql.*version*"
      - "postgresql.*hostname*"
```

#### **1.4 System Configuration**
```yaml
system:
  enabled: true
  
  allowed_metricsets:
    - "cpu"
    - "memory"
    - "load"
    - "diskio"
    - "filesystem"
    - "network"
    - "process"
    - "process_summary"
    - "socket_summary"
    - "uptime"
  
  blocked_metricsets:
    - "users"      # Privacy
    - "service"    # Security
  
  field_filters:
    blocked_fields:
      - "system.process.cmdline"
      - "system.process.env"
      - "system.process.username"
      - "system.filesystem.mount_point"
      - "system.network.name"
```

### **2. Logstash Configuration**

#### **2.1 Main Configuration**
File: `logstash/config/logstash.yml`

```yaml
node.name: "cloudwatch-logstash"
path.data: /usr/share/logstash/data

# Pipeline settings - Optimized for 256GB RAM
pipeline.workers: ${PIPELINE_WORKERS:32}
pipeline.batch.size: ${PIPELINE_BATCH_SIZE:2000}
pipeline.batch.delay: ${PIPELINE_BATCH_DELAY:50}

# Queue settings
queue.type: memory
queue.max_bytes: 8gb
queue.max_events: 0

# Monitoring
xpack.monitoring.enabled: ${XPACK_MONITORING_ENABLED:false}
```

#### **2.2 JVM Settings**
File: `logstash/config/jvm.options`

```bash
# Heap size - 32GB for 256GB RAM server
-Xms32g
-Xmx32g

# GC settings
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200
-XX:G1HeapRegionSize=32m

# Performance tuning
-XX:+UnlockExperimentalVMOptions
-XX:+UseCGroupMemoryLimitForHeap
-XX:+UseStringDeduplication
```

#### **2.3 Pipeline Configuration**
File: `logstash/pipeline/databases.conf`

```ruby
input {
  # TCP input for test data
  tcp {
    port => 5001
    codec => json
    add_field => { "input_source" => "tcp_test" }
  }
  
  # Beats input for Metricbeat
  beats {
    port => 5044
    add_field => { "input_source" => "beats" }
  }
}

filter {
  # Parse timestamp
  date {
    match => [ "timestamp", "ISO8601", "yyyy-MM-dd HH:mm:ss" ]
    target => "@timestamp"
  }
  
  # Apply filtering for metricbeat data only
  if [agent][type] == "metricbeat" {
    ruby {
      # Complex filtering logic
      # Load rules from YAML file
      # Apply whitelist filtering
      # Remove sensitive fields
      # Add audit trail
    }
  } else {
    # Drop non-metricbeat events
    mutate {
      add_tag => ["drop_package"]
    }
  }
  
  # Drop unwanted events
  if "drop_package" in [tags] {
    drop {}
  }
}

output {
  # Route blocked events
  if "_send_to_blocked_index" in [tags] {
    elasticsearch {
      hosts => ["elasticsearch:9200"]
      user => "${ELASTIC_USERNAME:elastic}"
      password => "${ELASTIC_PASSWORD:changeme123}"
      data_stream => "true"
      data_stream_type => "metrics"
      data_stream_dataset => "block"
      data_stream_namespace => "default"
    }
  }
  
  # Route allowed events
  if !("_send_to_blocked_index" in [tags]) {
    elasticsearch {
      hosts => ["elasticsearch:9200"]
      user => "${ELASTIC_USERNAME:elastic}"
      password => "${ELASTIC_PASSWORD:changeme123}"
      data_stream => "true"
      data_stream_type => "metrics"
      data_stream_dataset => "allow"
      data_stream_namespace => "default"
    }
  }
}
```

### **3. Elasticsearch Configuration**

#### **3.1 Main Configuration**
File: `elasticsearch/config/elasticsearch.yml`

```yaml
cluster.name: "cloudwatch-cluster"
node.name: "cloudwatch-node-1"
network.host: 0.0.0.0
http.port: 9200
discovery.type: single-node

# Security
xpack.security.enabled: true
xpack.security.authc.api_key.enabled: true

# Performance
indices.memory.index_buffer_size: 20%
indices.queries.cache.size: 20%
indices.fielddata.cache.size: 30%
```

#### **3.2 JVM Settings**
File: `elasticsearch/config/jvm.options`

```bash
# Heap size - 32GB for 256GB RAM
-Xms32g
-Xmx32g

# GC settings
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200
-XX:G1HeapRegionSize=32m
```

#### **3.3 Index Templates**

**Allow Template** (`elasticsearch/templates/allow-template.json`):
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
        "refresh_interval": "5s",
        "codec": "best_compression",
        "lifecycle": {
          "name": "allow-policy"
        }
      }
    },
    "mappings": {
      "properties": {
        "@timestamp": {"type": "date"},
        "service": {
          "properties": {
            "type": {"type": "keyword"}
          }
        },
        "mysql": {"type": "object"},
        "postgresql": {"type": "object"},
        "system": {"type": "object"},
        "filter_status": {"type": "keyword"},
        "removed_fields": {"type": "keyword"}
      }
    }
  }
}
```

#### **3.4 ILM Policies**

**Allow Policy** (`elasticsearch/ilm/allow-policy.json`):
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
      "warm": {
        "min_age": "7d",
        "actions": {
          "shrink": {
            "number_of_shards": 1
          }
        }
      },
      "cold": {
        "min_age": "30d",
        "actions": {
          "allocate": {
            "number_of_replicas": 0
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

### **4. Kibana Configuration**

#### **4.1 Main Configuration**
File: `kibana/config/kibana.yml`

```yaml
server.host: "0.0.0.0"
server.port: 5601
server.name: "cloudwatch-kibana"

elasticsearch.hosts: ["http://elasticsearch:9200"]
elasticsearch.username: "elastic"
elasticsearch.password: "changeme123"

# Security
xpack.security.enabled: true
xpack.encryptedSavedObjects.encryptionKey: "your-32-character-encryption-key"

# Monitoring
monitoring.ui.container.elasticsearch.enabled: true
```

### **5. Metricbeat Configuration**

#### **5.1 Main Configuration**
File: `metricbeat/metricbeat.yml`

```yaml
metricbeat.config.modules:
  path: ${path.config}/modules.d/*.yml
  reload.enabled: false

# MySQL module
metricbeat.modules:
- module: mysql
  metricsets:
    - status
    - galera_status
    - performance
  period: 10s
  hosts: ["mysql:3306"]
  username: metricbeat
  password: password

# PostgreSQL module  
- module: postgresql
  metricsets:
    - database
    - bgwriter
    - activity
  period: 10s
  hosts: ["postgres:5432"]
  username: metricbeat
  password: password

# System module
- module: system
  metricsets:
    - cpu
    - memory
    - load
    - diskio
    - filesystem
    - network
    - process
    - process_summary
    - socket_summary
    - uptime
  period: 10s

# Output to Logstash
output.logstash:
  hosts: ["logstash:5044"]

# Logging
logging.level: info
logging.to_files: true
logging.files:
  path: /var/log/metricbeat
  name: metricbeat
  keepfiles: 7
  permissions: 0644
```

## 🔧 Performance Tuning

### **1. Memory Optimization**
```yaml
# For 256GB RAM server
elasticsearch:
  ES_JAVA_OPTS: "-Xms32g -Xmx32g"
  
logstash:
  LS_JAVA_OPTS: "-Xms32g -Xmx32g"
  pipeline.workers: 32
  pipeline.batch.size: 2000
  queue.max_bytes: 8gb
```

### **2. Rate Limiting**
```yaml
rate_limiting:
  enabled: true
  per_instance:
    max_events_per_minute: 120000
    max_events_per_hour: 7200000
  per_metricset:
    status: 6000
    performance: 6000
    database: 6000
    activity: 12000
```

### **3. Alerting Thresholds**
```yaml
alerting:
  enabled: true
  high_connections:
    mysql_threshold: 8000
    postgresql_threshold: 800
  high_query_rate:
    mysql_threshold: 80000
    postgresql_threshold: 40000
  blocked_events_threshold: 100
```

## 🔄 Configuration Management

### **1. Environment Variables**
```bash
# .env file
ELASTIC_VERSION=8.13.2
ELASTIC_PASSWORD=changeme123
PIPELINE_WORKERS=32
PIPELINE_BATCH_SIZE=2000
PIPELINE_BATCH_DELAY=50
XPACK_MONITORING_ENABLED=false
```

### **2. Dynamic Configuration**
```bash
# Reload Logstash pipeline
curl -X POST "localhost:9600/_reload"

# Update filter rules (requires restart)
docker-compose restart logstash
```

### **3. Backup Configuration**
```bash
# Backup all configs
tar -czf config-backup-$(date +%Y%m%d).tar.gz \
  elasticsearch/config/ \
  logstash/config/ \
  kibana/config/ \
  metricbeat/
```

## 📊 Monitoring Configuration

### **1. Health Checks**
```bash
# Elasticsearch health
curl -X GET 'localhost:9200/_cluster/health'

# Logstash stats
curl -X GET 'localhost:9600/_node/stats'

# Kibana status
curl -X GET 'localhost:5601/api/status'
```

### **2. Performance Metrics**
```bash
# Monitor filter performance
./scripts/monitor-whitelist.sh

# Check data streams
curl -X GET 'localhost:9200/_data_stream'
```

## 🔧 Troubleshooting Configuration

### **Common Issues**
1. **Memory errors**: Reduce heap sizes
2. **Connection timeouts**: Check network settings
3. **Permission errors**: Fix file ownership
4. **Pipeline errors**: Check YAML syntax

### **Debug Mode**
```yaml
# Enable debug in filter rules
global:
  debug_mode: true
  log_filtered_events: true
```

## 📚 Next Steps

- **[Usage Guide](USAGE.md)** - Hướng dẫn sử dụng
- **[Security Guide](SECURITY.md)** - Cấu hình bảo mật
- **[Troubleshooting](TROUBLESHOOTING.md)** - Xử lý sự cố
