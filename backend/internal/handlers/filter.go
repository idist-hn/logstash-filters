package handlers

import (
	"net/http"

	"cloudwatch-backend/internal/services/filter"
	"cloudwatch-backend/pkg/logger"

	"github.com/gin-gonic/gin"
)

// FilterHandler handles filter management HTTP requests
type FilterHandler struct {
	service *filter.Service
	logger  logger.Logger
}

// NewFilterHandler creates a new filter handler
func NewFilterHandler(service *filter.Service, log logger.Logger) *FilterHandler {
	return &FilterHandler{
		service: service,
		logger:  log,
	}
}

// Response models for filter API
type FilterRulesResponse struct {
	Rules   *filter.FilterRules `json:"rules"`
	Success bool                `json:"success"`
}

type FilterStatsResponse struct {
	Stats   *filter.FilterStats `json:"stats"`
	Success bool                `json:"success"`
}

type ToggleFilterRequest struct {
	FilterType string `json:"filterType" binding:"required"`
	Enabled    bool   `json:"enabled"`
}

type UpdateRulesRequest struct {
	Rules *filter.FilterRules `json:"rules" binding:"required"`
}

// GetFilterRules returns current filter rules
// @Summary Get filter rules
// @Description Retrieve current filter rules configuration
// @Tags filters
// @Accept json
// @Produce json
// @Success 200 {object} FilterRulesResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/filters/rules [get]
func (h *FilterHandler) GetFilterRules(c *gin.Context) {
	h.logger.Info("Handling get filter rules request")

	rules, err := h.service.GetFilterRules(c.Request.Context())
	if err != nil {
		h.logger.Error("Failed to get filter rules", "error", err)
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Failed to retrieve filter rules",
			Message: err.Error(),
			Success: false,
		})
		return
	}

	response := FilterRulesResponse{
		Rules:   rules,
		Success: true,
	}

	h.logger.Info("Successfully retrieved filter rules")
	c.JSON(http.StatusOK, response)
}

// UpdateFilterRules updates filter rules
// @Summary Update filter rules
// @Description Update filter rules configuration
// @Tags filters
// @Accept json
// @Produce json
// @Param rules body UpdateRulesRequest true "Filter rules"
// @Success 200 {object} SuccessResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/filters/rules [put]
func (h *FilterHandler) UpdateFilterRules(c *gin.Context) {
	h.logger.Info("Handling update filter rules request")

	var req UpdateRulesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("Invalid request body", "error", err)
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid request body",
			Message: err.Error(),
			Success: false,
		})
		return
	}

	// Validate rules
	if err := h.service.ValidateRules(c.Request.Context(), req.Rules); err != nil {
		h.logger.Error("Invalid filter rules", "error", err)
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid filter rules",
			Message: err.Error(),
			Success: false,
		})
		return
	}

	// Update rules
	if err := h.service.UpdateFilterRules(c.Request.Context(), req.Rules); err != nil {
		h.logger.Error("Failed to update filter rules", "error", err)
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Failed to update filter rules",
			Message: err.Error(),
			Success: false,
		})
		return
	}

	response := SuccessResponse{
		Message: "Filter rules updated successfully",
		Success: true,
	}

	h.logger.Info("Successfully updated filter rules")
	c.JSON(http.StatusOK, response)
}

// ToggleFilter enables or disables a specific filter
// @Summary Toggle filter
// @Description Enable or disable a specific filter type
// @Tags filters
// @Accept json
// @Produce json
// @Param toggle body ToggleFilterRequest true "Toggle filter request"
// @Success 200 {object} SuccessResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/filters/toggle [post]
func (h *FilterHandler) ToggleFilter(c *gin.Context) {
	h.logger.Info("Handling toggle filter request")

	var req ToggleFilterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("Invalid request body", "error", err)
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid request body",
			Message: err.Error(),
			Success: false,
		})
		return
	}

	if err := h.service.ToggleFilter(c.Request.Context(), req.FilterType, req.Enabled); err != nil {
		h.logger.Error("Failed to toggle filter", "type", req.FilterType, "enabled", req.Enabled, "error", err)
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Failed to toggle filter",
			Message: err.Error(),
			Success: false,
		})
		return
	}

	action := "disabled"
	if req.Enabled {
		action = "enabled"
	}

	response := SuccessResponse{
		Message: "Filter " + req.FilterType + " " + action + " successfully",
		Success: true,
	}

	h.logger.Info("Successfully toggled filter", "type", req.FilterType, "enabled", req.Enabled)
	c.JSON(http.StatusOK, response)
}

