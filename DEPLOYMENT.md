# CloudWatch ELK Deployment Guide

## Hướng dẫn triển khai hệ thống CloudWatch ELK

### Yêu cầu hệ thống

- **Docker**: >= 20.10
- **Docker Compose**: >= 2.0
- **Go**: >= 1.21 (cho backend)
- **Node.js**: >= 18 (cho frontend)
- **RAM**: Tối thiểu 4GB (khuyến nghị 8GB)
- **Disk**: Tối thiểu 10GB trống

### Triển khai nhanh

```bash
# 1. Clone repository
git clone <repository-url>
cd cloudwatch

# 2. Thiết lập hệ thống
make setup

# 3. Khởi động tất cả services
make start

# 4. Tạo dữ liệu mẫu (tùy chọn)
make sample-data
```

### Triển khai từng bước

#### Bước 1: Chuẩn bị môi trường

```bash
# Tạo thư mục logs
mkdir -p logs

# Cấp quyền cho scripts
chmod +x scripts/*.sh

# Thiết lập biến môi trường
cp .env.example .env
# Chỉnh sửa .env theo môi trường của bạn
```

#### Bước 2: Khởi động ELK Stack

```bash
# Khởi động Elasticsearch trước
docker-compose up -d elasticsearch

# Đợi Elasticsearch sẵn sàng
curl -u elastic:changeme123 http://localhost:9200/_cluster/health

# Khởi động Kibana và Logstash
docker-compose up -d kibana logstash

# Khởi động Metricbeat
docker-compose up -d metricbeat
```

#### Bước 3: Khởi động Backend API

```bash
cd backend
go mod tidy
go run cmd/main.go
```

#### Bước 4: Khởi động Frontend

```bash
cd frontend
npm install
npm run dev
```

### Cấu hình Production

#### 1. Bảo mật Elasticsearch

```yaml
# Trong docker-compose.yml
environment:
  - ELASTIC_PASSWORD=your-strong-password
  - xpack.security.enabled=true
  - xpack.security.http.ssl.enabled=true
```

#### 2. Cấu hình SSL/TLS

```bash
# Tạo certificates
docker-compose exec elasticsearch bin/elasticsearch-certutil ca
docker-compose exec elasticsearch bin/elasticsearch-certutil cert --ca elastic-stack-ca.p12
```

#### 3. Tối ưu hiệu suất

```yaml
# Tăng memory cho Elasticsearch
environment:
  - "ES_JAVA_OPTS=-Xms2g -Xmx2g"

# Cấu hình shards và replicas
PUT _template/cloudwatch
{
  "index_patterns": ["cloudwatch-*"],
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1
  }
}
```

### Monitoring và Maintenance

#### 1. Kiểm tra trạng thái

```bash
# Kiểm tra tất cả services
make status

# Xem logs
make logs

# Kiểm tra cluster health
curl -u elastic:changeme123 http://localhost:9200/_cluster/health
```

#### 2. Backup dữ liệu

```bash
# Tạo snapshot repository
curl -X PUT "localhost:9200/_snapshot/backup" \
  -H "Content-Type: application/json" \
  -u elastic:changeme123 \
  -d '{
    "type": "fs",
    "settings": {
      "location": "/usr/share/elasticsearch/backup"
    }
  }'

# Tạo snapshot
curl -X PUT "localhost:9200/_snapshot/backup/snapshot_1" \
  -u elastic:changeme123
```

#### 3. Log rotation

```bash
# Cấu hình logrotate
sudo tee /etc/logrotate.d/cloudwatch << EOF
/path/to/cloudwatch/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
}
EOF
```

### Troubleshooting

#### 1. Elasticsearch không khởi động

```bash
# Kiểm tra logs
docker-compose logs elasticsearch

# Kiểm tra disk space
df -h

# Kiểm tra memory
free -h

# Reset data (cẩn thận!)
docker-compose down -v
sudo rm -rf elk/elasticsearch/data/*
```

#### 2. Kibana không kết nối được Elasticsearch

```bash
# Kiểm tra network
docker network ls
docker network inspect cloudwatch_elk-network

# Kiểm tra credentials
curl -u elastic:changeme123 http://localhost:9200
```

#### 3. Frontend không load được

```bash
# Kiểm tra backend API
curl http://localhost:8080/health

# Kiểm tra CORS settings
# Xem logs frontend
tail -f logs/frontend.log
```

### Scaling

#### 1. Horizontal scaling

```yaml
# Thêm Elasticsearch nodes
elasticsearch-2:
  image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
  environment:
    - node.name=elasticsearch-2
    - cluster.name=docker-cluster
    - discovery.seed_hosts=elasticsearch
    - cluster.initial_master_nodes=elasticsearch
```

#### 2. Load balancing

```yaml
# Nginx load balancer
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf
```

### Security Checklist

- [ ] Đổi default passwords
- [ ] Bật SSL/TLS cho Elasticsearch
- [ ] Cấu hình firewall
- [ ] Thiết lập authentication cho Kibana
- [ ] Giới hạn network access
- [ ] Cấu hình audit logging
- [ ] Regular security updates

### Performance Tuning

#### 1. Elasticsearch

```yaml
# JVM settings
ES_JAVA_OPTS: "-Xms4g -Xmx4g"

# Index settings
{
  "settings": {
    "refresh_interval": "30s",
    "number_of_shards": 1,
    "number_of_replicas": 0
  }
}
```

#### 2. System settings

```bash
# Increase file descriptors
echo "elasticsearch soft nofile 65536" >> /etc/security/limits.conf
echo "elasticsearch hard nofile 65536" >> /etc/security/limits.conf

# Disable swap
sudo swapoff -a

# Increase virtual memory
echo "vm.max_map_count=262144" >> /etc/sysctl.conf
sudo sysctl -p
```
