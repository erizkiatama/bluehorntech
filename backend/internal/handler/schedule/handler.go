package schedule

import (
	"errors"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/erizkiatama/bluehorntech/internal/models"

	"github.com/erizkiatama/bluehorntech/internal/service/schedule"
	"github.com/erizkiatama/bluehorntech/pkg/response"
	"github.com/gin-gonic/gin"
)

// TODO: hardcoded user id because there is no auth yet, will implement later
var defaultUserID int64 = 1

type Handler struct {
	svc schedule.Service
}

func New(svc schedule.Service) *Handler {
	return &Handler{
		svc: svc,
	}
}

func (h *Handler) GetTodaySchedules(c *gin.Context) {
	log.Printf("Getting today's schedules for user %d", defaultUserID)

	tz := c.Query("tz")
	if tz == "" {
		tz = "UTC"
	}

	resp, err := h.svc.GetTodaySchedules(c.Request.Context(), defaultUserID, tz)
	if err != nil {
		response.InternalError(c, "Failed to fetch today's schedules", err)
		return
	}

	log.Printf("Successfully retrieved %d schedules for today for user %d", len(resp.Schedules), defaultUserID)
	response.Success(c, "Today's schedules retrieved successfully", resp)
}

func (h *Handler) GetAllSchedules(c *gin.Context) {
	log.Printf("Getting all schedules for user %d", defaultUserID)

	resp, err := h.svc.GetAllSchedules(c.Request.Context(), defaultUserID)
	if err != nil {
		response.InternalError(c, "Failed to fetch schedules", err)
		return
	}

	log.Printf("Successfully retrieved %d total schedules for user %d", len(resp.Schedules), defaultUserID)
	response.Success(c, "Schedules retrieved successfully", resp)
}

func (h *Handler) GetScheduleDetails(c *gin.Context) {
	log.Printf("Getting a schedule details for user %d", defaultUserID)

	scheduleID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "Invalid schedule ID", err)
		return
	}

	resp, err := h.svc.GetScheduleDetails(c.Request.Context(), defaultUserID, int64(scheduleID))
	if err != nil {
		response.InternalError(c, "Failed to get schedule details", err)
		return
	}

	log.Printf("Successfully retrieved schedule %d details for user %d", scheduleID, defaultUserID)
	response.Success(c, "Schedule details retrieved successfully", resp)
}

func (h *Handler) ClockIn(c *gin.Context) {
	scheduleID, err := strconv.Atoi(c.Param("id"))
	if err != nil || scheduleID <= 0 {
		response.Error(c, http.StatusBadRequest, "Invalid schedule ID", err)
		return
	}

	var req models.ClockInOutRequest
	if err = c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	if err = validateGeolocation(req.Latitude, req.Longitude); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid geo location", err)
		return
	}

	if req.Timestamp == nil {
		now := time.Now().UTC()
		req.Timestamp = &now
	} else {
		utcTimestamp := req.Timestamp.UTC()
		req.Timestamp = &utcTimestamp
	}

	clockInResp, err := h.svc.ClockIn(c.Request.Context(), defaultUserID, int64(scheduleID), &req)
	if err != nil {
		errMsg := err.Error()
		statusCode := http.StatusInternalServerError

		switch {
		case errors.Is(err, models.ErrScheduleNotFound):
			statusCode = http.StatusNotFound
		case errors.Is(err, models.ErrVisitAlreadyStarted):
			statusCode = http.StatusConflict
		case errors.Is(err, models.ErrLocationTooFar):
			statusCode = http.StatusBadRequest
		case errors.Is(err, models.ErrClockInTooEarly):
			statusCode = http.StatusBadRequest
		case errors.Is(err, models.ErrClockInTooLate):
			statusCode = http.StatusBadRequest
		default:
			errMsg = "Failed to clock in: " + err.Error()
		}
		response.Error(c, statusCode, errMsg, err)
		return
	}

	message := "Clocked in successfully"
	if clockInResp.WarningMessage != "" {
		message = "Clocked in with warnings"
	}

	response.Success(c, message, clockInResp)
}

func (h *Handler) ClockOut(c *gin.Context) {
	scheduleID, err := strconv.Atoi(c.Param("id"))
	if err != nil || scheduleID <= 0 {
		response.Error(c, http.StatusBadRequest, "Invalid schedule ID", err)
		return
	}

	var req models.ClockInOutRequest
	if err = c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	if err = validateGeolocation(req.Latitude, req.Longitude); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid geo location", err)
		return
	}

	if req.Timestamp == nil {
		now := time.Now().UTC()
		req.Timestamp = &now
	} else {
		utcTimestamp := req.Timestamp.UTC()
		req.Timestamp = &utcTimestamp
	}

	// 5. Call service layer
	clockOutResp, err := h.svc.ClockOut(c.Request.Context(), defaultUserID, int64(scheduleID), &req)
	if err != nil {
		errMsg := err.Error()
		statusCode := http.StatusInternalServerError

		switch {
		case errors.Is(err, models.ErrScheduleNotFound):
			statusCode = http.StatusNotFound
		case errors.Is(err, models.ErrVisitNotStarted):
			statusCode = http.StatusBadRequest
		case errors.Is(err, models.ErrVisitAlreadyEnded):
			statusCode = http.StatusConflict
		case errors.Is(err, models.ErrLocationTooFar):
			statusCode = http.StatusBadRequest
		case errors.Is(err, models.ErrClockOutTooEarly):
			statusCode = http.StatusBadRequest
		default:
			errMsg = "Failed to clock out: " + err.Error()
		}
		response.Error(c, statusCode, errMsg, err)
		return
	}

	response.Success(c, "Clocked out successfully", clockOutResp)
}

// validateGeolocation validates latitude and longitude values
func validateGeolocation(lat, lng float64) error {
	if lat < -90 || lat > 90 {
		return errors.New("latitude must be between -90 and 90")
	}
	if lng < -180 || lng > 180 {
		return errors.New("longitude must be between -180 and 180")
	}
	return nil
}
