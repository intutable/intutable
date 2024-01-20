# Installation 🔧

### Option 1: Node.js

The unpretentious way is to install and use Node.js and NPM globally on your local machine. We recommend using [nvm](https://github.com/nvm-sh/nvm). This tool helps you to manage multiple Node.js versions simultaneously on your machine and prevents version conflicts. You can install it by following the instructions on their GitHub page.

Make sure to pick the right Node.js and NPM version. The currently required versions can be found in the [`package.json`](./package.json) file in `engines`. These settings further more enforce the correct versions when working with this project.

### Option 2: Docker 🐳

Nonetheless, we highly advise you to use Docker. This is the most comfortable and harmless way to get all services up and running. You can find more information about how to install Docker and Docker Compose [here](https://docs.docker.com/get-docker/). Despite this, some of our services are only available in Docker (e.g. the database). Make sure to consult our docs for further information about how to use Docker with this project.

## Building & Starting the Application 🏗️

If you are not using Docker, you will have to manually build and start each application. The intutable monorepo contains more than one standalone application as well as many internal libraries, tools and services. Most of them need to be built and started in a different way.

If you want to learn more about this, please consult our …

### Required Services

The database container must be running before you can start the backend. You can start it with `docker-compose up -d dekanat-database` or with [Docker Desktop](https://www.docker.com/products/docker-desktop/).

### For the backend

1. Build the backend application with all of its plugins and libraries with one command: `npm run build -w @intutable-org/backend`.
1. Then start the backend with `npm run start -w @intutable-org/backend`.

### For the frontend

1. `npm run build -w intutable-ui` will build the frontend application.
2. `npm run start -w intutable-ui` will start the frontend application.