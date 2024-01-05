FROM postgres:13-alpine

# .sql and .sh files in /docker-entrypoint-initdb.d/ will be executed once
COPY init.sql /docker-entrypoint-initdb.d/
