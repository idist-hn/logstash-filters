# CloudWatch ELK System - Database Metrics Filtering

## 📋 Tổng quan dự án

**CloudWatch ELK System** là một hệ thống giám sát và phân tích metrics toàn diện được xây dựng trên ELK Stack (Elasticsearch, Logstash, Kibana) với khả năng filtering và bảo mật cao cấp. Hệ thống được thiết kế để thu thập, xử lý và hiển thị metrics từ các database và system một cách an toàn và hiệu quả.

## 🎯 Mục tiêu chính

- **Thu thập metrics**: MySQL, PostgreSQL, Elasticsearch, System metrics
- **Filtering thông minh**: Whitelist-based với field-level security
- **Bảo mật cao**: Loại bỏ sensitive data, audit trail
- **Performance cao**: Tối ưu cho server 256GB RAM
- **Monitoring real-time**: Dashboard và alerting

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Metricbeat    │───▶│    Logstash     │───▶│ Elasticsearch   │
│ (Data Sources)  │    │   (Filtering)   │    │ (Data Streams)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │ Filter Rules    │    │     Kibana      │
                       │ (YAML Config)   │    │  (Dashboards)   │
                       └─────────────────┘    └─────────────────┘
```

## 🔧 Thành phần chính

### 1. **Data Collection Layer**
- **Metricbeat**: Thu thập metrics từ MySQL, PostgreSQL, Elasticsearch, System
- **TCP Input**: Nhận test data qua port 5001

### 2. **Processing Layer**
- **Logstash 8.13.2**: Xử lý và filtering data
- **Ruby Filter**: Logic filtering phức tạp
- **Field-level Security**: Loại bỏ sensitive fields

### 3. **Storage Layer**
- **Elasticsearch**: Lưu trữ với Data Streams
- **Allow Stream**: `metrics-allow-*` - Data được phép
- **Block Stream**: `metrics-block-*` - Data bị chặn
- **ILM Policies**: Quản lý lifecycle tự động

### 4. **Visualization Layer**
- **Kibana**: Dashboards và monitoring
- **Real-time Analytics**: Charts và metrics

## 🛡️ Tính năng bảo mật

### **Whitelist-based Filtering**
- **Default Deny**: Chặn tất cả, chỉ cho phép explicit allow
- **Service Filtering**: MySQL, PostgreSQL, Elasticsearch, System
- **Metricset Filtering**: Chỉ cho phép metricsets được định nghĩa

### **Field-level Security**
- **Global Blocked Fields**: `*password*`, `*secret*`, `*key*`, `*token*`
- **Service-specific Blocking**: Theo từng loại database
- **Audit Trail**: Tracking các fields bị loại bỏ

### **Content Filtering**
- **Sensitive Pattern Detection**: Credit cards, SSN, passwords
- **SQL Injection Protection**: Phát hiện và chặn SQL injection
- **Query Sanitization**: Làm sạch PostgreSQL queries

## 📊 Performance Features

### **High-Memory Optimization (256GB RAM)**
- **JVM Heap**: 32GB cho Logstash
- **Batch Processing**: 2000 events/batch
- **Worker Threads**: 32 workers
- **Parallel Processing**: Multi-threaded filtering

### **Rate Limiting**
- **Per Instance**: 120,000 events/minute
- **Per Metricset**: Configurable limits
- **Throttling**: Tự động điều chỉnh load

## 🚀 Quick Start

```bash
# 1. Clone repository
git clone <repository-url>
cd cloudwatch

# 2. Start services
docker-compose up -d

# 3. Setup data streams
./scripts/setup-data-streams.sh

# 4. Monitor system
./scripts/monitor-whitelist.sh
```

## 📁 Cấu trúc thư mục

```
cloudwatch/
├── docs/                    # Documentation
├── elasticsearch/           # Elasticsearch configs
│   ├── config/             # ES configuration
│   ├── ilm/                # Index Lifecycle Management
│   └── templates/          # Index templates
├── logstash/               # Logstash configs
│   ├── config/             # Logstash configuration
│   └── pipeline/           # Pipeline definitions
├── kibana/                 # Kibana configs
├── metricbeat/             # Metricbeat configs
├── scripts/                # Utility scripts
├── docker-compose.yml      # Development environment
└── docker-compose.prod.yml # Production environment
```

## 📚 Documentation

- **[Installation Guide](INSTALLATION.md)** - Hướng dẫn cài đặt chi tiết
- **[Configuration Guide](CONFIGURATION.md)** - Cấu hình hệ thống
- **[Usage Guide](USAGE.md)** - Hướng dẫn sử dụng
- **[Architecture Guide](ARCHITECTURE.md)** - Kiến trúc chi tiết
- **[Security Guide](SECURITY.md)** - Bảo mật và filtering
- **[Troubleshooting](TROUBLESHOOTING.md)** - Xử lý sự cố
- **[API Reference](API.md)** - API documentation

## 🔍 Monitoring & Alerting

### **Real-time Monitoring**
- **Filter Statistics**: Allowed/Blocked events count
- **Performance Metrics**: Processing speed, memory usage
- **Error Tracking**: Failed events, connection issues

### **Alerting Thresholds**
- **High Connection Count**: MySQL > 8000, PostgreSQL > 800
- **High Query Rate**: MySQL > 80000/s, PostgreSQL > 40000/s
- **Blocked Events**: > 100/minute

## 🛠️ Supported Data Sources

### **Databases**
- **MySQL**: Status, Performance, Galera metrics
- **PostgreSQL**: Database, Activity, BGWriter metrics
- **Elasticsearch**: Cluster, Node, Index metrics

### **System Metrics**
- **CPU**: Usage, Load averages
- **Memory**: RAM, Swap usage
- **Disk**: I/O, Filesystem usage
- **Network**: Traffic, Errors
- **Process**: Summary, Resource usage

## 📈 Scalability

- **Horizontal Scaling**: Multi-node Elasticsearch cluster
- **Vertical Scaling**: Optimized for high-memory servers
- **Data Retention**: Configurable ILM policies
- **Performance Tuning**: Batch processing, parallel execution

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

[Specify your license here]

## 📞 Support

- **Issues**: GitHub Issues
- **Documentation**: `/docs` directory
- **Monitoring**: Built-in dashboards and scripts
