## Repository Structure

> **TL;DR** – We use a monorepo. Main applications go into `/apps`, everything else goes into `/libs` respectivley `/tools`. [Turborepo](https://turbo.build/repo) takes care of building.

An application like ours usually requires multiple services to run separately. These then need to work together within specific boundaries through a thoroughly designed interface. Commonly a frontend, backend, one or more databases and a few other services.

A repository typically contains one of these services. Thus you need at least 3 repositories and probably have to import stuff from one another. Our plugin architecture (more on that later) would entail us to host many more repositories we need to update, maintain and deploy – all together resulting in a lot of redundant work and unnecessary complexity. Think of all the configuration files, scripts, documentation that come along with each service. Many duplicated files – many duplicated issues you need to take care of. Good luck with maintaing that.

We decided to migrate to a [mono-repository](https://en.wikipedia.org/wiki/Monorepo) though, meaning it hosts many individual projects at once. Some are are inter-linked, while others are completely independent. With this approach, many issues we suffered from in our multi-repo environment became obsolete.

To mention only a few:

- A handful of configuration files for all projects
- All projects share the same tooling like linters, formatters, testing frameworks, analyzers etc.
- Lesser maintenance work
- Easier to deploy
- Straightforward imports between projects

Surely it has drawbacks (read more about that [here](https://en.wikipedia.org/wiki/Monorepo)), but in our case the advantages outweigh them by far.

Most of the configuration files are located in the root directory (if they are used repo-wide). The `apps` folder contains all main applications, like the backend and frontend. The `libs` folder contains all libraries, plugins and everything else that is not a tool or main application. The `tools` folder contains all tools that are used by the development team (e.g. scripts).

```
.
├── turbo.json
├── package.json
├── tsconfig.base.json
├── docker-compose.yml
├── […]
├── apps/
    ├── intutable                       | backend process
    └── intutable-ui                    | frontend
├── libs/
    ├── core/                           | plugin manager
    ├── plugins/
    ├── dekanat-app-plugin              | ! legacy, will be deprecated soon
    └── shared                          | ! legacy, will be deprecated soon
├── tools/
    └── database-tools                  | scripts for database management
└── docs/
```

We use [Turborepo](https://turbo.build/repo) as a dedicated build tool that helps us testing, building and deploying all services effienctly with a fewn commands while taking account of complex interdependencies between projects.