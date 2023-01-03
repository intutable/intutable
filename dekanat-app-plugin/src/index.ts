/**
 * This plugin provides the abstraction layer that dresses up views as
 * fancy tables: The user does not deal with SQL or with any SQL-y abstractions
 * like the @intutable/lazy-views plugin provides. Instead, they just see
 * a table which can have "links" to other tables, allowing rows in tables
 * to be linked to others by a foreign key. Internally, this is implemented
 * as a table with a foreign key, plus a view that contains the join.
 * So the table manipulation methods in this plugin e.g. ensure that
 * the table and view are always created, changed, and deleted
 * together. Another abstraction provided by this plugin is the conversion
 * to more GUI-friendly data types defined in
 * `shared/src/types/tables/serialized.ts`.
 *
 * Since this plugin is just the GUI's delegate or agent inside the Core,
 * responsible for pretty much anything that is too fiddly and complex to
 * burden the front-end team with, all kinds of functionality are
 * likely to accumulate here in the future. There is nothing stopping
 * us from breaking it up into multiple plugins (each in their
 * own workspace) in the future.
 *
 * It may eventually also be a security bonus to hide all methods that are not
 * provided by this plugin from the front-end.
 */
import { PluginLoader, CoreRequest, CoreResponse } from "@intutable/core"
import { insert, update } from "@intutable/database/dist/requests"
import * as pm from "@intutable/project-management/dist/requests"
import { RowOptions, ColumnSpecifier, requests as lvr, selectable, asTable } from "@intutable/lazy-views/"
import {
    defaultViewName,
    APP_TABLE_COLUMNS,
    immutableColumnAttributes,
    idColumnAttributes,
    indexColumnAttributes,
    standardColumnAttributes,
    emptyRowOptions,
    defaultRowOptions,
    COLUMN_INDEX_KEY,
} from "shared/dist/api"

import sanitizeName from "shared/dist/utils/sanitizeName"

import { parser, ParserClass } from "./transform/Parser"
import {
    RawViewId,
    RawTableId,
    RawViewDescriptor,
    RawTableDescriptor,
    RawViewOptions,
    RawViewInfo,
    RawTableColumnDescriptor,
    RawViewColumnInfo,
    TableId,
    ViewId,
    TableDescriptor,
    ViewDescriptor,
    TableData,
    SerializedColumn,
    Filter,
    StandardColumnSpecifier,
    DB,
    CustomColumnAttributes,
    Row,
} from "./types"
import { RowData, RawRowData } from "./types/requests"
import * as req from "./requests"
import { error, ErrorCode } from "./error"
import * as perm from "./permissions/requests"

let core: PluginLoader

export async function init(plugins: PluginLoader) {
    core = plugins

    core.listenForRequests(req.CHANNEL)
        .on(req.createTable.name, createTable_)
        .on(req.deleteTable.name, deleteTable_)
        .on(req.createStandardColumn.name, createStandardColumn_)
        .on(req.addColumnToTable.name, addColumnToTable_)
        .on(req.removeColumnFromTable.name, removeColumnFromTable_)
        .on(req.changeTableColumnAttributes.name, changeTableColumnAttributes_)
        .on(req.getTableData.name, getTableData_)
        .on(req.createView.name, createView_)
        .on(req.renameView.name, renameView_)
        .on(req.deleteView.name, deleteView_)
        .on(req.listViews.name, listViews_)
        .on(req.getViewData.name, getViewData_)
        .on(req.changeViewFilters.name, changeViewFilters_)
        .on(req.createRow.name, createRow_)
        .on(req.updateRows.name, updateRows_)
        .on(perm.getUsers.name, perm.getUsers_)
        .on(perm.getRoles.name, perm.getRoles_)
        .on(perm.createUser.name, perm.createUser_)
        .on(perm.deleteUser.name, perm.deleteUser_)
        .on(perm.changeRole.name, perm.changeRole_)
}

function coreRequest<T = unknown>(req: CoreRequest): Promise<T> {
    return core.events.request(req)
}
//==================== core methods ==========================

