# Version 0.2.0
## Minor Changes
- if a core call throws an Error (like, really an instance of the class
  `Error`), then return a more detailed error, including the call stack.
