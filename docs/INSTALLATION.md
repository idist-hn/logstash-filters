# Installation Guide - CloudWatch ELK System

## 📋 Yêu cầu hệ thống

### **Hardware Requirements**
- **RAM**: Tối thiểu 16GB, khuyến nghị 256GB
- **CPU**: Tối thiểu 8 cores, khuyến nghị 32 cores
- **Disk**: Tối thiểu 100GB SSD, khuyến nghị 1TB+ NVMe
- **Network**: 1Gbps+ bandwidth

### **Software Requirements**
- **OS**: Ubuntu 20.04+, CentOS 8+, macOS 10.15+
- **Docker**: Version 20.10+
- **Docker Compose**: Version 2.0+
- **Git**: Latest version
- **curl/jq**: Cho testing và monitoring

## 🚀 Cài đặt nhanh

### **1. Clone Repository**
```bash
git clone <repository-url>
cd cloudwatch
```

### **2. Cấu hình Environment**
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

### **3. Start Services**
```bash
# Development environment
docker-compose up -d

# Production environment
docker-compose -f docker-compose.prod.yml up -d
```

### **4. Verify Installation**
```bash
# Check services status
docker-compose ps

# Setup data streams
./scripts/setup-data-streams.sh

# Monitor system
./scripts/monitor-whitelist.sh
```

## 🔧 Cài đặt chi tiết

### **Step 1: Chuẩn bị môi trường**

#### **1.1 Install Docker**
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# CentOS/RHEL
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
```

#### **1.2 Install Docker Compose**
```bash
# Linux
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

#### **1.3 System Optimization**
```bash
# Increase virtual memory for Elasticsearch
echo 'vm.max_map_count=262144' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Increase file descriptor limits
echo '* soft nofile 65536' | sudo tee -a /etc/security/limits.conf
echo '* hard nofile 65536' | sudo tee -a /etc/security/limits.conf
```

### **Step 2: Cấu hình dự án**

#### **2.1 Environment Variables**
```bash
# .env file
ELASTIC_VERSION=8.13.2
ELASTIC_PASSWORD=changeme123
ELASTIC_USERNAME=elastic
KIBANA_PASSWORD=changeme123

# JVM Settings (adjust for your RAM)
ES_JAVA_OPTS=-Xms16g -Xmx16g
LOGSTASH_JAVA_OPTS=-Xms32g -Xmx32g

# Network settings
ELASTIC_PORT=9200
KIBANA_PORT=5601
LOGSTASH_TCP_PORT=5001
```

#### **2.2 Memory Configuration**
```bash
# For 256GB RAM server
# elasticsearch/config/jvm.options
-Xms32g
-Xmx32g

# logstash/config/jvm.options  
-Xms32g
-Xmx32g
```

### **Step 3: Services Configuration**

#### **3.1 Elasticsearch Configuration**
```yaml
# elasticsearch/config/elasticsearch.yml
cluster.name: "cloudwatch-cluster"
node.name: "cloudwatch-node-1"
network.host: 0.0.0.0
discovery.type: single-node
xpack.security.enabled: true
xpack.security.authc.api_key.enabled: true
```

#### **3.2 Logstash Configuration**
```yaml
# logstash/config/logstash.yml
node.name: "cloudwatch-logstash"
pipeline.workers: 32
pipeline.batch.size: 2000
pipeline.batch.delay: 50
queue.type: memory
queue.max_bytes: 8gb
```

#### **3.3 Kibana Configuration**
```yaml
# kibana/config/kibana.yml
server.host: "0.0.0.0"
elasticsearch.hosts: ["http://elasticsearch:9200"]
elasticsearch.username: "elastic"
elasticsearch.password: "changeme123"
```

### **Step 4: Start Services**

#### **4.1 Development Environment**
```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f elasticsearch
docker-compose logs -f logstash
docker-compose logs -f kibana
```

