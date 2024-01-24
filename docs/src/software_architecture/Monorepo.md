# Monorepo

## NPM Workspaces

We utilize [NPM workspaces](https://docs.npmjs.com/cli/using-npm/workspaces) to manage our monorepo.

Our monorepo has:
- one root `package.json`
- one root `package-lock.json`
- one root `node_modules/`
- one `package.json` per workspace, that symlinks to the root `node_modules/`
- one `node_modules/` per workspace, that symlinks to the root `node_modules/`

```markdown
.
├── […]
├── package.json                            | root package    
├── package-lock.json                       | unified package lock
├── node_modules/                           | root node_modules
├── apps/                                   | main applications
    └── APPLICATION_1/
        ├── package.json                    | workspace package
        └── node_modules/                   | symlinks to the root folder
├── libs/                                   | internal libraries
    └── LIBRARY_1/
        ├── package.json                    | workspace package
        ├── dist/                           | transpiled JavaScript build
        └── node_modules/                   | symlinks to the root folder
├── tools/                                  | (development) tools etc.
└── docs/
```

### Creating New Workspaces / Managing Existing Ones

To add a new workspace or manage the existing ones, have a look into the root `package.json` file. You will find an object called `worksapces` that specifies sub-packages as workspaces.

In `./package.json`:
```json
{
    "workspaces": [
        "apps/*",
        "libs/*" // or "libs/LIBRARY_1"
        // […]
    ]
}
```

You can then address workspaces individually. Most commands provide the `-w` flag: `npm run build -w LIBRARY_1`.

Note that the workspace's name is the package's name. In `libs/LIBRARY_1/package.json`:
```json
{
    "name": "LIBRARY_1" // <- this is the name of the workspace!
}
```

> **NOTE**: In practice it's usually a good idea to namespace workspaces – e.g. `@intutable-org/LIBRARY_1` – to avoid name collisions.

### Importing Workspaces

If you want to import local packages within workspaces into another workspace, let's say you are developing `APPLICATION_1` and need to import some stuff from `LIBRARY_1`, you can simply add it as a dependency in the `package.json` of `APPLICATION_1` like you would normally do.

In `apps/APPLICATION_1/package.json`:
```json
{
    "dependencies": {
        "LIBRARY_1": "*" // <- no need to specify a version for internal packages
    }
}
```

What happens is, when you hit `npm i`, it will create a symlink in the root `node_modules/` to the workspace's folder, which you can then import. For further informatiom read the [NPM docs](https://docs.npmjs.com/cli/v10/using-npm/workspaces#using-workspaces).

## Integrating TypeScript

[Typescript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html) allows logical separation of TypeScript projects into individual components and lets you reference them from each other. 

```markdown
.
├── […]
├── tsconfig.json                      | root tsconfig
├── apps/
    └── APPLICATION_1/
        └── tsconfig.json                   | extends from the root config
├── libs/
    └── LIBRARY_1/
        └── tsconfig.json                   | extends from the root config
├── tools/
└── docs/
```

Make sure to properly understand TypeScript's Project References. You will have to reference other projects manually in your `tsconfig.json` files and build packages differently.
