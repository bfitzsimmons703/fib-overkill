.PHONY: dev
dev: build-development start-development

.PHONY: build-development
build-development:
	docker compose -f ./docker/docker-compose.dev.yaml build

.PHONY: start-development
start-development:
	docker compose -f ./docker/docker-compose.dev.yaml up

.PHONY: stop-development
stop-development:
	docker compose -f ./docker/docker-compose.dev.yaml down