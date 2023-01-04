import { ColumnSpecifier } from "@intutable/lazy-views"
import {
    TableId,
    ViewId,
    Filter,
    RawViewDescriptor,
    RawViewColumnInfo,
    StandardColumnSpecifier,
    CustomColumnAttributes,
} from "./types"
import { RowData } from "./types/requests"

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
export function createTable(connectionId: string, roleId: number, projectId: number, name: string) {
    return {
        channel: CHANNEL,
        method: createTable.name,
        connectionId,
        roleId,
        projectId,
        name,
    }
}

/**
 * Delete a table (along with all its views)
 * Response: { message: string } a report that the table was deleted.
 */
export function deleteTable(connectionId: string, id: TableId) {
    return { channel: CHANNEL, method: deleteTable.name, connectionId, id }
}

/**
 * Create a standard column: not a  link, not an index or checkbox column,
 * just a plain data column that the user can populate with whatever data
 * match its type.
 * Response: [SerializedColumn]{@link shared.dist.types/SerializedColumn}
 * @param {RawViewDescriptor["id"]} addToViews which views to also add
 * the new column to. If no argument is given, the column is added to all
 * views. The attributes are simply inherited from the table column. They
 * are separate copies of the data, so they will not update automatically -
 * be sure to use {@link changeTableColumnAttributes} to change attributes
 * and ensure that the change cascades to views as well.
 */
export function createStandardColumn(
    connectionId: string,
    tableId: TableId,
    column: StandardColumnSpecifier,
    addToViews?: ViewId[]
) {
    return {
        channel: CHANNEL,
        method: createStandardColumn.name,
        connectionId,
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
 */
export function addColumnToTable(
    connectionId: string,
    tableId: TableId,
    /**
     * Uses serialized attributes for now because there are still next
     * endpoints that use it.
     */
    column: ColumnSpecifier,
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
        connectionId,
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
    connectionId: string,
    tableId: RawViewDescriptor["id"],
    columnId: RawViewColumnInfo["id"]
) {
    return {
        channel: CHANNEL,
        method: removeColumnFromTable.name,
        connectionId,
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
    connectionId: string,
    tableId: RawViewDescriptor["id"],
    columnId: RawViewColumnInfo["id"],
    update: CustomColumnAttributes,
    changeInViews = true
) {
    return {
        channel: CHANNEL,
        method: changeTableColumnAttributes.name,
        connectionId,
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
export function getTableData(connectionId: string, tableId: TableId) {
    return { channel: CHANNEL, method: getTableData.name, connectionId, tableId }
}

/**
 * Create a view on a given table with the specified name. By default, it
 * has all columns of the table included and no filters, sorting, or grouping.
 * Filters can be added with {@link changeViewFilters}, while
 * hiding columns, sorting, and grouping are not yet implemented at all.
 */
export function createView(connectionId: string, tableId: TableId, name: string) {
    return {
        channel: CHANNEL,
        method: createView.name,
        connectionId,
        tableId,
        name,
    }
}

/**
 * Rename a view. The default view cannot be renamed.
 * Response: {@link ViewDescriptor} the descriptor of the updated view.
 */
export function renameView(connectionId: string, viewId: ViewId, newName: string) {
    return {
        channel: CHANNEL,
        method: renameView.name,
        connectionId,
        viewId,
        newName,
    }
}

/**
 * Delete a view. The default view cannot be deleted.
 * Response: { message: string } a report that the view was deleted.
 */
export function deleteView(connectionId: string, viewId: ViewId) {
    return { channel: CHANNEL, method: deleteView.name, connectionId, viewId }
}
/**
 * List views on a table.
 * Response: {@link types.ViewDescriptor}[]
 */
export function listViews(connectionId: string, id: TableId) {
    return { channel: CHANNEL, method: listViews.name, connectionId, id }
}

/**
 * Get all data of a given view, both object and metadata.
 * Response: [SerializedViewData]{@link shared.types.SerializedViewData}
 */
export function getViewData(connectionId: string, viewId: ViewId) {
    return { channel: CHANNEL, method: getViewData.name, connectionId, viewId }
}

/**
 * Set new filters for a view. Simply overwrites them, there is no incremental
 * changing functionality as of now.
 * Response: Filter[] the newly updated filters; they may be simplified or
 * re-ordered, but are semantically the same.
 */
export function changeViewFilters(connectionId: string, viewId: ViewId, newFilters: Filter[]) {
    return {
        channel: CHANNEL,
        method: changeViewFilters.name,
        connectionId,
        viewId,
        newFilters,
    }
}

/**
 * Create a new row in a given view's underlying table. The reason for letting data be inserted
 * through the view instead of the table is that the data displayed in the front-end are those
 * of a view, so the view's ID and column IDs will be available, and the work of mapping
 * these to the actual table is more appropriate in the back-end than the front-end.
 * You can also pass in the ID of the table itself. The column IDs have to match up, of course.
 * Response: { _id: number } the ID of the row that was created.
 * Preconditions:
 * - the `index` properties of the rows go from 0 to `rows.length - 1`
 * Exceptions:
 * - any specified column is not editable.
 * - any specified column is not of kind standard.
 */
export function createRow(
    connectionId: string,
    viewId: ViewId | TableId,
    options?: { atIndex?: number; values?: RowData }
) {
    return {
        channel: CHANNEL,
        method: createRow.name,
        connectionId,
        viewId,
        atIndex: options?.atIndex,
        values: options?.values,
    }
}

/**
 * Update a row or set of rows, setting the values according to `values`.
 * `condition` can be either the ID of a row or a list of IDs, in which case each of the affected
 * rows is updated with the same data.
 * You can reference either a table or a view, in which case the plugin will find the view's
 * underlying table. However, columns have different IDs at each layer, so they must match up:
 * you can do
 * `updateRows(..., view1.id, {[view1.column1.id]: <value>, ...)` or
 * `updateRows(..., table1.id, {[table1.column1.id]: <value>, ...)`, but not
 * `updateRows(..., view1.table.id, {[view1.column1.id]: <value>, ...)`.
 *                      ^ table, but the column ^ is a view column
 * Response: { rowsUpdated: number } The number of rows changed.
 * Exceptions:
 * - any specified column is not editable.
 * - any specified column is not of kind standard.
 */
export function updateRows(
    connectionId: string,
    viewId: ViewId | TableId,
    condition: number[] | number,
    values: RowData
) {
    return { channel: CHANNEL, method: updateRows.name, connectionId, viewId, condition, values }
}
