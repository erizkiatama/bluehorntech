package main

import (
	"log"

	"github.com/erizkiatama/bluehorntech/config"
	"github.com/erizkiatama/bluehorntech/internal/app"
)

func main() {
	log.Println("Starting server...")

	if err := config.Load(); err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}
	cfg := config.Get()

	application, err := app.New(cfg)
	if err != nil {
		log.Fatalf("Failed to initialize application: %v", err)
	}
	defer func() {
		_ = application.Close()
	}()

	log.Printf("Server starting on %s:%s", cfg.Server.Host, cfg.Server.Port)
	if err := application.Run(); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
