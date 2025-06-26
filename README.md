# CloudWatch ELK Stack with Database Metrics Filtering

Hệ thống ELK Stack với tính năng filtering database metrics, sử dụng whitelist approach để bảo mật dữ liệu.

## 🏗️ Architecture

```
Metricbeat → Logstash (Filter) → Elasticsearch → Kibana
                ↓
        ┌─────────────────┐
        │  Filter Logic   │
        │  (Whitelist)    │
        └─────────────────┘
                ↓
    ┌─────────────────────────┐
    │  metricbeat-filtered-*  │  ← Allowed events
    │  block-metric-*         │  ← Blocked events
    └─────────────────────────┘
```

## 📁 Project Structure

```
cloudwatch/
├── docker-compose.yml              # ELK Stack configuration
├── logstash/
│   ├── config/
│   │   ├── logstash.yml            # Logstash main config
│   │   ├── pipelines.yml           # Pipeline configuration
│   │   └── database-filter-rules.yml # Filter rules (whitelist)
│   └── pipeline/
│       └── simple.conf             # Main pipeline with filter logic
├── metricbeat/
│   └── metricbeat.yml              # Metricbeat configuration
└── scripts/
    ├── monitor-whitelist.sh        # Monitor filter results
    ├── monitor-results.sh          # General monitoring
    └── test-filter-simple.sh       # Test filter system
```

## 🚀 Quick Start

### 1. Start ELK Stack
```bash
docker-compose up -d
```

### 2. Check Services
```bash
# Elasticsearch
curl -X GET "http://localhost:9200/_cluster/health" -u "elastic:changeme123"

# Kibana
open http://localhost:5601

# Logstash
docker logs logstash --tail 20
```

### 3. Monitor Filter System
```bash
./scripts/monitor-whitelist.sh
```

## 🔧 Filter Configuration

### Whitelist Approach
- **Default Action**: DENY (block all by default)
- **Allowed Services**: MySQL, PostgreSQL, Elasticsearch
- **Blocked Services**: System, Docker, Kibana, Logstash, Unknown services

### Allowed Metricsets
- **MySQL**: `status`, `galera_status`, `performance`
- **PostgreSQL**: `database`, `bgwriter`, `activity`
- **Elasticsearch**: `node`, `cluster_stats`, `index`

### Index Routing
- **Allowed Events** → `metricbeat-filtered-*`
- **Blocked Events** → `block-metric-*`

## 📊 Monitoring

### Real-time Monitoring
```bash
# Monitor filter results
./scripts/monitor-whitelist.sh

# Continuous monitoring
./scripts/monitor-whitelist.sh --continuous
```

### Check Indices
```bash
curl -X GET "http://localhost:9200/_cat/indices?v" -u "elastic:changeme123"
```

### View Filter Stats
```bash
# Allowed events count
curl -X GET "http://localhost:9200/metricbeat-filtered-*/_count" -u "elastic:changeme123"

# Blocked events count
curl -X GET "http://localhost:9200/block-metric-*/_count" -u "elastic:changeme123"
```

## 🧪 Testing

### Run Filter Tests
```bash
./scripts/test-filter-simple.sh
```

### Test Scenarios
1. **Normal MySQL metrics** → Should be allowed
2. **MySQL with sensitive data** → Fields should be removed
3. **PostgreSQL with sensitive query** → Query should be blocked
4. **High connection count** → Should trigger alert/block
5. **Invalid data** → Should be blocked
6. **Unknown service types** → Should be blocked

## 🔒 Security Features

### Sensitive Data Filtering
- **Blocked Fields**: `*password*`, `*secret*`, `*key*`, `*token*`
- **Query Filtering**: SQL injection patterns, sensitive content
- **Value Limits**: Connection thresholds, rate limiting

### Block Reasons Tracking
- `default_deny_policy`
- `unknown_service_type:*`
- `metricset_not_in_whitelist:*`
- `missing_required_field:*`
- `connection_limit_exceeded`

## ⚙️ Configuration

### Modify Filter Rules
Edit `logstash/config/database-filter-rules.yml`:

```yaml
global:
  enabled: true
  default_action: "deny"  # Whitelist mode

mysql:
  enabled: true
  allowed_metricsets:
    - "status"
    - "galera_status"
    - "performance"
```

### Restart After Changes
```bash
docker restart logstash
```

## 📈 Performance

- **Single Pipeline**: Unified processing for all inputs
- **Efficient Filtering**: Ruby-based filter logic
- **Separate Indices**: Clean data separation
- **Monitoring**: Real-time stats and alerts

## 🔍 Troubleshooting

### Check Logstash Logs
```bash
docker logs logstash --tail 50
```

### Verify Filter Logic
```bash
docker logs logstash | grep -E "(filter_status|blocked|allowed)"
```

### Test Connectivity
```bash
# Test TCP input
echo '{"test": "message"}' | nc localhost 5001

# Test HTTP input
curl -X POST "http://localhost:8090" -H "Content-Type: application/json" -d '{"test": "message"}'
```

## 📝 Notes

- **Whitelist Mode**: Only explicitly allowed services/metricsets pass through
- **Audit Trail**: All blocked events are logged with reasons
- **Scalable**: Easy to add/remove allowed services
- **Secure**: Sensitive data automatically filtered out

## 🎯 Use Cases

- **Database Monitoring**: Secure MySQL/PostgreSQL metrics collection
- **Compliance**: Ensure no sensitive data leakage
- **Performance**: Monitor only relevant metrics
- **Security**: Block unknown/suspicious data sources
