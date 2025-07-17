compose_file_prod = ./docker-compose.deploy.yml
compose_file_dev  = ./docker-compose.dev.yml
compose_file_test  = ./docker-compose.test.yml

all: test

dev: build_dev up_dev

test: build_test up_test

build_test:
	docker compose -f $(compose_file_test) build

up_test:
	docker compose -f $(compose_file_test) up

compile:
	docker compose -f $(compose_file_prod) build

deploy:
	docker compose -f $(compose_file_prod) up

build_dev:
	docker compose -f $(compose_file_dev) build

up_dev:
	docker compose -f $(compose_file_dev) up

stop:
	docker compose -f $(compose_file_prod) stop
	docker compose -f $(compose_file_dev) stop
	docker compose -f $(compose_file_test) stop

clean down: stop
	docker compose -f $(compose_file_prod) down
	docker compose -f $(compose_file_dev) down
	docker compose -f $(compose_file_test) down

fclean purge: stop
	docker compose -f $(compose_file_prod) down --volumes
	docker compose -f $(compose_file_dev) down --volumes
	docker compose -f $(compose_file_test) down --volumes
	docker system prune --all --force --volumes

re: stop down all

re_dev: stop build_dev up_dev

.PHONY: build up stop down re purge fclean clean debug re_dev build_dev up_dev up_test build_test