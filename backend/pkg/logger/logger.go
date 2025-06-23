package logger

import (
	"log/slog"
	"os"
)

type Logger interface {
	Info(msg string, args ...interface{})
	Error(msg string, args ...interface{})
	Debug(msg string, args ...interface{})
	Warn(msg string, args ...interface{})
	Fatal(msg string, args ...interface{})
}

type slogLogger struct {
	logger *slog.Logger
}

func New() Logger {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))

	return &slogLogger{
		logger: logger,
	}
}

func (l *slogLogger) Info(msg string, args ...interface{}) {
	l.logger.Info(msg, args...)
}

func (l *slogLogger) Error(msg string, args ...interface{}) {
	l.logger.Error(msg, args...)
}

func (l *slogLogger) Debug(msg string, args ...interface{}) {
	l.logger.Debug(msg, args...)
}

func (l *slogLogger) Warn(msg string, args ...interface{}) {
	l.logger.Warn(msg, args...)
}

func (l *slogLogger) Fatal(msg string, args ...interface{}) {
	l.logger.Error(msg, args...)
	os.Exit(1)
}
