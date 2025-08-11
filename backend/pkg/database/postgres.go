package database

import (
	"github.com/erizkiatama/bluehorntech/config"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"log"
)

func New(cfg config.DatabaseConfig) *sqlx.DB {
	db := sqlx.MustConnect("postgres", cfg.URL)
	db.SetMaxOpenConns(cfg.MaxOpenConnection)
	db.SetMaxIdleConns(cfg.MaxIdleConnection)

	// Test the connection
	if err := db.Ping(); err != nil {
		log.Fatalf("failed to ping database: %s", err.Error())
	}

	return db
}
