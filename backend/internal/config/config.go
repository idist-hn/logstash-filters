package config

import (
	"os"
	"strconv"
)

type Config struct {
	Server        ServerConfig
	Elasticsearch ElasticsearchConfig
	JWT           JWTConfig
}

type ServerConfig struct {
	Host string
	Port string
}

type ElasticsearchConfig struct {
	Host     string
	Port     string
	Username string
	Password string
	URL      string
}

type JWTConfig struct {
	Secret string
}

func Load() *Config {
	return &Config{
		Server: ServerConfig{
			Host: getEnv("API_HOST", "0.0.0.0"),
			Port: getEnv("API_PORT", "8080"),
		},
		Elasticsearch: ElasticsearchConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "9200"),
			Username: getEnv("DB_USERNAME", "elastic"),
			Password: getEnv("DB_PASSWORD", "changeme123"),
			URL:      getEnv("ELASTICSEARCH_URL", "http://localhost:9200"),
		},
		JWT: JWTConfig{
			Secret: getEnv("JWT_SECRET", "your-super-secret-jwt-key"),
		},
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getEnvAsBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolValue, err := strconv.ParseBool(value); err == nil {
			return boolValue
		}
	}
	return defaultValue
}
