package models

import "time"

type ListScheduleResponse struct {
	Stats     StatsResponse      `json:"stats,omitempty"`
	Schedules []ScheduleResponse `json:"schedules"`
}

type StatsResponse struct {
	Missed    int64 `json:"missed"`
	Upcoming  int64 `json:"upcoming"`
	Completed int64 `json:"completed"`
}

type ScheduleResponse struct {
	ID          int64     `json:"id"`
	ClientName  string    `json:"client_name"`
	ServiceName string    `json:"service_name"`
	Location    string    `json:"location"`
	StartTime   time.Time `json:"start_time"`
	EndTime     time.Time `json:"end_time"`
	ShiftDate   string    `json:"shift_date"`
	Status      string    `json:"status"`

	ServiceNotes     string    `json:"service_notes,omitempty"`
	ClockInTime      time.Time `json:"clock_in_time,omitempty"`
	ClockOutTime     time.Time `json:"clock_out_time,omitempty"`
	ClockInLocation  string    `json:"clock_in_location,omitempty"`
	ClockOutLocation string    `json:"clock_out_location,omitempty"`

	Tasks []TaskResponse `json:"tasks,omitempty"`

	// TODO: evaluate if returning lat & long is necessary instead of directly return location name
	// ClockInLatitude  string `json:"clock_in_latitude"`
	// ClockInLongitude  string `json:"clock_in_longitude"`
	// ClockOutLatitude string `json:"clock_out_latitude"`
	// ClockOutLongitude string `json:"clock_out_longitude"`
}

type TaskResponse struct {
	ID          int64     `json:"id"`
	ScheduleID  int64     `json:"schedule_id" `
	Name        string    `json:"name" `
	Description string    `json:"description,omitempty" `
	Status      string    `json:"status"`
	Reason      string    `json:"reason,omitempty"`
	CompletedAt time.Time `json:"completed_at,omitempty"`
}

type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   *APIError   `json:"error,omitempty"`
}

// TODO: implement error code for easier and better debugging
type APIError struct {
	Message string `json:"message"`
	Detail  string `json:"detail,omitempty"`
}

func NewSuccessResponse(message string, data interface{}) APIResponse {
	return APIResponse{
		Success: true,
		Message: message,
		Data:    data,
	}
}

func NewErrorResponse(message, detail string) APIResponse {
	return APIResponse{
		Success: false,
		Error: &APIError{
			Message: message,
			Detail:  detail,
		},
	}
}
