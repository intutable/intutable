# FAQs & Troubleshooting 💡

Sometimes things just don't work and it does not always have to be your or our fault. Undefined behaviour can occur due to bugs in third party frameworks or libraries. This happens more often than you might think. Here are some things you should try when you don't know what to do anymore:

Especially cached files can cause a lot of trouble during development.

- Delete all `node_modules` folders (tipp: use [`npkill`](https://www.npmjs.com/package/npkill)), then install the dependencies again `npm i`.
- Delete all transpiled files such as those in `dist` or `out` (`npm run clean --workspaces --if-present` will clean the backend)
- Delete the nextjs cache folder `.next`
- Reset the database and docker containers
- Restart your IDE
- Rebuild everything again
- Make sure the database is not corrupted. The application ships with [pgAdmin](https://www.pgadmin.org) that can be used to inspect it.

Last but not least: 

- Restarting your pc can work wonders, so does a fresh reinstall of the repository


## Frequent Pitfalls

#### tsc is not building / tsc error »Cannot write file … because it would overwrite input file.«

Both issues are likely when you modified – i.e. deleted – the `dist` folder (or the `tsconfig.tsbuildinfo` file). Run `npm run clean -w @intutable-org/YOUR-WORKSPACE` and build again.

#### Types are incorrectly installed under `devDependencies`

Packages like `@types/…` are often installed as a dev dependency. This is not always correct. See [this stackoverflow answer](https://stackoverflow.com/a/46011417/14101494) when to use `devDependencies` and when to use `dependencies` for additional typings `@types/…`.