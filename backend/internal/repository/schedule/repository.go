package schedule

import (
	"context"
	"fmt"
	"github.com/erizkiatama/bluehorntech/internal/models"
	"github.com/jmoiron/sqlx"
	"time"
)

type Repository interface {
	GetAll(ctx context.Context, userID int64, isToday bool) ([]models.Schedule, error)
	GetByID(ctx context.Context, scheduleID, userID int64) (*models.Schedule, error)
	UpdateClockIn(ctx context.Context, req models.Schedule) error
	UpdateClockOut(ctx context.Context, req models.Schedule) error
}

type repository struct {
	db *sqlx.DB
}

func New(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// GetAll TODO: Implement proper query options for where clause and proper pagination using LIMIT & OFFSET
func (r *repository) GetAll(ctx context.Context, userID int64, isToday bool) ([]models.Schedule, error) {
	query := `
		SELECT id, user_id, client_name, service_name, service_notes, location, start_time, end_time,
			latitude, longitude, status, clock_in_time, clock_out_time, clock_in_latitude, clock_out_latitude,
			clock_in_longitude, clock_out_longitude FROM schedules WHERE user_id = ?`

	if isToday {
		query += " AND DATE(start_time) = CURRENT_DATE"
	}
	query += " ORDER BY start_time ASC"

	var schedules []models.Schedule
	stmt, err := r.db.PreparexContext(ctx, r.db.Rebind(query))
	if err != nil {
		return nil, fmt.Errorf("failed to prepare get schedules statement: %w", err)
	}
	defer func() {
		_ = stmt.Close()
	}()

	err = stmt.SelectContext(ctx, &schedules, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get schedules: %w", err)
	}

	return schedules, nil
}

func (r *repository) GetByID(ctx context.Context, scheduleID, userID int64) (*models.Schedule, error) {
	query := `
		SELECT id, user_id, client_name, service_name, service_notes, location, start_time, end_time,
			latitude, longitude, status, clock_in_time, clock_out_time, clock_in_latitude, clock_out_latitude,
			clock_in_longitude, clock_out_longitude FROM schedules WHERE user_id = ? AND id = ?`

	var schedule models.Schedule
	stmt, err := r.db.PreparexContext(ctx, r.db.Rebind(query))
	if err != nil {
		return nil, fmt.Errorf("failed to prepare get schedule by id statement: %w", err)
	}
	defer func() {
		_ = stmt.Close()
	}()

	err = stmt.GetContext(ctx, &schedule, userID, scheduleID)
	if err != nil {
		return nil, fmt.Errorf("failed to get schedule by id: %w", err)
	}

	return &schedule, nil
}

func (r *repository) UpdateClockIn(ctx context.Context, req models.Schedule) error {
	query := `
		UPDATE schedules 
		SET 
			clock_in_time = ?,
			clock_in_latitude = ?,
			clock_in_longitude = ?,
			status = ?,
			compliance_flags = ?,
			validation_notes = ?,
			updated_at = ?
		WHERE id = ?`

	stmt, err := r.db.PreparexContext(ctx, r.db.Rebind(query))
	if err != nil {
		return fmt.Errorf("failed to prepare update clock in statement: %w", err)
	}
	defer func() {
		_ = stmt.Close()
	}()

	_, err = stmt.ExecContext(ctx,
		req.ClockInTime, req.ClockInLatitude, req.ClockInLongitude, req.Status,
		req.ComplianceFlags, req.ValidationNotes, time.Now().UTC(), req.ID,
	)
	if err != nil {
		return fmt.Errorf("failed to update clock in: %w", err)
	}

	return nil
}

func (r *repository) UpdateClockOut(ctx context.Context, req models.Schedule) error {
	query := `
		UPDATE schedules 
		SET 
			clock_out_time = ?,
			clock_out_latitude = ?,
			clock_out_longitude = ?,
			status = ?,
			updated_at = ?
		WHERE id = ? AND clock_in_time IS NOT NULL`

	stmt, err := r.db.PreparexContext(ctx, r.db.Rebind(query))
	if err != nil {
		return fmt.Errorf("failed to prepare update clock out statement: %w", err)
	}
	defer func() {
		_ = stmt.Close()
	}()

	_, err = stmt.ExecContext(ctx,
		req.ClockOutTime, req.ClockOutLatitude, req.ClockOutLongitude, req.Status, time.Now().UTC(), req.ID,
	)
	if err != nil {
		return fmt.Errorf("failed to update clock out: %w", err)
	}

	return nil
}
