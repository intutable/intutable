# Overview

A database editor for the MathInf Dekanat of Heidelberg University. Currently
consists of a next.js web-app as a front-end and an
[IntuTable back-end](https://gitlab.com/intutable/core/) which communicate via
a REST API.

# Installation

1. Clone the repo
2. `cd dekanat-app`
3. `npm install`
5.  - For dev mode:
        - `npm run reset-db`
        - `npm run dev`
    - To build and start production build:
        - `npm run build`
        - `npm run start`

# Documentation

Source is too unstable and rapidly changing for that to make sense. You'll have
to find out the hard way.

# Conventions & Commit Guidelines

-   We have decided to use types over interfaces. There is no reason for this and since we are not developing an api this choice is totally valid.
-   Use arrow functions and closures over conventional js functions.
-   Do not make default exports. Also provide an index export file for each folder whenever possible.
-   Make use of eslint and prettier as much as you can. Before committing you should let run the npm ci script (`npm run ci`) at least once (otherwise you will suffer a bad surprise when the gitlab ci runs).
-   Fix ALL errors the CI logged before merging. Warnings are optional (try using eslint fix, this will handle many of them).
-   Use the latest standards and conventions of esnext.
