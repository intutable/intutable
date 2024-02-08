# Core / Plugin Architecture


## Core

`core` is a library and the central piece of our backend application. In short, it is a plugin manager that allows to build a plugin architecture upon it. Additionally, it provides core functionalities such as logging, http access etc.

It only contains a few files, all properly documented. Make sure to read them in order to understand how to work with core and plugins.

## Plugin Architecture

Around this core, we build a plugin architecture. Each plugin is a separate npm workspace package.

If you want to create a new plugin:

1. Create a new workspace package in `/libs/plugins`
2. Add this package as a dependency to `/apps/backend/package.json`
3. Add the path to this package to `/apps/backend/tsconfig.json`
4. Implement the plugin initialization interface in `/libs/plugin/YOUR_PLUGIN/src/index.ts` 

Done. It will automatically be loaded once installed via `npm i`. Finally, run `npm build -w @inutable/backend && npm start -w @inutable/backend` to start the backend with the new plugin.