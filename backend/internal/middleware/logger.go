package middleware

import "github.com/gin-gonic/gin"

func UseLogger() gin.HandlerFunc {
	return gin.Logger()
}
