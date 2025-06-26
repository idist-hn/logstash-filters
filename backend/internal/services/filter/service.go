package filter

import (
	"context"
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"cloudwatch-backend/pkg/logger"

	"gopkg.in/yaml.v3"
)

// Service provides filter management functionality
type Service struct {
	configPath   string
	backupDir    string
	reloadScript string
	logger       logger.Logger
}

// Config holds filter service configuration
type Config struct {
	ConfigPath   string `json:"configPath"`
	BackupDir    string `json:"backupDir"`
	ReloadScript string `json:"reloadScript"`
}

// FilterRules represents the complete filter configuration
type FilterRules struct {
	Global       GlobalSettings     `yaml:"global" json:"global"`
	Metrics      MetricsFilter      `yaml:"metrics" json:"metrics"`
	LogLevels    LogLevelsFilter    `yaml:"log_levels" json:"logLevels"`
	Sources      SourcesFilter      `yaml:"sources" json:"sources"`
	Content      ContentFilter      `yaml:"content" json:"content"`
	RateLimiting RateLimitingFilter `yaml:"rate_limiting" json:"rateLimiting"`
	TimeFilters  TimeFiltersConfig  `yaml:"time_filters" json:"timeFilters"`
	IndexRouting IndexRoutingConfig `yaml:"index_routing" json:"indexRouting"`
	Alerting     AlertingConfig     `yaml:"alerting" json:"alerting"`
	Performance  PerformanceConfig  `yaml:"performance" json:"performance"`
}

// GlobalSettings represents global filter settings
type GlobalSettings struct {
	Enabled           bool   `yaml:"enabled" json:"enabled"`
	DefaultAction     string `yaml:"default_action" json:"defaultAction"`
	LogFilteredEvents bool   `yaml:"log_filtered_events" json:"logFilteredEvents"`
}

// MetricsFilter represents metrics filtering rules
type MetricsFilter struct {
	Enabled bool                        `yaml:"enabled" json:"enabled"`
	Rules   map[string]MetricFilterRule `yaml:"rules" json:"rules"`
}

// MetricFilterRule represents a single metric filter rule
type MetricFilterRule struct {
	Enabled        bool     `yaml:"enabled" json:"enabled"`
	MinValue       *float64 `yaml:"min_value,omitempty" json:"minValue,omitempty"`
	MaxValue       *float64 `yaml:"max_value,omitempty" json:"maxValue,omitempty"`
	RequiredFields []string `yaml:"required_fields,omitempty" json:"requiredFields,omitempty"`
}

// LogLevelsFilter represents log level filtering
type LogLevelsFilter struct {
	Enabled       bool     `yaml:"enabled" json:"enabled"`
	AllowedLevels []string `yaml:"allowed_levels" json:"allowedLevels"`
	BlockedLevels []string `yaml:"blocked_levels" json:"blockedLevels"`
}

// SourcesFilter represents source-based filtering
type SourcesFilter struct {
	Enabled bool                        `yaml:"enabled" json:"enabled"`
	Rules   map[string]SourceFilterRule `yaml:"rules" json:"rules"`
}

// SourceFilterRule represents source filtering rules
type SourceFilterRule struct {
	Enabled           bool     `yaml:"enabled" json:"enabled"`
	AllowedApps       []string `yaml:"allowed_apps,omitempty" json:"allowedApps,omitempty"`
	BlockedApps       []string `yaml:"blocked_apps,omitempty" json:"blockedApps,omitempty"`
	AllowedHosts      []string `yaml:"allowed_hosts,omitempty" json:"allowedHosts,omitempty"`
	BlockedHosts      []string `yaml:"blocked_hosts,omitempty" json:"blockedHosts,omitempty"`
	AllowedNamespaces []string `yaml:"allowed_namespaces,omitempty" json:"allowedNamespaces,omitempty"`
	BlockedNamespaces []string `yaml:"blocked_namespaces,omitempty" json:"blockedNamespaces,omitempty"`
}

