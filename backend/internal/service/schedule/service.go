package schedule

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/erizkiatama/bluehorntech/config"
	"github.com/erizkiatama/bluehorntech/internal/models"
	"github.com/erizkiatama/bluehorntech/internal/repository/schedule"
	"github.com/erizkiatama/bluehorntech/internal/repository/task"
	"github.com/erizkiatama/bluehorntech/pkg/helpers"
	"github.com/lib/pq"
)

type Service interface {
	GetTodaySchedules(ctx context.Context, userID int64, tz string) (*models.ListScheduleResponse, error)
	GetAllSchedules(ctx context.Context, userID int64) (*models.ListScheduleResponse, error)
	GetScheduleDetails(ctx context.Context, userID, scheduleID int64) (*models.ScheduleResponse, error)
	ClockIn(ctx context.Context, userID, scheduleID int64, req *models.ClockInOutRequest) (*models.ClockInResponse, error)
	ClockOut(ctx context.Context, userID, scheduleID int64, req *models.ClockInOutRequest) (*models.ClockOutResponse, error)
}

type service struct {
	cfg          config.ServiceConfig
	scheduleRepo schedule.Repository
	taskRepo     task.Repository
}

func New(cfg config.ServiceConfig, scheduleRepo schedule.Repository, taskRepo task.Repository) Service {
	return &service{cfg: cfg, scheduleRepo: scheduleRepo, taskRepo: taskRepo}
}

func (s *service) GetTodaySchedules(ctx context.Context, userID int64, tz string) (*models.ListScheduleResponse, error) {
	loc, err := time.LoadLocation(tz)
	if err != nil {
		return nil, fmt.Errorf("invalid timezone: %w", err)
	}
	now := time.Now().In(loc)
	startOfDay := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, loc)
	endOfDay := startOfDay.Add(24 * time.Hour)

	schedules, err := s.scheduleRepo.GetAll(ctx, userID, true, startOfDay.Format(time.RFC3339), endOfDay.Format(time.RFC3339))
	if err != nil {
		return nil, err
	}

	var (
		scheduleResponses = make([]models.ScheduleResponse, len(schedules))
		statResponse      models.StatsResponse
	)
	for i, sch := range schedules {
		switch sch.Status {
		case models.StatusScheduled:
			statResponse.Upcoming++
		case models.StatusCompleted:
			statResponse.Completed++
		case models.StatusCancelled:
			statResponse.Missed++
		}

		scheduleResponses[i] = sch.ToScheduleResponse()
	}

	return &models.ListScheduleResponse{
		Stats:     statResponse,
		Schedules: scheduleResponses,
	}, nil
}

func (s *service) GetAllSchedules(ctx context.Context, userID int64) (*models.ListScheduleResponse, error) {
	schedules, err := s.scheduleRepo.GetAll(ctx, userID, false, "", "")
	if err != nil {
		return nil, err
	}

	scheduleResponses := make([]models.ScheduleResponse, len(schedules))
	for i, sch := range schedules {
		scheduleResponses[i] = sch.ToScheduleResponse()
	}

	return &models.ListScheduleResponse{
		Stats:     models.StatsResponse{},
		Schedules: scheduleResponses,
	}, nil
}

func (s *service) GetScheduleDetails(ctx context.Context, userID, scheduleID int64) (*models.ScheduleResponse, error) {
	sch, err := s.scheduleRepo.GetByID(ctx, scheduleID, userID)
	if err != nil {
		return nil, err
	}

	tasks, err := s.taskRepo.GetAll(ctx, scheduleID)
	if err != nil {
		return nil, err
	}

	return sch.ToScheduleDetailResponse(tasks), nil
}

