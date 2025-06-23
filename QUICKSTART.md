# CloudWatch ELK - Quick Start Guide

## 🚀 Khởi động nhanh trong 5 phút

### Bước 1: Kiểm tra yêu cầu hệ thống

```bash
# Kiểm tra Docker
docker --version
docker-compose --version

# Kiểm tra Go (cho backend)
go version

# Kiểm tra Node.js (cho frontend)
node --version
npm --version
```

**Yêu cầu tối thiểu:**
- Docker >= 20.10
- Docker Compose >= 2.0
- Go >= 1.21
- Node.js >= 18
- RAM >= 4GB
- Disk >= 10GB

### Bước 2: Clone và setup

```bash
# Clone repository
git clone <your-repo-url>
cd cloudwatch

# Thiết lập hệ thống (một lệnh duy nhất)
make setup
```

### Bước 3: Khởi động tất cả services

```bash
# Khởi động tất cả (ELK + Backend + Frontend)
make start
```

Lệnh này sẽ:
- ✅ Khởi động ELK Stack (Elasticsearch, Logstash, Kibana)
- ✅ Khởi động Metricbeat
- ✅ Khởi động Backend API (Golang)
- ✅ Khởi động Frontend (VueJS)

### Bước 4: Tạo dữ liệu mẫu

```bash
# Tạo dữ liệu test để demo
make sample-data
```

### Bước 5: Truy cập hệ thống

🌐 **Mở trình duyệt và truy cập:**

- **Dashboard chính**: http://localhost:3000
- **Kibana**: http://localhost:5601
- **API Backend**: http://localhost:8080

🔑 **Thông tin đăng nhập:**
- **Dashboard**: `admin` / `admin123`
- **Elasticsearch**: `elastic` / `changeme123`

## 🎯 Demo nhanh

### 1. Đăng nhập Dashboard
- Mở http://localhost:3000
- Đăng nhập với `admin` / `admin123`
- Xem tổng quan hệ thống

### 2. Xem System Metrics
- Click "Metrics" trong menu
- Xem CPU, Memory usage
- Theo dõi các host đang hoạt động

### 3. Phân tích Logs
- Click "Logs" trong menu
- Filter theo log level (Error, Warn, Info)
- Xem logs theo thời gian

### 4. Tìm kiếm dữ liệu
- Click "Search" trong menu
- Thử search: `level:error`
- Hoặc: `host:web-server-1`

### 5. Kibana Dashboard
- Mở http://localhost:5601
- Explore data trong Kibana
- Tạo custom visualizations

## 🔧 Troubleshooting nhanh

### Lỗi thường gặp:

**1. Port đã được sử dụng:**
```bash
# Kiểm tra port đang sử dụng
netstat -tulpn | grep :9200
netstat -tulpn | grep :5601
netstat -tulpn | grep :3000
netstat -tulpn | grep :8080

# Dừng services khác hoặc đổi port trong .env
```

**2. Elasticsearch không khởi động:**
```bash
# Kiểm tra memory
free -h

# Tăng virtual memory
sudo sysctl -w vm.max_map_count=262144

# Restart
make restart
```

**3. Frontend không load:**
```bash
# Kiểm tra backend
curl http://localhost:8080/health

# Xem logs
make logs
```

**4. Không có dữ liệu:**
```bash
# Tạo dữ liệu mẫu
make sample-data

# Kiểm tra indices
curl -u elastic:changeme123 http://localhost:9200/_cat/indices
```

## 🧪 Test hệ thống

```bash
# Chạy integration tests
make test

# Kiểm tra trạng thái
make status
```

## 🛑 Dừng hệ thống

```bash
# Dừng tất cả services
make stop

# Hoặc dọn dẹp hoàn toàn
make clean
```

## 📚 Tài liệu chi tiết

- [FEATURES.md](FEATURES.md) - Danh sách tính năng đầy đủ
- [DEPLOYMENT.md](DEPLOYMENT.md) - Hướng dẫn triển khai production
- [API Documentation](http://localhost:8080/docs) - API docs (sau khi khởi động)

## 🆘 Cần hỗ trợ?

1. **Kiểm tra logs**: `make logs`
2. **Kiểm tra status**: `make status`
3. **Restart hệ thống**: `make restart`
4. **Reset hoàn toàn**: `make clean && make setup && make start`

---

**🎉 Chúc mừng! Bạn đã có một hệ thống monitoring ELK hoàn chỉnh!**
