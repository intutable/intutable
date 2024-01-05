# Version 4.0.0
## Breaking Changes
- openConnection method no longer has `sessionID` parameter, because the
plugin manages the _connection_ IDs (also renamed all the identifiers) itself.
- `update` and `delete` return the number of rows altered.
## Minor Changes
- `npm test` now copies the node modules into the Docker container instead of
installing them from there, this allows you to copy custom versions into
`node_modules` as a makeshift replacement for `npm link`.
  
# Version 3.0.0
## Breaking Changes
- `openConnection` now throws if given bad login data. Don't forget to
await it, there was an instance of this in a test suite that used to work
and then broke after this change; so check your uses of `openConnection`!
