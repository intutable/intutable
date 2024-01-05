# lazy-views

IntuTable plugin for handling Lazy Views.

# What is a Lazy View?

Lazy Views expand the functionality of the Project-Management plugin
(SQL + metadata) by "lazy" views, that is, views which are not stored in the
database, but instead the query is created ad hoc each time the data are
needed. This has a few advantages over simply using SQL views:

-   They are easily incrementally updateable, as the query is constructed ad hoc instead of being
    stored as a view.
-   Being lazy, they support joining in circles and back to themselves. (See
    example below for a situation where this could be useful)

These views are also modeled differently from SQL queries. In SQL, a query selects from
one relation that is constructed algebraically from other relations, with none of them being
the "main" one. Here, in order to make the use as "fancy tables" easier and to be able to
keep track of them more easily, a view has a "main" table, plus a list of joins, each of
which mentions another table and the condition for joining on.

A view can also be built on another view, like in SQL. We use the term "source" as in
"the source of this view's data, since it doesn't have any data of its own" to mean
either a view or a table.

# Getting started

Simply add the NPM package to your `package.json`. The latest version is on
branch `main`. Don't forget to include the plugin in your Core plugin list.

# Example

```typescript
// Scenario: have a SQL table for employees and a view for departments.
// We want to create a view for employees in which each record is
// linked to a record from departments ("which department does
// this employee work in?")

import {
    createView,
    tableId,
    viewId
} from "lazy-views"

// 1. create column for foreign key
const departmentColumn = createColumnInTable(
    employeesTable.id,
    "department",
    ColumnType.integer
)
// 2. create view from existing table with link to other view
const employeesView = (await core.events.request(
    createView(
        tableId(employeesTable.id),   // base table
        "employeesWithDepartment",    // name
        {
            columns: [],              // use all columns of base table
            joins: [
                {
                    // the join's source (table or view)
                    foreignSource: viewId(departmentsView.id),
                    on: [
                        departmentColumn.id,
                        "=",
                        departmentsView.idColumn.id
                    ],
                    columns: [{
                    parentColumnId: departmentsView.nameColumn.id,
                        // arbitrary configurable column metadata
                        attributes: {
                            display_name: "Name (from Departments)",
                            column_width: 80px
                        }
                    }],
                },
            ],
        },
        { conditions: [], sortColumns: [], groupColumns: [] }
    )
)) as ViewDescriptor
```

Now imagine if the "departments" table also has a link to "employees",
indicating who leads the department. We could conceivably want to include
a reference to this column in the employees table ("who is this employee's
superior"?) which would require a cyclic join.

# FAQ

## This seems oddly specific. What are we trying to achieve?

The ability to link tables in a user-friendly manner, as is possible in
[AirTable](airtable.com), while maintaining the appearance/API of a single
table. This was intended to be the highest layer of abstraction, however it quickly turned out
that ensuring there is always a view on each table and vice versa as well as various other
metadata warranted their own layer. So now this plugin basically serves as another
simplification of SQL.

## Why not just use SQL views?

We need to maintain metadata such as "what column is a joined column
based on?" and choices of how to display columns, editing
privileges, ... We always have to keep enough metadata around to reconstruct
the view, which also means enough metadata to just build the query every
time. Thus we might as well do it this way in order to get the advantages
mentioned in the first section.

# Debugging

Unfortunately, the combination of Jest, PostgreSQL, and Docker has all kinds of ugly problems.

## Weird Testing Errors

### user x already own a project named y

If a testing run failed catastrophically, there may still be un-cleaned-up database data
lying around and Docker artifacts may have been insufficiently cleaned up. If you get
errors like "user x already own a project named y", try deleting all lazy-views-related
Docker images, containers, and volumes by hand.

### SQL errors that make no sense

Sometimes, if a Knex call causes an SQL error, there will be no exception, and then all
subsequent Knex calls will throw the error that occurred the first time. You may need to
look again to check which statement is even causing an error in the first place.
