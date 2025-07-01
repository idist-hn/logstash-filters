# Architecture Guide - CloudWatch ELK System

## 🏗️ Tổng quan kiến trúc

CloudWatch ELK System được thiết kế theo kiến trúc microservices với các thành phần độc lập, có khả năng mở rộng và bảo mật cao.

## 📊 Sơ đồ kiến trúc tổng thể

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DATA COLLECTION LAYER                        │
├─────────────────┬─────────────────┬─────────────────┬───────────────┤
│   MySQL DB      │ PostgreSQL DB   │ Elasticsearch   │ System Metrics│
│   - Status      │ - Database      │ - Cluster       │ - CPU/Memory  │
│   - Performance │ - Activity      │ - Node Stats    │ - Disk/Network│
│   - Galera      │ - BGWriter      │ - Index Stats   │ - Process     │
└─────────┬───────┴─────────┬───────┴─────────┬───────┴───────┬───────┘
          │                 │                 │               │
          ▼                 ▼                 ▼               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         METRICBEAT                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │MySQL Module │ │PostgreSQL   │ │Elasticsearch│ │System Module│   │
│  │             │ │Module       │ │Module       │ │             │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │
└─────────────────────────┬───────────────────────────────────────────┘
                          │ Beats Protocol (Port 5044)
                          │ + TCP Test Input (Port 5001)
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      PROCESSING LAYER                               │
│                         LOGSTASH                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    FILTER PIPELINE                         │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │   │
│  │  │   INPUT     │ │   FILTER    │ │       OUTPUT        │   │   │
│  │  │             │ │             │ │                     │   │   │
│  │  │ • Beats     │ │ • Ruby      │ │ • Elasticsearch     │   │   │
│  │  │ • TCP       │ │ • Mutate    │ │ • Data Streams      │   │   │
│  │  │ • JSON      │ │ • Date      │ │ • Conditional       │   │   │
│  │  │             │ │ • Drop      │ │   Routing           │   │   │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                  FILTERING ENGINE                           │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │   │
│  │  │ Whitelist   │ │Field-level  │ │   Security          │   │   │
│  │  │ Filtering   │ │ Filtering   │ │   Validation        │   │   │
│  │  │             │ │             │ │                     │   │   │
│  │  │ • Service   │ │ • Remove    │ │ • Pattern           │   │   │
│  │  │ • Metricset │ │   Sensitive │ │   Detection         │   │   │
│  │  │ • Default   │ │   Fields    │ │ • Content           │   │   │
│  │  │   Deny      │ │ • Audit     │ │   Filtering         │   │   │
│  │  │             │ │   Trail     │ │                     │   │   │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────┬───────────────────────────┘
                      │                   │
                      ▼                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       STORAGE LAYER                                 │
│                      ELASTICSEARCH                                  │
│  ┌─────────────────────────┐    ┌─────────────────────────────┐    │
│  │     ALLOW STREAM        │    │      BLOCK STREAM           │    │
│  │   metrics-allow-*       │    │    metrics-block-*          │    │
│  │                         │    │                             │    │
│  │ • Filtered Data         │    │ • Blocked Events            │    │
│  │ • Clean Fields          │    │ • Audit Information         │    │
│  │ • Performance Metrics   │    │ • Security Logs             │    │
│  │ • ILM: 90 days          │    │ • ILM: 30 days              │    │
│  └─────────────────────────┘    └─────────────────────────────┘    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    INDEX MANAGEMENT                         │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │   │
│  │  │   Templates │ │ ILM Policies│ │    Data Streams     │   │   │
│  │  │             │ │             │ │                     │   │   │
│  │  │ • Mappings  │ │ • Hot/Warm  │ │ • Auto Rollover     │   │   │
│  │  │ • Settings  │ │ • Cold      │ │ • Time-based        │   │   │
│  │  │ • Aliases   │ │ • Delete    │ │ • Size-based        │   │   │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    VISUALIZATION LAYER                              │
│                          KIBANA                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      DASHBOARDS                             │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │   │
│  │  │ Database    │ │   System    │ │      Security       │   │   │
│  │  │ Monitoring  │ │ Monitoring  │ │     Monitoring      │   │   │
│  │  │             │ │             │ │                     │   │   │
│  │  │ • MySQL     │ │ • CPU/Mem   │ │ • Blocked Events    │   │   │
│  │  │ • PostgreSQL│ │ • Disk I/O  │ │ • Filter Stats      │   │   │
│  │  │ • ES Cluster│ │ • Network   │ │ • Audit Trail       │   │   │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    ALERTING & WATCHER                       │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │   │
│  │  │Threshold    │ │ Anomaly     │ │    Actions          │   │   │
│  │  │Alerts       │ │ Detection   │ │                     │   │   │
│  │  │             │ │             │ │ • Email             │   │   │
│  │  │ • High CPU  │ │ • ML-based  │ │ • Slack             │   │   │
│  │  │ • Conn Limit│ │ • Pattern   │ │ • Webhook           │   │   │
│  │  │ • Disk Full │ │   Analysis  │ │ • Index             │   │   │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔧 Thành phần chi tiết

