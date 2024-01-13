# Troubleshooting & FAQs

Sometimes things just don't work and it does not always have to be your fault. Undefined behaviour can occur due to bugs in thrid party frameworks or libraries. This happens more often than you might think. Here are some things you should try when you don't know what to do anymore:

Especially cached files can cause a lot of trouble during development.

- Delete all `node_modules` folders (tipp: use [`npkill`](https://www.npmjs.com/package/npkill))
- Delete all transpiled files such as those in `dist` or `out`
- Delete the nextjs cache folder `.next`
- Reset the database and docker containers
- Restart the TypeScript server
- Restart your IDE
- Install the dependencies again `npm i`
- Rebuild everything again `npm run build`
- The application ships with [pgAdmin](https://www.pgadmin.org). Make sure the database is not corrupted.

Last but not least: 

- Restarting your pc can work wonders sometimes as well as a fresh install of the repository


## Known Traps

## `tsc` is not building & TS error `Cannot write file … because it would overwrite input file.`

Both issues are likely when you modified – i.e. deleted – the `dist` folder (or the `tsconfig.tsbuildinfo` file). Run `npm run clean -w @intutable-org/YOUR-WORKSPACE` and build again.

## Types are incorrectly installed under `devDependencies`

Packages like `@types/…` are often installed as a dev dependency. This is not always correct. See [this stackoverflow answer](https://stackoverflow.com/a/46011417/14101494) when to use `devDependencies` and when to use `dependencies` for additional typings `@types/…`.