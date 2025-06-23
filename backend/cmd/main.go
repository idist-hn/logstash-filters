package main

import (
	"log"
	"os"

	"cloudwatch-backend/internal/api"
	"cloudwatch-backend/internal/config"
	"cloudwatch-backend/internal/elasticsearch"
	"cloudwatch-backend/pkg/logger"

	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load("../.env"); err != nil {
		log.Println("Warning: .env file not found, using system environment variables")
	}

	// Initialize logger
	logger := logger.New()

	// Load configuration
	cfg := config.Load()

	// Initialize Elasticsearch client
	esClient, err := elasticsearch.NewClient(cfg.Elasticsearch)
	if err != nil {
		logger.Fatal("Failed to initialize Elasticsearch client", "error", err)
	}

	// Test Elasticsearch connection
	if err := esClient.Ping(); err != nil {
		logger.Fatal("Failed to connect to Elasticsearch", "error", err)
	}
	logger.Info("Successfully connected to Elasticsearch")

	// Initialize API server
	server := api.NewServer(cfg, esClient, logger)

	// Start server
	port := os.Getenv("API_PORT")
	if port == "" {
		port = "8080"
	}

	logger.Info("Starting server", "port", port)
	if err := server.Start(":" + port); err != nil {
		logger.Fatal("Failed to start server", "error", err)
	}
}