async function createTable_({ connectionId, roleId, projectId, name }: CoreRequest): Promise<CoreResponse> {
    return createTable(connectionId, roleId, projectId, name)
}
async function createTable(
    connectionId: string,
    roleId: number,
    projectId: number,
    name: string
): Promise<TableDescriptor> {
    const internalName = sanitizeName(name)
    const existingTables = (await core.events.request(
        pm.getTablesFromProject(connectionId, projectId)
    )) as RawTableDescriptor[]
    if (existingTables.some(t => t.name === internalName))
        return error(createTable.name, "table name already taken", ErrorCode.alreadyTaken)
    const pmTable = (await core.events.request(
        pm.createTableInProject(connectionId, roleId, projectId, internalName, APP_TABLE_COLUMNS)
    )) as RawTableDescriptor
    const pmColumns = (await core.events.request(
        pm.getColumnsFromTable(connectionId, pmTable.id)
    )) as RawTableColumnDescriptor[]
    const idColumn = pmColumns.find(c => c.name === "_id")!
    const idxColumn = pmColumns.find(c => c.name === COLUMN_INDEX_KEY)!
    const nameColumn = pmColumns.find(c => c.name === "name")!
    const columnSpecs = [
        { parentColumnId: idColumn.id, attributes: idColumnAttributes(0) },
        { parentColumnId: idxColumn.id, attributes: indexColumnAttributes(1) },
        {
            parentColumnId: nameColumn.id,
            attributes: standardColumnAttributes("Name", "string", 2, true),
        },
    ]
    const tableView = (await core.events.request(
        lvr.createView(
            connectionId,
            selectable.tableId(pmTable.id),
            /* Doesn't need to be sanitized, as it's not used as an SQL name */
            name,
            { columns: columnSpecs, joins: [] },
            emptyRowOptions(),
            roleId
        )
    )) as RawViewDescriptor

    // create default filter view
    const tableViewColumns = (await core.events
        .request(lvr.getViewInfo(connectionId, tableView.id))
        .then(info => info.columns)) as RawViewColumnInfo[]
    await core.events.request(
        lvr.createView(
            connectionId,
            selectable.viewId(tableView.id),
            defaultViewName(),
            { columns: [], /* [] means all columns */ joins: [] },
            defaultRowOptions(tableViewColumns),
            roleId
        )
    )
    return tableView
}
async function deleteTable_({ connectionId, id }: CoreRequest): Promise<CoreResponse> {
    return deleteTable(connectionId, id)
}
async function deleteTable(connectionId: string, id: TableId) {
    const filterViews = await listViews(connectionId, id)
    Promise.all(filterViews.map(v => core.events.request(lvr.deleteView(connectionId, v.id))))
    const tableViewOptions = (await core.events.request(lvr.getViewOptions(connectionId, id))) as RawViewOptions
    await core.events.request(lvr.deleteView(connectionId, id))
    await core.events.request(pm.removeTable(connectionId, selectable.asTable(tableViewOptions.source).id))
    return { message: `deleted table ${id}` }
}

async function createStandardColumn_({
    connectionId,
    tableId,
    column,
    addToViews,
}: CoreRequest): Promise<CoreResponse> {
    return createStandardColumn(connectionId, tableId, column, addToViews)
}
async function createStandardColumn(
    connectionId: string,
    tableId: RawViewDescriptor["id"],
    column: StandardColumnSpecifier,
    addToViews?: ViewId[]
) {
    const options = (await core.events.request(lvr.getViewOptions(connectionId, tableId))) as RawViewOptions
    const key = sanitizeName(column.name)
    const tableColumn = await core.events.request(pm.createColumnInTable(connectionId, asTable(options.source).id, key))
    // add column to table and filter views
    const columnIndex =
        options.columnOptions.columns.length + options.columnOptions.joins.reduce((acc, j) => acc + j.columns.length, 0)
    const allAttributes: Partial<DB.Column> = {
        ...standardColumnAttributes(column.name, column.cellType, columnIndex),
        ...parser.deparseColumn(column.attributes || {}),
    }
    const tableViewColumn = await addColumnToTable(
        connectionId,
        tableId,
        {
            parentColumnId: tableColumn.id,
            attributes: allAttributes,
        },
        null,
        addToViews
    )

    const parsedColumn = parser.parseColumn(tableViewColumn)
    return parsedColumn
}

