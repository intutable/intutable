/**
 * @module main Public API data types. See {@link ViewData} and {@link ViewInfo}
 * first; they are basically a full description of a view.
 */
import { ColumnType } from "@intutable-org/database/dist/types"
import {
    TableDescriptor,
    ColumnDescriptor as PM_Column,
} from "@intutable-org/project-management/dist/types"

import { ColumnDescriptor, ColumnGroupSpecifier } from "./internal"
import { SelectableSpecifier, SelectableDescriptor } from "./selectable"
import { Condition } from "./condition"

export type { TableDescriptor, PM_Column, Condition }

/**
 * A central concept in this library is the distinction between a column as seen "within" a
 * query and as seen from outside, i.e. in the result set. If we have a table `employees` with
 * a column `email` and a view `developers` on `employees`, then our metadata will have
 * both an `email` column in the table and an `email` column in the view, as separate entities
 * with separate IDs. All data types and operations relevant to building the query that
 * `developers` represents will use `employees.email`, like joins, WHERE clauses, etc.
 * The column `developers.email`, on the other hand, represents the column as a result of
 * selecting from `developers`. It is used in any views that select from `developers`, creating
 * a recursive chain that always ends with a table. Always think, when using columns,
 * about whether you are dealing with a column of a view itself, or a "parent" column, i.e. one
 * from its underlying source.
 */
export type ParentColumnId = TableColumnId | ViewColumnId
export type ViewId = number
export type TableId = number
export type TableColumnId = number
export type ViewColumnId = number

export type JoinId = number | null

export type ConditionOperator = string

/** Describes which columns and joins a view should contain on creating it. */
export interface ColumnOptions {
    columns: ColumnSpecifier[]
    joins: JoinSpecifier[]
}
/**
 * Describes a column to add to a view, passed to {@link requests.createView}
 */
export interface ColumnSpecifier {
    /**
     *  The {@link ColumnDescriptor.id | ID} of the column which this column
     *  inherits (selects) from.
     */
    parentColumnId: ParentColumnId
    /**
     * Arbitrary customizable metadata. The fields specified must be present
     * in the columns table (see {@link requests.addColumnAttribute})
     */
    attributes: Record<string, any>
    /**
     * An expression to apply to the column's value(s). Must be Knex raw SQL,
     * with `??` as a binding for the column's name. Examples:
     * `"?? + 1"`, `"SUM(??)"`(requires grouping), or
     * `"CASE WHEN ??<0 THEN -1 ELSE 1 END"`
     */
    outputFunc?: string
}

/** Describes a join to add to a view. */
export interface JoinSpecifier {
    /** The table or view to join with. */
    foreignSource: SelectableSpecifier
    /** Join condition (`JOIN .. ON myForeignKey=yourPrimaryKey`) */
    on: On
    /**
     * Some columns to add on creating the join. This is just a convenience,
     * you can add the columns incrementally too.
     */
    columns: ColumnSpecifier[]
    /**
     * Groups the right side of the join before joining. See docs/dev/join_pre_group for
     * more detail.
     */
    preGroup?: boolean
}
/**
 * Condition of a join. A condition of the form [id1, "=", id2] (operators other than "=" are
 * permitted, but make little sense for how this plugin is supposed to be used) means
 * "join where the base source's column with ID id1 equals the foreign source's column with
 * ID id2". The left column refers to a column in the source, not a column of the view.
 */
export type On = [ParentColumnId, ConditionOperator, ParentColumnId]

/** Options for what to do with view rows: filtering, grouping, sorting. */
export interface RowOptions {
    /**
     * Conditions for filtering rows (corresponds to `WHERE` clauses).
     * The elements of the array are joined with `AND`.
     */
    conditions: Condition[]
    /**
     * A list of columns to group outputs on. All non-grouping columns are
     * aggregated with `ARRAY_AGG` by default, but alternative aggregate
     * functions can be specified with {@link ColumnSpecifier.outputFunc}.
     */
    groupColumns: ParentColumnSpecifier[]
    /** Columns to sort result set on. */
    sortColumns: SortColumn[]
}

/** A column to sort rows on. */
export interface SortColumn {
    /**
     * Which column to use. It must be a column from the view's source(s),
     * not one of the output columns. It can also be one that is not present
     * in the view itself.
     */
    column: ParentColumnSpecifier
    order?: SortOrder
    /** Determines whether null values go first or last. */
    nulls?: NullsPosition
}

/** Determines whether to sort a result set ascending or descending. */
export enum SortOrder {
    Ascending = "asc",
    Descending = "desc",
}

/**
 *  Determines whether null values go first or last. */
export enum NullsPosition {
    First = "first",
    Last = "last",
}

/**
 * Abstract metadata of a view, with the same structure as the parameters
 * that went into {@link requests.createView}. Thus they are lacking, for
 * example, the IDs of the actual metadata records that are present in the
 * database. This is mostly a relic of an earlier, flawed implementation,
 * however it is still useful to get certain metadata with much less
 * computational effort compared to getting a view's {@link ViewInfo}.
 */
