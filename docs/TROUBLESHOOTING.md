# Troubleshooting Guide - CloudWatch ELK System

## 🔧 Tổng quan xử lý sự cố

Hướng dẫn chi tiết để chẩn đoán và khắc phục các vấn đề thường gặp trong CloudWatch ELK System.

## 🚨 Các vấn đề thường gặp

### **1. Services không khởi động**

#### **1.1 Elasticsearch không start**
```bash
# Kiểm tra logs
docker logs elasticsearch

# Lỗi thường gặp và cách khắc phục:

# Memory error
ERROR: "max virtual memory areas vm.max_map_count [65530] is too low"
# Fix:
sudo sysctl -w vm.max_map_count=262144
echo 'vm.max_map_count=262144' | sudo tee -a /etc/sysctl.conf

# Heap size error  
ERROR: "Initial heap size [X] not equal to maximum heap size [Y]"
# Fix: Adjust in .env
ES_JAVA_OPTS=-Xms16g -Xmx16g

# Permission error
ERROR: "java.nio.file.AccessDeniedException"
# Fix:
sudo chown -R 1000:1000 elasticsearch/data
sudo chmod -R 755 elasticsearch/data
```

#### **1.2 Logstash không start**
```bash
# Kiểm tra logs
docker logs logstash

# Lỗi thường gặp:

# Pipeline configuration error
ERROR: "Pipeline aborted due to error"
# Fix: Check pipeline syntax
docker exec logstash /usr/share/logstash/bin/logstash --config.test_and_exit

# Memory error
ERROR: "OutOfMemoryError"
# Fix: Increase heap size
LS_JAVA_OPTS=-Xms32g -Xmx32g

# Plugin error
ERROR: "unable to load plugin 'drop'"
# Fix: Check filter placement - drop should be in filter section, not output
```

#### **1.3 Kibana không start**
```bash
# Kiểm tra logs
docker logs kibana

# Lỗi thường gặp:

# Elasticsearch connection error
ERROR: "Unable to connect to Elasticsearch"
# Fix: Wait for Elasticsearch to be ready
docker-compose restart kibana

# Authentication error
ERROR: "Authentication Exception"
# Fix: Check credentials in kibana.yml
elasticsearch.username: "elastic"
elasticsearch.password: "changeme123"
```

### **2. Data không hiển thị**

#### **2.1 Không có data trong Kibana**
```bash
# 1. Kiểm tra data streams
curl -X GET 'localhost:9200/_data_stream' -u 'elastic:changeme123'

# 2. Kiểm tra indices
curl -X GET 'localhost:9200/_cat/indices?v' -u 'elastic:changeme123'

# 3. Kiểm tra data gần đây
curl -X GET 'localhost:9200/metrics-allow-*/_search?size=1&sort=@timestamp:desc' \
  -u 'elastic:changeme123'

# 4. Kiểm tra Logstash pipeline
curl -X GET 'localhost:9600/_node/stats/pipelines'

# Nếu không có data:
# - Check Metricbeat connection
# - Check Logstash filtering
# - Check Elasticsearch indexing
```

#### **2.2 Data bị filter sai**
```bash
# Kiểm tra blocked events
curl -X GET 'localhost:9200/metrics-block-*/_search' \
  -H 'Content-Type: application/json' \
  -u 'elastic:changeme123' \
  -d '{
    "query": {"match_all": {}},
    "sort": [{"@timestamp": {"order": "desc"}}],
    "size": 10
  }'

# Kiểm tra filter rules
cat logstash/config/database-filter-rules.yml

# Debug mode
# Enable debug in filter rules:
global:
  debug_mode: true
  log_filtered_events: true
```

### **3. Performance Issues**

#### **3.1 Logstash chậm**
```bash
# Kiểm tra pipeline stats
curl -X GET 'localhost:9600/_node/stats/pipelines' | jq '.pipelines.main'

# Kiểm tra JVM heap
curl -X GET 'localhost:9600/_node/stats/jvm' | jq '.jvm.mem'

# Optimization:
# 1. Increase workers
pipeline.workers: 32

# 2. Increase batch size  
pipeline.batch.size: 2000

# 3. Increase heap
LS_JAVA_OPTS=-Xms32g -Xmx32g

# 4. Check queue
queue.max_bytes: 8gb
```

