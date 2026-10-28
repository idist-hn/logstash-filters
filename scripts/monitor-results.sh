#!/bin/bash

# Monitor Filter Results Script
# Theo dõi kết quả filtering real-time

echo "📊 Database Metrics Filter - Real-time Monitor"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check Elasticsearch indices
check_indices() {
    echo -e "${BLUE}📋 Current Indices:${NC}"
    curl -s -X GET "http://localhost:9200/_cat/indices?v" -u "elastic:changeme123" | grep -E "(metricbeat|cloudwatch)" | while read line; do
        echo "   $line"
    done
    echo ""
}

# Function to get filter stats
get_filter_stats() {
    echo -e "${YELLOW}📈 Filter Statistics:${NC}"
    
    # Get latest filter stats
    stats=$(curl -s -X GET "http://localhost:9200/metricbeat-filter-stats-*/_search?size=1&sort=@timestamp:desc" -u "elastic:changeme123" | jq -r '.hits.hits[0]._source.filter_stats // empty' 2>/dev/null)
    
    if [ ! -z "$stats" ]; then
        allowed=$(echo $stats | jq -r '.allowed_count // 0')
        blocked=$(echo $stats | jq -r '.blocked_count // 0')
        echo -e "   ${GREEN}✅ Allowed: $allowed${NC}"
        echo -e "   ${RED}🚫 Blocked: $blocked${NC}"
        
        if [ "$blocked" -gt 0 ]; then
            echo -e "   ${RED}⚠️  Some events were blocked!${NC}"
        fi
    else
        echo "   No filter stats available yet"
    fi
    echo ""
}

# Function to show recent filtered events
show_recent_events() {
    echo -e "${GREEN}🔍 Recent Filtered Events (Last 5):${NC}"
    
    curl -s -X GET "http://localhost:9200/metricbeat-filtered-*/_search?size=5&sort=@timestamp:desc" -u "elastic:changeme123" | jq -r '.hits.hits[]._source | "\(.["@timestamp"]) - \(.service.type) - \(.metricset.name) - \(.filter_status)"' 2>/dev/null | while read line; do
        if [[ $line == *"allowed"* ]]; then
            echo -e "   ${GREEN}✅ $line${NC}"
        elif [[ $line == *"blocked"* ]]; then
            echo -e "   ${RED}🚫 $line${NC}"
        else
            echo "   📄 $line"
        fi
    done
    echo ""
}

# Function to check for blocked events
check_blocked_events() {
    echo -e "${RED}🚫 Blocked Events Analysis:${NC}"
    
    # Search for events with block reasons
    blocked=$(curl -s -X GET "http://localhost:9200/metricbeat-filtered-*/_search" -u "elastic:changeme123" -H "Content-Type: application/json" -d '{
        "query": {"exists": {"field": "block_reasons"}},
        "size": 3,
        "sort": [{"@timestamp": {"order": "desc"}}]
    }' | jq -r '.hits.hits[]._source | "\(.["@timestamp"]) - \(.service.type) - \(.block_reasons | join(", "))"' 2>/dev/null)
    
    if [ ! -z "$blocked" ]; then
        echo "$blocked" | while read line; do
            echo -e "   ${RED}🚫 $line${NC}"
        done
    else
        echo "   No blocked events found"
    fi
    echo ""
}

# Function to show removed fields
show_removed_fields() {
    echo -e "${YELLOW}🔒 Removed Sensitive Fields:${NC}"
    
    curl -s -X GET "http://localhost:9200/metricbeat-filtered-*/_search" -u "elastic:changeme123" -H "Content-Type: application/json" -d '{
        "query": {"exists": {"field": "removed_fields"}},
        "size": 3,
        "sort": [{"@timestamp": {"order": "desc"}}]
    }' | jq -r '.hits.hits[]._source | "\(.["@timestamp"]) - \(.service.type) - Removed: \(.removed_fields | join(", "))"' 2>/dev/null | while read line; do
        echo -e "   ${YELLOW}🔒 $line${NC}"
    done
    echo ""
}

# Function to monitor Logstash logs
monitor_logstash_logs() {
    echo -e "${BLUE}📋 Recent Logstash Filter Activity:${NC}"
    
    # Get last 10 lines from Logstash logs that contain filter info
    docker logs logstash --tail 20 2>/dev/null | grep -E "(filter_status|blocked|allowed)" | tail -5 | while read line; do
        if [[ $line == *"allowed"* ]]; then
            echo -e "   ${GREEN}✅ $line${NC}"
        elif [[ $line == *"blocked"* ]]; then
            echo -e "   ${RED}🚫 $line${NC}"
        else
            echo "   📄 $line"
        fi
    done
    echo ""
}

# Main monitoring loop
main_monitor() {
    while true; do
        clear
        echo "📊 Database Metrics Filter - Real-time Monitor"
        echo "=============================================="
        echo "$(date)"
        echo ""
        
        check_indices
        get_filter_stats
        show_recent_events
        check_blocked_events
        show_removed_fields
        monitor_logstash_logs
        
        echo -e "${BLUE}🔄 Refreshing in 10 seconds... (Ctrl+C to stop)${NC}"
        sleep 10
    done
}

# Check if running in continuous mode
if [ "$1" = "--continuous" ] || [ "$1" = "-c" ]; then
    main_monitor
else
    # Single run
    check_indices
    get_filter_stats
    show_recent_events
    check_blocked_events
    show_removed_fields
    monitor_logstash_logs
    
    echo -e "${BLUE}💡 Tip: Run with --continuous or -c for real-time monitoring${NC}"
fi
