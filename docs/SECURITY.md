# Security Guide - CloudWatch ELK System

## 🛡️ Tổng quan bảo mật

CloudWatch ELK System được thiết kế với nhiều lớp bảo mật để đảm bảo dữ liệu được bảo vệ từ thu thập đến lưu trữ và hiển thị.

## 🔒 Kiến trúc bảo mật

### **1. Defense in Depth**
```
┌─────────────────────────────────────────────────────────────┐
│                    NETWORK SECURITY                         │
│  • Docker Internal Networks  • Port Isolation              │
│  • SSL/TLS Encryption       • Firewall Rules               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 APPLICATION SECURITY                        │
│  • Authentication          • Authorization                  │
│  • API Key Management      • Role-based Access             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA SECURITY                            │
│  • Field-level Filtering   • Sensitive Data Removal        │
│  • Content Validation      • Audit Trail                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  STORAGE SECURITY                           │
│  • Encryption at Rest      • Access Control                │
│  • Backup Security         • Retention Policies            │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Authentication & Authorization

### **1. Elasticsearch Security**

#### **1.1 Built-in Security**
```yaml
# elasticsearch.yml
xpack.security.enabled: true
xpack.security.authc.api_key.enabled: true
xpack.security.authc.token.enabled: true

# User management
xpack.security.authc.realms:
  native:
    native1:
      order: 0
```

#### **1.2 User Roles**
```bash
# Create monitoring role
curl -X POST "localhost:9200/_security/role/cloudwatch_monitor" \
  -H 'Content-Type: application/json' \
  -u 'elastic:changeme123' \
  -d '{
    "cluster": ["monitor"],
    "indices": [
      {
        "names": ["metrics-*"],
        "privileges": ["read", "view_index_metadata"]
      }
    ]
  }'

# Create admin role
curl -X POST "localhost:9200/_security/role/cloudwatch_admin" \
  -H 'Content-Type: application/json' \
  -u 'elastic:changeme123' \
  -d '{
    "cluster": ["all"],
    "indices": [
      {
        "names": ["metrics-*"],
        "privileges": ["all"]
      }
    ]
  }'
```

#### **1.3 API Key Management**
```bash
# Create API key for Logstash
curl -X POST "localhost:9200/_security/api_key" \
  -H 'Content-Type: application/json' \
  -u 'elastic:changeme123' \
  -d '{
    "name": "logstash-writer",
    "role_descriptors": {
      "logstash_writer": {
        "cluster": ["monitor"],
        "indices": [
          {
            "names": ["metrics-*"],
            "privileges": ["create_index", "write", "create"]
          }
        ]
      }
    },
    "expiration": "1y"
  }'
```

### **2. Kibana Security**

#### **2.1 Authentication Setup**
```yaml
# kibana.yml
elasticsearch.username: "elastic"
elasticsearch.password: "changeme123"
xpack.security.enabled: true
xpack.encryptedSavedObjects.encryptionKey: "your-32-character-encryption-key"

# Session settings
xpack.security.session.idleTimeout: "1h"
xpack.security.session.lifespan: "8h"
```

#### **2.2 Space-based Security**
```bash
# Create monitoring space
curl -X POST "localhost:5601/api/spaces/space" \
  -H 'Content-Type: application/json' \
  -H 'kbn-xsrf: true' \
  -u 'elastic:changeme123' \
  -d '{
    "id": "monitoring",
    "name": "Database Monitoring",
    "description": "CloudWatch database monitoring space"
  }'
```

## 🔍 Data Security

### **1. Whitelist-based Filtering**

#### **1.1 Default Deny Policy**
```yaml
# database-filter-rules.yml
global:
  enabled: true
  default_action: "deny"  # Block everything by default
  log_filtered_events: true
  
  # Only allow explicitly defined services
  allowed_services:
    - "mysql"
    - "postgresql" 
    - "elasticsearch"
    - "system"
```

#### **1.2 Service-level Security**
```yaml
mysql:
  enabled: true
  
  # Only allow specific metricsets
  allowed_metricsets:
    - "status"
    - "galera_status"
    - "performance"
  
  # Block dangerous metricsets
  blocked_metricsets:
    - "user"           # User information
    - "variables"      # System variables
    - "processlist"    # Running processes
```

### **2. Field-level Security**

#### **2.1 Global Blocked Fields**
```yaml
global:
  blocked_fields:
    # Authentication & Credentials
    - "*password*"
    - "*secret*"
    - "*key*"
    - "*token*"
    - "*auth*"
    - "*credential*"
    - "*private*"
    
    # SSL/TLS Information
    - "*ssl_*"
    - "*cert*"
    - "*certificate*"
    
    # Network & Identity
    - "*.ip_address"
    - "*hostname*"
    - "*session*"
    - "*user*"
    
    # System Information
    - "*version*"
    - "*server_id*"
    - "*uuid*"
