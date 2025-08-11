package v1

import (
	taskHandler "github.com/erizkiatama/bluehorntech/internal/handler/task"
	"github.com/gin-gonic/gin"
)

// RegisterTaskRoutes registers task-related routes
func RegisterTaskRoutes(router *gin.RouterGroup, taskHandler *taskHandler.Handler) {
	tasks := router.Group("/tasks")
	{
		tasks.PATCH("/:id", taskHandler.UpdateTask)
	}
}
