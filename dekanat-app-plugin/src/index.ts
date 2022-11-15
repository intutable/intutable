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
import * as pm from "@intutable/project-management/dist/requests"
import { ColumnDescriptor as PmColumn } from "@intutable/project-management/dist/types"
import {
    types as lvt,
    requests as lvr,
    selectable,
    asTable,
} from "@intutable/lazy-views/"
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
} from "shared/dist/defaults"

import {
    StandardColumnSpecifier,
    CustomColumnAttributes,
    DB,
    Filter,
    SerializedColumn,
} from "shared/dist/types"
import sanitizeName from "shared/dist/utils/sanitizeName"

import { parser, ParserClass } from "./transform/Parser"
import * as types from "./types"
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
async function createTable_({
    sessionID,
    userId,
    projectId,
    name,
}: CoreRequest): Promise<CoreResponse> {
    return createTable(sessionID, userId, projectId, name)
}
async function createTable(
    sessionID: string,
    userId: number,
    projectId: number,
    name: string
): Promise<types.TableDescriptor> {
    const internalName = sanitizeName(name)
    const existingTables = (await core.events.request(
        pm.getTablesFromProject(sessionID, projectId)
    )) as lvt.TableDescriptor[]
    if (existingTables.some(t => t.name === internalName))
        return error(
            createTable.name,
            "table name already taken",
            ErrorCode.alreadyTaken
        )
    const pmTable = (await core.events.request(
        pm.createTableInProject(
            sessionID,
            userId,
            projectId,
            internalName,
            APP_TABLE_COLUMNS
        )
    )) as lvt.TableDescriptor
    const pmColumns = (await core.events.request(
        pm.getColumnsFromTable(sessionID, pmTable.id)
    )) as PmColumn[]
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
            sessionID,
            selectable.tableId(pmTable.id),
            /* Doesn't need to be sanitized, as it's not used as an SQL name */
            name,
            { columns: columnSpecs, joins: [] },
            emptyRowOptions(),
            userId
        )
    )) as lvt.ViewDescriptor

    // create default filter view
    const tableViewColumns = (await core.events
        .request(lvr.getViewInfo(sessionID, tableView.id))
        .then(info => info.columns)) as lvt.ColumnInfo[]
    await core.events.request(
        lvr.createView(
            sessionID,
            selectable.viewId(tableView.id),
            defaultViewName(),
            { columns: [], /* [] means all columns */ joins: [] },
            defaultRowOptions(tableViewColumns),
            userId
        )
    )
    return tableView
}
async function deleteTable_({
    sessionID,
    id,
}: CoreRequest): Promise<CoreResponse> {
    return deleteTable(sessionID, id)
}
async function deleteTable(sessionID: string, id: types.TableId) {
    const filterViews = await listViews(sessionID, id)
    Promise.all(
        filterViews.map(v =>
            core.events.request(lvr.deleteView(sessionID, v.id))
        )
    )
    const tableViewOptions = (await core.events.request(
        lvr.getViewOptions(sessionID, id)
    )) as lvt.ViewOptions
    await core.events.request(lvr.deleteView(sessionID, id))
    await core.events.request(
        pm.removeTable(
            sessionID,
            selectable.asTable(tableViewOptions.source).id
        )
    )
    return { message: `deleted table ${id}` }
}

async function createStandardColumn_({
    sessionID,
    tableId,
    column,
    addToViews,
}: CoreRequest): Promise<CoreResponse> {
    return createStandardColumn(sessionID, tableId, column, addToViews)
}
async function createStandardColumn(
    sessionID: string,
    tableId: lvt.ViewDescriptor["id"],
    column: StandardColumnSpecifier,
    addToViews?: types.ViewId[]
) {
    const options = (await core.events.request(
        lvr.getViewOptions(sessionID, tableId)
    )) as lvt.ViewOptions
    const key = sanitizeName(column.name)
    const tableColumn = await core.events.request(
        pm.createColumnInTable(sessionID, asTable(options.source).id, key)
    )
    // add column to table and filter views
    const columnIndex =
        options.columnOptions.columns.length +
        options.columnOptions.joins.reduce(
            (acc, j) => acc + j.columns.length,
            0
        )
    const allAttributes: Partial<DB.Column> = {
        ...standardColumnAttributes(column.name, column.cellType, columnIndex),
        ...parser.deparseColumn(column.attributes || {}),
    }
    const tableViewColumn = await addColumnToTable(
        sessionID,
        tableId,
        {
            parentColumnId: tableColumn.id,
            attributes: allAttributes,
        },
        null,
        addToViews
    )

    //    const parsedColumn = parser.parseColumn(tableViewColumn)
    //    return parsedColumn
    return {}
}

