package task

import (
	"errors"
	"github.com/erizkiatama/bluehorntech/internal/models"
	"github.com/erizkiatama/bluehorntech/internal/service/task"
	"github.com/erizkiatama/bluehorntech/pkg/response"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// TODO: hardcoded user id because there is no auth yet, will implement later
var defaultUserID int64 = 1

type Handler struct {
	svc task.Service
}

func New(svc task.Service) *Handler {
	return &Handler{
		svc: svc,
	}
}

func (h *Handler) UpdateTask(c *gin.Context) {
	taskID, err := strconv.Atoi(c.Param("id"))
	if err != nil || taskID <= 0 {
		response.Error(c, http.StatusBadRequest, "Invalid task ID", err)
		return
	}

	var req models.UpdateTaskRequest
	if err = c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	if err = validateTaskStatus(req.Status, req.Reason); err != nil {
		response.Error(c, http.StatusBadRequest, "Error validating task status", err)
		return
	}

	// TODO: implement auth check (can only update their own tasks)
	updateResp, err := h.svc.UpdateTask(c.Request.Context(), defaultUserID, int64(taskID), &req)
	if err != nil {
		errMsg := err.Error()
		statusCode := http.StatusInternalServerError

		switch {
		case errors.Is(err, models.ErrTaskNotFound):
			statusCode = http.StatusNotFound
		case errors.Is(err, models.ErrInvalidTaskStatus):
			statusCode = http.StatusBadRequest
		case errors.Is(err, models.ErrReasonRequired):
			statusCode = http.StatusBadRequest
		case errors.Is(err, models.ErrTaskAlreadyUpdated):
			statusCode = http.StatusConflict
		case errors.Is(err, models.ErrVisitNotInProgress):
			statusCode = http.StatusBadRequest
		default:
			errMsg = "Failed to update task: " + err.Error()
		}
		response.Error(c, statusCode, errMsg, err)
		return
	}

	response.Success(c, "Task updated successfully", updateResp)
}

func validateTaskStatus(status, reason string) error {
	switch status {
	case models.TaskStatusCompleted:
		return nil
	case models.TaskStatusNotCompleted:
		if reason == "" {
			return models.ErrReasonRequired
		}
		return nil
	default:
		return models.ErrInvalidTaskStatus
	}
}
