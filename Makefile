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
		--build-arg TWITTER_API_KEY=${TWITTER_API_KEY} \
		--build-arg TWITTER_API_SECRET=${TWITTER_API_SECRET} \
		--build-arg TWITTER_ACCESS_TOKEN_KEY=${TWITTER_ACCESS_TOKEN_KEY} \
		--build-arg TWITTER_ACCESS_TOKEN_SECRET=${TWITTER_ACCESS_TOKEN_SECRET} \
		-t ${TAG} .

docker-login:
	docker login registry.evix.io -u ${DOCKER_REGISTRY_USER} -p "${DOCKER_REGISTRY_PASS}"

push:
	docker push ${TAG}

deploy:
	ssh ${DEPLOY_USER}@${DEPLOY_HOST} "mkdir -p ${DEPLOY_PATH}"
	scp ${DOCKER_COMPOSE} ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/docker-compose.yml
	ssh ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${DEPLOY_PATH}; docker-compose pull"
	ssh ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${DEPLOY_PATH}; docker-compose up -d"
