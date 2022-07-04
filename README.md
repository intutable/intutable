# Intutable

## Description

NodeJS table based management and data wrangling tool.

Built on [Intutable Core](https://gitlab.com/intutable/core/).

## Installation

1. Clone the repo
2. `cd dekanat-app`
3. `npm install`
4.  - Dev mode: `npm run dev`
    - Prod mode: `npm run start`

**Note**: This App is dockerized.

## Documentation

N.N. Source is too unstable and rapidly changing for that to make sense. You'll have
to find out the hard way.

## [Semver](https://semver.org) for Non-API Designs

Given **x**.**y**.**z** (MAJOR.MINOR.PATCH):

-   **x** -> resdesigns of UI/X; backwards incompatible changes of e.g. export/import algorithms, routines, features related to user data and stuff like that
-   **y** -> new but backwards compatible features (starting at e.g. changing a button or adding one); code changes without visual effect to the user (e.g. performance improvments, cleaning code or rewriting code etc.)
-   **z** -> backwards comptabile bug fixes

**Note**: Prerelease like Alphas and Betas must conform [semver specifications](https://semver.org/#spec-item-11).
