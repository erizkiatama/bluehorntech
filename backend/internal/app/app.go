package app

import (
	"fmt"
	"github.com/jmoiron/sqlx"

	"github.com/erizkiatama/bluehorntech/config"
	"github.com/erizkiatama/bluehorntech/pkg/database"
	"github.com/gin-gonic/gin"

	_scheduleHandler "github.com/erizkiatama/bluehorntech/internal/handler/schedule"
	_scheduleRepo "github.com/erizkiatama/bluehorntech/internal/repository/schedule"
	_scheduleService "github.com/erizkiatama/bluehorntech/internal/service/schedule"

	_taskHandler "github.com/erizkiatama/bluehorntech/internal/handler/task"
	_taskRepo "github.com/erizkiatama/bluehorntech/internal/repository/task"
	_taskService "github.com/erizkiatama/bluehorntech/internal/service/task"
)

type App struct {
	Config   *config.Config
	DB       *sqlx.DB
	Router   *gin.Engine
	Handlers *Handlers
}

type Handlers struct {
	Schedule *_scheduleHandler.Handler
	Task     *_taskHandler.Handler
}

func New(cfg *config.Config) (*App, error) {
	db := database.New(cfg.Database)

	scheduleRepo := _scheduleRepo.New(db)
	taskRepo := _taskRepo.New(db)

	scheduleSvc := _scheduleService.New(cfg.Service, scheduleRepo, taskRepo)
	taskSvc := _taskService.New(taskRepo, scheduleRepo)

	handlers := &Handlers{
		Schedule: _scheduleHandler.New(scheduleSvc),
		Task:     _taskHandler.New(taskSvc),
	}

	// Setup router
	router := setupRouter(cfg, handlers)

	return &App{
		Config:   cfg,
		DB:       db,
		Router:   router,
		Handlers: handlers,
	}, nil
}

func (a *App) Run() error {
	address := fmt.Sprintf("%s:%s", a.Config.Server.Host, a.Config.Server.Port)
	return a.Router.Run(address)
}

func (a *App) Close() error {
	return a.DB.Close()
}
