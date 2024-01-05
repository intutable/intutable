# Intutable

[![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Open Source Love svg1](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/intutable)

<!-- [![GitLab latest release](https://badgen.net/gitlab/release/NickBusey/HomelabOS/)](https://github.com/intutable/intutable/-/releases) -->

> **Read our docs!** 📖💡 (See below.)

This is the monorepo for the Intutable project: A full stack application with a dedicated web interface and a plugin-based backend architecture for the [Faculty of Mathematics and Computer Science](https://www.mathinf.uni-heidelberg.de/en) at [Heidelberg University](https://www.uni-heidelberg.de/en). It is developed to be used by the administration of the faculty for management and organization purposes.

## 🔧 Installation

First step is to clone this repository. Then you have multiple options to install the project and get it running.

### Node.js

The unpretentious way to get started is to install and use Node.js and NPM. Your next steps are to read the docs and understand how this monorepo is structured and how to start all applications and services.

We recommend using [nvm](https://github.com/nvm-sh/nvm). This little tool helps you to manage multiple Node.js versions simultaneously on your machine and prevents version conflicts. You can install it by following the instructions on their GitHub page.

Make sure to pick the right Node.js and NPM version. The currently required versions can be found in the [`package.json`](./package.json) file in `engines`. These settings further more enforce the correct versions when working with this project.

### 🐳 Docker

Nonetheless, we highly advise you to use Docker. This is the most comfortable and harmless way to get all services up and running. You can find more information about how to install Docker and Docker Compose [here](https://docs.docker.com/get-docker/).

Further more, some of our services are only available in Docker. Make sure to consult our docs for further information about how to use Docker with this project.

## 📖 Docs

> **<u>Read the Docs</u>**: Run `npm run docs:open` within your locally cloned repository to open the docs in your browser.

Please read the docs thoroughly before contributing any changes or opening issues. These contain information not only about the project itself, but also about the development process, tools we use, common questions and problems, first steps etc.

Our documentation is built with [mdBook](https://github.com/rust-lang/mdBook). Make sure to install it in order to build the docs locally and render them inside your browser. Read more about installing mdBook [here](https://rust-lang.github.io/mdBook/guide/installation.html). Alternatively, you can find the same markdown files in [`./docs/`](./docs).

## License

See our license [here](./LICENSE), which applies to this whole monorepository.