func (s *service) ClockIn(ctx context.Context, userID, scheduleID int64, req *models.ClockInOutRequest) (*models.ClockInResponse, error) {
	var (
		complianceFlags []string
		complianceNotes sql.NullString
	)
	sch, err := s.scheduleRepo.GetByID(ctx, scheduleID, userID)
	if err != nil {
		return nil, models.ErrScheduleNotFound
	}

	if sch.ClockInTime.Valid {
		return nil, models.ErrVisitAlreadyStarted
	}

	if err = s.validateClockInTime(s.cfg, sch, *req.Timestamp); err != nil {
		return nil, err
	}

	compliance := s.validateLocationCompliance(s.cfg, sch, req.Latitude, req.Longitude)
	if compliance.Flags == models.ComplianceLocationError {
		return nil, models.ErrLocationTooFar
	}

	if compliance.Flags != "" {
		complianceFlags = []string{compliance.Flags}
	}
	if compliance.Notes != "" {
		complianceNotes = sql.NullString{
			String: compliance.Notes,
			Valid:  true,
		}
	}

	clockInData := models.Schedule{
		ID:     scheduleID,
		UserID: userID,
		ClockInTime: sql.NullTime{
			Time:  *req.Timestamp,
			Valid: true,
		},
		ClockInLatitude: sql.NullFloat64{
			Float64: req.Latitude,
			Valid:   true,
		},
		ClockInLongitude: sql.NullFloat64{
			Float64: req.Longitude,
			Valid:   true,
		},
		Status:          models.StatusInProgress,
		ComplianceFlags: pq.StringArray(complianceFlags),
		ValidationNotes: complianceNotes,
	}

	err = s.scheduleRepo.UpdateClockIn(ctx, clockInData)
	if err != nil {
		return nil, err
	}

	response := &models.ClockInResponse{
		ClockInTime:    *req.Timestamp,
		CanProceed:     true,
		WarningMessage: compliance.WarningMessage,
	}

	return response, nil
}

func (s *service) ClockOut(ctx context.Context, userID, scheduleID int64, req *models.ClockInOutRequest) (*models.ClockOutResponse, error) {
	sch, err := s.scheduleRepo.GetByID(ctx, scheduleID, userID)
	if err != nil {
		return nil, models.ErrScheduleNotFound
	}

	if !sch.ClockInTime.Valid {
		return nil, models.ErrVisitNotStarted
	}

	if sch.ClockOutTime.Valid {
		return nil, models.ErrVisitAlreadyEnded
	}

	visitDuration := req.Timestamp.Sub(sch.ClockInTime.Time)
	if visitDuration*time.Second < s.cfg.MinVisitDurationSeconds*time.Second {
		return nil, models.ErrClockOutTooEarly
	}

	clockOutData := models.Schedule{
		ID:     scheduleID,
		UserID: userID,
		ClockOutTime: sql.NullTime{
			Time:  *req.Timestamp,
			Valid: true,
		},
		ClockOutLatitude: sql.NullFloat64{
			Float64: req.Latitude,
			Valid:   true,
		},
		ClockOutLongitude: sql.NullFloat64{
			Float64: req.Longitude,
			Valid:   true,
		},
		Status: models.StatusCompleted,
	}

	err = s.scheduleRepo.UpdateClockOut(ctx, clockOutData)
	if err != nil {
		return nil, fmt.Errorf("failed to update clock-out: %w", err)
	}

	return &models.ClockOutResponse{
		ClockInTime:   sch.ClockInTime.Time,
		ClockOutTime:  *req.Timestamp,
		TotalDuration: helpers.FormatDuration(visitDuration),
		Date:          helpers.FormatShiftDate(sch.StartTime),
	}, nil
}

func (s *service) validateClockInTime(cfg config.ServiceConfig, sch *models.Schedule, clockInTime time.Time) error {
	shiftStart := sch.StartTime
	shiftEnd := sch.EndTime

	if clockInTime.Before(shiftStart.Add(-cfg.MaxEarlyClockInSeconds * time.Second)) {
		return models.ErrClockInTooEarly
	}

	if clockInTime.After(shiftEnd.Add(cfg.MaxLateClockInSeconds * time.Second)) {
		return models.ErrClockInTooLate
	}

	return nil
}

func (s *service) validateLocationCompliance(cfg config.ServiceConfig, sch *models.Schedule, lat, lng float64) models.ComplianceResult {
	distanceMeters := helpers.CalculateDistance(
		sch.Latitude, sch.Longitude,
		lat, lng,
	)

	if distanceMeters > cfg.MaxDistanceError {
		return models.ComplianceResult{
			Flags:          models.ComplianceLocationError,
			Notes:          fmt.Sprintf("Distance from scheduled location: %.0fm (exceeds %.0fm limit)", distanceMeters, cfg.MaxDistanceError),
			WarningMessage: fmt.Sprintf("You are %.0fm away from the scheduled location", distanceMeters),
		}
	}

	if distanceMeters > cfg.MaxDistanceWarning {
		return models.ComplianceResult{
			Flags:          models.ComplianceLocationWarn,
			Notes:          fmt.Sprintf("Distance from scheduled location: %.0fm (warning threshold)", distanceMeters),
			WarningMessage: fmt.Sprintf("You are %.0fm away from the scheduled location", distanceMeters),
		}
	}

	return models.ComplianceResult{}
}