async function addColumnToTable_({
    connectionId,
    tableId,
    column,
    joinId,
    addToViews,
}: CoreRequest): Promise<CoreResponse> {
    return addColumnToTable(connectionId, tableId, column, joinId, addToViews)
}
async function addColumnToTable(
    connectionId: string,
    tableId: RawViewDescriptor["id"],
    column: ColumnSpecifier,
    joinId: number | null = null,
    addToViews?: ViewId[]
): Promise<RawViewColumnInfo> {
    const tableColumn = (await core.events.request(
        lvr.addColumnToView(connectionId, tableId, column, joinId)
    )) as RawViewColumnInfo
    if (addToViews === undefined || addToViews.length !== 0)
        await addColumnToFilterViews(
            connectionId,
            tableId,
            {
                parentColumnId: tableColumn.id,
                attributes: tableColumn.attributes,
            },
            addToViews
        )
    return tableColumn
}

async function addColumnToFilterViews(
    connectionId: string,
    tableId: RawViewDescriptor["id"],
    column: ColumnSpecifier,
    views?: ViewId[]
): Promise<RawViewColumnInfo[]> {
    const filterViews = (await core.events.request(
        lvr.listViews(connectionId, selectable.viewId(tableId))
    )) as RawViewDescriptor[]
    const selectedViews = views === undefined ? filterViews : filterViews.filter(v => views.includes(v.id))
    return Promise.all(selectedViews.map(v => core.events.request(lvr.addColumnToView(connectionId, v.id, column))))
}

async function removeColumnFromTable_({ connectionId, tableId, columnId }: CoreRequest): Promise<CoreResponse> {
    return removeColumnFromTable(connectionId, tableId, columnId)
}
async function removeColumnFromTable(
    connectionId: string,
    tableId: RawViewDescriptor["id"],
    columnId: RawViewColumnInfo["id"]
) {
    const tableInfo = (await core.events.request(lvr.getViewInfo(connectionId, tableId))) as RawViewInfo

    if (!selectable.isTable(tableInfo.source))
        return error("removeColumnFromTable", `view #${tableId} is a filter view, not a table`)

    const column = tableInfo.columns.find(c => c.id === columnId)
    if (!column) return error("removeColumnFromTable", `view #${tableId} has no column with ID ${columnId}`)

    const kind = column.attributes.kind
    switch (kind) {
        case "standard":
            await removeStandardColumn(connectionId, tableId, column)
            break
        case "link":
            await removeLinkColumn(connectionId, tableId, column)
            break
        case "lookup":
            await removeLookupColumn(connectionId, tableId, columnId)
            break
        default:
            return error("removeColumnFromTable", `column #${columnId} has unknown kind ${kind}`)
    }

    // shift indices on remaining columns
    await shiftColumnIndicesAfterDelete(connectionId, tableId)
    return { message: `removed ${kind} column #${columnId}` }
}

async function removeLinkColumn(connectionId: string, tableId: number, column: RawViewColumnInfo): Promise<void> {
    const info = (await core.events.request(lvr.getViewInfo(connectionId, tableId))) as RawViewInfo
    const join = info.joins.find(j => j.id === column.joinId)

    if (!join) return error("removeColumnFromTable", `no join with ID ${column.joinId}, in table ${tableId}`)
    // remove lookup columns
    const lookupColumns = info.columns.filter(c => c.joinId === join.id && c.attributes.kind === "lookup")

    await Promise.all(lookupColumns.map(async c => removeColumnFromTable(connectionId, tableId, c.id)))
    // remove link column
    await removeColumnFromViews(connectionId, tableId, column.id)
    await core.events.request(lvr.removeColumnFromView(connectionId, column.id))
    // remove join and FK column
    await core.events.request(lvr.removeJoinFromView(connectionId, join.id))
    const fkColumnId = join.on[0]
    await core.events.request(pm.removeColumn(connectionId, fkColumnId))
}

async function removeStandardColumn(connectionId: string, tableId: number, column: RawViewColumnInfo): Promise<void> {
    await removeColumnFromViews(connectionId, tableId, column.id)
    await core.events.request(lvr.removeColumnFromView(connectionId, column.id))
    await core.events.request(pm.removeColumn(connectionId, column.parentColumnId))
}

async function removeLookupColumn(connectionId: string, tableId: number, columnId: number): Promise<void> {
    await removeColumnFromViews(connectionId, tableId, columnId)
    await core.events.request(lvr.removeColumnFromView(connectionId, columnId))
}

