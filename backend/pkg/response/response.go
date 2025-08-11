package response

import (
	"log"
	"net/http"

	"github.com/erizkiatama/bluehorntech/internal/models"
	"github.com/gin-gonic/gin"
)

// Success sends a successful response
func Success(c *gin.Context, message string, data interface{}) {
	response := models.NewSuccessResponse(message, data)
	c.JSON(http.StatusOK, response)
}

// Error sends an error response with logging
func Error(c *gin.Context, statusCode int, message string, err error) {
	// Log the error
	log.Printf("API Error [%s %s]: %s - %v",
		c.Request.Method,
		c.Request.URL.Path,
		message,
		err)

	var detail string
	if err != nil {
		detail = err.Error()
	}

	response := models.NewErrorResponse(message, detail)
	c.JSON(statusCode, response)
}

// InternalError sends a 500 internal server error
func InternalError(c *gin.Context, message string, err error) {
	Error(c, http.StatusInternalServerError, message, err)
}

// BadRequest sends a 400 bad request error
func BadRequest(c *gin.Context, message string, err error) {
	Error(c, http.StatusBadRequest, message, err)
}
