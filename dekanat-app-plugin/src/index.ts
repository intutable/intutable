/**
 * This plugin allows us to run initialization (config, example data)
 * on starting up the core. We can also create methods to allow complex
 * tasks to be accomplished with only one network request. It may eventually
 * even be a security bonus to create highly specific methods and expose only
 * them for use by the front-end.
 */
import { PluginLoader, CoreRequest, CoreResponse } from "@intutable/core"
import * as pm from "@intutable/project-management/dist/requests"
import {
    types as lvt,
    requests as lvr,
    selectable,
    asTable,
} from "@intutable/lazy-views/"
import { standardColumnAttributes } from "shared/dist/attributes"
import {
    StandardColumnSpecifier,
    CustomColumnAttributes,
    DB,
    Filter,
} from "shared/dist/types"
import { DBParser } from "./transform/parse"
import sanitizeName from "shared/dist/utils/sanitizeName"
import { defaultViewName } from "shared/dist/defaults"

import * as types from "./types"
import * as req from "./requests"
import { error } from "./internal/error"
import * as perm from "./permissions/requests"

let core: PluginLoader

export async function init(plugins: PluginLoader) {
    core = plugins

    core.listenForRequests(req.CHANNEL)
        .on(req.createStandardColumn.name, createStandardColumn_)
        .on(req.addColumnToTable.name, addColumnToTable_)
        .on(req.removeColumnFromTable.name, removeColumnFromTable_)
        .on(req.changeTableColumnAttributes.name, changeTableColumnAttributes_)
        .on(req.getTableData.name, getTableData_)
        .on(req.getViewData.name, getViewData_)
        .on(req.changeViewFilters.name, changeViewFilters_)
        .on(perm.getUsers.name, perm.getUsers_)
        .on(perm.getRoles.name, perm.getRoles_)
        .on(perm.createUser.name, perm.createUser_)
        .on(perm.deleteUser.name, perm.deleteUser_)
        .on(perm.changeRole.name, perm.changeRole_)
}

//==================== core methods ==========================
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
    const allAttributes: CustomColumnAttributes = {
        ...standardColumnAttributes(column.name, column.cellType, columnIndex),
        ...(column.attributes || {}),
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

    const parsedColumn = DBParser.parseColumnInfo(tableViewColumn)
    return parsedColumn
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
    column: req.ColumnSpecifier,
    joinId: number | null = null,
    addToViews?: types.ViewId[]
): Promise<lvt.ColumnInfo> {
    const columnSpec = {
        ...column,
        attributes: DBParser.partialDeparseColumn(column.attributes),
    }
    const tableColumn = (await core.events.request(
        lvr.addColumnToView(sessionID, tableId, columnSpec, joinId)
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
    const columnUpdates = getColumnIndexUpdates(tableInfo.columns)

    await Promise.all(
        columnUpdates.map(async c =>
            changeTableColumnAttributes(sessionID, tableId, c.id, {
                ["index"]: c.index,
            })
        )
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
        return Promise.reject(
            error(
                "removeColumnFromTable",
                `no join with ID ${column.joinId}, in table ${tableId}`
            )
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

async function changeTableColumnAttributes_({
    sessionID,
    tableId,
    columnId,
    update,
    changeInViews,
}: CoreRequest): Promise<CoreResponse> {
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
): Promise<lvt.ColumnInfo[]> {
    const attributes = DBParser.partialDeparseColumn(update)
    await core.events.request(
        lvr.changeColumnAttributes(sessionID, columnId, attributes)
    )
    if (changeInViews)
        return changeColumnAttributesInViews(
            sessionID,
            tableId,
            columnId,
            attributes
        )
}

async function changeColumnAttributesInViews(
    sessionID: string,
    tableId: number,
    columnId: number,
    update: Partial<DB.Column>
): Promise<lvt.ColumnInfo[]> {
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
                core.events.request(
                    lvr.changeColumnAttributes(sessionID, c.id, update)
                )
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
        .then(DBParser.parseTable)
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
        .then(DBParser.parseView)
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
        conditions: newFilters.map(DBParser.deparseFilter),
    }
    await core.events.request(
        lvr.changeRowOptions(sessionID, viewId, newRowOptions)
    )
    options = (await core.events.request(
        lvr.getViewOptions(sessionID, viewId)
    )) as lvt.ViewOptions
    return options.rowOptions.conditions.map(DBParser.parseFilter)
}