### **1. Data Collection Layer**

#### **1.1 Metricbeat Architecture**
```
Metricbeat Container
├── MySQL Module
│   ├── Status Metricset (10s interval)
│   ├── Performance Metricset (10s interval)
│   └── Galera Status Metricset (10s interval)
├── PostgreSQL Module  
│   ├── Database Metricset (10s interval)
│   ├── Activity Metricset (10s interval)
│   └── BGWriter Metricset (10s interval)
├── Elasticsearch Module
│   ├── Cluster Metricset (30s interval)
│   ├── Node Metricset (30s interval)
│   └── Index Metricset (30s interval)
└── System Module
    ├── CPU Metricset (10s interval)
    ├── Memory Metricset (10s interval)
    ├── Load Metricset (10s interval)
    ├── Disk I/O Metricset (10s interval)
    ├── Filesystem Metricset (30s interval)
    ├── Network Metricset (10s interval)
    ├── Process Metricset (30s interval)
    └── Uptime Metricset (60s interval)
```

### **2. Processing Layer**

#### **2.1 Logstash Pipeline Architecture**
```
Input Stage
├── Beats Input (Port 5044)
│   ├── SSL/TLS Support
│   ├── Client Authentication
│   └── Compression Support
└── TCP Input (Port 5001)
    ├── JSON Codec
    ├── Test Data Support
    └── Development Mode

Filter Stage
├── Date Filter
│   ├── Timestamp Parsing
│   ├── Timezone Handling
│   └── Format Detection
├── Ruby Filter (Main Processing)
│   ├── YAML Config Loading
│   ├── Whitelist Validation
│   ├── Field-level Filtering
│   ├── Security Validation
│   └── Audit Trail Generation
├── Mutate Filter
│   ├── Field Addition
│   ├── Tag Management
│   └── Metadata Enhancement
└── Drop Filter
    ├── Non-Metricbeat Events
    ├── Invalid Data
    └── Security Violations

Output Stage
├── Allowed Events Output
│   ├── Data Stream: metrics-allow
│   ├── Conditional Routing
│   └── Performance Optimization
└── Blocked Events Output
    ├── Data Stream: metrics-block
    ├── Audit Information
    └── Security Logging
```

#### **2.2 Filtering Engine Architecture**
```
Filtering Engine
├── Configuration Layer
│   ├── YAML Rule Loading
│   ├── Dynamic Reloading
│   └── Validation
├── Service Filtering
│   ├── Whitelist Validation
│   ├── Service Type Check
│   └── Default Deny Logic
├── Metricset Filtering
│   ├── Allowed Metricsets
│   ├── Blocked Metricsets
│   └── Pattern Matching
├── Field-level Filtering
│   ├── Global Blocked Fields
│   ├── Service-specific Rules
│   ├── Pattern Detection
│   └── Sensitive Data Removal
├── Security Validation
│   ├── SQL Injection Detection
│   ├── XSS Prevention
│   ├── Credit Card Detection
│   └── Password Pattern Detection
└── Audit Trail
    ├── Removed Fields Tracking
    ├── Block Reason Logging
    ├── Processing Metadata
    └── Performance Metrics
```

### **3. Storage Layer**

#### **3.1 Elasticsearch Architecture**
```
Elasticsearch Cluster
├── Master Node
│   ├── Cluster Management
│   ├── Index Management
│   └── Shard Allocation
├── Data Nodes
│   ├── Data Storage
│   ├── Search Processing
│   └── Aggregation
└── Coordinating Nodes
    ├── Request Routing
    ├── Result Aggregation
    └── Load Balancing

Data Streams
├── metrics-allow Stream
│   ├── Backing Indices
│   ├── Rollover Policy
│   ├── ILM Management
│   └── Retention: 90 days
└── metrics-block Stream
    ├── Backing Indices
    ├── Rollover Policy
    ├── ILM Management
    └── Retention: 30 days

Index Management
├── Templates
│   ├── Mapping Definitions
│   ├── Settings Configuration
│   └── Alias Management
├── ILM Policies
│   ├── Hot Phase (Active writing)
│   ├── Warm Phase (Read-only)
│   ├── Cold Phase (Compressed)
│   └── Delete Phase (Cleanup)
└── Snapshots
    ├── Automated Backups
    ├── Point-in-time Recovery
    └── Cross-cluster Replication
```

