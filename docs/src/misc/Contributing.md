# Contributing Guidelines

## Testing

Ideally every piece of code is covered by some test in order to prevent bugs. Even the frontend should have extensive E2E tests.

In reality this is not always practicable. Nevertheless we encourage you to internalize this useful habit. Writing tests might take some time but it will save you a lot of time in the future when bugs occur.

- [Jest](https://jestjs.io) – Plain TypeScript testing 
- [Cypress](https://www.cypress.io) – Frontend E2E testing
- [GitHub Copilot](https://github.com/features/copilot) – Is able to generate tests for you, make sure to check them.

## Documenting

Code is written less often than it is read! Do yourself and others a favor and document your code properly. This is especially important for public APIs and interfaces.

Different code pieces need to be documented in different fashions.

[Swagger](https://swagger.io)
[mdBook](https://github.com/rust-lang/mdBook)
[JSDoc](https://jsdoc.app)
[GitHub Copilot](https://github.com/features/copilot) – Automatically generates JSDoc for you
[IDE Keywords](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.todo-tree) – leave keywords like `TODO`, `BUG` or `FIX` in comments.

## DevOps & Git

## Coding Style

Adhere to the latest [ECMAScript standard](https://developer.mozilla.org/en-US/docs/Glossary/ECMAScript?retiredLocale=de)

Prettier and ESLint

Write code that is concsistent with the style of the existing codebase.

## Versioning

We are committed to [semantic versioning](https://semver.org/lang/de/) for each individual project. However, the frontend and the root package need adapted semantics for versioning.

### Frontend

Semver does not fully apply to frontend applications. It is used by end users and does not offer some API or library where backwards incompatible changes render the interface useless. We still use the same syntax for versioning. However, the meaning is slightly adapted for end users and focuses on their actual usage of the application.

- **Major**: Everything that breaks existing functionality and/or compromises the user's data. Also heavy redesigns etc.
- **Minor**: New features that DO NOT break existing functionality and DO NOT compromise the user's data.
- **Patch**: Bug fixes (including minor changes like typos, missing documentation, subtile UI improvements, etc.)

### Root Package

## Documenting Your Work: Changelog / (Release) Notes / Commit Messages / Docs

> ** TL;DR**: Strictly follow the conventions listed below.

Many roads lead to Rome. So does many ways to document your work. There is no general recipe for success. However, we settled on some guidelines we think suit our needs best.


that should help you to document your work in a way that is useful for others.

0. Of course, you should use critical features of your IDE 

1. Ensure everything works
    1. Lint before 
    2. Build
    3. Test
    4. Execute

2. Document


[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) is enfored for commit messages by means of [commitlint](https://commitlint.js.org/).