async function shiftColumnIndicesAfterDelete(connectionId: string, tableId: TableId) {
    // in case of links, more columns than the one specified may have
    // disappeared, so simply decrementing all indices by one is not enough - we have to
    // go over them all and adjust their index appropriately.
    const tableInfo = (await core.events.request(lvr.getViewInfo(connectionId, tableId))) as RawViewInfo

    const columns = [...tableInfo.columns]
    const idxKey = COLUMN_INDEX_KEY
    columns.sort((a, b) => a.attributes[idxKey] - b.attributes[idxKey])
    await Promise.all(
        columns.map(async (c, idx) => {
            if (c.attributes[idxKey] === idx) return
            else await changeTableColumnAttributes(connectionId, tableId, c.id, { [idxKey]: idx })
        })
    )
}

async function removeColumnFromViews(connectionId: string, tableId: number, parentColumnId: number): Promise<void> {
    const views = (await core.events.request(
        lvr.listViews(connectionId, selectable.viewId(tableId))
    )) as RawViewDescriptor[]
    await Promise.all(
        views.map(async v => {
            const info = (await core.events.request(lvr.getViewInfo(connectionId, v.id))) as RawViewInfo
            const viewColumn = info.columns.find(c => c.parentColumnId === parentColumnId)
            if (viewColumn) await core.events.request(lvr.removeColumnFromView(connectionId, viewColumn.id))
        })
    )
}

async function changeTableColumnAttributes_({
    connectionId,
    tableId,
    columnId,
    update,
    changeInViews,
}: CoreRequest): Promise<CoreResponse> {
    for (const illegalAttribute of immutableColumnAttributes)
        if (illegalAttribute in update)
            return error(
                req.changeTableColumnAttributes.name,
                `cannot edit immutable column attribute ${illegalAttribute}`,
                ErrorCode.writeInternalData
            )
    return changeTableColumnAttributes(connectionId, tableId, columnId, update, changeInViews)
}

async function changeTableColumnAttributes(
    connectionId: string,
    tableId: number,
    columnId: number,
    update: CustomColumnAttributes,
    changeInViews = true
): Promise<SerializedColumn[]> {
    const attributes = parser.deparseColumn(update)
    const tableColumn = await core.events
        .request(lvr.changeColumnAttributes(connectionId, columnId, attributes))
        .then(c => parser.parseColumn(c))
    if (changeInViews)
        return [tableColumn].concat(await changeColumnAttributesInViews(connectionId, tableId, columnId, attributes))
    else return [tableColumn]
}

async function changeColumnAttributesInViews(
    connectionId: string,
    tableId: number,
    columnId: number,
    update: Partial<DB.Column>
): Promise<SerializedColumn[]> {
    const views = (await core.events.request(
        lvr.listViews(connectionId, selectable.viewId(tableId))
    )) as RawViewDescriptor[]
    const viewColumns: (RawViewColumnInfo | undefined)[] = await Promise.all(
        views.map(async v => {
            const info = (await core.events.request(lvr.getViewInfo(connectionId, v.id))) as RawViewInfo
            const viewColumn = info.columns.find(c => c.parentColumnId === columnId)
            return viewColumn
        })
    )

    return Promise.all(
        viewColumns
            .filter(c => c !== undefined)
            .map(async c =>
                core.events
                    .request(lvr.changeColumnAttributes(connectionId, c.id, update))
                    .then(c => parser.parseColumn(c))
            )
    )
}

async function getTableData_({ connectionId, tableId }: CoreRequest): Promise<CoreResponse> {
    return getTableData(connectionId, tableId)
}
async function getTableData(connectionId: string, tableId: TableId) {
    return core.events.request(lvr.getViewData(connectionId, tableId)).then(table => parser.parseTable(table))
}

async function createView_({ connectionId, tableId, name }: CoreRequest): Promise<CoreResponse> {
    const existingViews = await listViews(connectionId, tableId)
    if (existingViews.some(v => v.name === name))
        return error(req.createView.name, `view named ${name} already exists`, ErrorCode.alreadyTaken)
    return createView(connectionId, tableId, name)
}
async function createView(connectionId: string, tableId: TableId, name: string): Promise<ViewDescriptor> {
    const tableInfo = (await core.events.request(lvr.getViewInfo(connectionId, tableId))) as RawViewInfo
    return core.events.request(
        lvr.createView(
            connectionId,
            selectable.viewId(tableId),
            name,
            { columns: [], joins: [] },
            defaultRowOptions(tableInfo.columns)
        )
    )
}

