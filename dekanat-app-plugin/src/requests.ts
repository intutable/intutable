import { types as lv } from "@intutable/lazy-views"
import {
    StandardColumnSpecifier,
    CustomColumnAttributes,
    Filter,
} from "shared/dist/types"
import { TableId, ViewId } from "./types"

export const CHANNEL = "dekanat-app-plugin"

/**
 * Create a standard column: not a  link, not an index or checkbox column,
 * just a plain data column that the user can populate with whatever data
 * match its type.
 * Response: [SerializedColumn]{@link shared.dist.types/SerializedColumn}
 * @param {lv.ViewDescriptor["id"]} addToViews which views to also add
 * the new column to. If no argument is given, the column is added to all
 * views. The attributes are simply inherited from the table column. They
 * are separate copies of the data, so they will not update automatically -
 * be sure to use {@link changeTableColumnAttributes} to change attributes
 * and ensure that the change cascades to views as well.
 */
export function createStandardColumn(
    sessionID: string,
    tableId: TableId,
    column: StandardColumnSpecifier,
    addToViews?: ViewId[]
) {
    return {
        channel: CHANNEL,
        method: createStandardColumn.name,
        sessionID,
        tableId,
        column,
        addToViews,
    }
}

/**
 * Create a column in a table view, optionally (default is yes) adding it
 * to all of the table's filter views.
 * PM column must already be present.
 * @deprecated we will soon expose only dedicated {@link createStandardColumn},
 ` createLinkColumn` and `createLookupColumn` methods and this will be
 * purely internal.
n */
export function addColumnToTable(
    sessionID: string,
    tableId: TableId,
    /**
     * Uses serialized attributes for now because there are still next
     * endpoints that use it.
     */
    column: lv.ColumnSpecifier,
    joinId: number | null = null,
    /**
     * @param {ViewId[] | undefined} addToViews which views to also
     * corresponding column in. If undefined, add the column to all views
     */
    addToViews?: ViewId[]
) {
    return {
        channel: CHANNEL,
        method: addColumnToTable.name,
        sessionID,
        tableId,
        column,
        joinId,
        addToViews,
    }
}

/**
 * Remove a column from a table view and all its filter views.
 */
export function removeColumnFromTable(
    sessionID: string,
    tableId: lv.ViewDescriptor["id"],
    columnId: lv.ColumnInfo["id"]
) {
    return {
        channel: CHANNEL,
        method: removeColumnFromTable.name,
        sessionID,
        tableId,
        columnId,
    }
}

/**
 * Change the attributes of a column of a table, and optionally all its views.
 * All boolean values in the attributes are changed into ones and zeros,
 * other than that no transformation takes place.
 * Response: An array of all columns that were changed.
 */
export function changeTableColumnAttributes(
    sessionID: string,
    tableId: lv.ViewDescriptor["id"],
    columnId: lv.ColumnInfo["id"],
    update: CustomColumnAttributes,
    changeInViews = true
) {
    return {
        channel: CHANNEL,
        method: changeTableColumnAttributes.name,
        sessionID,
        tableId,
        columnId,
        update,
        changeInViews,
    }
}

/**
 * Get all data of a given table, both object and metadata.
 * Response: [TableData]{@link shared.types.TableData}
 */
export function getTableData(sessionID: string, tableId: TableId) {
    return { channel: CHANNEL, method: getTableData.name, sessionID, tableId }
}

/**
 * Get all data of a given view, both object and metadata.
 * Response: [SerializedViewData]{@link shared.types.SerializedViewData}
 */
export function getViewData(sessionID: string, viewId: ViewId) {
    return { channel: CHANNEL, method: getViewData.name, sessionID, viewId }
}

/**
 * Set new filters for a view. Simply overwrites them, there is no incremental
 * changing functionality as of now.
 * Response: Filter[] the newly updated filters; they may be simplified or
 * re-ordered, but are semantically the same.
 */
export function changeViewFilters(
    sessionID: string,
    viewId: ViewId,
    newFilters: Filter[]
) {
    return {
        channel: CHANNEL,
        method: changeViewFilters.name,
        sessionID,
        viewId,
        newFilters,
    }
}
