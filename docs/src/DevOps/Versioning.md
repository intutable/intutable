# Versioning

Versioning in a monrepo might not be the same as in a single repo. There are many reasons to do things differently in a monorepo. Again, there is no definitive recipe for success. We have considered many reasons and decided to use the following approach.

### Internal Packages (Workspaces) Have No Version

Honestly, they all do have a version. Because all packages or sub-projects within this monorepo are [npm workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces), each `package.json` in these workspaces requires a [semver](https://semver.org/lang/de/) conform version.

Despite this, we have no use for semver versioning in our internal packages.

> Remember: This monorepo consists of only a few applications that are developed for direct use and deployment. Additionaly, the majority of workspaces are *internal* libraries and tools that are only consumed by those applications. They will never be used or published anywhere else. Their only purpose is logical and technical code separation.

That's why we decided to not bother with versioning hell. We still need to apply a version, so we set it to `0.1.0` in all our internal packages. Just leave it as it is and do not touch it. We will never change it. It's just there to satisfy the npm workspace requirements.

> **NOTE**: If you want to reference one of these internal packages, you still have to use a specific semver version and all of them still have a version. Though it will never change. Thus you can simply use the latest version: `"my-lib": "*"` referencing the latest version of `my-lib`.

### Monoversion

Regardless of the internal packages, we could ship our applications with a semver version. But since we only ship all applications at once, we don't need to version them individually. We can simply use a single version for all of them. This strategy is called a "monoversion": one version across the whole monorepo.

Our monoversion still adheres to the semver specification. Though the semantics are applied to the whole monorepo instead of individual packages and are more concerned with the user rather than API changes.

There are valid objections against this in general. However, our monorepo in specific focuses on shipping one single product. All packages need to be consistent and working together. A breaking change (major version) in the backend would break the frontend and render the product useless. Each time a bug fix, new feature or breaking change is introduced, it can either take place in a single package, or more likely in multiple packages. In any case, the whole monorepo needs to be updated and shipped together. Thus, a monoversion is a valid approach for us.

Then, like stated above, this versioning system focuses more on the user than on API changes etc. It is more about the product than the individual package. Altogether, (breaking) changes the user would not notice result in a version change.

In detail, this means that our monoversion still adheres to the semver specification. Moreover it is 1. applied to monorepos and 2. includes semantics that are more concerned with the user's product.

- **<u>Major Version</u>** – Like semver majos versions, but also when e.g. user data changed and the user is required to take action, large refactors, huge UI changes, redesigns etc.
- **<u>Minor Version</u>** – Like semver minor versions, but also when e.g. new features are introduced, new UI elements are added, new pages are added etc.
- **<u>Patch Version</u>** – Like semver patch versions, but also when e.g. bug fixes are introduced, small refactors, small UI changes etc.

As a consequence, only the root `package.json` has a real version that is been updated frequently. All other `package.json` files in the workspaces have a fixed version that won't change.