// ContentFilter represents content-based filtering
type ContentFilter struct {
	Enabled bool                         `yaml:"enabled" json:"enabled"`
	Rules   map[string]ContentFilterRule `yaml:"rules" json:"rules"`
}

// ContentFilterRule represents content filtering rules
type ContentFilterRule struct {
	Enabled         bool     `yaml:"enabled" json:"enabled"`
	BlockPatterns   []string `yaml:"block_patterns,omitempty" json:"blockPatterns,omitempty"`
	MaskFields      []string `yaml:"mask_fields,omitempty" json:"maskFields,omitempty"`
	MaxMessageSize  *int     `yaml:"max_message_size,omitempty" json:"maxMessageSize,omitempty"`
	MaxFieldCount   *int     `yaml:"max_field_count,omitempty" json:"maxFieldCount,omitempty"`
	MandatoryFields []string `yaml:"mandatory_fields,omitempty" json:"mandatoryFields,omitempty"`
}

// RateLimitingFilter represents rate limiting configuration
type RateLimitingFilter struct {
	Enabled bool                     `yaml:"enabled" json:"enabled"`
	Rules   map[string]RateLimitRule `yaml:"rules" json:"rules"`
}

// RateLimitRule represents rate limiting rules
type RateLimitRule struct {
	Enabled            bool `yaml:"enabled" json:"enabled"`
	MaxEventsPerMinute *int `yaml:"max_events_per_minute,omitempty" json:"maxEventsPerMinute,omitempty"`
	MaxEventsPerHour   *int `yaml:"max_events_per_hour,omitempty" json:"maxEventsPerHour,omitempty"`
	ErrorMaxPerMinute  *int `yaml:"error_max_per_minute,omitempty" json:"errorMaxPerMinute,omitempty"`
	WarnMaxPerMinute   *int `yaml:"warn_max_per_minute,omitempty" json:"warnMaxPerMinute,omitempty"`
	InfoMaxPerMinute   *int `yaml:"info_max_per_minute,omitempty" json:"infoMaxPerMinute,omitempty"`
}

// TimeFiltersConfig represents time-based filtering
type TimeFiltersConfig struct {
	Enabled bool                      `yaml:"enabled" json:"enabled"`
	Rules   map[string]TimeFilterRule `yaml:"rules" json:"rules"`
}

// TimeFilterRule represents time filtering rules
type TimeFilterRule struct {
	Enabled       bool   `yaml:"enabled" json:"enabled"`
	StartHour     *int   `yaml:"start_hour,omitempty" json:"startHour,omitempty"`
	EndHour       *int   `yaml:"end_hour,omitempty" json:"endHour,omitempty"`
	Timezone      string `yaml:"timezone,omitempty" json:"timezone,omitempty"`
	MaxAgeHours   *int   `yaml:"max_age_hours,omitempty" json:"maxAgeHours,omitempty"`
	MinAgeSeconds *int   `yaml:"min_age_seconds,omitempty" json:"minAgeSeconds,omitempty"`
}

// IndexRoutingConfig represents index routing configuration
type IndexRoutingConfig struct {
	Enabled bool                        `yaml:"enabled" json:"enabled"`
	Rules   map[string]IndexRoutingRule `yaml:"rules" json:"rules"`
}

// IndexRoutingRule represents index routing rules
type IndexRoutingRule struct {
	Enabled          bool   `yaml:"enabled" json:"enabled"`
	ErrorIndex       string `yaml:"error_index,omitempty" json:"errorIndex,omitempty"`
	WarnIndex        string `yaml:"warn_index,omitempty" json:"warnIndex,omitempty"`
	InfoIndex        string `yaml:"info_index,omitempty" json:"infoIndex,omitempty"`
	DebugIndex       string `yaml:"debug_index,omitempty" json:"debugIndex,omitempty"`
	ApplicationIndex string `yaml:"application_index,omitempty" json:"applicationIndex,omitempty"`
	SystemIndex      string `yaml:"system_index,omitempty" json:"systemIndex,omitempty"`
	SecurityIndex    string `yaml:"security_index,omitempty" json:"securityIndex,omitempty"`
	Pattern          string `yaml:"pattern,omitempty" json:"pattern,omitempty"`
}

