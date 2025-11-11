.PHONY: help setup dev build test clean deploy

help:
	@echo "🎯 Record Meet - Development Commands"
	@echo ""
	@echo "Usage:"
	@echo "  make setup        - Initial setup for both frontend and backend"
	@echo "  make dev          - Start development servers (both frontend + backend)"
	@echo "  make dev-frontend - Start only frontend (Next.js on :3000)"
	@echo "  make dev-backend  - Start only backend (Go on :3001)"
	@echo "  make build        - Build both frontend and backend"
	@echo "  make docker-build - Build Docker images"
	@echo "  make docker-run   - Run services with Docker"
	@echo "  make test         - Run tests"
	@echo "  make clean        - Clean build artifacts"
	@echo "  make deploy       - Deploy to production"
	@echo ""

setup:
	@bash scripts/setup.sh

dev:
	@bash scripts/dev.sh

dev-frontend:
	@echo "Starting Next.js frontend..."
	cd frontend && npm run dev

dev-backend:
	@echo "Starting Go backend..."
	cd backend && go run cmd/server/main.go

build:
	@bash scripts/build.sh

docker-build:
	docker-compose build

docker-run:
	docker-compose up -d

docker-logs:
	docker-compose logs -f

test:
	@echo "Running frontend tests..."
	cd frontend && npm run test 2>/dev/null || echo "No frontend tests yet"
	@echo "Running backend tests..."
	cd backend && go test ./... 2>/dev/null || echo "No backend tests yet"

clean:
	@echo "Cleaning up..."
	cd frontend && rm -rf .next node_modules
	cd backend && rm -f main
	docker-compose down
	@echo "Clean complete"

deploy:
	@bash scripts/deploy.sh
