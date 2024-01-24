## Documenting

Code is written less often than it is read! Do yourself and others a favor and document your code properly. This is especially important for public APIs and interfaces.

Different code pieces need to be documented in different fashions.

- [mdBook](https://github.com/rust-lang/mdBook) generates this documentation from Markdown files and GitHub automatically deploys it once merged into the main branch. If you changed something causing these docs to be obsolete, update it accordingly. Ensure that these docs stay up to date by adding new documentation to your PRs if necessary.
- [Swagger](https://swagger.io) is used to document the REST API. It is automatically generated from the code. If you changed something causing the Swagger docs to be obsolete, update it accordingly. Ensure that these docs stay up to date by adding new documentation to your PRs if necessary.
- **Every (!) piece of code should have [JSDoc](https://jsdoc.app).** (Well, not everything needs to be documented, but you get the point.) If you think your code is self-evident or you and everyone else will understand it in a year, you are wrong. These are also highly useful for IDEs and their features.

Take note of

- [GitHub Copilot](https://github.com/features/copilot) can automatically generate JSDoc for you.
- [IDE Keywords](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.todo-tree) use keywords like `TODO`, `BUG` or `FIX` in code comments.

## GitHub: Changelog / (Release) Notes / Commit Messages / Docs

Many roads lead to Rome. So does many ways to document your work. There is no general recipe for success. However, we settled on some guidelines we think suit our needs best.

1. Make sure commit messages have meaning and are useful for others. This is especially important for the first line of a commit message. It should be short and concise. The rest of the message can be longer and more detailed. If you want to know more about this, read about [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). Keywords like `BREAKING CHANGE` or `FIX` are useful for others to quickly understand what happened.
1. Properly describe your issues and PRs. Include additional paragraphs if user affected features are included, so these can be used in other places as well. Go into detail about breaking changes etc.
1. Create releases by merging into `main` and creating a release with detailed release notes.