// AlertingConfig represents alerting configuration
type AlertingConfig struct {
	Enabled bool                    `yaml:"enabled" json:"enabled"`
	Rules   map[string]AlertingRule `yaml:"rules" json:"rules"`
}

// AlertingRule represents alerting rules
type AlertingRule struct {
	Enabled       bool `yaml:"enabled" json:"enabled"`
	Threshold     *int `yaml:"threshold,omitempty" json:"threshold,omitempty"`
	WindowMinutes *int `yaml:"window_minutes,omitempty" json:"windowMinutes,omitempty"`
}

// PerformanceConfig represents performance settings
type PerformanceConfig struct {
	Enabled  bool                   `yaml:"enabled" json:"enabled"`
	Settings map[string]interface{} `yaml:"settings" json:"settings"`
}

// FilterStats represents filter statistics
type FilterStats struct {
	TotalEvents    int64                  `json:"totalEvents"`
	FilteredEvents int64                  `json:"filteredEvents"`
	PassedEvents   int64                  `json:"passedEvents"`
	FilterReasons  map[string]int64       `json:"filterReasons"`
	LastUpdated    time.Time              `json:"lastUpdated"`
	Performance    map[string]interface{} `json:"performance"`
}

// NewService creates a new filter service
func NewService(config Config, log logger.Logger) *Service {
	return &Service{
		configPath:   config.ConfigPath,
		backupDir:    config.BackupDir,
		reloadScript: config.ReloadScript,
		logger:       log,
	}
}

// GetFilterRules returns current filter rules
func (s *Service) GetFilterRules(ctx context.Context) (*FilterRules, error) {
	s.logger.Info("Getting filter rules", "path", s.configPath)

	data, err := ioutil.ReadFile(s.configPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read config file: %w", err)
	}

	var rules FilterRules
	if err := yaml.Unmarshal(data, &rules); err != nil {
		return nil, fmt.Errorf("failed to parse config file: %w", err)
	}

	s.logger.Info("Filter rules loaded successfully")
	return &rules, nil
}

// UpdateFilterRules updates filter rules and reloads configuration
func (s *Service) UpdateFilterRules(ctx context.Context, rules *FilterRules) error {
	s.logger.Info("Updating filter rules")

	// Create backup
	if err := s.createBackup(); err != nil {
		s.logger.Warn("Failed to create backup", "error", err)
	}

	// Marshal to YAML
	data, err := yaml.Marshal(rules)
	if err != nil {
		return fmt.Errorf("failed to marshal rules: %w", err)
	}

	// Write to file
	if err := ioutil.WriteFile(s.configPath, data, 0644); err != nil {
		return fmt.Errorf("failed to write config file: %w", err)
	}

	// Reload configuration
	if err := s.reloadConfiguration(); err != nil {
		return fmt.Errorf("failed to reload configuration: %w", err)
	}

	s.logger.Info("Filter rules updated successfully")
	return nil
}

// ToggleFilter enables or disables a specific filter
func (s *Service) ToggleFilter(ctx context.Context, filterType string, enabled bool) error {
	s.logger.Info("Toggling filter", "type", filterType, "enabled", enabled)

	rules, err := s.GetFilterRules(ctx)
	if err != nil {
		return err
	}

	// Update specific filter
	switch filterType {
	case "global":
		rules.Global.Enabled = enabled
	case "metrics":
		rules.Metrics.Enabled = enabled
	case "log_levels":
		rules.LogLevels.Enabled = enabled
	case "sources":
		rules.Sources.Enabled = enabled
	case "content":
		rules.Content.Enabled = enabled
	case "rate_limiting":
		rules.RateLimiting.Enabled = enabled
	case "time_filters":
		rules.TimeFilters.Enabled = enabled
	case "index_routing":
		rules.IndexRouting.Enabled = enabled
	case "alerting":
		rules.Alerting.Enabled = enabled
	case "performance":
		rules.Performance.Enabled = enabled
	default:
		return fmt.Errorf("unknown filter type: %s", filterType)
	}

	return s.UpdateFilterRules(ctx, rules)
}

