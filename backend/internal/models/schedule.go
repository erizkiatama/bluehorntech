package models

import (
	"database/sql"
	"github.com/erizkiatama/bluehorntech/pkg/helpers"
	"github.com/lib/pq"
	"time"
)

type Schedule struct {
	ID                int64           `json:"id" db:"id"`
	UserID            int64           `json:"user_id" db:"user_id"`
	ClientName        string          `json:"client_name" db:"client_name"`
	ServiceName       string          `json:"service_name" db:"service_name"`
	ServiceNotes      sql.NullString  `json:"service_notes" db:"service_notes"`
	Location          string          `json:"location" db:"location"`
	Status            string          `json:"status" db:"status"`
	Latitude          float64         `json:"latitude" db:"latitude"`
	Longitude         float64         `json:"longitude" db:"longitude"`
	StartTime         time.Time       `json:"start_time" db:"start_time"`
	EndTime           time.Time       `json:"end_time" db:"end_time"`
	ClockInTime       sql.NullTime    `json:"clock_in_time,omitempty" db:"clock_in_time"`
	ClockOutTime      sql.NullTime    `json:"clock_out_time,omitempty" db:"clock_out_time"`
	ClockInLatitude   sql.NullFloat64 `json:"clock_in_latitude,omitempty" db:"clock_in_latitude"`
	ClockInLongitude  sql.NullFloat64 `json:"clock_in_longitude,omitempty" db:"clock_in_longitude"`
	ClockOutLatitude  sql.NullFloat64 `json:"clock_out_latitude,omitempty" db:"clock_out_latitude"`
	ClockOutLongitude sql.NullFloat64 `json:"clock_out_longitude,omitempty" db:"clock_out_longitude"`
	ComplianceFlags   pq.StringArray  `json:"compliance_flags,omitempty" db:"compliance_flags"`
	ValidationNotes   sql.NullString  `json:"validation_notes,omitempty" db:"validation_notes"`
	CreatedAt         time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time       `json:"updated_at" db:"updated_at"`

	Tasks []Task `json:"tasks,omitempty"`
}

func (s *Schedule) ToScheduleResponse() ScheduleResponse {
	return ScheduleResponse{
		ID:          s.ID,
		ClientName:  s.ClientName,
		ServiceName: s.ServiceName,
		Location:    s.Location,
		ShiftTime:   helpers.FormatShiftTime(s.StartTime, s.EndTime),
		ShiftDate:   helpers.FormatShiftDate(s.StartTime),
		Status:      s.Status,
	}
}

func (s *Schedule) ToScheduleDetailResponse(tasks []Task) *ScheduleResponse {
	var (
		clockInTime, clockOutTime         string
		clockInLocation, clockOutLocation string
	)

	if s.ClockInTime.Valid {
		clockInTime = s.ClockInTime.Time.Format(time.TimeOnly)
	}
	if s.ClockOutTime.Valid {
		clockOutTime = s.ClockOutTime.Time.Format(time.TimeOnly)
	}

	if s.ClockInLatitude.Valid && s.ClockInLongitude.Valid {
		clockInLocation = helpers.GetLocationDetail(s.ClockInLatitude.Float64, s.ClockInLongitude.Float64)
	}
	if s.ClockOutLatitude.Valid && s.ClockOutLongitude.Valid {
		clockOutLocation = helpers.GetLocationDetail(s.ClockOutLatitude.Float64, s.ClockOutLongitude.Float64)
	}

	resp := s.ToScheduleResponse()
	resp.ServiceNotes = s.ServiceNotes.String
	resp.ClockInTime = clockInTime
	resp.ClockOutTime = clockOutTime
	resp.ClockInLocation = clockInLocation
	resp.ClockOutLocation = clockOutLocation

	for _, t := range tasks {
		tPointer := &t
		resp.Tasks = append(resp.Tasks, tPointer.ToTaskResponse())
	}

	return &resp
}

const (
	StatusScheduled  = "scheduled"
	StatusInProgress = "in progress"
	StatusCompleted  = "completed"
	StatusCancelled  = "cancelled"
)

func (s *Schedule) IsActive() bool {
	return s.Status == StatusScheduled || s.Status == StatusInProgress
}

func (s *Schedule) CanStart() bool {
	return s.Status == StatusScheduled
}

func (s *Schedule) CanEnd() bool {
	return s.Status == StatusInProgress
}

func IsValidScheduleStatus(status string) bool {
	switch status {
	case StatusScheduled, StatusInProgress, StatusCompleted, StatusCancelled:
		return true
	default:
		return false
	}
}

type ComplianceResult struct {
	Flags          string
	Notes          string
	WarningMessage string
}
