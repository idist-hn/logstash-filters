package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// LoginRequest represents the login request payload
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Remember bool   `json:"remember"`
}

// LoginResponse represents the login response
type LoginResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Token   string `json:"token,omitempty"`
	User    *User  `json:"user,omitempty"`
}

// User represents user information
type User struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Role     string `json:"role"`
}

// ErrorResponse represents error response
type ErrorResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Error   string `json:"error,omitempty"`
}

func main() {
	// Set Gin to release mode for production
	gin.SetMode(gin.ReleaseMode)

	// Create Gin router
	r := gin.Default()

	// Configure CORS
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"}
	config.AllowCredentials = true
	r.Use(cors.New(config))

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "ok",
			"timestamp": time.Now().Unix(),
			"service":   "cloudwatch-backend-mock",
		})
	})

	// API v1 routes
	v1 := r.Group("/api/v1")
	{
		// Authentication routes
		auth := v1.Group("/auth")
		{
			auth.POST("/login", handleLogin)
			auth.POST("/logout", handleLogout)
			auth.GET("/me", handleMe)
		}
	}

	// Start server
	port := "8080"
	fmt.Printf("🚀 Mock CloudWatch Backend starting on port %s\n", port)
	fmt.Printf("📊 Health check: http://localhost:%s/health\n", port)
	fmt.Printf("🔐 Login endpoint: http://localhost:%s/api/v1/auth/login\n", port)
	fmt.Printf("📝 Demo credentials: admin / admin123\n")

	log.Fatal(http.ListenAndServe(":"+port, r))
}

// handleLogin handles user authentication
func handleLogin(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid request format",
			Error:   err.Error(),
		})
		return
	}

	// Mock authentication - accept admin/admin123
	if req.Username == "admin" && req.Password == "admin123" {
		// Generate mock JWT token
		token := fmt.Sprintf("mock-jwt-token-%d", time.Now().Unix())

		user := &User{
			ID:       1,
			Username: req.Username,
			Email:    "admin@cloudwatch.local",
			Role:     "administrator",
		}

		c.JSON(http.StatusOK, LoginResponse{
			Success: true,
			Message: "Login successful",
			Token:   token,
			User:    user,
		})
		return
	}

	// Invalid credentials
	c.JSON(http.StatusUnauthorized, ErrorResponse{
		Success: false,
		Message: "Invalid username or password",
	})
}

// handleLogout handles user logout
func handleLogout(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Logout successful",
	})
}

// handleMe returns current user info
func handleMe(c *gin.Context) {
	// Mock user info
	user := &User{
		ID:       1,
		Username: "admin",
		Email:    "admin@cloudwatch.local",
		Role:     "administrator",
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"user":    user,
	})
}
