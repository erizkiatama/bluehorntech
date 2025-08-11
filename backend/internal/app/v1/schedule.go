package v1

import (
	scheduleHandler "github.com/erizkiatama/bluehorntech/internal/handler/schedule"
	"github.com/gin-gonic/gin"
)

// RegisterScheduleRoutes registers schedule-related routes
func RegisterScheduleRoutes(router *gin.RouterGroup, scheduleHandler *scheduleHandler.Handler) {
	schedules := router.Group("/schedules")
	{
		schedules.GET("/today", scheduleHandler.GetTodaySchedules)
		schedules.GET("", scheduleHandler.GetAllSchedules)
		schedules.GET("/:id", scheduleHandler.GetScheduleDetails)

		schedules.POST("/:id/start", scheduleHandler.ClockIn)
		schedules.POST("/:id/end", scheduleHandler.ClockOut)
	}
}