async function addColumnToTable_({
    sessionID,
    tableId,
    column,
    joinId,
    addToViews,
}: CoreRequest): Promise<CoreResponse> {
    return addColumnToTable(sessionID, tableId, column, joinId, addToViews)
}
async function addColumnToTable(
    sessionID: string,
    tableId: lvt.ViewDescriptor["id"],
    column: lvt.ColumnSpecifier,
    joinId: number | null = null,
    addToViews?: types.ViewId[]
): Promise<lvt.ColumnInfo> {
    const tableColumn = (await core.events.request(
        lvr.addColumnToView(sessionID, tableId, column, joinId)
    )) as lvt.ColumnInfo
    if (addToViews === undefined || addToViews.length !== 0)
        await addColumnToFilterViews(
            sessionID,
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
    sessionID: string,
    tableId: lvt.ViewDescriptor["id"],
    column: lvt.ColumnSpecifier,
    views?: types.ViewId[]
): Promise<lvt.ColumnInfo[]> {
    const filterViews = (await core.events.request(
        lvr.listViews(sessionID, selectable.viewId(tableId))
    )) as lvt.ViewDescriptor[]
    const selectedViews =
        views === undefined
            ? filterViews
            : filterViews.filter(v => views.includes(v.id))
    return Promise.all(
        selectedViews.map(v =>
            core.events.request(lvr.addColumnToView(sessionID, v.id, column))
        )
    )
}

async function removeColumnFromTable_({
    sessionID,
    tableId,
    columnId,
}: CoreRequest): Promise<CoreResponse> {
    return removeColumnFromTable(sessionID, tableId, columnId)
}
async function removeColumnFromTable(
    sessionID: string,
    tableId: lvt.ViewDescriptor["id"],
    columnId: lvt.ColumnInfo["id"]
) {
    let tableInfo = (await core.events.request(
        lvr.getViewInfo(sessionID, tableId)
    )) as lvt.ViewInfo

    if (!selectable.isTable(tableInfo.source))
        return error(
            "removeColumnFromTable",
            `view #${tableId} is a filter view, not a table`
        )

    const column = tableInfo.columns.find(c => c.id === columnId)
    if (!column)
        return error(
            "removeColumnFromTable",
            `view #${tableId} has no column with ID ${columnId}`
        )

    const kind = column.attributes.kind
    switch (kind) {
        case "standard":
            await removeStandardColumn(sessionID, tableId, column)
            break
        case "link":
            await removeLinkColumn(sessionID, tableId, column)
            break
        case "lookup":
            await removeLookupColumn(sessionID, tableId, columnId)
            break
        default:
            return error(
                "removeColumnFromTable",
                `column #${columnId} has unknown kind ${kind}`
            )
    }

    // shift indices on remaining columns
    // in case of links, more columns than the one specified may have
    // disappeared, so we need to refresh.
    tableInfo = (await core.events.request(
        lvr.getViewInfo(sessionID, tableId)
    )) as lvt.ViewInfo

    const idxKey = COLUMN_INDEX_KEY
    await Promise.all(
        tableInfo.columns
            .filter(c => c.attributes[idxKey] > column.attributes[idxKey])
            .map(async c => {
                console.log("updating index of column " + c.id)
                changeTableColumnAttributes(sessionID, tableId, c.id, {
                    [idxKey]: c.attributes[idxKey] - 1,
                })
            })
    )

    return { message: `removed ${kind} column #${columnId}` }
}

async function removeLinkColumn(
    sessionID: string,
    tableId: number,
    column: lvt.ColumnInfo
): Promise<void> {
    const info = (await core.events.request(
        lvr.getViewInfo(sessionID, tableId)
    )) as lvt.ViewInfo
    const join = info.joins.find(j => j.id === column.joinId)

    if (!join)
        return error(
            "removeColumnFromTable",
            `no join with ID ${column.joinId}, in table ${tableId}`
        )
    // remove lookup columns
    const lookupColumns = info.columns.filter(
        c => c.joinId === join.id && c.attributes.kind === "lookup"
    )

    await Promise.all(
        lookupColumns.map(async c =>
            removeColumnFromTable(sessionID, tableId, c.id)
        )
    )
    // remove link column
    await removeColumnFromViews(sessionID, tableId, column.id)
    await core.events.request(lvr.removeColumnFromView(sessionID, column.id))
    // remove join and FK column
    await core.events.request(lvr.removeJoinFromView(sessionID, join.id))
    const fkColumnId = join.on[0]
    await core.events.request(pm.removeColumn(sessionID, fkColumnId))
}

async function removeStandardColumn(
    sessionID: string,
    tableId: number,
    column: lvt.ColumnInfo
): Promise<void> {
    await removeColumnFromViews(sessionID, tableId, column.id)
    await core.events.request(lvr.removeColumnFromView(sessionID, column.id))
    await core.events.request(pm.removeColumn(sessionID, column.parentColumnId))
}

async function removeLookupColumn(
    sessionID: string,
    tableId: number,
    columnId: number
): Promise<void> {
    await removeColumnFromViews(sessionID, tableId, columnId)
    await core.events.request(lvr.removeColumnFromView(sessionID, columnId))
}

/**
 * Given a list of columns, return a list of columns whose index is wrong
 * and the new index it they should have.
 */
function getColumnIndexUpdates(
    columns: lvt.ColumnInfo[]
): { id: number; index: number }[] {
    return columns
        .map((c, index) => ({ column: c, index }))
        .filter(
            pair => pair.column.attributes["__columnIndex__"] !== pair.index
        )
        .map(pair => ({
            id: pair.column.id,
            index: pair.index,
        }))
}

async function removeColumnFromViews(
    sessionID: string,
    tableId: number,
    parentColumnId: number
): Promise<void> {
    const views = (await core.events.request(
        lvr.listViews(sessionID, selectable.viewId(tableId))
    )) as lvt.ViewDescriptor[]
    await Promise.all(
        views.map(async v => {
            const info = (await core.events.request(
                lvr.getViewInfo(sessionID, v.id)
            )) as lvt.ViewInfo
            const viewColumn = info.columns.find(
                c => c.parentColumnId === parentColumnId
            )
            if (viewColumn)
                await core.events.request(
                    lvr.removeColumnFromView(sessionID, viewColumn.id)
                )
        })
    )
}

async function changeTableColumnAttributes_({
    sessionID,
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
    return changeTableColumnAttributes(
        sessionID,
        tableId,
        columnId,
        update,
        changeInViews
    )
}

async function changeTableColumnAttributes(
    sessionID: string,
    tableId: number,
    columnId: number,
    update: CustomColumnAttributes,
    changeInViews = true
): Promise<SerializedColumn[]> {
    const attributes = parser.deparseColumn(update)
    const tableColumn = await core.events
        .request(lvr.changeColumnAttributes(sessionID, columnId, attributes))
        .then(c => parser.parseColumn(c))
    if (changeInViews)
        return [tableColumn].concat(
            await changeColumnAttributesInViews(
                sessionID,
                tableId,
                columnId,
                attributes
            )
        )
    else return [tableColumn]
}

async function changeColumnAttributesInViews(
    sessionID: string,
    tableId: number,
    columnId: number,
    update: Partial<DB.Column>
): Promise<SerializedColumn[]> {
    const views = (await core.events.request(
        lvr.listViews(sessionID, selectable.viewId(tableId))
    )) as lvt.ViewDescriptor[]
    const viewColumns: (lvt.ColumnInfo | undefined)[] = await Promise.all(
        views.map(async v => {
            const info = (await core.events.request(
                lvr.getViewInfo(sessionID, v.id)
            )) as lvt.ViewInfo
            const viewColumn = info.columns.find(
                c => c.parentColumnId === columnId
            )
            return viewColumn
        })
    )

    return Promise.all(
        viewColumns
            .filter(c => c !== undefined)
            .map(async c =>
                core.events
                    .request(
                        lvr.changeColumnAttributes(sessionID, c.id, update)
                    )
                    .then(c => parser.parseColumn(c))
            )
    )
}

async function getTableData_({
    sessionID,
    tableId,
}: CoreRequest): Promise<CoreResponse> {
    return getTableData(sessionID, tableId)
}
async function getTableData(sessionID: string, tableId: types.TableId) {
    return core.events
        .request(lvr.getViewData(sessionID, tableId))
        .then(table => parser.parseTable(table))
}

async function createView_({
    sessionID,
    tableId,
    userId,
    name,
}: CoreRequest): Promise<CoreResponse> {
    const existingViews = await listViews(sessionID, tableId)
    if (existingViews.some(v => v.name === name))
        return error(
            req.createView.name,
            `view named ${name} already exists`,
            ErrorCode.alreadyTaken
        )
    return createView(sessionID, userId, tableId, name)
}
async function createView(
    sessionID: string,
    userId: number,
    tableId: types.TableId,
    name: string
): Promise<types.ViewDescriptor> {
    const tableInfo = (await core.events.request(
        lvr.getViewInfo(sessionID, tableId)
    )) as lvt.ViewInfo
    return core.events.request(
        lvr.createView(
            sessionID,
            selectable.viewId(tableId),
            name,
            { columns: [], joins: [] },
            defaultRowOptions(tableInfo.columns),
            userId
        )
    )
}

async function renameView_({
    sessionID,
    viewId,
    newName,
}: CoreRequest): Promise<CoreResponse> {
    return renameView(sessionID, viewId, newName)
}
async function renameView(
    sessionID: string,
    viewId: types.ViewId,
    newName: string
): Promise<types.ViewDescriptor> {
    const options = await coreRequest<lvt.ViewOptions>(
        lvr.getViewOptions(sessionID, viewId)
    )
    // prevent renaming the default view
    if (options.name === defaultViewName())
        return error(
            "renameView",
            "cannot rename default view",
            ErrorCode.changeDefaultView
        )

    // check if name is taken
    const otherViews = await listViews(sessionID, viewId)
    const isTaken = otherViews
        .map(view => view.name.toLowerCase())
        .includes(newName.toLowerCase())
    if (isTaken)
        return error(
            "renameView",
            `name ${newName} already taken`,
            ErrorCode.alreadyTaken
        )

    return coreRequest<types.ViewDescriptor>(
        lvr.renameView(sessionID, viewId, newName)
    )
}
async function deleteView_({
    sessionID,
    viewId,
}: CoreRequest): Promise<CoreResponse> {
    return deleteView(sessionID, viewId)
}
async function deleteView(sessionID: string, viewId: types.ViewId) {
    const options = await coreRequest<lvt.ViewOptions>(
        lvr.getViewOptions(sessionID, viewId)
    )
    if (options.name === defaultViewName())
        return error(
            "deleteView",
            "cannot delete the default view",
            ErrorCode.changeDefaultView
        )
    await coreRequest(lvr.deleteView(sessionID, viewId))
    return { message: `deleted view #${viewId}` }
}

async function listViews_({
    sessionID,
    id,
}: CoreRequest): Promise<CoreResponse> {
    return listViews(sessionID, id)
}
async function listViews(sessionID: string, id: types.TableId) {
    return core.events.request(
        lvr.listViews(sessionID, selectable.viewId(id))
    ) as Promise<lvt.ViewDescriptor[]>
}

async function getViewData_({
    sessionID,
    viewId,
}: CoreRequest): Promise<CoreResponse> {
    return getViewData(sessionID, viewId)
}
async function getViewData(sessionID: string, viewId: types.ViewId) {
    return core.events
        .request(lvr.getViewData(sessionID, viewId))
        .then(view => parser.parseView(view))
}

async function changeViewFilters_({
    sessionID,
    viewId,
    newFilters,
}: CoreRequest): Promise<CoreResponse> {
    return changeViewFilters(sessionID, viewId, newFilters)
}
async function changeViewFilters(
    sessionID: string,
    viewId: types.ViewId,
    newFilters: Filter[]
) {
    let options = (await core.events.request(
        lvr.getViewOptions(sessionID, viewId)
    )) as lvt.ViewOptions
    if (options.name === defaultViewName())
        return error("changeViewFilters", "cannot change default view")
    const newRowOptions: lvt.RowOptions = {
        ...options.rowOptions,
        conditions: newFilters.map(ParserClass.deparseFilter),
    }
    await core.events.request(
        lvr.changeRowOptions(sessionID, viewId, newRowOptions)
    )
    options = (await core.events.request(
        lvr.getViewOptions(sessionID, viewId)
    )) as lvt.ViewOptions
    return options.rowOptions.conditions.map(ParserClass.deparseFilter)
}
