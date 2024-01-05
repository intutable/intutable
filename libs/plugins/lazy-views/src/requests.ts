import { Column } from "@intutable-org/database/dist/types"
import { RowOptions, ColumnOptions, JoinSpecifier, ColumnSpecifier } from "./types"
import { SelectableSpecifier } from "./types/selectable"

export const CHANNEL = "lazy-views"

/**
 * Create a view with the given options.
 *
 * Response: [ViewDescriptor]{@link types.ViewDescriptor}
 * @param {SelectableSpecifier} source The table or view that this view selects
 * from.
 * @param {string} name
 * @param {number | null} userId a user to assign the view to, can be null.
 * @param {ColumnOptions} columnOptions columns and joins to other views.
 * @param {RowOptions} rowOptions filters, sorting, and grouping on rows.
 * There are utility functions in the /condition module for creating the
 * filters.
 */
export function createView(
    connectionId: string,
    source: SelectableSpecifier,
    name: string,
    columnOptions: ColumnOptions,
    rowOptions: RowOptions,
    userId: number | null = null
) {
    return {
        channel: CHANNEL,
        method: createView.name,
        connectionId,
        source,
        name,
        columnOptions,
        rowOptions,
        userId,
    }
}

/**
 * Delete a view.
 *
 * Response: `{ message: string }` A report that the view was deleted or
 * did not exist.
 * @param {boolean} rejectIfNotExists whether to reject or resolve if the
 * specified view does not exist.
 */
export function deleteView(connectionId: string, id: number, rejectIfNotExists = false) {
    return {
        channel: CHANNEL,
        method: deleteView.name,
        connectionId,
        id,
        rejectIfNotExists,
    }
}

/**
 * List all views on a given table.
 *
 * Response: [ViewDescriptor[]]{@link types.ViewDescriptor} a list of views.
 */
export function listViews(connectionId: string, source: SelectableSpecifier) {
    return {
        channel: CHANNEL,
        method: listViews.name,
        connectionId,
        source,
    }
}

/**
 * Get a summary of a view's specifications.
 *
 * Response: [ViewOptions]{@link types.ViewOptions}
 * a summary of the specifications by
 * which the view was created. Matches the data that went into
 * {@link createView}, so it does not, for instance, contain the
 * IDs under which columns are stored. For that, you need
 * {@link getViewInfo}. However, this method has fewer
 * DB accesses and is much faster than {@link getViewInfo}.
 */
export function getViewOptions(connectionId: string, id: number) {
    return {
        channel: CHANNEL,
        method: getViewOptions.name,
        connectionId,
        id,
    }
}

/**
 * Get more detailed info about a view, in particular also the components'
 * IDs, which are needed for stuff like deleting and setting filters/sorting.
 * Requires expanding the tree of the view and its joins' target views, so it
 * is much more expensive than {@link getViewOptions}.
 *
 * Response: [ViewInfo]{@link types.ViewInfo}
 */
export function getViewInfo(connectionId: string, id: number) {
    return { channel: CHANNEL, method: getViewInfo.name, connectionId, id }
}

/**
 * Select all data from a view.
 * @param rowOptions one-time row options. If any props of this are set, they override those
 * of the view itself - i.e. the actual row options used to select are constructed as
 * `{ ...originalRowOptions, ...oneTimeRowOptions }`. The `ViewData` returned will only
 * include the original rowOptions from the database.
 *
 * Response: [ViewData]{@link types.ViewData}
 * the result of {@link getViewInfo}, along with the result set
 * (rows) of selecting from the view.
 */
export function getViewData(
    connectionId: string,
    id: number,
    oneTimeRowOptions?: Partial<RowOptions>
) {
    return { channel: CHANNEL, method: getViewData.name, connectionId, id, oneTimeRowOptions }
}

/**
 * Rename a view.
 *
 * Response: [ViewDescriptor]{@link types.ViewDescriptor}
 * the descriptor of the newly renamed view.
 */
export function renameView(connectionId: string, id: number, newName: string) {
    return {
        channel: CHANNEL,
        method: renameView.name,
        connectionId,
        id,
        newName,
    }
}