```

#### **2.2 Service-specific Field Filtering**
```yaml
mysql:
  field_filters:
    blocked_fields:
      - "mysql.status.ssl_*"
      - "mysql.status.rsa_*"
      - "mysql.status.*password*"
      - "mysql.status.version*"
      - "mysql.status.hostname"
      - "mysql.status.server_id"

postgresql:
  field_filters:
    blocked_fields:
      - "postgresql.activity.query"        # SQL queries (privacy)
      - "postgresql.activity.client.address"  # Client IPs
      - "postgresql.activity.user.name"    # Usernames
      - "postgresql.*password*"
      - "postgresql.*version*"

system:
  field_filters:
    blocked_fields:
      - "system.process.cmdline"           # Command lines
      - "system.process.env"               # Environment variables
      - "system.process.username"          # Process usernames
      - "system.filesystem.mount_point"    # Mount points
      - "system.network.name"              # Interface names
```

### **3. Content Security**

#### **3.1 Pattern Detection**
```ruby
# Security patterns in Ruby filter
security_patterns = {
  'credit_card' => /\b(?:\d{4}[-\s]?){3}\d{4}\b/,
  'ssn' => /\b\d{3}-\d{2}-\d{4}\b/,
  'email' => /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
  'ip_address' => /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/,
  'password_field' => /password\s*[:=]\s*\S+/i,
  'api_key' => /(?:api[_-]?key|token)\s*[:=]\s*[a-zA-Z0-9]{20,}/i
}
```

#### **3.2 SQL Injection Prevention**
```ruby
# SQL injection patterns
sql_injection_patterns = [
  /union\s+select/i,
  /drop\s+table/i,
  /delete\s+from/i,
  /insert\s+into/i,
  /update\s+.*set/i,
  /exec\s*\(/i,
  /script\s*>/i
]

# Check and block suspicious content
if content_contains_sql_injection?(event)
  event.set("block_reasons", ["sql_injection_detected"])
  event.tag("_send_to_blocked_index")
end
```

### **4. Audit Trail**

#### **4.1 Security Logging**
```ruby
# Add audit information
event.set("filter_status", "field_filtered")
event.set("filter_processed_at", Time.now.utc.iso8601)
event.set("removed_fields", removed_fields)
event.set("processed_by", "cloudwatch-logstash")
event.set("pipeline", "databases")

# Security metadata
if blocked_reasons.any?
  event.set("block_reasons", blocked_reasons)
  event.set("security_level", "high")
end
```

#### **4.2 Compliance Tracking**
```json
{
  "@timestamp": "2025-06-26T12:00:00.000Z",
  "filter_status": "field_filtered",
  "removed_fields": [
    "mysql.status.ssl_key",
    "mysql.status.hostname"
  ],
  "block_reasons": ["sensitive_field_detected"],
  "compliance": {
    "gdpr": true,
    "pci_dss": true,
    "hipaa": false
  },
  "audit_trail": {
    "processor": "cloudwatch-logstash",
    "rule_version": "1.0",
    "processing_time_ms": 15
  }
}
```

## 🔐 Network Security

### **1. Docker Network Isolation**
```yaml
# docker-compose.yml
networks:
  elk-network:
    driver: bridge
    internal: true  # No external access
    
  monitoring-network:
    driver: bridge
    # External access for Kibana only
```

### **2. Port Security**
```yaml
services:
  elasticsearch:
    ports:
      - "127.0.0.1:9200:9200"  # Bind to localhost only
    
  kibana:
    ports:
      - "127.0.0.1:5601:5601"  # Bind to localhost only
    
  logstash:
    ports:
      - "127.0.0.1:5001:5001"  # Test port - localhost only
      # Port 5044 internal only for Beats
```

### **3. SSL/TLS Configuration**

#### **3.1 Elasticsearch SSL**
```yaml
# elasticsearch.yml
xpack.security.http.ssl:
  enabled: true
  keystore.path: certs/elastic-certificates.p12
  
xpack.security.transport.ssl:
  enabled: true
  verification_mode: certificate
  keystore.path: certs/elastic-certificates.p12
  truststore.path: certs/elastic-certificates.p12
```

#### **3.2 Logstash SSL**
```ruby
# logstash pipeline
input {
  beats {
    port => 5044
    ssl => true
    ssl_certificate => "/usr/share/logstash/config/certs/logstash.crt"
    ssl_key => "/usr/share/logstash/config/certs/logstash.key"
    ssl_verify_mode => "force_peer"
  }
}
```

## 🚨 Security Monitoring

### **1. Security Dashboards**

#### **1.1 Blocked Events Dashboard**
```json
{
  "visualization": {
    "title": "Security Events",
    "type": "line",
    "query": {
      "match": {
        "tags": "_send_to_blocked_index"
      }
    },
    "aggregations": {
      "blocked_by_reason": {
        "terms": {
          "field": "block_reasons"
        }
      }
    }
  }
}
```

#### **1.2 Sensitive Data Removal**
```json
{
  "visualization": {
    "title": "Removed Sensitive Fields",
    "type": "table",
    "query": {
      "exists": {
        "field": "removed_fields"
      }
    },
    "aggregations": {
      "top_removed_fields": {
        "terms": {
          "field": "removed_fields",
          "size": 20
        }
      }
    }
  }
}
```

### **2. Security Alerts**

#### **2.1 High Blocked Events Alert**
```json
{
  "trigger": {
    "schedule": {"interval": "1m"}
  },
  "input": {
    "search": {
      "request": {
        "indices": ["metrics-block-*"],
        "body": {
          "query": {
            "range": {
              "@timestamp": {
                "gte": "now-5m"
              }
            }
          }
        }
      }
    }
  },
  "condition": {
    "compare": {
      "ctx.payload.hits.total": {"gt": 100}
    }
  },
  "actions": {
    "send_email": {
      "email": {
        "to": ["security@company.com"],
        "subject": "High Security Events Alert",
        "body": "More than 100 events blocked in last 5 minutes"
      }
    }
  }
}
```

#### **2.2 SQL Injection Alert**
```json
{
  "trigger": {
    "schedule": {"interval": "30s"}
  },
  "input": {
    "search": {
      "request": {
        "indices": ["metrics-block-*"],
        "body": {
          "query": {
            "bool": {
              "must": [
                {"term": {"block_reasons": "sql_injection_detected"}},
                {"range": {"@timestamp": {"gte": "now-1m"}}}
              ]
            }
          }
        }
      }
    }
  },
  "condition": {
    "compare": {
      "ctx.payload.hits.total": {"gt": 0}
    }
  },
  "actions": {
    "immediate_alert": {
      "email": {
        "to": ["security@company.com", "admin@company.com"],
        "subject": "CRITICAL: SQL Injection Detected",
        "body": "SQL injection attempt detected and blocked"
      }
    }
  }
}
```

## 🔧 Security Best Practices

### **1. Configuration Security**
```bash
# Secure file permissions
chmod 600 .env
chmod 600 elasticsearch/config/elasticsearch.yml
chmod 600 logstash/config/logstash.yml

# Secure directories
chmod 700 elasticsearch/config/
chmod 700 logstash/config/
chmod 700 kibana/config/
```

### **2. Password Management**
```bash
# Use strong passwords
ELASTIC_PASSWORD=$(openssl rand -base64 32)
KIBANA_PASSWORD=$(openssl rand -base64 32)

# Store in secure location
echo "ELASTIC_PASSWORD=${ELASTIC_PASSWORD}" >> .env.secure
chmod 600 .env.secure
```

### **3. Regular Security Updates**
```bash
# Update Docker images regularly
docker-compose pull
docker-compose up -d

# Monitor security advisories
# Check Elastic Security announcements
# Update filter rules as needed
```

## 📋 Security Checklist

### **Pre-deployment**
- [ ] Change default passwords
- [ ] Configure SSL/TLS
- [ ] Set up proper network isolation
- [ ] Configure authentication
- [ ] Test filtering rules
- [ ] Set up monitoring

### **Post-deployment**
- [ ] Monitor blocked events
- [ ] Review audit logs
- [ ] Test security alerts
- [ ] Verify data filtering
- [ ] Check access controls
- [ ] Update security rules

### **Ongoing**
- [ ] Regular security reviews
- [ ] Update passwords
- [ ] Monitor for anomalies
- [ ] Review filter effectiveness
- [ ] Update threat patterns
- [ ] Security training

## 🚨 Incident Response

### **1. Security Incident Detection**
```bash
# Check for security events
curl -X GET "localhost:9200/metrics-block-*/_search" \
  -H 'Content-Type: application/json' \
  -u 'elastic:changeme123' \
  -d '{
    "query": {
      "range": {
        "@timestamp": {"gte": "now-1h"}
      }
    },
    "aggs": {
      "by_reason": {
        "terms": {"field": "block_reasons"}
      }
    }
  }'
```

### **2. Response Procedures**
1. **Immediate**: Stop data ingestion if needed
2. **Investigate**: Analyze blocked events
3. **Contain**: Update filtering rules
4. **Recover**: Resume normal operations
5. **Learn**: Update security measures

## 📞 Security Support

- **Security Alerts**: Monitor `metrics-block-*` index
- **Audit Trail**: Check `removed_fields` in events
- **Incident Response**: Follow documented procedures
- **Updates**: Regular security rule updates
