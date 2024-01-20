# GitHub / Formal Workflow

Understanding the "formal process" of contributing to a project on GitHub and using it effecticely as a tool is crucial for our cooperaion.

1. Search existing (and closed) issues before opening a new one.
1. Be descriptive, provide detailed information and reproducible bugs, be concise, use existing templates.
1. Always work on a feature branch, never on `main` or `develop` directly.
1. Look out for the tests affected by your changes and run them before pushing commits. Update them or add new ones if necessary.
1. Analogue to tests, look out for the documentation affected by your changes and update it accordingly or add new documentation if necessary.
1. Adhere to [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) and use meaningful descriptions for commit messages.
1. Lint and test before pushing commits.
1. Do not forget to bump the version only in the root `package.json`.
1. Make sure your branch is up to date with `develop`.
1. Open a pull request once you are done and request a merge into `develop`.
1. Include detailed and production ready information for users if a user feature is affected or included.
1. CIs must pass before merging.
1. Squash merge into `main` for new releases (with appropriate user changelogs).