/**
 * Add a column to a view.
 *
 * Response: [ColumnInfo]{@link types.ColumnInfo}
 * The new column's full data, along with IDs and everything.
 * @param {ColumnSpecifier} column the attributes and parent column to be
 * added. WARNING: if the parent column belongs to a join, you must specify
 * `joinId`, or you may be creating a valid but unintended column, as IDs
 * need not be unique.
 * @param {number | undefined} joinId the ID of the join (or `undefined`,
 * if the column belongs to the base source of the view) from which the
 * parent column comes.
 */
export function addColumnToView(
    connectionId: string,
    viewId: number,
    column: ColumnSpecifier,
    joinId?: number
) {
    return {
        channel: CHANNEL,
        method: addColumnToView.name,
        connectionId,
        viewId,
        column,
        joinId: joinId || null,
    }
}

/**
 * Remove a column from a view. Fails if the column was not present before.
 *
 * Response: `{ message: string }`
 * a report that the column was deleted.
 */
export function removeColumnFromView(connectionId: string, id: number) {
    return {
        channel: CHANNEL,
        method: removeColumnFromView.name,
        connectionId,
        id,
    }
}

/**
 * Add join to a view.
 *
 * Response: [JoinDescriptor]{@link types.JoinDescriptor}
 * a descriptor of the newly added join.
 */
export function addJoinToView(connectionId: string, viewId: number, join: JoinSpecifier) {
    return {
        channel: CHANNEL,
        method: addJoinToView.name,
        connectionId,
        viewId,
        join,
    }
}

/**
 * Remove a join, deleting all its columns as well.
 *
 * Response: pass on the response from the database plugin's `delete` method.
 */
export function removeJoinFromView(connectionId: string, id: number) {
    return {
        channel: CHANNEL,
        method: removeJoinFromView.name,
        connectionId,
        id,
    }
}

/**
 * Overwrite the row options of a view. Incremental changes are not yet
 * implemented, alas.
 *
 * Response: pass on the response from the database plugin's `update` method.
 * @param {number} id the ID of the view.
 */
export function changeRowOptions(connectionId: string, id: number, newOptions: RowOptions) {
    return {
        channel: CHANNEL,
        method: changeRowOptions.name,
        connectionId,
        id,
        newOptions,
    }
}

/**
 * Update the (custom) attributes of a column. The basic attributes
 * (ID, name, ...) cannot be directly altered, as they are fundamental
 * to a column's definition.
 *
 * Response: [ColumnInfo]{@link types.ColumnInfo}
 * the column's updated information.
 */
export function changeColumnAttributes(
    connectionId: string,
    id: number,
    attributes: Record<string, any>
) {
    return {
        channel: CHANNEL,
        method: "changeColumnAttributes",
        connectionId,
        id,
        attributes,
    }
}

/**
 * Get the {@link ColumnInfo} of one column by its ID.
 *
 * Response: [ColumnInfo]{@link types.ColumnInfo}
 * The full information of the column.
 */
export function getColumnInfo(connectionId: string, id: number) {
    return {
        channel: CHANNEL,
        method: "getColumnInfo",
        connectionId,
        id,
    }
}

/**
 * Add a meta attribute for columns. This can then be populated by setting
 * the `attributes` of a given column or with {@link changeColumnAttributes}
 *
 * Response: pass on the response from the database plugin's `addColumn` method.
 */
export function addColumnAttribute(connectionId: string, column: Column) {
    return {
        channel: CHANNEL,
        method: "addColumnAttribute",
        connectionId,
        column,
    }
}

/**
 * Remove meta attribute for columns. Not for any specific columns - the
 * attribute in question will no longer exist nor be settable with
 * {@link changeColumnAttributes}.
 *
 * Response: pass on the response from the database plugin's `delete` method.
 */
export function removeColumnAttribute(connectionId: string, name: string) {
    return {
        channel: CHANNEL,
        method: "removeColumnAttribute",
        connectionId,
        name,
    }
}

/**
 * List all joins pointing to a given table or view, along with the view that they belong to.
 * Response: { join: JoinDescriptor, viewId: ViewId }[]
 */
export function listJoinsTo(connectionId: string, source: SelectableSpecifier) {
    return { channel: CHANNEL, method: listJoinsTo.name, connectionId, source }
}