#### **4.2 Production Environment**
```bash
# Start production services
docker-compose -f docker-compose.prod.yml up -d

# Enable auto-restart
docker update --restart=always elasticsearch logstash kibana metricbeat
```

### **Step 5: Post-Installation Setup**

#### **5.1 Setup Data Streams**
```bash
# Run setup script
./scripts/setup-data-streams.sh

# Verify data streams
curl -X GET 'http://localhost:9200/_data_stream' -u 'elastic:changeme123'
```

#### **5.2 Configure Index Templates**
```bash
# Apply templates
curl -X PUT 'http://localhost:9200/_index_template/allow-template' \
  -H 'Content-Type: application/json' \
  -u 'elastic:changeme123' \
  -d @elasticsearch/templates/allow-template.json

curl -X PUT 'http://localhost:9200/_index_template/block-template' \
  -H 'Content-Type: application/json' \
  -u 'elastic:changeme123' \
  -d @elasticsearch/templates/block-template.json
```

#### **5.3 Setup ILM Policies**
```bash
# Apply ILM policies
curl -X PUT 'http://localhost:9200/_ilm/policy/allow-policy' \
  -H 'Content-Type: application/json' \
  -u 'elastic:changeme123' \
  -d @elasticsearch/ilm/allow-policy.json

curl -X PUT 'http://localhost:9200/_ilm/policy/block-policy' \
  -H 'Content-Type: application/json' \
  -u 'elastic:changeme123' \
  -d @elasticsearch/ilm/block-policy.json
```

## ✅ Verification

### **1. Service Health Check**
```bash
# Check all services
docker-compose ps

# Expected output:
# elasticsearch  Up  9200/tcp, 9300/tcp
# logstash      Up  5001/tcp, 5044/tcp, 9600/tcp  
# kibana        Up  5601/tcp
# metricbeat    Up
```

### **2. Elasticsearch Health**
```bash
curl -X GET 'http://localhost:9200/_cluster/health' -u 'elastic:changeme123'
# Expected: "status": "green" or "yellow"
```

### **3. Logstash Pipeline**
```bash
curl -X GET 'http://localhost:9600/_node/stats/pipelines' | jq '.pipelines.main.events'
# Should show events processing
```

### **4. Test Data Flow**
```bash
# Send test data
echo '{"@timestamp": "2025-06-26T12:00:00.000Z", "agent": {"type": "metricbeat"}, "service": {"type": "mysql"}, "metricset": {"name": "status"}, "test": true}' | nc localhost 5001

# Check results
./scripts/monitor-whitelist.sh
```

## 🔧 Troubleshooting

### **Common Issues**

#### **1. Elasticsearch won't start**
```bash
# Check memory settings
docker logs elasticsearch

# Fix: Reduce heap size in .env
ES_JAVA_OPTS=-Xms8g -Xmx8g
```

#### **2. Logstash connection errors**
```bash
# Check Elasticsearch connectivity
docker exec logstash curl -X GET 'http://elasticsearch:9200' -u 'elastic:changeme123'

# Fix: Wait for Elasticsearch to be ready
docker-compose restart logstash
```

#### **3. Permission denied errors**
```bash
# Fix file permissions
sudo chown -R 1000:1000 elasticsearch/data
sudo chown -R 1000:1000 logstash/data
```

## 🚀 Next Steps

1. **[Configuration Guide](CONFIGURATION.md)** - Cấu hình chi tiết
2. **[Usage Guide](USAGE.md)** - Hướng dẫn sử dụng
3. **[Security Guide](SECURITY.md)** - Cấu hình bảo mật
4. **[Monitoring Setup](USAGE.md#monitoring)** - Setup monitoring

## 📞 Support

- **Issues**: Check logs với `docker-compose logs [service]`
- **Performance**: Monitor với `./scripts/monitor-whitelist.sh`
- **Documentation**: Xem thêm trong `/docs`
