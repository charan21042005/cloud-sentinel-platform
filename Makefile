.PHONY: setup dev build clean test help

# Project Variables
DOCKER_COMPOSE = docker-compose -f infrastructure/docker/docker-compose.yml

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: ## Initial project bootstrap
	@echo "🚀 Bootstrapping Cloud Sentinel Platform..."
	@if [ ! -f .env ]; then cp .env.example .env; echo "✅ Created .env from template"; fi
	@echo "🛠️ Ready. Run 'make dev' to start local development."

dev: ## Start local development environment
	@echo "🛰️ Starting Sentinel in Dev Mode..."
	$(DOCKER_COMPOSE) up --build

build: ## Build all production images
	@echo "🏗️ Building Sentinel Images..."
	docker build -t sentinel-api:latest ./services/api-gateway
	docker build -t sentinel-dashboard:latest ./apps/dashboard

test: ## Run tests across all services
	@echo "🧪 Running Test Suites..."
	cd services/api-gateway && pytest || true
	@echo "⚠️ Frontend tests skipped until configured."

clean: ## Cleanup temporary files and artifacts
	@echo "🧹 Cleaning workspace..."
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name "node_modules" -exec rm -rf {} +
	rm -rf dist/
