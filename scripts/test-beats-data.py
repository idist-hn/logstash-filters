#!/usr/bin/env python3
"""
Test Beats Data Generator
Gửi dữ liệu test qua Beats protocol để test filter system
"""

import json
import socket
import struct
import zlib
from datetime import datetime, timezone

class BeatsProtocolSender:
    def __init__(self, host="localhost", port=5044):
        self.host = host
        self.port = port
        
    def send_beats_data(self, events):
        """Send data using Beats protocol"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.connect((self.host, self.port))
            
            # Beats protocol version 2
            version = b'2J'
            sock.send(version)
            
            # Send window size (number of events)
            window_size = struct.pack('>I', len(events))
            sock.send(window_size)
            
            # Send each event
            for event in events:
                # Convert event to JSON
                json_data = json.dumps(event).encode('utf-8')
                
                # Compress data
                compressed_data = zlib.compress(json_data)
                
                # Send frame type (JSON frame = 'J')
                frame_type = b'J'
                sock.send(frame_type)
                
                # Send sequence number (4 bytes)
                seq_num = struct.pack('>I', 1)
                sock.send(seq_num)
                
                # Send payload size (4 bytes)
                payload_size = struct.pack('>I', len(compressed_data))
                sock.send(payload_size)
                
                # Send compressed payload
                sock.send(compressed_data)
            
            sock.close()
            return True
            
        except Exception as e:
            print(f"Beats protocol error: {e}")
            return False

def create_test_events():
    """Create test events for database metrics"""
    events = []
    
    # Test 1: Normal MySQL metrics (should be allowed)
    mysql_normal = {
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
            "name": "status"
        },
        "host": {
            "name": "mysql-server-01"
        },
        "mysql": {
            "status": {
                "connections": 150,
                "max_connections": 1000,
                "threads_connected": 25,
                "queries": 15000,
                "slow_queries": 2,
                "com_select": 8000,
                "com_insert": 500
            }
        }
    }
    events.append(mysql_normal)
    
    # Test 2: MySQL with sensitive data (should be filtered)
    mysql_sensitive = {
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
            "name": "status"
        },
        "host": {
            "name": "mysql-server-01"
        },
        "mysql": {
            "status": {
                "connections": 200,
                "ssl_cipher": "AES256-SHA",
                "ssl_key": "secret-ssl-key-12345",
                "user_password": "admin123",
                "api_secret": "mysql-secret-token",
                "queries": 20000
            }
        }
    }
    events.append(mysql_sensitive)
    
    # Test 3: PostgreSQL normal (should be allowed)
    postgres_normal = {
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
            "name": "database"
        },
        "host": {
            "name": "postgres-server-01"
        },
        "postgresql": {
            "database": {
                "name": "production_db",
                "number_of_backends": 15,
                "transactions": {
                    "commit": 5000,
                    "rollback": 10
                },
                "blocks": {
                    "read": 25000,
                    "hit": 225000
                }
            }
        }
    }
    events.append(postgres_normal)
    
    # Test 4: PostgreSQL with sensitive query (should be filtered)
    postgres_sensitive = {
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
            "name": "activity"
        },
        "host": {
            "name": "postgres-server-01"
        },
        "postgresql": {
            "activity": {
                "query": "SELECT * FROM users WHERE password = 'admin123' AND api_key = 'secret-key'",
                "user": {
                    "name": "admin",
                    "password": "encrypted_hash"
                },
                "client": {
                    "address": "192.168.1.50"
                }
            },
            "database": {
                "connection_string": "postgresql://admin:secret123@localhost:5432/db"
            }
        }
    }
    events.append(postgres_sensitive)
    
    # Test 5: High connection count (should trigger alert)
    mysql_high_conn = {
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
            "name": "status"
        },
        "host": {
            "name": "mysql-server-01"
        },
        "mysql": {
            "status": {
                "connections": 9500,  # Above threshold
                "max_connections": 10000,
                "threads_connected": 9000,
                "queries": 100000
            }
        }
    }
    events.append(mysql_high_conn)
    
    # Test 6: Invalid data (missing required fields)
    invalid_data = {
        "@timestamp": datetime.now(timezone.utc).isoformat(),
        "service": {
            "type": "mysql"
        },
        "mysql": {
            "status": {
                "connections": 100
            }
        }
        # Missing agent.type, metricset.name, host.name
    }
    events.append(invalid_data)
    
    return events

if __name__ == "__main__":
    print("🚀 Testing Database Metrics Filter with Beats Protocol")
    print("=" * 55)
    
    # Create test events
    events = create_test_events()
    print(f"📊 Created {len(events)} test events")
    
    # Send via Beats protocol
    sender = BeatsProtocolSender()
    
    print("📤 Sending test events via Beats protocol...")
    success = sender.send_beats_data(events)
    
    if success:
        print("✅ Test events sent successfully!")
        print("\n📋 Test scenarios sent:")
        print("   1. ✅ Normal MySQL metrics (should be allowed)")
        print("   2. 🔒 MySQL with sensitive data (should be filtered)")
        print("   3. ✅ Normal PostgreSQL metrics (should be allowed)")
        print("   4. 🔍 PostgreSQL with sensitive query (should be filtered)")
        print("   5. ⚠️  High connection count (should trigger alert)")
        print("   6. ❌ Invalid data (missing required fields)")
        
        print("\n🔍 Check results with:")
        print("   ./scripts/monitor-results.sh")
        print("   docker logs logstash --tail 20")
        
    else:
        print("❌ Failed to send test events")
        print("💡 Make sure Logstash Beats input is running on port 5044")