#### **3.2 Elasticsearch chậm**
```bash
# Kiểm tra cluster health
curl -X GET 'localhost:9200/_cluster/health' -u 'elastic:changeme123'

# Kiểm tra node stats
curl -X GET 'localhost:9200/_nodes/stats' -u 'elastic:changeme123'

# Optimization:
# 1. Clear cache
curl -X POST 'localhost:9200/_cache/clear' -u 'elastic:changeme123'

# 2. Force merge old indices
curl -X POST 'localhost:9200/metrics-allow-*/_forcemerge?max_num_segments=1' \
  -u 'elastic:changeme123'

# 3. Adjust refresh interval
curl -X PUT 'localhost:9200/metrics-*/_settings' \
  -H 'Content-Type: application/json' \
  -u 'elastic:changeme123' \
  -d '{"index": {"refresh_interval": "30s"}}'
```

#### **3.3 Memory issues**
```bash
# Kiểm tra memory usage
docker stats

# Elasticsearch memory
curl -X GET 'localhost:9200/_nodes/stats/jvm' -u 'elastic:changeme123' | \
  jq '.nodes[].jvm.mem.heap_used_percent'

# Logstash memory  
curl -X GET 'localhost:9600/_node/stats/jvm' | jq '.jvm.mem.heap_used_percent'

# Fix high memory:
# 1. Reduce heap size if over 50GB
# 2. Clear field data cache
# 3. Reduce batch size
# 4. Add more RAM or scale horizontally
```

## 🔍 Diagnostic Commands

### **1. Health Checks**
```bash
#!/bin/bash
# health-check.sh

echo "=== CloudWatch ELK Health Check ==="
echo "Timestamp: $(date)"
echo

# Docker services
echo "📦 Docker Services:"
docker-compose ps
echo

# Elasticsearch health
echo "🔍 Elasticsearch Health:"
curl -s 'localhost:9200/_cluster/health' -u 'elastic:changeme123' | jq '.'
echo

# Logstash health
echo "⚙️ Logstash Health:"
curl -s 'localhost:9600/_node' | jq '{name: .name, status: .status}'
echo

# Kibana health
echo "📊 Kibana Health:"
curl -s 'localhost:5601/api/status' | jq '.status.overall.state'
echo

# Data streams
echo "📈 Data Streams:"
curl -s 'localhost:9200/_data_stream' -u 'elastic:changeme123' | \
  jq '.data_streams[] | {name, status, indices_count}'
echo

# Recent events
echo "📋 Recent Events (last 5 minutes):"
ALLOW_COUNT=$(curl -s "localhost:9200/metrics-allow-*/_count?q=@timestamp:[now-5m TO now]" \
  -u 'elastic:changeme123' | jq '.count')
BLOCK_COUNT=$(curl -s "localhost:9200/metrics-block-*/_count?q=@timestamp:[now-5m TO now]" \
  -u 'elastic:changeme123' | jq '.count')

echo "Allowed: $ALLOW_COUNT"
echo "Blocked: $BLOCK_COUNT"
```

### **2. Performance Monitoring**
```bash
#!/bin/bash
# performance-monitor.sh

echo "=== Performance Monitoring ==="

# Logstash pipeline performance
echo "⚙️ Logstash Pipeline:"
curl -s 'localhost:9600/_node/stats/pipelines' | \
  jq '.pipelines.main.events | {in, filtered, out, duration_in_millis}'

# Elasticsearch performance
echo "🔍 Elasticsearch Performance:"
curl -s 'localhost:9200/_nodes/stats/indices' -u 'elastic:changeme123' | \
  jq '.nodes[].indices | {indexing, search, get}'

# Memory usage
echo "💾 Memory Usage:"
echo "Elasticsearch:"
curl -s 'localhost:9200/_nodes/stats/jvm' -u 'elastic:changeme123' | \
  jq '.nodes[].jvm.mem | {heap_used_percent, heap_max_in_bytes}'

echo "Logstash:"
curl -s 'localhost:9600/_node/stats/jvm' | \
  jq '.jvm.mem | {heap_used_percent, heap_max_in_bytes}'

# Disk usage
echo "💿 Disk Usage:"
curl -s 'localhost:9200/_nodes/stats/fs' -u 'elastic:changeme123' | \
  jq '.nodes[].fs.total | {total_in_bytes, available_in_bytes}'
```

