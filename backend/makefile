# Database configuration
DB_HOST ?= localhost
DB_PORT ?= 5432
DB_USER ?= postgres
DB_PASSWORD ?= password
DB_NAME ?= bluehorntech
DB_URL ?= postgres://$(DB_USER):$(DB_PASSWORD)@$(DB_HOST):$(DB_PORT)/$(DB_NAME)?sslmode=disable

# Migration path
MIGRATION_PATH = ./migrations

# Default target
.PHONY: help
help:
	@echo "Database Migration Commands:"
	@echo ""
	@echo "  make migrate-up         - Run all pending migrations"
	@echo "  make migrate-down       - Rollback one migration"
	@echo "  make migrate-reset      - Drop all tables and re-run migrations"
	@echo "  make migrate-force version=n  - Force migration version (use with caution)"
	@echo "  make migrate-version    - Show current migration version"
	@echo "  make migrate-create name=name - Create new migration files"
	@echo ""
	@echo "Examples:"
	@echo "  make migrate-create name=add_user_table"
	@echo "  make migrate-force version=4"

# Migration commands
.PHONY: migrate-up
migrate-up:
	@echo "Running migrations..."
	migrate -path $(MIGRATION_PATH) -database "$(DB_URL)" up

.PHONY: migrate-down
migrate-down:
	@echo "Rolling back one migration..."
	migrate -path $(MIGRATION_PATH) -database "$(DB_URL)" down 1

.PHONY: migrate-reset
migrate-reset:
	@echo "⚠️  WARNING: This will drop ALL tables!"
	@echo "Press Ctrl+C to cancel, or Enter to continue..."
	@read
	@echo "Dropping all tables..."
	migrate -path $(MIGRATION_PATH) -database "$(DB_URL)" drop -f
	@echo "Running all migrations..."
	migrate -path $(MIGRATION_PATH) -database "$(DB_URL)" up

.PHONY: migrate-force
migrate-force:
	@if [ -z "$(version)" ]; then \
		echo "❌ Error: Version required"; \
		echo "Usage: make migrate-force version=<version>"; \
		echo "Example: make migrate-force version=4"; \
		exit 1; \
	fi
	@echo "Forcing migration version to $(version)..."
	migrate -path $(MIGRATION_PATH) -database "$(DB_URL)" force $(version)

.PHONY: migrate-version
migrate-version:
	@echo "Current migration version:"
	@migrate -path $(MIGRATION_PATH) -database "$(DB_URL)" version

.PHONY: migrate-create
migrate-create:
	@if [ -z "$(name)" ]; then \
		echo "❌ Error: Migration name required"; \
		echo "Usage: make migrate-create name=<migration_name>"; \
		echo "Example: make migrate-create name=add_user_table"; \
		exit 1; \
	fi
	@echo "Creating migration: $(name)"
	@migrate create -ext sql -dir $(MIGRATION_PATH) $(name)
	@echo "✅ Created migration files:"
	@ls -la $(MIGRATION_PATH)/*$(name)*

# Status and info commands
.PHONY: migrate-status
migrate-status:
	@echo "Migration Status:"
	@echo "Database URL: $(DB_URL)"
	@echo "Migration Path: $(MIGRATION_PATH)"
	@echo ""
	@echo "Current Version:"
	@migrate -path $(MIGRATION_PATH) -database "$(DB_URL)" version 2>/dev/null || echo "No migrations applied yet"
	@echo ""
	@echo "Available Migrations:"
	@ls -1 $(MIGRATION_PATH)/*.sql 2>/dev/null | head -10 || echo "No migration files found"

.PHONY: migrate-validate
migrate-validate:
	@echo "Validating migrations..."
	@if [ ! -d "$(MIGRATION_PATH)" ]; then \
		echo "❌ Migration directory not found: $(MIGRATION_PATH)"; \
		exit 1; \
	fi
	@migration_count=$$(ls -1 $(MIGRATION_PATH)/*.up.sql 2>/dev/null | wc -l); \
	if [ $$migration_count -eq 0 ]; then \
		echo "❌ No migration files found in $(MIGRATION_PATH)"; \
		exit 1; \
	fi
	@echo "✅ Found $$migration_count migration(s)"
	@echo "✅ Migration directory structure looks good"