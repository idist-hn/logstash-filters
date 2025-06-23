package api

import (
	"net/http"

	"cloudwatch-backend/internal/config"
	"cloudwatch-backend/internal/elasticsearch"
	"cloudwatch-backend/internal/middleware"
	"cloudwatch-backend/pkg/logger"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Server struct {
	config   *config.Config
	es       *elasticsearch.Client
	logger   logger.Logger
	router   *gin.Engine
	handlers *Handlers
}

func NewServer(cfg *config.Config, esClient *elasticsearch.Client, log logger.Logger) *Server {
	server := &Server{
		config: cfg,
		es:     esClient,
		logger: log,
	}

	server.handlers = NewHandlers(esClient, log, cfg)
	server.setupRouter()

	return server
}

func (s *Server) setupRouter() {
	gin.SetMode(gin.ReleaseMode)
	s.router = gin.New()

	// Middleware
	s.router.Use(gin.Logger())
	s.router.Use(gin.Recovery())
	s.router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Health check
	s.router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// API routes
	api := s.router.Group("/api/v1")
	{
		// Authentication
		auth := api.Group("/auth")
		{
			auth.POST("/login", s.handlers.Login)
			auth.POST("/register", s.handlers.Register)
		}

		// Protected routes
		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware(s.config.JWT.Secret))
		{
			// Dashboard
			protected.GET("/dashboard", s.handlers.GetDashboard)
			
			// Metrics
			metrics := protected.Group("/metrics")
			{
				metrics.GET("/system", s.handlers.GetSystemMetrics)
				metrics.GET("/logs", s.handlers.GetLogs)
				metrics.GET("/cluster", s.handlers.GetClusterHealth)
			}

			// Search
			protected.GET("/search", s.handlers.Search)
		}
	}
}

func (s *Server) Start(addr string) error {
	s.logger.Info("Starting HTTP server", "address", addr)
	return s.router.Run(addr)
}