### **3. Error Detection**
```bash
#!/bin/bash
# error-detection.sh

echo "=== Error Detection ==="

# Logstash errors
echo "⚙️ Logstash Errors:"
docker logs logstash --tail 50 | grep -i error

# Elasticsearch errors
echo "🔍 Elasticsearch Errors:"
docker logs elasticsearch --tail 50 | grep -i error

# Kibana errors
echo "📊 Kibana Errors:"
docker logs kibana --tail 50 | grep -i error

# Failed events
echo "❌ Failed Events:"
curl -s 'localhost:9600/_node/stats/pipelines' | \
  jq '.pipelines.main.events.out - .pipelines.main.events.in'

# Blocked events (last hour)
echo "🚫 Blocked Events (last hour):"
curl -s "localhost:9200/metrics-block-*/_count?q=@timestamp:[now-1h TO now]" \
  -u 'elastic:changeme123' | jq '.count'
```

## 🛠️ Common Fixes

### **1. Reset Data Streams**
```bash
#!/bin/bash
# reset-data-streams.sh

echo "Resetting data streams..."

# Delete data streams
curl -X DELETE 'localhost:9200/_data_stream/metrics-allow' -u 'elastic:changeme123'
curl -X DELETE 'localhost:9200/_data_stream/metrics-block' -u 'elastic:changeme123'

# Recreate with templates
./scripts/setup-data-streams.sh

echo "Data streams reset complete"
```

### **2. Clear All Data**
```bash
#!/bin/bash
# clear-all-data.sh

echo "WARNING: This will delete all data!"
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" = "yes" ]; then
    # Stop services
    docker-compose down
    
    # Remove data
    sudo rm -rf elasticsearch/data/*
    sudo rm -rf logstash/data/*
    
    # Restart services
    docker-compose up -d
    
    # Wait and setup
    sleep 30
    ./scripts/setup-data-streams.sh
    
    echo "All data cleared and reset"
fi
```

### **3. Restart Services Safely**
```bash
#!/bin/bash
# restart-services.sh

echo "Restarting CloudWatch ELK services..."

# Stop services in order
docker-compose stop kibana
docker-compose stop logstash
docker-compose stop elasticsearch

# Wait for clean shutdown
sleep 10

# Start services in order
docker-compose start elasticsearch

# Wait for Elasticsearch to be ready
echo "Waiting for Elasticsearch..."
until curl -s 'localhost:9200/_cluster/health' -u 'elastic:changeme123' | grep -q '"status":"green\|yellow"'; do
    sleep 5
done

docker-compose start logstash

# Wait for Logstash to be ready
echo "Waiting for Logstash..."
until curl -s 'localhost:9600/_node' | grep -q '"status":"green"'; do
    sleep 5
done

docker-compose start kibana

echo "All services restarted successfully"
```

## 🔧 Configuration Issues

### **1. YAML Syntax Errors**
```bash
# Validate YAML files
python3 -c "import yaml; yaml.safe_load(open('logstash/config/database-filter-rules.yml'))"

# Common YAML issues:
# - Incorrect indentation
# - Missing quotes around special characters
# - Invalid boolean values (use true/false, not yes/no)
```

### **2. Pipeline Configuration**
```bash
# Test Logstash configuration
docker exec logstash /usr/share/logstash/bin/logstash --config.test_and_exit

# Common pipeline issues:
# - Missing required fields
# - Incorrect filter placement
# - Invalid Ruby syntax
# - Wrong output configuration
```

### **3. Template Issues**
```bash
# Check template application
curl -X GET 'localhost:9200/_index_template' -u 'elastic:changeme123'

# Reapply templates
curl -X PUT 'localhost:9200/_index_template/allow-template' \
  -H 'Content-Type: application/json' \
  -u 'elastic:changeme123' \
  -d @elasticsearch/templates/allow-template.json
```

## 📊 Monitoring Scripts

