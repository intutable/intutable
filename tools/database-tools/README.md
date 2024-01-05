# database-tools

This directory contains tools for managing the database.

## ´init.sql´

Our database schema.

## Migrations Scripts

-   [ ] add migrations scripts!

## Docker

A Dockerfile for correctly building the postgres image.

## pgAdmin

[pgAdmin](https://www.pgadmin.org) is a useful tool for a more convenient way of inspecting and managing your SQL database. We typically use it to inspect the database of our development environment. You can install and run it independently, but we recommend using Docker.

The credentials (email/password) can be found in the `docker-compose.yml` file in the root of this repository.

Once started, you need to add a database connection. The host name is the docker service name of the postgres container found in the same `docker-compose.yml` file.

Read more about it [here](https://www.pgadmin.org).