### **4. Visualization Layer**

#### **4.1 Kibana Architecture**
```
Kibana Application
├── Discover
│   ├── Real-time Search
│   ├── Field Analysis
│   └── Data Exploration
├── Visualizations
│   ├── Time Series Charts
│   ├── Metric Displays
│   ├── Heat Maps
│   └── Geographic Maps
├── Dashboards
│   ├── Database Monitoring
│   ├── System Performance
│   ├── Security Overview
│   └── Custom Views
├── Alerting
│   ├── Threshold Monitoring
│   ├── Anomaly Detection
│   ├── Notification Actions
│   └── Alert History
└── Management
    ├── Index Patterns
    ├── Saved Objects
    ├── User Management
    └── Security Settings
```

## 🔄 Data Flow

### **1. Normal Data Flow**
```
1. Metricbeat collects metrics (10-60s intervals)
2. Data sent to Logstash via Beats protocol
3. Logstash applies filtering rules
4. Allowed data → metrics-allow stream
5. Blocked data → metrics-block stream
6. Kibana visualizes both streams
7. Alerts trigger on thresholds
```

### **2. Security Data Flow**
```
1. Sensitive field detected
2. Field removed from event
3. Audit trail added
4. Event sent to allow stream
5. Security dashboard updated
6. Alert if threshold exceeded
```

### **3. Error Handling Flow**
```
1. Processing error detected
2. Event tagged with error
3. Error logged to Logstash logs
4. Event sent to dead letter queue
5. Monitoring alert triggered
6. Manual investigation required
```

## 🚀 Performance Architecture

### **1. Memory Management**
```
Total System: 256GB RAM
├── Elasticsearch: 32GB JVM Heap
├── Logstash: 32GB JVM Heap
├── Kibana: 4GB
├── Metricbeat: 1GB
├── OS Cache: 150GB
└── System: 37GB
```

### **2. Processing Optimization**
```
Logstash Configuration
├── Workers: 32 threads
├── Batch Size: 2000 events
├── Batch Delay: 50ms
├── Queue: 8GB memory
└── Parallel Processing: Enabled

Elasticsearch Configuration
├── Shards: 1 per index
├── Replicas: 0 (single node)
├── Refresh: 5s (allow), 10s (block)
├── Compression: best_compression
└── Cache: 20% query, 30% fielddata
```

### **3. Scalability Design**
```
Horizontal Scaling
├── Multiple Logstash Instances
├── Elasticsearch Cluster
├── Load Balancer
└── Shared Configuration

Vertical Scaling
├── Increased JVM Heap
├── More CPU Cores
├── Faster Storage
└── Network Optimization
```

## 🛡️ Security Architecture

### **1. Network Security**
```
Network Layer
├── Internal Docker Network
├── Port Isolation
├── SSL/TLS Encryption
└── Authentication Required

Application Security
├── Elasticsearch Security
├── Kibana Authentication
├── API Key Management
└── Role-based Access
```

### **2. Data Security**
```
Data Protection
├── Field-level Filtering
├── Sensitive Data Removal
├── Audit Trail
└── Compliance Logging

Access Control
├── User Authentication
├── Role-based Permissions
├── API Security
└── Network Isolation
```

## 📊 Monitoring Architecture

### **1. Health Monitoring**
```
System Health
├── Service Status
├── Resource Usage
├── Performance Metrics
└── Error Rates

Data Health
├── Ingestion Rates
├── Processing Speed
├── Storage Usage
└── Query Performance
```

### **2. Alerting Architecture**
```
Alert Sources
├── Elasticsearch Watcher
├── Kibana Alerting
├── External Monitoring
└── Custom Scripts

Alert Actions
├── Email Notifications
├── Slack Integration
├── Webhook Calls
└── Index Logging
```

## 🔧 Deployment Architecture

### **1. Container Architecture**
```
Docker Compose Stack
├── Elasticsearch Container
├── Logstash Container
├── Kibana Container
├── Metricbeat Container
└── Shared Networks/Volumes

Production Deployment
├── Docker Swarm/Kubernetes
├── Load Balancers
├── Persistent Storage
└── Backup Systems
```

### **2. Configuration Management**
```
Configuration Files
├── Environment Variables
├── YAML Configurations
├── JSON Templates
└── Script Automation

Version Control
├── Git Repository
├── Configuration Tracking
├── Deployment Scripts
└── Rollback Procedures
```

## 📈 Future Architecture

### **1. Planned Enhancements**
- Multi-cluster Elasticsearch
- Machine Learning Integration
- Advanced Anomaly Detection
- Real-time Stream Processing

### **2. Scalability Roadmap**
- Kubernetes Deployment
- Auto-scaling Capabilities
- Multi-region Support
- Edge Computing Integration
