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
import { insert } from "@intutable/database/dist/requests"
import * as pm from "@intutable/project-management/dist/requests"
import { ColumnDescriptor as PmColumn, TableInfo as RawTableInfo } from "@intutable/project-management/dist/types"
import { types as lvt, requests as lvr, selectable, asTable, asView } from "@intutable/lazy-views/"
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
import * as types from "shared/dist/types"
import { RowInsertData } from "./types/requests"
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
): Promise<types.TableDescriptor> {
    const internalName = sanitizeName(name)
    const existingTables = (await core.events.request(
        pm.getTablesFromProject(connectionId, projectId)
    )) as lvt.TableDescriptor[]
    if (existingTables.some(t => t.name === internalName))
        return error(createTable.name, "table name already taken", ErrorCode.alreadyTaken)
    const pmTable = (await core.events.request(
        pm.createTableInProject(connectionId, roleId, projectId, internalName, APP_TABLE_COLUMNS)
    )) as lvt.TableDescriptor
    const pmColumns = (await core.events.request(pm.getColumnsFromTable(connectionId, pmTable.id))) as PmColumn[]
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
    )) as lvt.ViewDescriptor

    // create default filter view
    const tableViewColumns = (await core.events
        .request(lvr.getViewInfo(connectionId, tableView.id))
        .then(info => info.columns)) as lvt.ColumnInfo[]
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
async function deleteTable(connectionId: string, id: types.TableId) {
    const filterViews = await listViews(connectionId, id)
    Promise.all(filterViews.map(v => core.events.request(lvr.deleteView(connectionId, v.id))))
    const tableViewOptions = (await core.events.request(lvr.getViewOptions(connectionId, id))) as lvt.ViewOptions
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
    tableId: lvt.ViewDescriptor["id"],
    column: types.StandardColumnSpecifier,
    addToViews?: types.ViewId[]
) {
    const options = (await core.events.request(lvr.getViewOptions(connectionId, tableId))) as lvt.ViewOptions
    const key = sanitizeName(column.name)
    const tableColumn = await core.events.request(pm.createColumnInTable(connectionId, asTable(options.source).id, key))
    // add column to table and filter views
    const columnIndex =
        options.columnOptions.columns.length + options.columnOptions.joins.reduce((acc, j) => acc + j.columns.length, 0)
    const allAttributes: Partial<types.DB.Column> = {
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
    tableId: lvt.ViewDescriptor["id"],
    column: lvt.ColumnSpecifier,
    joinId: number | null = null,
    addToViews?: types.ViewId[]
): Promise<lvt.ColumnInfo> {
    const tableColumn = (await core.events.request(
        lvr.addColumnToView(connectionId, tableId, column, joinId)
    )) as lvt.ColumnInfo
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
    tableId: lvt.ViewDescriptor["id"],
    column: lvt.ColumnSpecifier,
    views?: types.ViewId[]
): Promise<lvt.ColumnInfo[]> {
    const filterViews = (await core.events.request(
        lvr.listViews(connectionId, selectable.viewId(tableId))
    )) as lvt.ViewDescriptor[]
    const selectedViews = views === undefined ? filterViews : filterViews.filter(v => views.includes(v.id))
    return Promise.all(selectedViews.map(v => core.events.request(lvr.addColumnToView(connectionId, v.id, column))))
}

async function removeColumnFromTable_({ connectionId, tableId, columnId }: CoreRequest): Promise<CoreResponse> {
    return removeColumnFromTable(connectionId, tableId, columnId)
}
async function removeColumnFromTable(
    connectionId: string,
    tableId: lvt.ViewDescriptor["id"],
    columnId: lvt.ColumnInfo["id"]
) {
    const tableInfo = (await core.events.request(lvr.getViewInfo(connectionId, tableId))) as lvt.ViewInfo

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

async function removeLinkColumn(connectionId: string, tableId: number, column: lvt.ColumnInfo): Promise<void> {
    const info = (await core.events.request(lvr.getViewInfo(connectionId, tableId))) as lvt.ViewInfo
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

async function removeStandardColumn(connectionId: string, tableId: number, column: lvt.ColumnInfo): Promise<void> {
    await removeColumnFromViews(connectionId, tableId, column.id)
    await core.events.request(lvr.removeColumnFromView(connectionId, column.id))
    await core.events.request(pm.removeColumn(connectionId, column.parentColumnId))
}

async function removeLookupColumn(connectionId: string, tableId: number, columnId: number): Promise<void> {
    await removeColumnFromViews(connectionId, tableId, columnId)
    await core.events.request(lvr.removeColumnFromView(connectionId, columnId))
}

async function shiftColumnIndicesAfterDelete(connectionId: string, tableId: types.TableId) {
    // in case of links, more columns than the one specified may have
    // disappeared, so simply decrementing all indices by one is not enough - we have to
    // go over them all and adjust their index appropriately.
    const tableInfo = (await core.events.request(lvr.getViewInfo(connectionId, tableId))) as lvt.ViewInfo

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
    )) as lvt.ViewDescriptor[]
    await Promise.all(
        views.map(async v => {
            const info = (await core.events.request(lvr.getViewInfo(connectionId, v.id))) as lvt.ViewInfo
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
    update: types.CustomColumnAttributes,
    changeInViews = true
): Promise<types.SerializedColumn[]> {
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
    update: Partial<types.DB.Column>
): Promise<types.SerializedColumn[]> {
    const views = (await core.events.request(
        lvr.listViews(connectionId, selectable.viewId(tableId))
    )) as lvt.ViewDescriptor[]
    const viewColumns: (lvt.ColumnInfo | undefined)[] = await Promise.all(
        views.map(async v => {
            const info = (await core.events.request(lvr.getViewInfo(connectionId, v.id))) as lvt.ViewInfo
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
async function getTableData(connectionId: string, tableId: types.TableId) {
    return core.events.request(lvr.getViewData(connectionId, tableId)).then(table => parser.parseTable(table))
}

async function createView_({ connectionId, tableId, name }: CoreRequest): Promise<CoreResponse> {
    const existingViews = await listViews(connectionId, tableId)
    if (existingViews.some(v => v.name === name))
        return error(req.createView.name, `view named ${name} already exists`, ErrorCode.alreadyTaken)
    return createView(connectionId, tableId, name)
}
async function createView(connectionId: string, tableId: types.TableId, name: string): Promise<types.ViewDescriptor> {
    const tableInfo = (await core.events.request(lvr.getViewInfo(connectionId, tableId))) as lvt.ViewInfo
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
async function renameView(connectionId: string, viewId: types.ViewId, newName: string): Promise<types.ViewDescriptor> {
    const options = await coreRequest<lvt.ViewOptions>(lvr.getViewOptions(connectionId, viewId))
    // prevent renaming the default view
    if (options.name === defaultViewName())
        return error("renameView", "cannot rename default view", ErrorCode.changeDefaultView)

    // check if name is taken
    const otherViews = await listViews(connectionId, viewId)
    const isTaken = otherViews.map(view => view.name.toLowerCase()).includes(newName.toLowerCase())
    if (isTaken) return error("renameView", `name ${newName} already taken`, ErrorCode.alreadyTaken)

    return coreRequest<types.ViewDescriptor>(lvr.renameView(connectionId, viewId, newName))
}
async function deleteView_({ connectionId, viewId }: CoreRequest): Promise<CoreResponse> {
    return deleteView(connectionId, viewId)
}
async function deleteView(connectionId: string, viewId: types.ViewId) {
    const options = await coreRequest<lvt.ViewOptions>(lvr.getViewOptions(connectionId, viewId))
    if (options.name === defaultViewName())
        return error("deleteView", "cannot delete the default view", ErrorCode.changeDefaultView)
    await coreRequest(lvr.deleteView(connectionId, viewId))
    return { message: `deleted view #${viewId}` }
}

async function listViews_({ connectionId, id }: CoreRequest): Promise<CoreResponse> {
    return listViews(connectionId, id)
}
async function listViews(connectionId: string, id: types.TableId) {
    return core.events.request(lvr.listViews(connectionId, selectable.viewId(id))) as Promise<lvt.ViewDescriptor[]>
}

async function getViewData_({ connectionId, viewId }: CoreRequest): Promise<CoreResponse> {
    return getViewData(connectionId, viewId)
}
async function getViewData(connectionId: string, viewId: types.ViewId) {
    return core.events.request(lvr.getViewData(connectionId, viewId)).then(view => parser.parseView(view))
}

async function changeViewFilters_({ connectionId, viewId, newFilters }: CoreRequest): Promise<CoreResponse> {
    return changeViewFilters(connectionId, viewId, newFilters)
}
async function changeViewFilters(connectionId: string, viewId: types.ViewId, newFilters: types.Filter[]) {
    let options = (await core.events.request(lvr.getViewOptions(connectionId, viewId))) as lvt.ViewOptions
    if (options.name === defaultViewName()) return error("changeViewFilters", "cannot change default view")
    const newRowOptions: lvt.RowOptions = {
        ...options.rowOptions,
        conditions: newFilters.map(ParserClass.deparseFilter),
    }
    await core.events.request(lvr.changeRowOptions(connectionId, viewId, newRowOptions))
    options = (await core.events.request(lvr.getViewOptions(connectionId, viewId))) as lvt.ViewOptions
    return options.rowOptions.conditions.map(ParserClass.deparseFilter)
}

async function createRow_({ connectionId, viewId, data }: CoreRequest): Promise<CoreResponse> {
    return createRow(connectionId, viewId, data)
}

async function createRow(connectionId: string, viewId: types.ViewId, data: RowInsertData = {}) {
    const info: lvt.ViewInfo = await core.events.request(lvr.getViewInfo(connectionId, viewId))
    let stringData: Record<string, unknown>
    try {
        stringData = mapRowInsertDataToStrings(info, data)
    } catch (e) {
        return error("createRow", e.message)
    }
    await createRowInRawView(connectionId, asView(info.source).view.id, stringData)
    return { message: `inserted new row in table ${asView(info.source).view.id}` }
}

/**
 * Traverse a chain of raw views down to the raw table at the bottom and insert a new row in it.
 * Precondition: All columns (keys) in `data` are of kind `standard`, which means, among other
 * things, that they belong to the base view or base table of each view in the chain, never to
 * a join.
 */
async function createRowInRawView(connectionId: string, viewId: types.ViewId, data: Record<string, unknown>) {
    const tableViewOptions: lvt.ViewOptions = await core.events.request(lvr.getViewOptions(connectionId, viewId))
    if (selectable.isTable(tableViewOptions.source)) {
        const rawTableInfo: RawTableInfo = await core.events.request(
            pm.getTableInfo(connectionId, tableViewOptions.source.id)
        )
        await core.events.request(insert(connectionId, rawTableInfo.table.key, data))
    } else if (selectable.isView(tableViewOptions.source)) {
        await createRowInRawView(connectionId, tableViewOptions.source.id, data)
    }
}
/**
 * Row inserts and updates are specified with { column ID -> value } maps. To actually insert
 * in the database, we need their string names. This function takes a view or table's
 * raw view info and the update data and creates a new update data set with the proper names.
 */
function mapRowInsertDataToStrings(viewInfo: lvt.ViewInfo, update: RowInsertData): Record<string, unknown> {
    const stringUpdate: Record<string, unknown> = {}
    for (const key in update) {
        // the for-let-in construction always gives you the keys as strings.
        const column = viewInfo.columns.find(c => c.id.toString() === key)
        if (column === undefined) throw new TypeError(`view ${viewInfo.descriptor.id} has no column with ID ${key}`)
        else if (column.attributes.kind !== "standard")
            throw new TypeError(`column ${key} is not a standard column, but is of kind ${column.attributes.kind}`)
        else stringUpdate[column.name] = update[key]
    }
    return stringUpdate
}
