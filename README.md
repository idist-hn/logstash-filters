# CloudWatch ELK Monitoring System

Hệ thống monitoring và quản trị dựa trên ELK Stack với VueJS frontend và Golang backend.

## Kiến trúc hệ thống

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   VueJS Web     │    │   Golang API    │    │   ELK Stack     │
│   Dashboard     │◄──►│   Backend       │◄──►│   (E+L+K)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        ▲
                                                        │
                                               ┌─────────────────┐
                                               │   Metricbeat    │
                                               │   (VMs)         │
                                               └─────────────────┘
```

## Tech Stack

- **Frontend**: VueJS 3 + Vite + TypeScript
- **Backend**: Golang + Gin Framework + Elasticsearch Client
- **Infrastructure**: Docker + Docker Compose
- **Monitoring**: ELK Stack (Elasticsearch + Logstash + Kibana)
- **Data Collection**: Metricbeat
- **Database**: Elasticsearch

## Cấu trúc dự án

```
cloudwatch/
├── docker-compose.yml          # Docker orchestration
├── .env                        # Environment variables
├── elk/                        # ELK Stack configurations
│   ├── elasticsearch/
│   ├── logstash/
│   └── kibana/
├── metricbeat/                 # Metricbeat configurations
├── backend/                    # Golang API
│   ├── cmd/
│   ├── internal/
│   ├── pkg/
│   └── go.mod
├── frontend/                   # VueJS Dashboard
│   ├── src/
│   ├── public/
│   └── package.json
└── scripts/                    # Deployment scripts
```

## Khởi chạy hệ thống

### Khởi chạy nhanh (Recommended)

**Linux/macOS:**
```bash
# Thiết lập và khởi động tất cả services
make setup
make start

# Tạo dữ liệu mẫu để test
make sample-data
```

**Windows:**
```cmd
# Thiết lập hệ thống
scripts\setup.bat

# Khởi động tất cả services
scripts\start-all.bat

# Tạo dữ liệu mẫu
scripts\generate-sample-data.sh (cần Git Bash hoặc WSL)
```

### Khởi chạy từng bước

1. **Thiết lập ban đầu:**
   ```bash
   chmod +x scripts/*.sh
   ./scripts/setup.sh
   ```

2. **Khởi động ELK Stack:**
   ```bash
   docker-compose up -d elasticsearch logstash kibana metricbeat
   ```

3. **Khởi động Backend API:**
   ```bash
   cd backend && go mod tidy && go run cmd/main.go
   ```

4. **Khởi động Frontend:**
   ```bash
   cd frontend && npm install && npm run dev
   ```

5. **Test hệ thống:**
   ```bash
   chmod +x scripts/test-system.sh
   ./scripts/test-system.sh
   ```

## Truy cập

- **Web Dashboard**: http://localhost:3000
- **Kibana**: http://localhost:5601
- **API Backend**: http://localhost:8080
- **Elasticsearch**: http://localhost:9200

## Tính năng chính

- **Real-time Dashboard**: Monitoring hệ thống theo thời gian thực
- **System Metrics**: CPU, Memory, Disk, Network monitoring
- **Log Management**: Thu thập, phân tích và tìm kiếm logs
- **Advanced Search**: Tìm kiếm toàn văn với query syntax
- **User Authentication**: JWT-based authentication
- **Data Visualization**: Charts và graphs tương tác
- **Alert System**: Cảnh báo và thông báo
- **API Integration**: RESTful API đầy đủ
- **Responsive UI**: Giao diện thân thiện trên mọi thiết bị
- **Docker Support**: Triển khai dễ dàng với containers

## Commands hữu ích

```bash
# Xem trạng thái tất cả services
make status

# Xem logs
make logs

# Dừng tất cả services
make stop

# Dọn dẹp hệ thống
make clean

# Chạy tests
make test
```
