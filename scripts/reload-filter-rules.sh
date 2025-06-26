#!/bin/bash

# Script để reload filter rules cho Logstash
# Sử dụng: ./reload-filter-rules.sh [config-file]

set -e

# Configuration
LOGSTASH_CONTAINER="logstash"
CONFIG_FILE="${1:-logstash/config/filter-rules.yml}"
BACKUP_DIR="backups/filter-rules"
LOG_FILE="logs/filter-reload.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Create necessary directories
mkdir -p "$(dirname "$LOG_FILE")"
mkdir -p "$BACKUP_DIR"

log "Starting filter rules reload process..."

# Validate config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    error "Config file not found: $CONFIG_FILE"
    exit 1
fi

# Validate YAML syntax
log "Validating YAML syntax..."
if command -v python3 &> /dev/null; then
    python3 -c "
import yaml
import sys
try:
    with open('$CONFIG_FILE', 'r') as f:
        yaml.safe_load(f)
    print('YAML syntax is valid')
except yaml.YAMLError as e:
    print(f'YAML syntax error: {e}')
    sys.exit(1)
except Exception as e:
    print(f'Error reading file: {e}')
    sys.exit(1)
"
    if [ $? -ne 0 ]; then
        error "YAML validation failed"
        exit 1
    fi
    success "YAML syntax validation passed"
else
    warning "Python3 not found, skipping YAML validation"
fi

# Backup current config
BACKUP_FILE="$BACKUP_DIR/filter-rules-$(date +%Y%m%d-%H%M%S).yml"
if docker exec "$LOGSTASH_CONTAINER" test -f /usr/share/logstash/config/filter-rules.yml; then
    log "Creating backup of current config..."
    docker cp "$LOGSTASH_CONTAINER:/usr/share/logstash/config/filter-rules.yml" "$BACKUP_FILE"
    success "Backup created: $BACKUP_FILE"
fi

# Copy new config to container
log "Copying new config to Logstash container..."
docker cp "$CONFIG_FILE" "$LOGSTASH_CONTAINER:/usr/share/logstash/config/filter-rules.yml"

if [ $? -eq 0 ]; then
    success "Config file copied successfully"
else
    error "Failed to copy config file"
    exit 1
fi

# Test config by sending a test event
log "Testing new configuration..."
TEST_EVENT='{
  "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'",
  "level": "INFO",
  "message": "Test event for filter validation",
  "host": "test-host",
  "application": "filter-test",
  "type": "test"
}'

# Send test event via HTTP input
if command -v curl &> /dev/null; then
    RESPONSE=$(curl -s -w "%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d "$TEST_EVENT" \
        http://localhost:8080 2>/dev/null || echo "000")
    
    if [ "$RESPONSE" = "200" ]; then
        success "Test event processed successfully"
    else
        warning "Test event failed (HTTP $RESPONSE), but config might still be valid"
    fi
else
    warning "curl not found, skipping test event"
fi

# Check Logstash logs for errors
log "Checking Logstash logs for errors..."
RECENT_ERRORS=$(docker logs --since=30s "$LOGSTASH_CONTAINER" 2>&1 | grep -i "error\|exception\|failed" | tail -5)

if [ -n "$RECENT_ERRORS" ]; then
    warning "Recent errors found in Logstash logs:"
    echo "$RECENT_ERRORS"
else
    success "No recent errors found in Logstash logs"
fi

# Display current filter rules summary
log "Current filter rules summary:"
if command -v python3 &> /dev/null; then
    python3 -c "
import yaml
import json

with open('$CONFIG_FILE', 'r') as f:
    config = yaml.safe_load(f)

print('Global settings:')
print(f\"  Enabled: {config.get('global', {}).get('enabled', 'N/A')}\")
print(f\"  Default action: {config.get('global', {}).get('default_action', 'N/A')}\")

print('\\nFilter modules:')
modules = ['metrics', 'log_levels', 'sources', 'content', 'rate_limiting', 'time_filters']
for module in modules:
    enabled = config.get(module, {}).get('enabled', False)
    status = '✓' if enabled else '✗'
    print(f\"  {status} {module}\")

print('\\nIndex routing:')
routing_enabled = config.get('index_routing', {}).get('enabled', False)
print(f\"  Enabled: {'✓' if routing_enabled else '✗'}\")
"
fi

# Show statistics
log "Filter statistics (if available):"
if docker exec "$LOGSTASH_CONTAINER" test -f /usr/share/logstash/data/filter-stats.json; then
    docker exec "$LOGSTASH_CONTAINER" cat /usr/share/logstash/data/filter-stats.json | head -10
else
    log "No filter statistics available yet"
fi

success "Filter rules reload completed successfully!"

# Provide next steps
echo ""
echo "Next steps:"
echo "1. Monitor Logstash logs: docker logs -f $LOGSTASH_CONTAINER"
echo "2. Check filtered events index: logs-filtered-*"
echo "3. Verify metrics in Kibana dashboards"
echo "4. Rollback if needed: docker cp $BACKUP_FILE $LOGSTASH_CONTAINER:/usr/share/logstash/config/filter-rules.yml"

log "Filter rules reload process completed"
