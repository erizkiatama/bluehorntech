package middleware

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func UseCORS() gin.HandlerFunc {
	config := cors.DefaultConfig()
	// TODO: Only for this assignment, don't do this on actual production!
	config.AllowOrigins = []string{"*"}
	config.AllowMethods = []string{"*"}
	config.AllowHeaders = []string{"*"}
	return cors.New(config)
}
