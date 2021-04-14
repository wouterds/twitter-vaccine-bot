PWD = $(shell pwd)

DOCKER_COMPOSE = ./docker-compose.yml
DOCKERFILE = ./Dockerfile

TAG = registry.evix.io/twitter-vaccine-bot

all: build

clean:
	-rm -rf node_modules
	-rm -rf .env

node_modules: yarn.lock
	docker run --rm -v ${PWD}:/code -w /code node:14-alpine yarn --pure-lockfile

build: ${DOCKERFILE}
	docker build -f ${DOCKERFILE} \
		--build-arg PORT=${PORT} \
		--build-arg APP_HOST=${APP_HOST} \
		--build-arg API_HOST=${API_HOST} \
		-t ${TAG} .

docker-login:
	docker login -u ${DOCKER_REGISTRY_USER} -p "${DOCKER_REGISTRY_PASS}"

push:
	docker push ${TAG}

deploy:
	ssh ${DEPLOY_USER}@${DEPLOY_HOST} "mkdir -p ${DEPLOY_PATH}"
	scp ${DOCKER_COMPOSE} ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/docker-compose.yml
	ssh ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${DEPLOY_PATH}; docker-compose pull"
	ssh ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${DEPLOY_PATH}; docker-compose up -d"
