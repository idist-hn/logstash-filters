package api

import (
	"net/http"
	"time"

	"cloudwatch-backend/internal/config"
	"cloudwatch-backend/internal/elasticsearch"
	"cloudwatch-backend/pkg/logger"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type Handlers struct {
	es     *elasticsearch.Client
	logger logger.Logger
	config *config.Config
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type RegisterRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
}

type User struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"-"`
}

func NewHandlers(esClient *elasticsearch.Client, log logger.Logger, cfg *config.Config) *Handlers {
	return &Handlers{
		es:     esClient,
		logger: log,
		config: cfg,
	}
}

func (h *Handlers) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Simple authentication (in production, use proper user management)
	if req.Username == "admin" && req.Password == "admin123" {
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"username": req.Username,
			"exp":      time.Now().Add(time.Hour * 24).Unix(),
		})

		tokenString, err := token.SignedString([]byte(h.config.JWT.Secret))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"token": tokenString,
			"user": gin.H{
				"username": req.Username,
				"email":    "admin@cloudwatch.com",
			},
		})
		return
	}

	c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
}

func (h *Handlers) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// In production, save user to database
	user := User{
		Username: req.Username,
		Email:    req.Email,
		Password: string(hashedPassword),
	}

	h.logger.Info("User registered", "username", user.Username, "email", user.Email)

	c.JSON(http.StatusCreated, gin.H{
		"message": "User registered successfully",
		"user": gin.H{
			"username": user.Username,
			"email":    user.Email,
		},
	})
}

func (h *Handlers) GetDashboard(c *gin.Context) {
	timeRange := c.DefaultQuery("timeRange", "1h")

	// Get system metrics
	systemMetrics, err := h.es.GetSystemMetrics(timeRange)
	if err != nil {
		h.logger.Error("Failed to get system metrics", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get system metrics"})
		return
	}

	// Get cluster health
	clusterHealth, err := h.es.GetClusterHealth()
	if err != nil {
		h.logger.Error("Failed to get cluster health", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get cluster health"})
		return
	}

	// Get recent logs
	logs, err := h.es.GetLogData(timeRange, "")
	if err != nil {
		h.logger.Error("Failed to get logs", "error", err)
		// Don't fail the entire request if logs are unavailable
		logs = &elasticsearch.SearchResult{}
	}

	c.JSON(http.StatusOK, gin.H{
		"systemMetrics":  systemMetrics,
		"clusterHealth":  clusterHealth,
		"recentLogs":     logs,
		"timestamp":      time.Now(),
	})
}

func (h *Handlers) GetSystemMetrics(c *gin.Context) {
	timeRange := c.DefaultQuery("timeRange", "1h")

	metrics, err := h.es.GetSystemMetrics(timeRange)
	if err != nil {
		h.logger.Error("Failed to get system metrics", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get system metrics"})
		return
	}

	c.JSON(http.StatusOK, metrics)
}

func (h *Handlers) GetLogs(c *gin.Context) {
	timeRange := c.DefaultQuery("timeRange", "1h")
	level := c.Query("level")

	logs, err := h.es.GetLogData(timeRange, level)
	if err != nil {
		h.logger.Error("Failed to get logs", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get logs"})
		return
	}

	c.JSON(http.StatusOK, logs)
}

func (h *Handlers) GetClusterHealth(c *gin.Context) {
	health, err := h.es.GetClusterHealth()
	if err != nil {
		h.logger.Error("Failed to get cluster health", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get cluster health"})
		return
	}

	c.JSON(http.StatusOK, health)
}

func (h *Handlers) Search(c *gin.Context) {
	query := c.Query("q")
	index := c.DefaultQuery("index", "*")
	
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Query parameter 'q' is required"})
		return
	}

	searchQuery := `{
		"query": {
			"query_string": {
				"query": "` + query + `"
			}
		},
		"size": 100,
		"sort": [
			{
				"@timestamp": {
					"order": "desc"
				}
			}
		]
	}`

	results, err := h.es.Search(index, searchQuery)
	if err != nil {
		h.logger.Error("Search failed", "error", err, "query", query)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Search failed"})
		return
	}

	c.JSON(http.StatusOK, results)
}
