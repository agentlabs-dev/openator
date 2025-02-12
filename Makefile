.PHONY: build up down restart logs

build:
	docker-compose build

watch:
	docker-compose up

up:
	docker-compose up

upd:
	docker-compose up -d

dev-up:
	docker-compose -f docker-compose.dev.yml up --build --force-recreate

dev-upd:
	docker-compose -f docker-compose.dev.yml up --build --force-recreate -d

down:
	docker-compose down

re: build watch

logs:
	docker-compose logs -f

logs-playwright:
	docker-compose logs -f playwright

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

prune-all:
	docker system prune -a --volumes