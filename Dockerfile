FROM node:14-alpine as builder
WORKDIR /code

COPY ./package.json ./package.json
COPY ./yarn.lock ./yarn.lock
COPY ./index.js ./index.js

RUN yarn --pure-lockfile --production

FROM arm32v7/node:14-alpine
WORKDIR /code

ARG TWITTER_API_KEY
ARG TWITTER_API_SECRET
ARG TWITTER_ACCESS_TOKEN_KEY
ARG TWITTER_ACCESS_TOKEN_SECRET
ENV TWITTER_API_KEY=$TWITTER_API_KEY \
    TWITTER_API_SECRET=$TWITTER_API_SECRET \
    TWITTER_ACCESS_TOKEN_KEY=$TWITTER_ACCESS_TOKEN_KEY \
    TWITTER_ACCESS_TOKEN_SECRET=$TWITTER_ACCESS_TOKEN_SECRET

COPY --from=builder /code /code

CMD [ "node" , "." ]
