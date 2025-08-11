package models

import "time"

type ClockInOutRequest struct {
	Latitude  float64    `json:"latitude" binding:"required"`
	Longitude float64    `json:"longitude" binding:"required"`
	Timestamp *time.Time `json:"timestamp,omitempty"`
}

type ClockInResponse struct {
	ClockInTime    time.Time `json:"clock_in_time"`
	CanProceed     bool      `json:"can_proceed"`
	WarningMessage string    `json:"warning_message,omitempty"`
}

type ClockOutResponse struct {
	ClockInTime   time.Time `json:"clock_in_time"`
	ClockOutTime  time.Time `json:"clock_out_time"`
	TotalDuration string    `json:"total_duration"`
	Date          string    `json:"date"`
}

type UpdateTaskRequest struct {
	Status string `json:"status" binding:"required"`
	Reason string `json:"reason,omitempty"`
}

const (
	ComplianceLocationError = "LOCATION_ERROR"
	ComplianceLocationWarn  = "LOCATION_WARNING"
	ComplianceTimeError     = "TIME_ERROR"
	ComplianceTimeWarning   = "TIME_WARNING"
)
