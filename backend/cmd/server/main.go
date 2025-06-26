package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"cloudwatch-backend/internal/config"
	"cloudwatch-backend/internal/handlers"
	"cloudwatch-backend/internal/services/kibana"
	"cloudwatch-backend/internal/services/filter"
	"cloudwatch-backend/pkg/elasticsearch"
	"cloudwatch-backend/pkg/logger"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Initialize logger
	logger := logger.New(cfg.Logging.Level, cfg.Logging.Format)
	logger.Info("Starting CloudWatch ELK Monitoring System")

	// Initialize Elasticsearch client
	esClient, err := elasticsearch.NewClient(elasticsearch.Config{
		URL:      cfg.Elasticsearch.URL,
		Username: cfg.Elasticsearch.Username,
		Password: cfg.Elasticsearch.Password,
	}, logger)
	if err != nil {
		logger.Fatal("Failed to create Elasticsearch client", "error", err)
	}

	// Test Elasticsearch connection
	if err := esClient.Ping(); err != nil {
		logger.Warn("Failed to connect to Elasticsearch", "error", err)
		// Don't fail startup, just warn
	} else {
		logger.Info("Successfully connected to Elasticsearch")
	}

	// Initialize Kibana service
	kibanaService := kibana.NewService(cfg.Kibana, logger)

	// Test Kibana connection
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	
	if err := kibanaService.HealthCheck(ctx); err != nil {
		logger.Warn("Kibana health check failed", "error", err)
		// Don't fail startup, just warn
	} else {
		logger.Info("Successfully connected to Kibana")
	}

	// Initialize Filter service
	filterService := filter.NewService(filter.Config{
		ConfigPath:   "logstash/config/filter-rules.yml",
		BackupDir:    "backups/filter-rules",
		ReloadScript: "scripts/reload-filter-rules.sh",
	}, logger)

	// Initialize handlers
	kibanaHandler := handlers.NewKibanaHandler(kibanaService, logger)
	filterHandler := handlers.NewFilterHandler(filterService, logger)

	// Setup Gin router
	if cfg.IsProduction() {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	// CORS configuration
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = []string{"http://localhost:3000", "http://localhost:5173"}
	corsConfig.AllowCredentials = true
	corsConfig.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	router.Use(cors.New(corsConfig))

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "healthy",
			"timestamp": time.Now().Format(time.RFC3339),
			"version":   "1.0.0",
		})
	})

	// API routes
	api := router.Group("/api/v1")
	{
		// Kibana routes
		kibanaRoutes := api.Group("/kibana")
		{
			kibanaRoutes.GET("/health", kibanaHandler.HealthCheck)
			kibanaRoutes.GET("/dashboards", kibanaHandler.GetDashboards)
			kibanaRoutes.GET("/dashboards/search", kibanaHandler.SearchDashboards)
			kibanaRoutes.GET("/dashboards/:id", kibanaHandler.GetDashboard)
			kibanaRoutes.GET("/dashboards/:id/timerange", kibanaHandler.GetDashboardWithTimeRange)
			kibanaRoutes.GET("/dashboards/:id/embed-url", kibanaHandler.GetEmbedURL)
			kibanaRoutes.GET("/visualizations/:id", kibanaHandler.GetVisualization)
			kibanaRoutes.GET("/metrics", kibanaHandler.GetMetrics)
			kibanaRoutes.POST("/cache/refresh", kibanaHandler.RefreshCache)
		}

		// Filter management routes
		filterRoutes := api.Group("/filters")
		{
			filterRoutes.GET("/rules", filterHandler.GetFilterRules)
			filterRoutes.PUT("/rules", filterHandler.UpdateFilterRules)
			filterRoutes.POST("/toggle", filterHandler.ToggleFilter)
			filterRoutes.GET("/stats", filterHandler.GetFilterStats)
			filterRoutes.POST("/validate", filterHandler.ValidateRules)
			filterRoutes.GET("/types", filterHandler.GetFilterTypes)
		}

		// Future routes for alerts, monitoring, etc.
		// alertRoutes := api.Group("/alerts")
		// monitorRoutes := api.Group("/monitor")
		// logRoutes := api.Group("/logs")
	}

	// Create HTTP server
	server := &http.Server{
		Addr:         cfg.GetServerAddress(),
		Handler:      router,
		ReadTimeout:  cfg.Server.ReadTimeout,
		WriteTimeout: cfg.Server.WriteTimeout,
		IdleTimeout:  cfg.Server.IdleTimeout,
	}

	// Start server in a goroutine
	go func() {
		logger.Info("Starting HTTP server", "address", server.Addr)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal("Failed to start server", "error", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down server...")

	// Graceful shutdown with timeout
	ctx, cancel = context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		logger.Fatal("Server forced to shutdown", "error", err)
	}

	logger.Info("Server exited")
}
