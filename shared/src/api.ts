/**
 * Helper functions and constants for the `dekanat-app-plugin`'s API.
 */
import { Column, ColumnType } from "@intutable/database/dist/types"
import { ParentColumnDescriptor, RowOptions, SortOrder } from "@intutable/lazy-views/dist/types"

import { SerializedColumn, DB } from "./types"

/**
 * The two basic columns that every table must have (in addition to _id, but
 * the project-management plugin creates that automatically)
 * These are columns in the underlying table, while {@link isAppColumn}
 * refers to columns of the view on top of it.
 */
export const APP_TABLE_COLUMNS: Column[] = [
    { name: "index", type: ColumnType.integer, options: [] },
    { name: "name", type: ColumnType.string, options: [] },
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
 * "user primary" or "user primary key" refers to. This function returns that column's name.
 */
export function userPrimaryColumnName() {
    return "Name"
}

/**
 * Subset of a column's props (note: these are metadata: "id" and
 * "index" (column index) are totally distinct from the ID and index
 * (row index) _columns_ that exist in object tables)
 * They cannot be changed by the back-ends "change column attributes" method.
 */
export const immutableColumnAttributes: (keyof SerializedColumn)[] = [
    "id",
    "key",
    "kind",
    "index",
    "isUserPrimaryKey",
]

export function standardColumnAttributes(
    name: string,
    contentType: string,
    columnIndex?: number,
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

export function linkColumnAttributes(name: string, columnIndex?: number): Partial<DB.Column> {
    return {
        kind: "link",
        displayName: name,
        index: columnIndex,
        editable: 1,
        cellType: "string",
    }
}

export function lookupColumnAttributes(
    name: string,
    contentType: string,
    columnIndex?: number
): Partial<DB.Column> {
    return {
        kind: "lookup",
        displayName: name,
        index: columnIndex,
        editable: 1,
        cellType: contentType,
    }
}

export function idColumnAttributes(columnIndex?: number): Partial<DB.Column> {
    return {
        kind: "standard",
        displayName: "ID",
        index: columnIndex,
        isInternal: 1,
        editable: 0,
        cellType: "number",
    }
}
export function indexColumnAttributes(columnIndex?: number): Partial<DB.Column> {
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
 * Blank row options - no filters, no grouping, no sorting.
 */
export function emptyRowOptions(): RowOptions {
    return {
        conditions: [],
        groupColumns: [],
        sortColumns: [],
    }
}

/**
 * Default row options: obviously no filtering or grouping. Only order by
 * index, to keep rows from jumping around when you edit them.
 */
export function defaultRowOptions(
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