export interface ViewOptions {
    name: string
    /** The "main" table or view from which this view selects. */
    source: SelectableSpecifier
    /** The ID of the user to whom the view belongs. */
    userId: number | null
    /** Which columns and joins (to other tables/views) to add. */
    columnOptions: ColumnOptions
    /** Options for structuring result sets: sorting, grouping, filtering. */
    rowOptions: RowOptions
}

/** Minimal descriptor a view. */
export interface ViewDescriptor {
    id: number
    name: string
}

/**
 * Full metadata of an already-created view with IDs on all elements of the
 * structure.
 * The structure is somewhat of a compromise between JS and SQL. For instance,
 * instead of a FROM clause that consists of a tree of joins and
 * cartesian products, our views have one "base" selectable (table or view)
 * and a list of "join" objects, each of which contains another selectable
 * and a join condition. This way, each view is assigned to a "main" table which makes the
 * operation "get me all views on this table" easier and clearer. It also matches the idea
 * behind these views of "table but with links to other tables".
 */
export interface ViewInfo {
    /** ID and name. */
    descriptor: ViewDescriptor
    /**
     * The view's "base" table/view. We will continue to use the term "source"
     * for tables or views being selected from, and occasionally "base source"
     * to distinguish the view's main source from the sources of its joins.
     */
    source: SelectableDescriptor
    /** A list of joins to other tables or views */
    joins: JoinDescriptor[]
    /** The view's columns. */
    columns: ColumnInfo[]
    /** Row options */
    rowOptions: RowOptions
}

/** {@link ViewInfo} along with result set. */
export interface ViewData extends ViewInfo {
    rows: Record<string, any>[]
}

/**
 * A column of a view. Consists of a link to a column from an underlying
 * source, the name of the column in the DB, and the key by
 * which this column's data are aliased in the result set.
 */
export interface ColumnInfo extends ColumnDescriptor {
    /**
     *  The name of the bottom-level table column in the database. Needed
     * for editing the object data.
     */
    name: string
    /** Data type of the object data. */
    type: ColumnType
    /**
     * Key in the result set. This would normally simply be the same as
     * {@link name}, but since joins allow us to select columns of the same
     * name from different tables (and even the same column from the same
     * table twice) we need to select them under aliases. `key` is that
     * alias, used to index into {@link ViewData.rows}.
     */
    key: string
}

/** A join. Rather than a tree of joins and tables, our views select from
 * one "base" table (or view) and then have a list of `JoinDescriptor`s
 * which specify a selectable and a join condition.
 */
export interface JoinDescriptor {
    /** ID for e.g. adding new columns or deleting the join. */
    id: number
    /** Table or view to join with. */
    foreignSource: SelectableSpecifier
    /** Condition, named for `JOIN table2 ON table1.column1=table2.column2` */
    on: On
    /**
     * Groups the right side of the join before joining. See docs/dev/join_pre_group for
     * more detail.
     */
    preGroup: boolean
}

/** Not implemented in public API yet, kinds of join (left, outer, inner...) */
export enum JoinType {
    Left = "LEFT",
}

/**
 * A view can be based on a table from `project-management` or another view.
 * This interface captures the properties that a table column (from PM) and
 * a ColumnDescriptor (of a view) have in common.
 * NOTE: this type does not have the same relationship to
 * {@link ParentColumnSpecifier} as {@link ColumnDescriptor} has to
 * {@link ColumnSpecifier}.
 */
export interface ParentColumnDescriptor {
    id: ParentColumnId
    name: string
    type: ColumnType
}

/**
 * A reference to a parent column of a view.
 * Needed since WHERE, ORDER BY, and GROUP BY clauses all operate on the
 * columns that are selected _from_, not the aliases that are finally exposed
 * in the result set.
`* Example:
 * ```sql
 * SELECT table1.name AS c21_name
 * FROM table1
 * WHERE length(c21_name)<32;
 * ==> ERROR: column "c21_name" does not exist
 *     HINT: perhaps you meant to reference the column "table1.name".
 * ```
 * NOTE: this type does not have the same relationship to
 * {@link ParentColumnDescriptor} as {@link ColumnDescriptor} has to
 * {@link ColumnSpecifier}.
 * NOTE: The prop name `parentColumnId` is unfortunately chosen. It allows you to use a 
 * `ColumnInfo` of a view to automatically mean "sort by this column's parent column", but is
 * misleading. If you have e.g. a view that is based on a table and you want to sort by a
 * source table column `c1 = { id: 7, name: "name", ... }` then you have to convert it to a
 * `ParentColumnSpecifier` like `c1Spec = { parentColumnId: c1.id, joinId: null }`.
 */
export interface ParentColumnSpecifier {
    /** The ID of the source's column */
    parentColumnId: ParentColumnId
    /** the ID of the join in which the column appears. */
    joinId: JoinId
}