// GetFilterStats returns filter statistics
// @Summary Get filter statistics
// @Description Retrieve filter statistics and performance metrics
// @Tags filters
// @Accept json
// @Produce json
// @Success 200 {object} FilterStatsResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/filters/stats [get]
func (h *FilterHandler) GetFilterStats(c *gin.Context) {
	h.logger.Info("Handling get filter stats request")

	stats, err := h.service.GetFilterStats(c.Request.Context())
	if err != nil {
		h.logger.Error("Failed to get filter stats", "error", err)
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Failed to retrieve filter statistics",
			Message: err.Error(),
			Success: false,
		})
		return
	}

	response := FilterStatsResponse{
		Stats:   stats,
		Success: true,
	}

	h.logger.Info("Successfully retrieved filter stats")
	c.JSON(http.StatusOK, response)
}

// ValidateRules validates filter rules without applying them
// @Summary Validate filter rules
// @Description Validate filter rules configuration without applying
// @Tags filters
// @Accept json
// @Produce json
// @Param rules body UpdateRulesRequest true "Filter rules to validate"
// @Success 200 {object} SuccessResponse
// @Failure 400 {object} ErrorResponse
// @Router /api/v1/filters/validate [post]
func (h *FilterHandler) ValidateRules(c *gin.Context) {
	h.logger.Info("Handling validate filter rules request")

	var req UpdateRulesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("Invalid request body", "error", err)
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid request body",
			Message: err.Error(),
			Success: false,
		})
		return
	}

	if err := h.service.ValidateRules(c.Request.Context(), req.Rules); err != nil {
		h.logger.Error("Filter rules validation failed", "error", err)
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Filter rules validation failed",
			Message: err.Error(),
			Success: false,
		})
		return
	}

	response := SuccessResponse{
		Message: "Filter rules validation passed",
		Success: true,
	}

	h.logger.Info("Filter rules validation passed")
	c.JSON(http.StatusOK, response)
}

// GetFilterTypes returns available filter types
// @Summary Get filter types
// @Description Get list of available filter types and their descriptions
// @Tags filters
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/filters/types [get]
func (h *FilterHandler) GetFilterTypes(c *gin.Context) {
	h.logger.Info("Handling get filter types request")

	filterTypes := map[string]interface{}{
		"global": map[string]interface{}{
			"name":        "Global Settings",
			"description": "Global filter settings and default actions",
			"configurable": []string{"enabled", "default_action", "log_filtered_events"},
		},
		"metrics": map[string]interface{}{
			"name":        "Metrics Filter",
			"description": "Filter metrics based on value ranges and required fields",
			"configurable": []string{"enabled", "min_value", "max_value", "required_fields"},
		},
		"log_levels": map[string]interface{}{
			"name":        "Log Levels Filter",
			"description": "Filter logs based on log levels",
			"configurable": []string{"enabled", "allowed_levels", "blocked_levels"},
		},
		"sources": map[string]interface{}{
			"name":        "Sources Filter",
			"description": "Filter based on data sources (applications, hosts, containers)",
			"configurable": []string{"enabled", "allowed_apps", "blocked_apps", "allowed_hosts", "blocked_hosts"},
		},
		"content": map[string]interface{}{
			"name":        "Content Filter",
			"description": "Filter based on message content and sensitive data",
			"configurable": []string{"enabled", "block_patterns", "mask_fields", "size_limits"},
		},
		"rate_limiting": map[string]interface{}{
			"name":        "Rate Limiting",
			"description": "Limit event rates per source and log level",
			"configurable": []string{"enabled", "max_events_per_minute", "max_events_per_hour"},
		},
		"time_filters": map[string]interface{}{
			"name":        "Time Filters",
			"description": "Filter based on time ranges and event age",
			"configurable": []string{"enabled", "business_hours", "max_age_hours"},
		},
		"index_routing": map[string]interface{}{
			"name":        "Index Routing",
			"description": "Route events to different Elasticsearch indices",
			"configurable": []string{"enabled", "by_level", "by_source", "by_date"},
		},
		"alerting": map[string]interface{}{
			"name":        "Alerting",
			"description": "Configure alerts for filter events",
			"configurable": []string{"enabled", "thresholds", "window_minutes"},
		},
		"performance": map[string]interface{}{
			"name":        "Performance",
			"description": "Performance and resource settings",
			"configurable": []string{"enabled", "batch_size", "worker_threads", "memory_limits"},
		},
	}

	response := map[string]interface{}{
		"filterTypes": filterTypes,
		"success":     true,
	}

	h.logger.Info("Successfully retrieved filter types")
	c.JSON(http.StatusOK, response)
}
