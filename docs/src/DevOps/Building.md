# Building The Monorepo

The intutable monorepo contains more than one standalone application as well as many more libraries, tools and services. Most of them need to be built in some way.

Sometimes, you even have multiple options to build some piece code.

## General

Most of the code is based on TypeScript, thus the most common way to build it is to use the TypeScript compiler `tsc`. However, there are some exceptions:

Exceptions:
- The frontend utilizes Next.js, which has its own build workflow. However, it provides an npm `dev`, `build` and `start` script. The can be used analogously to our other apps/libs.
- 

Each package should have a `build` script, if required, which can be used to build it. However, there are some exceptions:

## Plain TSC

## Turborepo
## Docker
