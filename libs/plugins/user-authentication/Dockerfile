FROM postgres:13-alpine as postgres

ENV POSTGRES_USER admin
ENV POSTGRES_PASSWORD admin
ENV POSTGRES_DB db

EXPOSE 5432

COPY ./init.sql /docker-entrypoint-initdb.d/

FROM node:latest as node

ENV CI true

WORKDIR /app
COPY . .
RUN npm run build

CMD ["/bin/bash", "./tests/waitthentest.sh"]
