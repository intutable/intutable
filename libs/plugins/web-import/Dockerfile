FROM postgres:13-alpine as postgres

ENV POSTGRES_USER admin
ENV POSTGRES_PASSWORD admin
ENV POSTGRES_DB db

EXPOSE 5432

COPY ./init.sql /docker-entrypoint-initdb.d/

FROM node:lts-alpine as node

ENV CI true

WORKDIR /app
COPY . .

CMD ["/bin/sh", "./tests/wait_for_db.sh"]
