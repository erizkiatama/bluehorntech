package app

import (
	v1 "github.com/erizkiatama/bluehorntech/internal/app/v1"
	"net/http"

	"github.com/erizkiatama/bluehorntech/config"
	"github.com/erizkiatama/bluehorntech/internal/middleware"
	"github.com/gin-gonic/gin"
)

// setupRouter configures Gin router with all routes and middleware
func setupRouter(cfg *config.Config, handlers *Handlers) *gin.Engine {
	// Set Gin mode
	if cfg.Server.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.Default()

	// Global middleware
	router.Use(middleware.UseCORS())
	router.Use(middleware.UseLogger())

	// Setup route groups
	setupHealthRoutes(router)
	setupAPIV1Routes(router, handlers)

	return router
}

// setupHealthRoutes configures health check
func setupHealthRoutes(router *gin.Engine) {
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":   "healthy",
			"database": "connected",
		})
	})
}

// setupAPIV1Routes configures all v1 API routes
func setupAPIV1Routes(router *gin.Engine, handlers *Handlers) {
	apiV1 := router.Group("/api/v1")
	{
		v1.RegisterScheduleRoutes(apiV1, handlers.Schedule)
		v1.RegisterTaskRoutes(apiV1, handlers.Task)
	}
}
