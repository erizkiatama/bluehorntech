package models

import "errors"

var (
	ErrScheduleNotFound    = errors.New("schedule not found")
	ErrVisitAlreadyStarted = errors.New("visit already started")
	ErrLocationTooFar      = errors.New("location too far from scheduled location")
	ErrClockInTooEarly     = errors.New("cannot clock in more than 15 minutes early")
	ErrClockInTooLate      = errors.New("cannot clock in more than 30 minutes after shift start")
)

var (
	ErrVisitNotStarted   = errors.New("visit not started - cannot clock out")
	ErrVisitAlreadyEnded = errors.New("visit already ended")
	ErrClockOutTooEarly  = errors.New("cannot clock out before minimum visit time")
)

var (
	ErrTaskNotFound       = errors.New("task not found")
	ErrInvalidTaskStatus  = errors.New("invalid task status")
	ErrReasonRequired     = errors.New("reason is required for not completed tasks")
	ErrTaskAlreadyUpdated = errors.New("task already completed or marked as not completed")
	ErrVisitNotInProgress = errors.New("cannot update tasks - visit not in progress")
)
