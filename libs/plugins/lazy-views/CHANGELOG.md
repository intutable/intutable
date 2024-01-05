# Version 7.0.0
### Breaking Changes
- `JoinDescriptor` now has a required property `preGroup` (See "New Features" for more info)
- database schema has new column for `preGroup`
### New Features
- joins now have an option `preGroup`. If it is set to true, then the joined table or view will
  be grouped before joining. The group is performed on the same column used for the join condition,
  and all other columns are aggregated with `ARRAY_AGG`.

# Patch 6.1.2
## Fixes
- Fixed a bug where columns belonging to a join where the join's source is a view, but the
  source of the column's view is a table (or vice versa) are not auto-removed when
  their source column (in the foreign view) is deleted.

# Patch 6.1.1
## Fixes
- Joins' conditions are now checked just like their foreign source and columns
- Fixed a bug where, if a column had a custom `outputFunc` (an expression built on the column
  to select, e.g. `ARRAY_AGG(column)` as opposed to just `column`), its `AS` alias was not
  double-quoted, leading to errors if the column had capital letters or special characters.

# Minor Version 6.1.0
## New Features
- the `condition` module exposes a new handy function `filterCondition`.
- when a table, view, column, or join is deleted, the plugin deletes all objects that depend on
  it.
- `listJoinsTo` method which lists all joins whose foreign source is the given table or view.
- `getViewData` has an optional parameter of type `Partial<RowOptions>` which allows overriding
  some or all of a view's row options: filtering, grouping, sorting; although grouping does not
  really make sense to override (but this is an issue for a deeper overhaul of the API)
## Minor Changes
- the getColumnInfo method is no longer deprecated
- The errors returned from `error` had a prop named `reason`, which is now
  called `cause` instead.

# Patch 6.0.1
## Fixes
- `addColumnToView` now returns the full info of the column that was created,
  not just a summary of the data that were passed in (i.e. it actually selects
  the newly created column from the DB)

# Version 6.0.0
## Breaking Changes
- use DB version 4

## Other
- improve Docker test configuration.
>>>>>>> develop

# Version 5.1.0

## Breaking Changes
- Use database version 3.0.0 and PM version 1.1.0 (columnoption types are
  different with these)

# Version 4.0.0-single-connection

## 2022-07-15

### New Features
- Data types for conditions (filtering result sets) are now heavily
  parameterized and facilitate creating constrained subsets, so client code
  does not have to take into account all possible forms a condition can have.
- Expanded convenience functions for building conditions

### Breaking Changes
- Condition types have new names and type parameters
- Condition types now tagged unions with explicit kind discriminator
- convenience functions for building conditions moved from `requests`
  module to `condition` module.
