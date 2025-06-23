package elasticsearch

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"cloudwatch-backend/internal/config"

	"github.com/elastic/go-elasticsearch/v8"
	"github.com/elastic/go-elasticsearch/v8/esapi"
)

type Client struct {
	es *elasticsearch.Client
}

type SearchResult struct {
	Hits struct {
		Total struct {
			Value int `json:"value"`
		} `json:"total"`
		Hits []struct {
			Source map[string]interface{} `json:"_source"`
			Index  string                 `json:"_index"`
			ID     string                 `json:"_id"`
		} `json:"hits"`
	} `json:"hits"`
	Aggregations map[string]interface{} `json:"aggregations"`
}

type MetricData struct {
	Timestamp time.Time              `json:"@timestamp"`
	Host      map[string]interface{} `json:"host"`
	System    map[string]interface{} `json:"system"`
	Service   map[string]interface{} `json:"service"`
}

func NewClient(cfg config.ElasticsearchConfig) (*Client, error) {
	esConfig := elasticsearch.Config{
		Addresses: []string{
			fmt.Sprintf("http://%s:%s", cfg.Host, cfg.Port),
		},
		Username: cfg.Username,
		Password: cfg.Password,
	}

	es, err := elasticsearch.NewClient(esConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to create Elasticsearch client: %w", err)
	}

	return &Client{es: es}, nil
}

func (c *Client) Ping() error {
	res, err := c.es.Info()
	if err != nil {
		return fmt.Errorf("failed to ping Elasticsearch: %w", err)
	}
	defer res.Body.Close()

	if res.IsError() {
		return fmt.Errorf("Elasticsearch ping failed with status: %s", res.Status())
	}

	return nil
}

func (c *Client) Search(index, query string) (*SearchResult, error) {
	req := esapi.SearchRequest{
		Index: []string{index},
		Body:  strings.NewReader(query),
	}

	res, err := req.Do(context.Background(), c.es)
	if err != nil {
		return nil, fmt.Errorf("failed to execute search: %w", err)
	}
	defer res.Body.Close()

	if res.IsError() {
		return nil, fmt.Errorf("search request failed with status: %s", res.Status())
	}

	var result SearchResult
	if err := json.NewDecoder(res.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode search response: %w", err)
	}

	return &result, nil
}

func (c *Client) GetSystemMetrics(timeRange string) (*SearchResult, error) {
	query := fmt.Sprintf(`{
		"query": {
			"bool": {
				"must": [
					{
						"range": {
							"@timestamp": {
								"gte": "now-%s"
							}
						}
					},
					{
						"exists": {
							"field": "system"
						}
					}
				]
			}
		},
		"sort": [
			{
				"@timestamp": {
					"order": "desc"
				}
			}
		],
		"size": 1000,
		"aggs": {
			"cpu_usage": {
				"avg": {
					"field": "system.cpu.total.pct"
				}
			},
			"memory_usage": {
				"avg": {
					"field": "system.memory.used.pct"
				}
			},
			"hosts": {
				"terms": {
					"field": "host.name.keyword",
					"size": 10
				}
			}
		}
	}`, timeRange)

	return c.Search("metricbeat-*", query)
}

func (c *Client) GetLogData(timeRange string, level string) (*SearchResult, error) {
	levelFilter := ""
	if level != "" {
		levelFilter = fmt.Sprintf(`,{
			"term": {
				"level.keyword": "%s"
			}
		}`, level)
	}

	query := fmt.Sprintf(`{
		"query": {
			"bool": {
				"must": [
					{
						"range": {
							"@timestamp": {
								"gte": "now-%s"
							}
						}
					}%s
				]
			}
		},
		"sort": [
			{
				"@timestamp": {
					"order": "desc"
				}
			}
		],
		"size": 500,
		"aggs": {
			"log_levels": {
				"terms": {
					"field": "level.keyword",
					"size": 10
				}
			},
			"hosts": {
				"terms": {
					"field": "host.name.keyword",
					"size": 10
				}
			}
		}
	}`, timeRange, levelFilter)

	return c.Search("cloudwatch-logs-*", query)
}

func (c *Client) GetClusterHealth() (map[string]interface{}, error) {
	req := esapi.ClusterHealthRequest{}
	res, err := req.Do(context.Background(), c.es)
	if err != nil {
		return nil, fmt.Errorf("failed to get cluster health: %w", err)
	}
	defer res.Body.Close()

	if res.IsError() {
		return nil, fmt.Errorf("cluster health request failed with status: %s", res.Status())
	}

	var health map[string]interface{}
	if err := json.NewDecoder(res.Body).Decode(&health); err != nil {
		return nil, fmt.Errorf("failed to decode cluster health response: %w", err)
	}

	return health, nil
}