async function renameView_({ connectionId, viewId, newName }: CoreRequest): Promise<CoreResponse> {
    return renameView(connectionId, viewId, newName)
}
async function renameView(connectionId: string, viewId: ViewId, newName: string): Promise<ViewDescriptor> {
    const options = await coreRequest<RawViewOptions>(lvr.getViewOptions(connectionId, viewId))
    // prevent renaming the default view
    if (options.name === defaultViewName())
        return error("renameView", "cannot rename default view", ErrorCode.changeDefaultView)

    // check if name is taken
    const otherViews = await listViews(connectionId, viewId)
    const isTaken = otherViews.map(view => view.name.toLowerCase()).includes(newName.toLowerCase())
    if (isTaken) return error("renameView", `name ${newName} already taken`, ErrorCode.alreadyTaken)

    return coreRequest<ViewDescriptor>(lvr.renameView(connectionId, viewId, newName))
}
async function deleteView_({ connectionId, viewId }: CoreRequest): Promise<CoreResponse> {
    return deleteView(connectionId, viewId)
}
async function deleteView(connectionId: string, viewId: ViewId) {
    const options = await coreRequest<RawViewOptions>(lvr.getViewOptions(connectionId, viewId))
    if (options.name === defaultViewName())
        return error("deleteView", "cannot delete the default view", ErrorCode.changeDefaultView)
    await coreRequest(lvr.deleteView(connectionId, viewId))
    return { message: `deleted view #${viewId}` }
}

async function listViews_({ connectionId, id }: CoreRequest): Promise<CoreResponse> {
    return listViews(connectionId, id)
}
async function listViews(connectionId: string, id: TableId) {
    return core.events.request(lvr.listViews(connectionId, selectable.viewId(id))) as Promise<RawViewDescriptor[]>
}

async function getViewData_({ connectionId, viewId }: CoreRequest): Promise<CoreResponse> {
    return getViewData(connectionId, viewId)
}
async function getViewData(connectionId: string, viewId: ViewId) {
    return core.events.request(lvr.getViewData(connectionId, viewId)).then(view => parser.parseView(view))
}

async function changeViewFilters_({ connectionId, viewId, newFilters }: CoreRequest): Promise<CoreResponse> {
    return changeViewFilters(connectionId, viewId, newFilters)
}
async function changeViewFilters(connectionId: string, viewId: ViewId, newFilters: Filter[]) {
    let options = (await core.events.request(lvr.getViewOptions(connectionId, viewId))) as RawViewOptions
    if (options.name === defaultViewName()) return error("changeViewFilters", "cannot change default view")
    const newRowOptions: RowOptions = {
        ...options.rowOptions,
        conditions: newFilters.map(ParserClass.deparseFilter),
    }
    await core.events.request(lvr.changeRowOptions(connectionId, viewId, newRowOptions))
    options = (await core.events.request(lvr.getViewOptions(connectionId, viewId))) as RawViewOptions
    return options.rowOptions.conditions.map(ParserClass.deparseFilter)
}

async function createRow_({ connectionId, viewId, atIndex, values }: CoreRequest): Promise<CoreResponse> {
    return createRow(connectionId, viewId, atIndex, values)
}

async function createRow(
    connectionId: string,
    viewId: ViewId | TableId,
    atIndex: number | undefined = undefined,
    values: RowData = {}
) {
    // 1. find the column names needed to update the data in the actual raw table
    const viewInfo: RawViewInfo = await core.events.request(lvr.getViewInfo(connectionId, viewId))
    let rawData: Record<string, unknown>
    try {
        rawData = mapRowInsertDataToStrings(viewInfo, values)
    } catch (e) {
        return error("createRow", e.message)
    }

    // 2. get the data of the table (since we start out with a view ID)
    const tableViewId: RawViewId = await getTableViewId(connectionId, viewId)
    const tableData: TableData = await getTableData(connectionId, tableViewId)

    // 3. determine necessary index shifts
    if (atIndex > tableData.rows.length + 1 || atIndex < 0) return error("createRow", "invalid row index: " + atIndex)
    const actualIndex = atIndex ?? tableData.rows.length
    const { rowData: finalRowData, rowsToShift } = addIndexShifts(tableData, actualIndex, rawData)

    // 4. shift all rows after the desired index
    const rawTable: RawTableDescriptor = asTable(tableData.metadata.source).table
    await Promise.all(
        rowsToShift.map(async shift => {
            await core.events.request(
                update(connectionId, rawTable.key, {
                    condition: ["_id", shift.rowId],
                    update: { index: shift.index },
                })
            )
        })
    )
    // 5. insert the new row
    return core.events.request(insert(connectionId, rawTable.key, finalRowData, ["_id"]))
}

