package task

import (
	"context"
	"fmt"
	"github.com/erizkiatama/bluehorntech/internal/models"
	"github.com/jmoiron/sqlx"
	"time"
)

type Repository interface {
	GetAll(ctx context.Context, scheduleID int64) ([]models.Task, error)
	GetByID(ctx context.Context, taskID int64) (*models.Task, error)
	UpdateTask(ctx context.Context, data *models.Task) error
}

type repository struct {
	db *sqlx.DB
}

func New(db *sqlx.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetAll(ctx context.Context, scheduleID int64) ([]models.Task, error) {
	query := `
		SELECT id, schedule_id, name, description, status, reason, completed_at
		FROM tasks 
		WHERE schedule_id = ?
		ORDER BY id`

	stmt, err := r.db.PreparexContext(ctx, r.db.Rebind(query))
	if err != nil {
		return nil, fmt.Errorf("failed to prepare get all tasks statement: %w", err)
	}
	defer func() {
		_ = stmt.Close()
	}()

	var tasks []models.Task
	err = stmt.SelectContext(ctx, &tasks, scheduleID)
	if err != nil {
		return nil, fmt.Errorf("failed to get all tasks: %w", err)
	}

	return tasks, nil
}

func (r *repository) GetByID(ctx context.Context, taskID int64) (*models.Task, error) {
	query := `
		SELECT id, schedule_id, name, description, status, reason, completed_at
		FROM tasks 
		WHERE id = ?`

	stmt, err := r.db.PreparexContext(ctx, r.db.Rebind(query))
	if err != nil {
		return nil, fmt.Errorf("failed to prepare get task by id statement: %w", err)
	}
	defer func() {
		_ = stmt.Close()
	}()

	var task models.Task
	err = stmt.GetContext(ctx, &task, taskID)
	if err != nil {
		return nil, fmt.Errorf("failed to get task by id: %w", err)
	}

	return &task, nil
}

func (r *repository) UpdateTask(ctx context.Context, data *models.Task) error {
	query := `
		UPDATE tasks 
		SET 
			status = ?,
			reason = ?,
			completed_at = ?,
			updated_at = ?
		WHERE id = ? AND status = 'pending'`

	stmt, err := r.db.PreparexContext(ctx, r.db.Rebind(query))
	if err != nil {
		return fmt.Errorf("failed to prepare update task statement: %w", err)
	}
	defer func() {
		_ = stmt.Close()
	}()

	_, err = stmt.ExecContext(ctx, data.Status, data.Reason, data.CompletedAt, time.Now().UTC(), data.ID)
	if err != nil {
		return fmt.Errorf("failed to update task: %w", err)
	}

	return nil
}
