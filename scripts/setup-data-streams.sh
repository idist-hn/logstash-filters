#!/bin/bash

# Setup Data Streams for CloudWatch ELK
# Tạo ILM policies, index templates và data streams

echo "🚀 Setting up Data Streams for CloudWatch ELK"
echo "=============================================="

ES_HOST="http://localhost:9200"
ES_USER="elastic"
ES_PASS="changeme123"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to check Elasticsearch health
check_elasticsearch() {
    echo -e "${BLUE}📊 Checking Elasticsearch health...${NC}"
    
    response=$(curl -s -u "$ES_USER:$ES_PASS" "$ES_HOST/_cluster/health")
    status=$(echo $response | jq -r '.status')
    
    if [ "$status" = "green" ] || [ "$status" = "yellow" ]; then
        echo -e "${GREEN}✅ Elasticsearch is healthy (status: $status)${NC}"
        return 0
    else
        echo -e "${RED}❌ Elasticsearch is not healthy${NC}"
        return 1
    fi
}

# Function to create ILM policy
create_ilm_policy() {
    local policy_name=$1
    local policy_file=$2
    
    echo -e "${YELLOW}📋 Creating ILM policy: $policy_name${NC}"
    
    response=$(curl -s -X PUT -u "$ES_USER:$ES_PASS" \
        "$ES_HOST/_ilm/policy/$policy_name" \
        -H "Content-Type: application/json" \
        -d @"$policy_file")
    
    if echo $response | jq -e '.acknowledged' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ ILM policy '$policy_name' created successfully${NC}"
    else
        echo -e "${RED}❌ Failed to create ILM policy '$policy_name'${NC}"
        echo "Response: $response"
    fi
}

# Function to create index template
create_index_template() {
    local template_name=$1
    local template_file=$2
    
    echo -e "${YELLOW}📋 Creating index template: $template_name${NC}"
    
    response=$(curl -s -X PUT -u "$ES_USER:$ES_PASS" \
        "$ES_HOST/_index_template/$template_name" \
        -H "Content-Type: application/json" \
        -d @"$template_file")
    
    if echo $response | jq -e '.acknowledged' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Index template '$template_name' created successfully${NC}"
    else
        echo -e "${RED}❌ Failed to create index template '$template_name'${NC}"
        echo "Response: $response"
    fi
}

# Function to create data stream
create_data_stream() {
    local stream_name=$1
    
    echo -e "${YELLOW}📋 Creating data stream: $stream_name${NC}"
    
    response=$(curl -s -X PUT -u "$ES_USER:$ES_PASS" \
        "$ES_HOST/_data_stream/$stream_name")
    
    if echo $response | jq -e '.acknowledged' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Data stream '$stream_name' created successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  Data stream '$stream_name' may already exist or will be auto-created${NC}"
    fi
}

# Function to list data streams
list_data_streams() {
    echo -e "${BLUE}📊 Current Data Streams:${NC}"
    
    curl -s -u "$ES_USER:$ES_PASS" "$ES_HOST/_data_stream" | jq -r '.data_streams[] | "\(.name) - \(.status) - \(.indices | length) indices"' | while read line; do
        echo -e "${GREEN}   📊 $line${NC}"
    done
}

# Main setup process
main() {
    echo "Starting Data Streams setup..."
    echo ""
    
    # Check Elasticsearch health
    if ! check_elasticsearch; then
        echo -e "${RED}❌ Cannot proceed without healthy Elasticsearch${NC}"
        exit 1
    fi
    
    echo ""
    
    # Create ILM policies
    echo -e "${BLUE}🔧 Creating ILM Policies...${NC}"
    create_ilm_policy "allow-policy" "elasticsearch/ilm/allow-policy.json"
    create_ilm_policy "block-policy" "elasticsearch/ilm/block-policy.json"
    
    echo ""
    
    # Create index templates
    echo -e "${BLUE}🔧 Creating Index Templates...${NC}"
    create_index_template "allow-template" "elasticsearch/templates/allow-template.json"
    create_index_template "block-template" "elasticsearch/templates/block-template.json"
    
    echo ""
    
    # Create data streams (optional - they will be auto-created)
    echo -e "${BLUE}🔧 Creating Data Streams...${NC}"
    create_data_stream "metrics-allow-default"
    create_data_stream "metrics-block-default"
    
    echo ""
    
    # List current data streams
    list_data_streams
    
    echo ""
    echo -e "${GREEN}🎉 Data Streams setup completed!${NC}"
    echo ""
    echo -e "${BLUE}💡 Data Streams Benefits:${NC}"
    echo "   📊 Automatic index lifecycle management"
    echo "   🔄 Automatic rollover based on size/age"
    echo "   🗜️  Compression and optimization"
    echo "   🗑️  Automatic deletion of old data"
    echo "   📈 Better performance for time-series data"
    echo ""
    echo -e "${BLUE}📋 Monitor Data Streams:${NC}"
    echo "   curl -u '$ES_USER:$ES_PASS' '$ES_HOST/_data_stream'"
    echo "   curl -u '$ES_USER:$ES_PASS' '$ES_HOST/_data_stream/_stats'"
}

# Run main function
main
