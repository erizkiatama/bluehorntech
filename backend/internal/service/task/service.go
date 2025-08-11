package task

import (
	"context"
	"database/sql"
	"github.com/erizkiatama/bluehorntech/internal/models"
	"github.com/erizkiatama/bluehorntech/internal/repository/schedule"
	"github.com/erizkiatama/bluehorntech/internal/repository/task"
	"time"
)

type Service interface {
	UpdateTask(ctx context.Context, userID, taskID int64, req *models.UpdateTaskRequest) (*models.TaskResponse, error)
}

type service struct {
	taskRepo     task.Repository
	scheduleRepo schedule.Repository
}

func New(taskRepo task.Repository, scheduleRepo schedule.Repository) Service {
	return &service{taskRepo: taskRepo, scheduleRepo: scheduleRepo}
}

// UpdateTask handles the business logic for updating a task
func (s *service) UpdateTask(ctx context.Context, userID, taskID int64, req *models.UpdateTaskRequest) (*models.TaskResponse, error) {
	tsk, err := s.taskRepo.GetByID(ctx, taskID)
	if err != nil {
		return nil, models.ErrTaskNotFound
	}

	sch, err := s.scheduleRepo.GetByID(ctx, tsk.ScheduleID, userID)
	if err != nil {
		return nil, models.ErrScheduleNotFound
	}

	if sch.Status != models.StatusInProgress {
		return nil, models.ErrVisitNotInProgress
	}

	if tsk.Status != models.TaskStatusPending {
		return nil, models.ErrTaskAlreadyUpdated
	}

	updateData := &models.Task{
		ID:     taskID,
		Status: req.Status,
	}

	// Set completion time only for completed tasks
	// set reason only for non completed tasks
	if req.Status == models.TaskStatusCompleted {
		updateData.CompletedAt = sql.NullTime{
			Time:  time.Now().UTC(),
			Valid: true,
		}
	} else if req.Status == models.TaskStatusNotCompleted {
		updateData.Reason = sql.NullString{
			String: req.Reason,
			Valid:  true,
		}
	}

	err = s.taskRepo.UpdateTask(ctx, updateData)
	if err != nil {
		return nil, err
	}

	response := &models.TaskResponse{
		ID:          taskID,
		Status:      req.Status,
		Reason:      req.Reason,
		CompletedAt: updateData.CompletedAt.Time.Format(time.TimeOnly),
	}

	return response, nil
}