/**
 * Traverse a chain of views down to the bottom table view, i.e. the one that is based on a table,
 * not another view.
 * As of December 2022, we only have a fixed two layers, so the recursion is not necessary, but
 * we eventually want allow users to share views with others who in turn can sub-filter them,
 * which will probably have to be implemented by allowing them to create sub-views.
 * @return {number} the ID of the lowermost view in the chain (not the table, the view!)
 */
async function getTableViewId(connectionId: string, viewId: ViewId | TableId): Promise<RawTableId> {
    const viewOptions: RawViewOptions = await core.events.request(lvr.getViewOptions(connectionId, viewId))
    if (selectable.isTable(viewOptions.source)) {
        return viewId
    } else if (selectable.isView(viewOptions.source)) {
        return getTableViewId(connectionId, viewOptions.source.id)
    }
}

/**
 * Row inserts and updates are specified with { column ID -> value } maps. To actually insert
 * in the database, we need their string names. This function takes a view or table's
 * raw view info and the update data and creates a new update data set with the proper names.
 */
function mapRowInsertDataToStrings(viewData: RawViewInfo, update: RowData): RawRowData {
    const stringUpdate: Record<string, unknown> = {}
    for (const key in update) {
        // the for-let-in construction always gives you the keys as strings.
        const column = viewData.columns.find(c => c.id.toString() === key)
        if (column === undefined) throw new TypeError(`table ${viewData.descriptor.id} has no column with ID ${key}`)
        else if (column.attributes.kind !== "standard")
            throw new TypeError(`column ${key} is not a standard column, but is of kind ${column.attributes.kind}`)
        else stringUpdate[column.name] = update[key]
    }
    return stringUpdate
}

type IndexShiftData = { rowId: number; oldIndex: number; index: number }

function addIndexShifts(
    tableData: TableData,
    atIndex: number,
    rowData: Record<string, unknown>
): { rowData: Record<string, unknown>; rowsToShift: IndexShiftData[] } {
    const shifts = (tableData.rows as Row[])
        .sort((r1, r2) => r1.index - r2.index)
        .slice(atIndex) // yes, this is legitimate
        .map(row => ({
            rowId: row._id,
            oldIndex: row.index,
            index: row.index + 1,
        }))
    return { rowData: { ...rowData, index: atIndex }, rowsToShift: shifts }
}

async function updateRows_({ connectionId, viewId, condition, values }: CoreRequest): Promise<CoreResponse> {
    return updateRows(connectionId, viewId, condition, values)
}

async function updateRows(
    connectionId: string,
    viewId: ViewId | TableId,
    condition: number | number[],
    values: RowData
): Promise<{ rowsUpdated: number }> {
    // 1. map condition to sql table
    const rawViewInfo = await core.events.request(lvr.getViewInfo(connectionId, viewId))
    let rawCondition: (string | number | number[])[]
    if (typeof condition === "number") rawCondition = ["_id", condition]
    else rawCondition = ["_id", "in", condition]

    // 2. map update to sql table
    const rawUpdate = mapRowInsertDataToStrings(rawViewInfo, values)

    // 3. get table key
    const tableViewId: RawViewId = await getTableViewId(connectionId, viewId)
    const tableViewInfo: RawViewInfo = await core.events.request(lvr.getViewInfo(connectionId, tableViewId))
    const rawTable: RawTableDescriptor = asTable(tableViewInfo.source).table

    // 4. perform the update
    const updated = await core.events.request(
        update(connectionId, rawTable.key, { condition: rawCondition, update: rawUpdate })
    )
    return updated
}
