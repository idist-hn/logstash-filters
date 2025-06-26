#!/bin/bash

# Monitor Whitelist Filter System
# Theo dõi kết quả whitelist approach

echo "🎯 Whitelist Filter System - Monitor"
echo "===================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📊 Current Indices:${NC}"
curl -s -X GET "http://localhost:9200/_cat/indices?v" -u "elastic:changeme123" | grep -E "(blocked|cloudwatch|metricbeat)"
echo ""

echo -e "${GREEN}✅ Allowed Events (cloudwatch-logs):${NC}"
allowed_count=$(curl -s -X GET "http://localhost:9200/cloudwatch-logs-*/_count" -u "elastic:changeme123" | jq '.count')
echo "   Total allowed events: $allowed_count"

echo -e "${RED}🚫 Blocked Events (blocked-metrics):${NC}"
blocked_count=$(curl -s -X GET "http://localhost:9200/blocked-metrics-*/_count" -u "elastic:changeme123" | jq '.count')
echo "   Total blocked events: $blocked_count"

echo ""
echo -e "${YELLOW}🔍 Recent Blocked Events (Top 5):${NC}"
curl -s -X GET "http://localhost:9200/blocked-metrics-*/_search?size=5&sort=@timestamp:desc" -u "elastic:changeme123" | jq -r '.hits.hits[]._source | "\(.["@timestamp"]) - \(.service.type) - \(.metricset.name) - Reasons: \(.block_reasons | join(", "))"' | while read line; do
    echo -e "   ${RED}🚫 $line${NC}"
done

echo ""
echo -e "${GREEN}✅ Recent Allowed Events (Top 3):${NC}"
curl -s -X GET "http://localhost:9200/cloudwatch-logs-*/_search?size=3&sort=@timestamp:desc" -u "elastic:changeme123" | jq -r '.hits.hits[]._source | "\(.["@timestamp"]) - \(.service.type // "unknown") - \(.metricset.name // "unknown") - Status: \(.filter_status // "none")"' 2>/dev/null | while read line; do
    echo -e "   ${GREEN}✅ $line${NC}"
done

echo ""
echo -e "${BLUE}📈 Filter Statistics from Logstash:${NC}"
docker logs logstash --tail 20 | grep -E "filter_stats" | tail -1 | grep -o '"blocked_count"[^}]*' | sed 's/"//g'

echo ""
echo -e "${YELLOW}🔧 Block Reasons Analysis:${NC}"
curl -s -X GET "http://localhost:9200/blocked-metrics-*/_search" -u "elastic:changeme123" -H "Content-Type: application/json" -d '{
  "size": 0,
  "aggs": {
    "block_reasons": {
      "terms": {
        "field": "block_reasons.keyword",
        "size": 10
      }
    }
  }
}' | jq -r '.aggregations.block_reasons.buckets[] | "   \(.key): \(.doc_count) events"'

echo ""
echo -e "${BLUE}💡 Whitelist Configuration Status:${NC}"
echo "   - Default action: DENY (whitelist mode)"
echo "   - Allowed MySQL metricsets: status, galera_status, performance"
echo "   - Allowed PostgreSQL metricsets: database, bgwriter, activity"
echo "   - Allowed Elasticsearch metricsets: node, cluster_stats, index"
echo "   - Unknown services: BLOCKED"
echo "   - Blocked events sent to: blocked-metrics-* index"
