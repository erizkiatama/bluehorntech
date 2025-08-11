package models

import (
	"database/sql"
	"time"
)

type Task struct {
	ID          int64          `json:"id" db:"id"`
	ScheduleID  int64          `json:"schedule_id" db:"schedule_id"`
	Name        string         `json:"name" db:"name"`
	Description sql.NullString `json:"description,omitempty" db:"description"`
	Status      string         `json:"status" db:"status"`
	Reason      sql.NullString `json:"reason,omitempty" db:"reason"`
	CompletedAt sql.NullTime   `json:"completed_at,omitempty" db:"completed_at"`
	CreatedAt   time.Time      `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at" db:"updated_at"`
}

func (t *Task) ToTaskResponse() TaskResponse {
	return TaskResponse{
		ID:          t.ID,
		ScheduleID:  t.ScheduleID,
		Name:        t.Name,
		Description: t.Description.String,
		Status:      t.Status,
		Reason:      t.Reason.String,
		CompletedAt: t.CompletedAt.Time,
	}
}

const (
	TaskStatusPending      = "pending"
	TaskStatusCompleted    = "completed"
	TaskStatusNotCompleted = "not completed"
)

func (t *Task) IsPending() bool {
	return t.Status == TaskStatusPending
}

func (t *Task) IsCompleted() bool {
	return t.Status == TaskStatusCompleted
}

func (t *Task) IsNotCompleted() bool {
	return t.Status == TaskStatusNotCompleted
}

func (t *Task) CanUpdate() bool {
	return t.Status == TaskStatusPending
}

func (t *Task) RequiresReason() bool {
	return t.Status == TaskStatusNotCompleted
}

func IsValidTaskStatus(status string) bool {
	switch status {
	case TaskStatusPending, TaskStatusCompleted, TaskStatusNotCompleted:
		return true
	default:
		return false
	}
}
