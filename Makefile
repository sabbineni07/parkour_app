.PHONY: help build up down restart logs shell clean dev-build dev-up dev-down dev-logs

# Default target
help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Production targets
build: ## Build the production Docker image
	docker compose build

up: ## Start the production container
	docker compose up -d

down: ## Stop the production container
	docker compose down

restart: ## Restart the production container
	docker compose restart

logs: ## Show production container logs
	docker compose logs -f parkour-frontend

shell: ## Open shell in production container
	docker compose exec parkour-frontend sh

# Development targets
dev-build: ## Build the development Docker image
	docker compose -f docker-compose.dev.yml build

dev-up: ## Start the development container
	docker compose -f docker-compose.dev.yml up -d

dev-down: ## Stop the development container
	docker compose -f docker-compose.dev.yml down

dev-logs: ## Show development container logs
	docker compose -f docker-compose.dev.yml logs -f parkour-frontend-dev

dev-shell: ## Open shell in development container
	docker compose -f docker-compose.dev.yml exec parkour-frontend-dev sh

# Utility targets
clean: ## Remove containers, volumes, and images
	docker compose down -v
	docker compose -f docker-compose.dev.yml down -v
	docker rmi parkour-parkour-frontend parkour-parkour-frontend-dev 2>/dev/null || true

clean-all: clean ## Remove all Docker artifacts including images
	docker system prune -a -f

install: ## Install npm dependencies locally
	npm install

start: ## Start Angular dev server locally
	npm start

build-local: ## Build Angular app locally
	npm run build

# Combined targets
dev: dev-build dev-up ## Build and start development environment
	@echo "Development server starting at http://localhost:4200"
	@echo "View logs with: make dev-logs"

prod: build up ## Build and start production environment
	@echo "Production server starting at http://localhost:4200"
	@echo "View logs with: make logs"

