#!/usr/bin/env python3
"""
Test Data Generator for Database Metrics Filtering
Tạo dữ liệu test để kiểm tra hệ thống filter Logstash
"""

import json
import time
import random
import socket
import requests
from datetime import datetime, timezone
import threading

class TestDataGenerator:
    def __init__(self):
        self.logstash_tcp_host = "localhost"
        self.logstash_tcp_port = 5001
        self.logstash_http_url = "http://localhost:8090"
        
    def generate_mysql_metrics(self, include_sensitive=False):
        """Generate MySQL-like metrics data"""
        base_data = {
            "@timestamp": datetime.now(timezone.utc).isoformat(),
            "agent": {
                "type": "metricbeat",
                "version": "8.11.0",
                "name": "test-mysql-host"
            },
            "service": {
                "type": "mysql",
                "name": "mysql"
            },
            "metricset": {
                "name": random.choice(["status", "performance", "galera_status"])
            },
            "host": {
                "name": "mysql-server-01",
                "ip": ["192.168.1.100"]
            },
            "mysql": {
                "status": {
                    "connections": random.randint(10, 500),
                    "max_connections": 1000,
                    "threads_connected": random.randint(5, 100),
                    "threads_running": random.randint(1, 20),
                    "queries": random.randint(1000, 50000),
                    "slow_queries": random.randint(0, 10),
                    "com_select": random.randint(500, 10000),
                    "com_insert": random.randint(100, 2000),
                    "com_update": random.randint(50, 1000),
                    "com_delete": random.randint(10, 500),
                    "innodb_buffer_pool_pages_total": random.randint(8000, 16000),
                    "innodb_buffer_pool_pages_free": random.randint(1000, 4000)
                }
            }
        }
        
        # Add sensitive data for testing filter
        if include_sensitive:
            base_data["mysql"]["status"].update({
                "ssl_cipher": "AES256-SHA",
                "ssl_key": "secret-ssl-key-12345",
                "rsa_public_key": "-----BEGIN PUBLIC KEY-----",
                "user_password": "admin123",
                "api_secret": "mysql-api-secret-token"
            })
            
        return base_data
    
    def generate_postgresql_metrics(self, include_sensitive=False):
        """Generate PostgreSQL-like metrics data"""
        base_data = {
            "@timestamp": datetime.now(timezone.utc).isoformat(),
            "agent": {
                "type": "metricbeat", 
                "version": "8.11.0",
                "name": "test-postgres-host"
            },
            "service": {
                "type": "postgresql",
                "name": "postgresql"
            },
            "metricset": {
                "name": random.choice(["database", "bgwriter", "activity"])
            },
            "host": {
                "name": "postgres-server-01",
                "ip": ["192.168.1.101"]
            },
            "postgresql": {
                "database": {
                    "name": "production_db",
                    "number_of_backends": random.randint(5, 50),
                    "transactions": {
                        "commit": random.randint(1000, 10000),
                        "rollback": random.randint(10, 100)
                    },
                    "blocks": {
                        "read": random.randint(5000, 50000),
                        "hit": random.randint(45000, 450000)
                    },
                    "rows": {
                        "returned": random.randint(10000, 100000),
                        "fetched": random.randint(5000, 50000),
                        "inserted": random.randint(100, 1000),
                        "updated": random.randint(50, 500),
                        "deleted": random.randint(10, 100)
                    }
                }
            }
        }
        
        # Add sensitive data and SQL queries for testing
        if include_sensitive:
            base_data["postgresql"]["activity"] = {
                "query": "SELECT * FROM users WHERE password = 'admin123' AND api_key = 'secret-key'",
                "user": {
                    "name": "admin",
                    "password": "encrypted_password_hash"
                },
                "client": {
                    "address": "192.168.1.50"
                }
            }
            base_data["postgresql"]["database"]["connection_string"] = "postgresql://admin:secret123@localhost:5432/db"
            
        return base_data
    
    def generate_system_metrics(self):
        """Generate system metrics data"""
        return {
            "@timestamp": datetime.now(timezone.utc).isoformat(),
            "agent": {
                "type": "metricbeat",
                "version": "8.11.0", 
                "name": "test-system-host"
            },
            "service": {
                "type": "system",
                "name": "system"
            },
            "metricset": {
                "name": random.choice(["cpu", "memory", "network", "diskio"])
            },
            "host": {
                "name": "app-server-01",
                "ip": ["192.168.1.102"]
            },
            "system": {
                "cpu": {
                    "user": {
                        "pct": round(random.uniform(0.1, 0.8), 3)
                    },
                    "system": {
                        "pct": round(random.uniform(0.05, 0.3), 3)
                    },
                    "idle": {
                        "pct": round(random.uniform(0.2, 0.9), 3)
                    }
                },
                "memory": {
                    "used": {
                        "bytes": random.randint(1000000000, 8000000000),
                        "pct": round(random.uniform(0.3, 0.9), 3)
                    },
                    "free": {
                        "bytes": random.randint(500000000, 4000000000)
                    }
                }
            }
        }
    
    def send_tcp_data(self, data):
        """Send data via TCP to Logstash"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.connect((self.logstash_tcp_host, self.logstash_tcp_port))
            message = json.dumps(data) + '\n'
            sock.send(message.encode('utf-8'))
            sock.close()
            return True
        except Exception as e:
            print(f"TCP Error: {e}")
            return False
    
    def send_http_data(self, data):
        """Send data via HTTP to Logstash"""
        try:
            response = requests.post(
                self.logstash_http_url,
                json=data,
                headers={'Content-Type': 'application/json'},
                timeout=5
            )
            return response.status_code == 200
        except Exception as e:
            print(f"HTTP Error: {e}")
            return False
    
    def generate_test_scenarios(self):
        """Generate various test scenarios"""
        scenarios = []
        
        # Scenario 1: Normal MySQL metrics (should be allowed)
        scenarios.extend([
            ("MySQL Normal", self.generate_mysql_metrics(include_sensitive=False))
            for _ in range(5)
        ])
        
        # Scenario 2: MySQL with sensitive data (should be filtered)
        scenarios.extend([
            ("MySQL Sensitive", self.generate_mysql_metrics(include_sensitive=True))
            for _ in range(3)
        ])
        
        # Scenario 3: Normal PostgreSQL metrics (should be allowed)
        scenarios.extend([
            ("PostgreSQL Normal", self.generate_postgresql_metrics(include_sensitive=False))
            for _ in range(5)
        ])
        
        # Scenario 4: PostgreSQL with sensitive data (should be filtered)
        scenarios.extend([
            ("PostgreSQL Sensitive", self.generate_postgresql_metrics(include_sensitive=True))
            for _ in range(3)
        ])
        
        # Scenario 5: System metrics (should be allowed)
        scenarios.extend([
            ("System Metrics", self.generate_system_metrics())
            for _ in range(4)
        ])
        
        # Scenario 6: High connection count (should trigger alerts)
        high_conn_mysql = self.generate_mysql_metrics()
        high_conn_mysql["mysql"]["status"]["connections"] = 9500  # Above threshold
        scenarios.append(("MySQL High Connections", high_conn_mysql))
        
        # Scenario 7: Invalid data (missing required fields)
        invalid_data = {
            "@timestamp": datetime.now(timezone.utc).isoformat(),
            "service": {"type": "mysql"},
            # Missing required fields like host.name, metricset.name
        }
        scenarios.append(("Invalid Data", invalid_data))
        
        return scenarios
    
    def run_test_suite(self, duration_seconds=60):
        """Run comprehensive test suite"""
        print(f"🚀 Starting test data generation for {duration_seconds} seconds...")
        print("📊 Generating various scenarios to test filter system...")
        
        start_time = time.time()
        sent_count = 0
        error_count = 0
        
        while time.time() - start_time < duration_seconds:
            scenarios = self.generate_test_scenarios()
            
            for scenario_name, data in scenarios:
                # Randomly choose TCP or HTTP
                if random.choice([True, False]):
                    success = self.send_tcp_data(data)
                    method = "TCP"
                else:
                    success = self.send_http_data(data)
                    method = "HTTP"
                
                if success:
                    sent_count += 1
                    print(f"✅ {method}: {scenario_name}")
                else:
                    error_count += 1
                    print(f"❌ {method}: {scenario_name} - FAILED")
                
                # Small delay between sends
                time.sleep(random.uniform(0.5, 2.0))
                
                # Check if time limit reached
                if time.time() - start_time >= duration_seconds:
                    break
        
        print(f"\n📈 Test Summary:")
        print(f"   Total sent: {sent_count}")
        print(f"   Errors: {error_count}")
        print(f"   Duration: {duration_seconds}s")
        print(f"   Rate: {sent_count/duration_seconds:.1f} events/sec")

if __name__ == "__main__":
    generator = TestDataGenerator()
    
    print("🔧 Database Metrics Filter Test Data Generator")
    print("=" * 50)
    
    # Run test suite for 2 minutes
    generator.run_test_suite(duration_seconds=120)
    
    print("\n✨ Test data generation completed!")
    print("📋 Check Kibana to see filtered results:")
    print("   - Index: metricbeat-filtered-*")
    print("   - Filter stats: metricbeat-filter-stats-*")