### **1. Real-time Monitoring**
```bash
#!/bin/bash
# real-time-monitor.sh

while true; do
    clear
    echo "=== CloudWatch ELK Real-time Monitor ==="
    echo "Time: $(date)"
    echo
    
    # Pipeline stats
    STATS=$(curl -s 'localhost:9600/_node/stats/pipelines' | jq '.pipelines.main.events')
    echo "Pipeline Events:"
    echo "  In: $(echo $STATS | jq '.in')"
    echo "  Filtered: $(echo $STATS | jq '.filtered')"
    echo "  Out: $(echo $STATS | jq '.out')"
    echo
    
    # Recent events
    ALLOW=$(curl -s "localhost:9200/metrics-allow-*/_count?q=@timestamp:[now-1m TO now]" \
      -u 'elastic:changeme123' | jq '.count')
    BLOCK=$(curl -s "localhost:9200/metrics-block-*/_count?q=@timestamp:[now-1m TO now]" \
      -u 'elastic:changeme123' | jq '.count')
    
    echo "Events (last minute):"
    echo "  Allowed: $ALLOW"
    echo "  Blocked: $BLOCK"
    echo
    
    sleep 5
done
```

### **2. Alert Script**
```bash
#!/bin/bash
# alert-monitor.sh

# Thresholds
MAX_BLOCKED_PER_MINUTE=100
MAX_HEAP_PERCENT=80
MIN_CLUSTER_HEALTH="yellow"

# Check blocked events
BLOCKED=$(curl -s "localhost:9200/metrics-block-*/_count?q=@timestamp:[now-1m TO now]" \
  -u 'elastic:changeme123' | jq '.count')

if [ "$BLOCKED" -gt "$MAX_BLOCKED_PER_MINUTE" ]; then
    echo "ALERT: High blocked events: $BLOCKED/minute"
    # Send notification here
fi

# Check heap usage
HEAP=$(curl -s 'localhost:9200/_nodes/stats/jvm' -u 'elastic:changeme123' | \
  jq '.nodes[].jvm.mem.heap_used_percent')

if [ "$HEAP" -gt "$MAX_HEAP_PERCENT" ]; then
    echo "ALERT: High heap usage: $HEAP%"
    # Send notification here
fi

# Check cluster health
HEALTH=$(curl -s 'localhost:9200/_cluster/health' -u 'elastic:changeme123' | \
  jq -r '.status')

if [ "$HEALTH" = "red" ]; then
    echo "ALERT: Cluster health is RED"
    # Send notification here
fi
```

## 📞 Getting Help

### **1. Log Collection**
```bash
#!/bin/bash
# collect-logs.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_DIR="logs_$TIMESTAMP"

mkdir -p $LOG_DIR

# Collect service logs
docker logs elasticsearch > $LOG_DIR/elasticsearch.log 2>&1
docker logs logstash > $LOG_DIR/logstash.log 2>&1
docker logs kibana > $LOG_DIR/kibana.log 2>&1

# Collect configuration
cp -r elasticsearch/config $LOG_DIR/
cp -r logstash/config $LOG_DIR/
cp -r kibana/config $LOG_DIR/

# Collect system info
docker-compose ps > $LOG_DIR/services.txt
curl -s 'localhost:9200/_cluster/health' -u 'elastic:changeme123' > $LOG_DIR/cluster_health.json
curl -s 'localhost:9600/_node/stats' > $LOG_DIR/logstash_stats.json

# Create archive
tar -czf "cloudwatch_logs_$TIMESTAMP.tar.gz" $LOG_DIR
rm -rf $LOG_DIR

echo "Logs collected in: cloudwatch_logs_$TIMESTAMP.tar.gz"
```

### **2. Support Information**
- **Documentation**: Check `/docs` directory
- **Logs**: Use log collection script
- **Configuration**: Verify YAML syntax
- **Performance**: Use monitoring scripts
- **Community**: Elastic Stack community forums

### **3. Emergency Procedures**
1. **Service Down**: Use restart script
2. **Data Loss**: Restore from backup
3. **Security Breach**: Check blocked events
4. **Performance Issues**: Scale resources
5. **Configuration Error**: Rollback changes
