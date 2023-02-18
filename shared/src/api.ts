/**
 * Helper functions and constants for the `dekanat-app-plugin`'s API.
 */
import { Column, ColumnType } from "@intutable/database/dist/types"
import {
    JoinDescriptor,
    ViewInfo as RawViewInfo,
    ColumnSpecifier,
    ParentColumnDescriptor,
    RowOptions,
    SortOrder,
} from "@intutable/lazy-views/dist/types"

import { DB, RawColumn } from "./types"

export { immutableColumnAttributes } from "./types"

/**
 * The two basic columns that every table must have (in addition to _id, but
 * the project-management plugin creates that automatically)
 */
export const APP_TABLE_COLUMNS: Column[] = [
    { name: "index", type: ColumnType.integer, options: [] },
    { name: "name", type: ColumnType.text, options: [] },
]

/**
 * Much functionality of tables goes directly through views, so we maintain a default view
 * with no filters on every table. This is its name.
 */
export function defaultViewName() {
    return "Standard"
}
/**
 * Each table is automatically created with a "name" column right off the bat. It cannot be deleted
 * and _should_ (but does not strictly have to) have a unique value, this is what the term
 * "user primary" or "user primary key" refers to. This function determines that column's name.
 */
export function userPrimaryColumnName() {
    return "Name"
}

/**
 * Default attributes for a standard column.
 */
export function standardColumnAttributes(
    name: string,
    contentType: string,
    columnIndex: number,
    userPrimary?: boolean
): Partial<DB.Column> {
    return {
        kind: "standard",
        ...(userPrimary !== undefined && {
            isUserPrimaryKey: userPrimary ? 1 : 0,
        }),
        displayName: name,
        index: columnIndex,
        editable: 1,
        cellType: contentType,
    }
}

export function linkColumnAttributes(name: string, columnIndex: number): Partial<DB.Column> {
    return {
        kind: "link",
        displayName: name,
        index: columnIndex,
        editable: 1,
        cellType: "string",
    }
}
export function backwardLinkColumnAttributes(
    name: string,
    parentColumnCellType: string,
    columnIndex: number
): Partial<DB.Column> {
    return {
        kind: "backwardLink",
        displayName: name,
        index: columnIndex,
        editable: 1,
        cellType: "unordered-list",
        cellTypeParameter: parentColumnCellType,
    }
}
export function foreignKeyColumnAttributes(columnIndex: number): Partial<DB.Column> {
    return {
        kind: "foreignKey",
        index: columnIndex,
        cellType: "number",
        isInternal: 1,
        editable: 0,
    }
}
export function lookupColumnAttributes(
    name: string,
    contentType: string,
    columnIndex: number
): Partial<DB.Column> {
    return {
        kind: "lookup",
        displayName: name,
        index: columnIndex,
        editable: 0,
        cellType: contentType,
    }
}
export function backwardLookupColumnAttributes(
    name: string,
    parentColumnCellType: string,
    columnIndex: number
): Partial<DB.Column> {
    return {
        kind: "backwardLookup",
        displayName: name,
        index: columnIndex,
        editable: 0,
        cellType: "unordered-list",
        cellTypeParameter: parentColumnCellType,
    }
}

export function idColumnAttributes(columnIndex: number): Partial<DB.Column> {
    return {
        kind: "standard",
        displayName: "ID",
        index: columnIndex,
        isInternal: 1,
        editable: 0,
        cellType: "number",
    }
}
export function indexColumnAttributes(columnIndex: number): Partial<DB.Column> {
    return {
        displayName: "Index",
        kind: "index",
        isInternal: 1,
        cellType: "number",
        index: columnIndex,
        editable: 0,
    }
}

export const ROW_INDEX_KEY = "index"
export const COLUMN_INDEX_KEY = "index"

/**
 * Standard `RowOptions` for a table. The rows are grouped by ID. All columns in the home table
 * can stay ungrouped, since the ID is a primary key and PG understands that it will thus be
 * unique.
 */
export function defaultTableRowOptions(idColumnId: number): RowOptions {
    return {
        conditions: [],
        groupColumns: [{ parentColumnId: idColumnId, joinId: null }],
        sortColumns: [],
    }
}

/**
 * Default row options: obviously no filtering or grouping. Only order by
 * index, to keep rows from jumping around when you edit them.
 */
export function defaultViewRowOptions(
    /**
     * To order by the index column, we need to have access to that column's
     * ID, so you unfortunately have to pass the source table's columns in.
     */
    columns: ParentColumnDescriptor[]
): RowOptions {
    const indexColumn = columns.find(c => c.name === ROW_INDEX_KEY)!
    return {
        conditions: [],
        groupColumns: [],
        sortColumns: [
            {
                column: { parentColumnId: indexColumn.id, joinId: null },
                order: SortOrder.Ascending,
            },
        ],
    }
}

/**
 * All tables' rows are grouped by ID (to avoid duplicates caused by joins). Now, PG can tell
 * that the ID is unique and that other columns from the same table do not have to be aggregated.
 * Unfortunately, the LV plugin just automatically ARRAY_AGGs all non-grouping columns. Unless
 * this is overridden with an `outputFunc` prop. Here, we are setting this to a trivial
 * non-aggregation to work around this.
 */
export function doNotAggregate(): ColumnSpecifier["outputFunc"] {
    return "??"
}

/**
 * For backward links, we have to aggregate multiple values into an array. We also need them to
 * have their IDs and the type that the contents should be rendered with. The GUI's UnorderedList
 * component provides an appropriate data type, {@link types.gui.UnorderedListCellContent}. This
 * output function makes PostgreSQL directly spit out that data type.
 * @param {RawColumn} idColumn the ID column of the target table
 * @param {RawColumn} parentColumn the column that the link/lookup should take its values
 * from.
 */
export function unorderedListAggregate(
    join: JoinDescriptor,
    foreignTableInfo: RawViewInfo,
    idColumn: RawColumn,
    parentColumn: RawColumn
): ColumnSpecifier["outputFunc"] {
    // yes, this is constant, for now at least.
    const idKey = `"j${join.id}_${foreignTableInfo.descriptor.name}"."${idColumn.key}"`
    const cellType = parentColumn.attributes["cellType"]
    return (
        `JSON_BUILD_OBJECT(` +
        `'format', JSON_BUILD_OBJECT('cellType', '${cellType}'),` +
        `'items', JSON_AGG(JSON_BUILD_OBJECT(` +
        `'value', ??,` +
        ` 'props', JSON_BUILD_OBJECT('_id', ${idKey})` +
        `))` + //end JSON_AGG(JSON_BUILD_OBJECT(
        `)`
    ) //end JSON_BUILD_OBJECT(
}
/**
 * Since forward link columns are grouped on the foreign table's (unique) ID, there will be
 * no duplicates in link/lookup columns. But, unlike with the ID of the home table, PG cannot
 * figure this out and forces us to aggregate them into singleton arrays. This aggregate function
 * gets the first element out of the array. The best part: if there are no rows to be aggregated,
 * PG returns a singleton array with a null, so we don't even have to worry about empty arrays.
 * We use `JSONB_AGG` instead of `ARRAY_AGG`, because `ARRAY_AGG` does not play nice with nesting,
 * and nesting is what we are aaaaaall about.
 */
export function firstAggregate(): ColumnSpecifier["outputFunc"] {
    return "(JSONB_AGG(??))->0"
}
