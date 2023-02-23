import {
    TableId,
    ViewId,
    Filter,
    RawViewDescriptor,
    RawViewColumnInfo,
    SerializedColumn,
} from "./types"
import {
    RowData,
    StandardColumnSpecifier,
    LinkColumnSpecifier,
    LookupColumnSpecifier,
    CustomColumnAttributes,
} from "./types/requests"

export * from "./types/requests"

export const CHANNEL = "dekanat-app-plugin"

export function getProjects(connectionId: string, unusedRoleId: number, username: string) {
    return {
        channel: CHANNEL,
        method: "getProjects",
        connectionId,
        unusedRoleId,
        username,
    }
}

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
 * are separate copies of the original attributes, so they will not update automatically -
 * be sure to use {@link changeTableColumnAttributes} to change attributes
 * and ensure that the change cascades to views as well, and not use any lower-level methods for it.
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
 * Create a _Link Column_, which links the data of the affected table (_home table_ from here on)
 * to another table, the _foreign table_. The user can click on a cell of the link column and
 * choose a row from the foreign table to set the value of a foreign key column, causing
 * the row containing the cell and the row selected to be displayed next to each other.
 * This is how we make foreign keys and joins accessible to users who do not know SQL.
 * To keep things intuitive, the link column is equivalent to the link - any user functions
 * on the link, such as deleting it or adding more columns from the
 * foreign table, are done via the link column's context menu.
 * The link column itself displays the "Name" field of the linked row, or whichever column is
 * marked by the `isUserPrimary` attribute, with the table's name in parentheses.
 * More columns, up to the whole table, can be added with {@link createLookupColumn}.
 * Creating a link column also creates a similar link column in the target table. However, since
 * the link is a partial functional relation, this "backward" link column will give rise to
 * a 1:n relationship. For now, all linked values are aggregated into an array.
 * The backward link can not be edited; one must link rows via the forward link column (for now).
 *
 * Response: [SerializedColumn]{@link shared.dist.types/SerializedColumn} the newly created column.
 * @param {ViewId[]} addToHomeViews The column created in a table may or may not also be added
 * to all views. This parameter specifies which views to add the forward link column to.
 * If undefined, it is added to all views.
 * @param {ViewId[]} addToForeignViews Which of the views of the _foreign_ table should have the
 * _backward_ link column added to them.
 */
export function createLinkColumn(
    connectionId: string,
    tableId: TableId,
    column: LinkColumnSpecifier,
    addToHomeViews?: ViewId[],
    addToForeignViews?: ViewId[]
) {
    return {
        channel: CHANNEL,
        method: createLinkColumn.name,
        connectionId,
        tableId,
        column,
        addToHomeViews,
        addToForeignViews,
    }
}

/**
 * Create a _Lookup Column_, which adds another column to a link. For example, one could create
 * a link from a table "Employees" to a table "Departments", which would allow assigning each
 * employee a department. The link column itself would show the name of the department. To
 * also show the address alongside the name and the employee's remaining data, one would add a
 * lookup column to the link, specifying the home table, link, and ID of the additional column
 * that the lookup column should be based on.
 * Response: [SerializedColumn]{@link shared.dist.types/SerializedColumn} the newly created
 * lookup column.
 * Pre: The table `tableId` has a link with ID `column.linkId`, which points
 * to a table which has a column whose ID is `column.foreignColumn`.
 * Post: The table `tableId` has a new column whose data are taken from the other table's column
 * `column.foreignColumn`. Its index is such that it is directly to the right of the other
 * columns from the link. Its name is the name of `column.foreignColumn`, with the table name
 * in parentheses.
 */
export function createLookupColumn(
    connectionId: string,
    tableId: TableId,
    column: LookupColumnSpecifier,
    addToViews?: ViewId[]
) {
    return {
        channel: CHANNEL,
        method: createLookupColumn.name,
        connectionId,
        tableId,
        column,
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
 * Change the display name of a table column.
 * Rules:
 * R1 Column names are table-wide: Each column only has one name, across all views.
 * R2 Column names are table-specific: Renaming a column will not affect anything in other
 * tables, such as lookup columns.
 * The SQL column and all affected queries will not change, only the display name in the GUI.
 * Exceptions:
 * E1 there already exists a column with the same name => reject with error
 * Response: { message: string } A report that the column was renamed.
 */
export function renameTableColumn(
    connectionId: string,
    tableId: TableId,
    columnId: SerializedColumn["id"],
    newName: string
) {
    return {
        channel: CHANNEL,
        method: renameTableColumn.name,
        connectionId,
        tableId,
        columnId,
        newName,
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

/**
 * Delete one or many rows from a table.
 * `viewId` can be either the ID of a table or of a view, in the latter case the underlying table
 * is automatically found and the rows deleted appropriately.
 * Response: { rowsDeleted: number } the number of rows deleted.
 * Preconditions:
 * - the `index` properties of the rows go from 0 to `rows.length - 1`
 */
export function deleteRows(
    connectionId: string,
    viewId: ViewId | TableId,
    condition: number[] | number
) {
    return { channel: CHANNEL, method: deleteRows.name, connectionId, viewId, condition }
}

/**
 * Creates a new user settings object in the database.
 */
export function createUserSettings(
    connectionId: string,
    userId: number,
    defaultUserSettings?: string
) {
    return {
        channel: CHANNEL,
        method: createUserSettings.name,
        connectionId,
        userId,
        defaultUserSettings,
    }
}

/**
 * Creates a new user settings object in the database.
 */
export function getUserSettings(connectionId: string, userId: number) {
    return { channel: CHANNEL, method: getUserSettings.name, connectionId, userId }
}

/**
 * Update the user's settings.
 * @param settings json stringified user settings
 */
export function updateUserSettings(connectionId: string, userId: number, settings: string) {
    return { channel: CHANNEL, method: updateUserSettings.name, connectionId, userId, settings }
}