// GetFilterStats returns filter statistics
func (s *Service) GetFilterStats(ctx context.Context) (*FilterStats, error) {
	s.logger.Info("Getting filter statistics")

	// Mock statistics - in real implementation, this would query actual stats
	stats := &FilterStats{
		TotalEvents:    10000,
		FilteredEvents: 1500,
		PassedEvents:   8500,
		FilterReasons: map[string]int64{
			"metric_disabled":         300,
			"log_level_not_allowed":   200,
			"sensitive_data_detected": 150,
			"rate_limit_exceeded":     400,
			"host_blocked":            250,
			"message_too_large":       100,
			"event_too_old":           100,
		},
		LastUpdated: time.Now(),
		Performance: map[string]interface{}{
			"avg_processing_time_ms": 2.5,
			"events_per_second":      1666,
			"memory_usage_mb":        128,
		},
	}

	return stats, nil
}

// ValidateRules validates filter rules configuration
func (s *Service) ValidateRules(ctx context.Context, rules *FilterRules) error {
	s.logger.Info("Validating filter rules")

	// Basic validation
	if rules.Global.DefaultAction != "allow" && rules.Global.DefaultAction != "deny" {
		return fmt.Errorf("invalid default_action: must be 'allow' or 'deny'")
	}

	// Validate metric rules
	for name, rule := range rules.Metrics.Rules {
		if rule.MinValue != nil && rule.MaxValue != nil && *rule.MinValue > *rule.MaxValue {
			return fmt.Errorf("metric %s: min_value cannot be greater than max_value", name)
		}
	}

	// Validate time filters
	for name, rule := range rules.TimeFilters.Rules {
		if rule.StartHour != nil && (*rule.StartHour < 0 || *rule.StartHour > 23) {
			return fmt.Errorf("time filter %s: invalid start_hour", name)
		}
		if rule.EndHour != nil && (*rule.EndHour < 0 || *rule.EndHour > 23) {
			return fmt.Errorf("time filter %s: invalid end_hour", name)
		}
	}

	s.logger.Info("Filter rules validation passed")
	return nil
}

// createBackup creates a backup of current configuration
func (s *Service) createBackup() error {
	if _, err := os.Stat(s.configPath); os.IsNotExist(err) {
		return nil // No existing config to backup
	}

	// Ensure backup directory exists
	if err := os.MkdirAll(s.backupDir, 0755); err != nil {
		return fmt.Errorf("failed to create backup directory: %w", err)
	}

	// Create backup filename with timestamp
	timestamp := time.Now().Format("20060102-150405")
	backupPath := filepath.Join(s.backupDir, fmt.Sprintf("filter-rules-%s.yml", timestamp))

	// Copy file
	data, err := ioutil.ReadFile(s.configPath)
	if err != nil {
		return fmt.Errorf("failed to read config for backup: %w", err)
	}

	if err := ioutil.WriteFile(backupPath, data, 0644); err != nil {
		return fmt.Errorf("failed to write backup: %w", err)
	}

	s.logger.Info("Backup created", "path", backupPath)
	return nil
}

// reloadConfiguration reloads Logstash configuration
func (s *Service) reloadConfiguration() error {
	if s.reloadScript == "" {
		s.logger.Warn("No reload script configured, skipping reload")
		return nil
	}

	s.logger.Info("Reloading Logstash configuration", "script", s.reloadScript)

	cmd := exec.Command("bash", s.reloadScript, s.configPath)
	output, err := cmd.CombinedOutput()

	if err != nil {
		s.logger.Error("Failed to reload configuration", "error", err, "output", string(output))
		return fmt.Errorf("reload failed: %w", err)
	}

	s.logger.Info("Configuration reloaded successfully", "output", string(output))
	return nil
}
