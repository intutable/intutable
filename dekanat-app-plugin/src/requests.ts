import { types as lv } from "@intutable/lazy-views"

export const CHANNEL = "dekanat-app-plugin"

/**
 * Create a column in a table view, optionally (default is yes) adding it
 * to all of the table's filter views.
 * PM column must already be present.
 * @param {boolean} createInViews if true (default) also create a corresponding
 * column in all of the table's views.
 */
export function addColumnToTable(
    tableId: lv.ViewDescriptor["id"],
    column: lv.ColumnSpecifier,
    joinId: number | null = null,
    createInViews: boolean = true
) {
    return {
        channel: CHANNEL,
        method: addColumnToTable.name,
        tableId,
        column,
        joinId,
        createInViews,
    }
}

/**
 * Add a column of a table to all views. It must already be present
 * in the table.
 */
export function addColumnToViews(
    tableId: lv.ViewDescriptor["id"],
    column: lv.ColumnSpecifier
) {
    return {
        channel: CHANNEL,
        method: addColumnToViews.name,
        tableId,
        column,
    }
}

/**
 * Remove a column from a table view and all its filter views.
 */
export function removeColumnFromTable(
    tableId: lv.ViewDescriptor["id"],
    columnId: lv.ColumnInfo["id"]
) {
    return {
        channel: CHANNEL,
        method: removeColumnFromTable.name,
        tableId,
        columnId,
    }
}
