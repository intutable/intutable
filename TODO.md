# TODO Monorepo / GitHub Migration

(Only leftovers.)

## Monorepo stuff

-   [x] fix prettier and eslint
-   [ ] fix jest
-   [ ] add `turborepo`
-   [ ] revise npm package.json configs

## GitHub Migration

-   [ ] add CIs

## Infrastructure

-   [ ] Docker
    -   [ ] Frontend
    -   [ ] Backend
    -   [x] Database
    -   [ ] Nginx
    -   [x] pgAdmin
    -   [ ] Docs
-   [ ] add code coverage
-   [ ] write docs in mdBook
-   [ ] add Swagger for API documentation
-   [ ] add SuperTest for API testing
-   [ ] add Cypress for frontend e2e tests
-   [ ] add READMEs, Badges, Licenses, etc.
-   [ ] add Winston for logging
-   [ ] add Depend-a-bot
-   add Husky with
    -   git hooks for
        -   [x] linting
        -   [ ] prettier (in progress)
        -   [ ] testing ?
        -   [ ] building ?
        -   [ ] test coverage warnings ?
    -   commitlint
        -   [x] local commit message linting
        -   [ ] remote (CI) commit message linting (see [here](https://commitlint.js.org/#/guides-ci-setup?id=github-actions))

## Housekeeping

-   [ ] write more and better tests
-   [ ] update dependencies
-   [ ] reset versions to 1.0.0

## Future Code Refactoring / Bug Fixing related to this migration

(The following issues originate from the monorepo creation / github migration. In order to get the app running again, these tasks should be resolved soon. )

-   [ ] dissolve `dekanat-app-plugin`
-   [ ] dissolve `shared`
-   [ ] many `@ts-ignore` flags had to be set in order to compile, fix them
-   [ ] a lot of plugins make use of the any-type, annotate them correctly
-   [ ] A part of the frontend (the API) imports half of the backend, this leads to errors
    -   [ ] migrate the NEXT.js API Routes using API to the backend
