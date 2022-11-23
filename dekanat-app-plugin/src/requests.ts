import { types as lv } from "@intutable/lazy-views"
import { StandardColumnSpecifier, CustomColumnAttributes, Filter } from "shared/dist/types"
import { TableId, ViewId } from "./types"

export const CHANNEL = "dekanat-app-plugin"

/**
 * Create a table in the given project with the given name
 * Also created:
 * - columns ID and index, which are hidden to the user
 * - a column named "Name" designated as "user primary key" (i.e. not really
 * a PK in the database, but the user is _encouraged_ to keep it unique, and
 * it is used as the "title" of a row when creating previews of rows)
 * - a default view with the name "Standard", whose metadata
 * (filters, name) cannot be edited.
 * Exceptions:
 * - name is already taken -> error
 * Response: {@link types.TableDescriptor} name and ID of the newly
 * created table.
 */
export function createTable(sessionID: string, userId: number, projectId: number, name: string) {
    return {
        channel: CHANNEL,
        method: createTable.name,
        sessionID,
        userId,
        projectId,
        name,
    }
}

/**
 * Delete a table (along with all its views)
 * Response: { message: string } a report that the table was deleted.
 */
export function deleteTable(sessionID: string, id: TableId) {
    return { channel: CHANNEL, method: deleteTable.name, sessionID, id }
}

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
 * Response: [SerializedColumn]{@link shared.dist.types/SerializedColumn}
 * An array of all columns that were changed.
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
 * Create a view on a given table with the specified name. By default, it
 * has all columns of the table included and no filters, sorting, or grouping.
 * Filters can be added with {@link changeViewFilters}, while
 * hiding columns, sorting, and grouping are not yet implemented at all.
 */
export function createView(sessionID: string, userId: number, tableId: TableId, name: string) {
    return {
        channel: CHANNEL,
        method: createView.name,
        sessionID,
        userId,
        tableId,
        name,
    }
}

/**
 * Rename a view. The default view cannot be renamed.
 * Response: {@link ViewDescriptor} the descriptor of the updated view.
 */
export function renameView(sessionID: string, viewId: ViewId, newName: string) {
    return {
        channel: CHANNEL,
        method: renameView.name,
        sessionID,
        viewId,
        newName,
    }
}

/**
 * Delete a view. The default view cannot be deleted.
 * Response: { message: string } a report that the view was deleted.
 */
export function deleteView(sessionID: string, viewId: ViewId) {
    return { channel: CHANNEL, method: deleteView.name, sessionID, viewId }
}
/**
 * List views on a table.
 * Response: {@link types.ViewDescriptor}[]
 */
export function listViews(sessionID: string, id: TableId) {
    return { channel: CHANNEL, method: listViews.name, sessionID, id }
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
export function changeViewFilters(sessionID: string, viewId: ViewId, newFilters: Filter[]) {
    return {
        channel: CHANNEL,
        method: changeViewFilters.name,
        sessionID,
        viewId,
        newFilters,
    }
}
