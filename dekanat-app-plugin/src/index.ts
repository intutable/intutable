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
import { insert, update, deleteRow, select } from "@intutable/database/dist/requests"
import { Condition as RawCondition, ColumnType } from "@intutable/database/dist/types"
import * as pm from "@intutable/project-management/dist/requests"
import {
    RowOptions,
    ColumnSpecifier,
    JoinDescriptor,
    types as lvt,
    requests as lvr,
    selectable,
    isTable,
    isView,
    asTable,
    asView,
} from "@intutable/lazy-views/"
import {
    defaultViewName,
    APP_TABLE_COLUMNS,
    immutableColumnAttributes,
    idColumnAttributes,
    indexColumnAttributes,
    standardColumnAttributes,
    linkColumnAttributes,
    backwardLinkColumnAttributes,
    backwardLookupColumnAttributes,
    foreignKeyColumnAttributes,
    lookupColumnAttributes,
    defaultTableRowOptions,
    defaultViewRowOptions,
    COLUMN_INDEX_KEY,
    doNotAggregate,
    jsonbArrayAggregate,
    firstAggregate,
} from "shared/dist/api"

import sanitizeName from "shared/dist/utils/sanitizeName"

import { parser, ParserClass } from "./transform/Parser"
import {
    RawViewId,
    RawTableId,
    RawViewDescriptor,
    RawTableDescriptor,
    RawViewOptions,
    RawTableInfo,
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
    DB,
    CustomColumnAttributes,
    Row,
    LinkKind,
} from "./types"
import {
    RowData,
    RawRowData,
    StandardColumnSpecifier,
    LinkColumnSpecifier,
    LookupColumnSpecifier,
} from "./types/requests"
import * as req from "./requests"
import { error, errorSync, ErrorCode } from "./error"
import * as perm from "./permissions/requests"

let core: PluginLoader

export async function init(plugins: PluginLoader) {
    core = plugins

    core.listenForRequests(req.CHANNEL)
        .on(req.createTable.name, createTable_)
        .on(req.deleteTable.name, deleteTable_)
        .on(req.createStandardColumn.name, createStandardColumn_)
        .on(req.createLinkColumn.name, createLinkColumn_)
        .on(req.createLookupColumn.name, createLookupColumn_)
        .on(req.removeColumnFromTable.name, removeColumnFromTable_)
        .on(req.changeTableColumnAttributes.name, changeTableColumnAttributes_)
        .on(req.renameTableColumn.name, renameTableColumn)
        .on(req.getTableData.name, getTableData_)
        .on(req.createView.name, createView_)
        .on(req.renameView.name, renameView_)
        .on(req.deleteView.name, deleteView_)
        .on(req.listViews.name, listViews_)
        .on(req.getViewData.name, getViewData_)
        .on(req.changeViewFilters.name, changeViewFilters_)
        .on(req.createRow.name, createRow_)
        .on(req.updateRows.name, updateRows_)
        .on(req.deleteRows.name, deleteRows_)
        .on(perm.getUsers.name, perm.getUsers_)
        .on(perm.getRoles.name, perm.getRoles_)
        .on(perm.createUser.name, perm.createUser_)
        .on(perm.deleteUser.name, perm.deleteUser_)
        .on(perm.changeRole.name, perm.changeRole_)
        .on(req.createUserSettings.name, createUserSettings_)
        .on(req.getUserSettings.name, getUserSettings_)
        .on(req.updateUserSettings.name, updateUserSettings_)
}

function coreRequest<T = unknown>(req: CoreRequest): Promise<T> {
    return core.events.request(req)
}
//==================== core methods ==========================

async function createTable_({
    connectionId,
    roleId,
    projectId,
    name,
}: CoreRequest): Promise<CoreResponse> {
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
        {
            parentColumnId: idxColumn.id,
            attributes: indexColumnAttributes(1),
            outputFunc: doNotAggregate(),
        },
        {
            parentColumnId: nameColumn.id,
            attributes: standardColumnAttributes("Name", "string", 2, true),
            outputFunc: doNotAggregate(),
        },
    ]
    const tableView = (await core.events.request(
        lvr.createView(
            connectionId,
            selectable.tableId(pmTable.id),
            /* Doesn't need to be sanitized, as it's not used as an SQL name */
            name,
            { columns: columnSpecs, joins: [] },
            defaultTableRowOptions(idColumn.id),
            roleId
        )
    )) as RawViewDescriptor

    // create default filter view
    await createView(connectionId, tableView.id, defaultViewName())
    return tableView
}
async function deleteTable_({ connectionId, id }: CoreRequest): Promise<CoreResponse> {
    return deleteTable(connectionId, id)
}
async function deleteTable(connectionId: string, id: TableId) {
    // unfortunate workaround: our makeshift foreign key columns are not detected by
    // lazy-views' auto-cleanup, so we have to get rid of them ourselves.
    const backwardLinks = await coreRequest<RawViewInfo>(lvr.getViewInfo(connectionId, id)).then(
        info => info.columns.filter(column => column.attributes.kind === "backwardLink")
    )
    for (const column of backwardLinks) await removeColumnFromTable(connectionId, id, column.id)
    // remove views
    const filterViews = await listViews(connectionId, id)
    Promise.all(filterViews.map(v => core.events.request(lvr.deleteView(connectionId, v.id))))
    const tableViewOptions = (await core.events.request(
        lvr.getViewOptions(connectionId, id)
    )) as RawViewOptions
    await core.events.request(lvr.deleteView(connectionId, id))
    await core.events.request(
        pm.removeTable(connectionId, selectable.asTable(tableViewOptions.source).id)
    )
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
): Promise<SerializedColumn> {
    const options = (await core.events.request(
        lvr.getViewOptions(connectionId, tableId)
    )) as RawViewOptions
    const key = sanitizeName(column.name)
    const tableColumn = await core.events.request(
        pm.createColumnInTable(connectionId, asTable(options.source).id, key)
    )
    // add column to table and filter views
    const columnIndex = getNextColumnIndex(options.columnOptions)
    const allAttributes: Partial<DB.Column> = {
        ...standardColumnAttributes(column.name, column.cellType, columnIndex),
        ...parser.deparseColumn(column.attributes || {}),
    }
    const tableViewColumn = await addColumnToTableView(
        connectionId,
        tableId,
        {
            parentColumnId: tableColumn.id,
            attributes: allAttributes,
            outputFunc: doNotAggregate(),
        },
        null,
        addToViews
    )

    const parsedColumn = parser.parseColumn(tableViewColumn)
    return parsedColumn
}
function getNextColumnIndex(options: lvt.ColumnOptions): number {
    const baseColumns = options.columns.length
    return options.joins.reduce((acc, j) => acc + j.columns.length, baseColumns)
}

async function createLinkColumn_({
    connectionId,
    tableId,
    column,
    addToHomeViews,
    addToForeignViews,
}: CoreRequest): Promise<CoreResponse> {
    return createLinkColumn(connectionId, tableId, column, addToHomeViews, addToForeignViews)
}

async function createLinkColumn(
    connectionId: string,
    tableId: TableId,
    column: LinkColumnSpecifier,
    addToHomeViews?: ViewId[],
    addToForeignViews?: ViewId[]
): Promise<SerializedColumn> {
    const homeTableInfo = await coreRequest<RawViewInfo>(lvr.getViewInfo(connectionId, tableId))
    const foreignTableInfo = await coreRequest<RawViewInfo>(
        lvr.getViewInfo(connectionId, column.foreignTable)
    )
    // create foreign key column
    const foreignKeyColumn = await coreRequest<RawTableColumnDescriptor>(
        pm.createColumnInTable(
            connectionId,
            asTable(homeTableInfo.source).table.id,
            makeForeignKeyName(homeTableInfo),
            ColumnType.integer
        )
    )
    let forwardLinkColumn = await createForwardLinkColumn(
        connectionId,
        homeTableInfo,
        foreignTableInfo,
        foreignKeyColumn,
        addToHomeViews
    )
    const backwardLinkColumn = await createBackwardLinkColumn(
        connectionId,
        homeTableInfo,
        foreignTableInfo,
        foreignKeyColumn,
        addToForeignViews
    )
    // connect the two columns, so we can find one from the other later.
    // our handy `changeTableColumnAttributes` function is not available for this, since it
    // blocks editing sacred internal column attributes, of which `inverseLinkColumnId` is one.
    await coreRequest<RawViewColumnInfo>(
        lvr.changeColumnAttributes(connectionId, backwardLinkColumn.id, {
            inverseLinkColumnId: forwardLinkColumn.id,
        })
    )
    forwardLinkColumn = await coreRequest<RawViewColumnInfo>(
        lvr.changeColumnAttributes(connectionId, forwardLinkColumn.id, {
            inverseLinkColumnId: backwardLinkColumn.id,
        })
    )
    return parser.parseColumn(forwardLinkColumn)
}

function makeForeignKeyName(viewInfo: RawViewInfo) {
    // We pick a number greater than any join so far's ID...
    const nextJoinIndex = Math.max(0, ...viewInfo.joins.map(j => j.id)) + 1
    // and add a special character so that there can't be clashes with
    // user-added columns (see ./sanitizeName)
    const fkColumnName = `j#${nextJoinIndex}_fk`
    return fkColumnName
}
async function createForwardLinkColumn(
    connectionId: string,
    homeTableInfo: RawViewInfo,
    foreignTableInfo: RawViewInfo,
    foreignKeyColumn: RawTableColumnDescriptor,
    addToViews?: ViewId[]
): Promise<RawViewColumnInfo> {
    // add join to the home table's table-view
    const foreignIdColumn = foreignTableInfo.columns.find(c => c.name === "_id")!
    const join = await coreRequest<JoinDescriptor>(
        lvr.addJoinToView(connectionId, homeTableInfo.descriptor.id, {
            foreignSource: selectable.viewId(foreignTableInfo.descriptor.id),
            on: [foreignKeyColumn.id, "=", foreignIdColumn.id],
            columns: [],
        })
    )
    // add and return link column
    const foreignUserPrimaryColumn = foreignTableInfo.columns.find(
        c => c.attributes.isUserPrimaryKey! === 1
    )!
    const displayName =
        ((foreignUserPrimaryColumn.attributes.displayName ||
            foreignUserPrimaryColumn.name) as string) + `(${foreignTableInfo.descriptor.name})`
    const columnIndex = homeTableInfo.columns.length
    const attributes = linkColumnAttributes(displayName, columnIndex)
    const linkColumn = await addColumnToTableView(
        connectionId,
        homeTableInfo.descriptor.id,
        { parentColumnId: foreignUserPrimaryColumn.id, attributes, outputFunc: firstAggregate() },
        join.id,
        addToViews
    )
    return linkColumn
}
async function createBackwardLinkColumn(
    connectionId: string,
    homeTableInfo: RawViewInfo,
    foreignTableInfo: RawViewInfo,
    foreignKeyColumn: RawTableColumnDescriptor,
    addToViews?: ViewId[]
): Promise<RawViewColumnInfo> {
    // since our join links the foreign table's raw table to the home table's table view,
    // we must create an extra view column over the foreign key, and get the raw table column
    // of the foreign table's ID column
    const foreignIdColumn = foreignTableInfo.columns.find(c => c.name === "_id")!
    const forwardLinkColumnIndex = homeTableInfo.columns.length
    const foreignKeyViewColumn = await coreRequest<RawViewColumnInfo>(
        lvr.addColumnToView(connectionId, homeTableInfo.descriptor.id, {
            parentColumnId: foreignKeyColumn.id,
            // the forward link column gets the next index, we just add 1 here to keep it short.
            attributes: foreignKeyColumnAttributes(forwardLinkColumnIndex + 1),
            outputFunc: doNotAggregate(),
        })
    )
    const join = await coreRequest<JoinDescriptor>(
        lvr.addJoinToView(connectionId, foreignTableInfo.descriptor.id, {
            foreignSource: selectable.viewId(homeTableInfo.descriptor.id),
            on: [foreignIdColumn.parentColumnId, "=", foreignKeyViewColumn.id],
            columns: [],
        })
    )
    // add and return link column
    const homeUserPrimaryColumn = homeTableInfo.columns.find(
        c => c.attributes.isUserPrimaryKey! === 1
    )!
    const displayName =
        ((homeUserPrimaryColumn.attributes.displayName || homeUserPrimaryColumn.name) as string) +
        `(${homeTableInfo.descriptor.name})`
    const columnIndex = foreignTableInfo.columns.length
    const attributes = backwardLinkColumnAttributes(displayName, columnIndex)
    const linkColumn = await addColumnToTableView(
        connectionId,
        foreignTableInfo.descriptor.id,
        { parentColumnId: homeUserPrimaryColumn.id, attributes, outputFunc: jsonbArrayAggregate() },
        join.id,
        addToViews
    )
    return linkColumn
}

async function createLookupColumn_({
    connectionId,
    tableId,
    column,
    addToViews,
}: CoreRequest): Promise<CoreResponse> {
    return createLookupColumn(connectionId, tableId, column, addToViews)
}

async function createLookupColumn(
    connectionId: string,
    tableId: TableId,
    column: LookupColumnSpecifier,
    addToViews?: ViewId[]
): Promise<SerializedColumn> {
    const tableInfo = await coreRequest<RawViewInfo>(lvr.getViewInfo(connectionId, tableId))
    const join = tableInfo.joins.find(j => j.id === column.linkId)!
    if (!join)
        return error(
            "createLookupColumn",
            `home table ${tableId} has no link with ID ${column.linkId}`
        )
    const linkColumn = tableInfo.columns.find(
        c => ["link", "backwardLink"].includes(c.attributes.kind) && c.joinId === column.linkId
    )
    if (!linkColumn)
        return error(
            "createLookupColumn",
            `table ${tableId} has no link column with link ID ${column.linkId}`
        )

    const otherTableId = asView(join.foreignSource).id
    const otherTableInfo = await coreRequest<RawViewInfo>(
        lvr.getViewInfo(connectionId, otherTableId)
    )
    const parentColumn = otherTableInfo.columns.find(c => c.id === column.foreignColumn)
    if (!parentColumn)
        return error(
            "createLookupColumn",
            `other table ${otherTableId} has no column with ID ${column.foreignColumn}`
        )

    const linkKind = linkColumn.attributes.kind === "link" ? LinkKind.Forward : LinkKind.Backward
    const columnIndex =
        Math.max(
            ...tableInfo.columns
                .filter(c => c.joinId === join.id)
                .map(c => c.attributes[COLUMN_INDEX_KEY])
        ) + 1
    const specifier = createRawSpecifierForLookupColumn(
        linkKind,
        otherTableInfo.descriptor,
        parentColumn,
        columnIndex
    )
    const lookupColumn = await addColumnToTableView(
        connectionId,
        tableId,
        specifier,
        join.id,
        addToViews
    )
    const newColumn = parser.parseColumn(lookupColumn)
    // and shift the column index of all columns that come after the position where it was inserted
    const idxKey = COLUMN_INDEX_KEY
    await Promise.all(
        tableInfo.columns
            .filter(c => c.attributes[idxKey] >= columnIndex)
            .map(c =>
                changeTableColumnAttributes(connectionId, tableId, c.id, {
                    [idxKey]: c.attributes[idxKey] + 1,
                })
            )
    )
    return newColumn
}

function createRawSpecifierForLookupColumn(
    kind: LinkKind,
    otherTableDescriptor: TableDescriptor,
    parentColumn: RawViewColumnInfo,
    columnIndex: number
): ColumnSpecifier {
    // determine meta attributes
    const displayName =
        (parentColumn.attributes.displayName || parentColumn.name) +
        `(${otherTableDescriptor.name})`
    let contentType: string
    let attributes: Partial<DB.Column>
    let aggregateFunction: ColumnSpecifier["outputFunc"]
    switch (kind) {
        case LinkKind.Forward:
            contentType = parentColumn.attributes.cellType || "string"
            attributes = lookupColumnAttributes(displayName, contentType, columnIndex)
            aggregateFunction = firstAggregate()
            break
        case LinkKind.Backward:
            contentType = parentColumn.attributes.cellType || "string"
            attributes = backwardLookupColumnAttributes(displayName, contentType, columnIndex)
            aggregateFunction = jsonbArrayAggregate()
            break
    }
    return { parentColumnId: parentColumn.id, attributes, outputFunc: aggregateFunction }
}

async function addColumnToTableView(
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
    const selectedViews =
        views === undefined ? filterViews : filterViews.filter(v => views.includes(v.id))
    return Promise.all(
        selectedViews.map(v => core.events.request(lvr.addColumnToView(connectionId, v.id, column)))
    )
}

async function removeColumnFromTable_({
    connectionId,
    tableId,
    columnId,
}: CoreRequest): Promise<CoreResponse> {
    return removeColumnFromTable(connectionId, tableId, columnId)
}
async function removeColumnFromTable(
    connectionId: string,
    tableId: RawViewDescriptor["id"],
    columnId: RawViewColumnInfo["id"]
) {
    const tableInfo = (await core.events.request(
        lvr.getViewInfo(connectionId, tableId)
    )) as RawViewInfo

    if (!selectable.isTable(tableInfo.source))
        return error("removeColumnFromTable", `view #${tableId} is a filter view, not a table`)

    const column = tableInfo.columns.find(c => c.id === columnId)
    if (!column)
        return error("removeColumnFromTable", `view #${tableId} has no column with ID ${columnId}`)

    const kind = column.attributes.kind
    switch (kind) {
        case "standard":
            await removeStandardColumn(connectionId, tableId, column)
            break
        case "link":
            await removeLinkColumn(connectionId, tableId, column).then(deletedJoin =>
                shiftColumnIndicesAfterDelete(
                    connectionId,
                    selectable.getId(deletedJoin.foreignSource)
                )
            )
            break
        case "backwardLink":
            await removeBackwardLinkColumn(connectionId, tableId, column).then(deletedJoin =>
                shiftColumnIndicesAfterDelete(
                    connectionId,
                    selectable.getId(deletedJoin.foreignSource)
                )
            )
            break
        case "lookup":
        case "backwardLookup":
            await removeLookupColumn(connectionId, tableId, columnId)
            break
        default:
            return error("removeColumnFromTable", `column #${columnId} has unknown kind ${kind}`)
    }
    await shiftColumnIndicesAfterDelete(connectionId, tableId)
    return { message: `removed ${kind} column #${columnId}` }
}

async function removeStandardColumn(
    connectionId: string,
    tableId: number,
    column: RawViewColumnInfo
): Promise<void> {
    await removeColumnFromViews(connectionId, tableId, column.id)
    await core.events.request(lvr.removeColumnFromView(connectionId, column.id))
    await core.events.request(pm.removeColumn(connectionId, column.parentColumnId))
}

async function removeLinkColumn(
    connectionId: string,
    tableId: number,
    column: RawViewColumnInfo
): Promise<JoinDescriptor> {
    const info = await coreRequest<RawViewInfo>(lvr.getViewInfo(connectionId, tableId))
    const join = info.joins.find(j => j.id === column.joinId)

    if (!join)
        return error(
            "removeColumnFromTable",
            `no join with ID ${column.joinId}, in table ${tableId}`
        )
    const fkColumnId = join.on[0]
    await core.events.request(pm.removeColumn(connectionId, fkColumnId))
    return join
}

async function removeBackwardLinkColumn(
    connectionId: string,
    tableId: number,
    column: RawViewColumnInfo
): Promise<JoinDescriptor> {
    const info = await coreRequest<RawViewInfo>(lvr.getViewInfo(connectionId, tableId))
    const join = info.joins.find(j => j.id === column.joinId)
    const forwardLinkColumn = await coreRequest<RawViewColumnInfo>(
        lvr.getColumnInfo(connectionId, column.attributes.inverseLinkColumnId)
    )

    if (!join)
        return error(
            "removeColumnFromTable",
            `no join with ID ${column.joinId}, in table ${tableId}`
        )
    await removeLinkColumn(connectionId, asView(join.foreignSource).id, forwardLinkColumn)
    return join
}
async function removeLookupColumn(
    connectionId: string,
    tableId: number,
    columnId: number
): Promise<void> {
    await removeColumnFromViews(connectionId, tableId, columnId)
    await core.events.request(lvr.removeColumnFromView(connectionId, columnId))
}

async function shiftColumnIndicesAfterDelete(connectionId: string, tableId: TableId) {
    // in case of links, more columns than the one specified may have
    // disappeared, so simply decrementing all indices by one is not enough - we have to
    // go over them all and adjust their index appropriately.
    const tableInfo = await coreRequest<RawViewInfo>(lvr.getViewInfo(connectionId, tableId))
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

async function removeColumnFromViews(
    connectionId: string,
    tableId: number,
    parentColumnId: number
): Promise<void> {
    const views = (await core.events.request(
        lvr.listViews(connectionId, selectable.viewId(tableId))
    )) as RawViewDescriptor[]
    await Promise.all(
        views.map(async v => {
            const info = (await core.events.request(
                lvr.getViewInfo(connectionId, v.id)
            )) as RawViewInfo
            const viewColumn = info.columns.find(c => c.parentColumnId === parentColumnId)
            if (viewColumn)
                await core.events.request(lvr.removeColumnFromView(connectionId, viewColumn.id))
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
        return [tableColumn].concat(
            await changeColumnAttributesInViews(connectionId, tableId, columnId, attributes)
        )
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
            const info = (await core.events.request(
                lvr.getViewInfo(connectionId, v.id)
            )) as RawViewInfo
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

async function renameTableColumn({
    connectionId,
    tableId,
    columnId,
    newName,
}): Promise<CoreResponse> {
    const tableInfo = await coreRequest<RawViewInfo>(lvr.getViewInfo(connectionId, tableId))
    if (tableInfo.columns.some(c => c.attributes.displayName === newName))
        return error(
            "renameTableColumn",
            `table ${tableId} already contains a column named ${columnId}`,
            ErrorCode.alreadyTaken
        )
    const update = { name: newName }
    await changeTableColumnAttributes(connectionId, tableId, columnId, update)
    return { message: `column ${columnId} renamed to "${newName}"` }
}

async function getTableData_({ connectionId, tableId }: CoreRequest): Promise<CoreResponse> {
    return getTableData(connectionId, tableId)
}
async function getTableData(connectionId: string, tableId: TableId) {
    return core.events
        .request(lvr.getViewData(connectionId, tableId))
        .then(table => parser.parseTable(table))
}

async function createView_({ connectionId, tableId, name }: CoreRequest): Promise<CoreResponse> {
    const existingViews = await listViews(connectionId, tableId)
    if (existingViews.some(v => v.name === name))
        return error(
            req.createView.name,
            `view named ${name} already exists`,
            ErrorCode.alreadyTaken
        )
    return createView(connectionId, tableId, name)
}
async function createView(
    connectionId: string,
    tableId: TableId,
    name: string
): Promise<ViewDescriptor> {
    const tableInfo = (await core.events.request(
        lvr.getViewInfo(connectionId, tableId)
    )) as RawViewInfo
    return core.events.request(
        lvr.createView(
            connectionId,
            selectable.viewId(tableId),
            name,
            { columns: [], joins: [] },
            defaultViewRowOptions(tableInfo.columns)
        )
    )
}

async function renameView_({ connectionId, viewId, newName }: CoreRequest): Promise<CoreResponse> {
    return renameView(connectionId, viewId, newName)
}
async function renameView(
    connectionId: string,
    viewId: ViewId,
    newName: string
): Promise<ViewDescriptor> {
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
    return core.events.request(lvr.listViews(connectionId, selectable.viewId(id))) as Promise<
        RawViewDescriptor[]
    >
}

async function getViewData_({ connectionId, viewId }: CoreRequest): Promise<CoreResponse> {
    return getViewData(connectionId, viewId)
}
async function getViewData(connectionId: string, viewId: ViewId) {
    return core.events
        .request(lvr.getViewData(connectionId, viewId))
        .then(view => parser.parseView(view))
}

async function changeViewFilters_({
    connectionId,
    viewId,
    newFilters,
}: CoreRequest): Promise<CoreResponse> {
    return changeViewFilters(connectionId, viewId, newFilters)
}
async function changeViewFilters(connectionId: string, viewId: ViewId, newFilters: Filter[]) {
    let options = (await core.events.request(
        lvr.getViewOptions(connectionId, viewId)
    )) as RawViewOptions
    if (options.name === defaultViewName())
        return error("changeViewFilters", "cannot change default view")
    const newRowOptions: RowOptions = {
        ...options.rowOptions,
        conditions: newFilters.map(ParserClass.deparseFilter),
    }
    await core.events.request(lvr.changeRowOptions(connectionId, viewId, newRowOptions))
    options = (await core.events.request(
        lvr.getViewOptions(connectionId, viewId)
    )) as RawViewOptions
    return options.rowOptions.conditions.map(ParserClass.deparseFilter)
}

async function createRow_({
    connectionId,
    viewId,
    atIndex,
    values,
}: CoreRequest): Promise<CoreResponse> {
    return createRow(connectionId, viewId, atIndex, values)
}

async function createRow(
    connectionId: string,
    viewId: ViewId | TableId,
    atIndex: number | undefined = undefined,
    values: RowData = {}
) {
    // 1. find the column names needed to update the data in the actual raw table
    const rawViewInfo: RawViewInfo = await core.events.request(
        lvr.getViewInfo(connectionId, viewId)
    )
    let rawData: Record<string, unknown>
    try {
        rawData = await mapRowInsertDataToStrings(connectionId, rawViewInfo, values)
    } catch (e) {
        return error("createRow", e.message)
    }

    // 2. get the data of the table (since we start out with a view ID)
    const tableViewId: RawViewId = await getTableViewId(connectionId, viewId)
    const tableData: TableData = await getTableData(connectionId, tableViewId)

    // 3. determine necessary index shifts
    if (atIndex > tableData.rows.length + 1 || atIndex < 0)
        return error("createRow", "invalid row index: " + atIndex)
    const actualIndex = atIndex ?? tableData.rows.length
    const { rowData: finalRowData, rowsToShift } = addIndexShifts(tableData, actualIndex, rawData)

    // 4. shift all rows after the desired index
    await Promise.all(
        rowsToShift.map(async shift => {
            await core.events.request(
                update(connectionId, tableData.rawTable.key, {
                    condition: ["_id", shift.rowId],
                    update: { index: shift.index },
                })
            )
        })
    )
    // 5. insert the new row
    return core.events.request(insert(connectionId, tableData.rawTable.key, finalRowData, ["_id"]))
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
    const viewOptions: RawViewOptions = await core.events.request(
        lvr.getViewOptions(connectionId, viewId)
    )
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
async function mapRowInsertDataToStrings(
    connectionId: string,
    viewData: RawViewInfo,
    update: RowData,
    allowLinks = true
): Promise<RawRowData> {
    const stringUpdate: Record<string, unknown> = {}
    for (const key in update) {
        // the for-let-in construction always gives you the keys as strings.
        const column = viewData.columns.find(c => c.id.toString() === key)
        if (column === undefined)
            throw errorSync(
                "mapRowInsertDataToStrings",
                `table ${viewData.descriptor.id} has no column with ID ${key}`
            )
        if (!allowLinks && column.attributes.kind !== "standard")
            return error(
                "mapRowInsertDataToStrings",
                `column ${key} is of kind` +
                    ` ${column.attributes.kind}, but only standard is allowed`
            )
        if (!["standard", "link"].includes(column.attributes.kind))
            return error(
                "mapRowInsertDataToStrings",
                `column ${key}/${column.attributes.displayName} is of kind` +
                    `${column.attributes.kind}, but only standard and link are allowed`,
                ErrorCode.invalidRowWrite
            )
        if (![1, true].includes(column.attributes.editable))
            return error(
                "mapRowInsertDataToStrings",
                `column ${column.key} is not editable`,
                ErrorCode.invalidRowWrite
            )
        // set property with appropriate column name
        if (column.attributes.kind === "standard") stringUpdate[column.name] = update[key]
        else if (column.attributes.kind === "link") {
            const rawForeignKeyColumn = await getLinkColumnForeignKey(
                connectionId,
                viewData,
                column
            )
            stringUpdate[rawForeignKeyColumn.name] = update[key]
        }
    }
    return stringUpdate
}

/** To set the target row of a link column, one needs to know what raw table column acts as
 * the foreign key. Since this column does not appear in any views, we have to find out the
 * raw table to find the column.
 * The column must be a link column. If the view is a table view (i.e. its source is a raw table)
 * then the column must belong to a join. If the view is a higher-order view, then the column
 * must have a chain of parents that end with a column that belongs to a join.
 */
async function getLinkColumnForeignKey(
    connectionId: string,
    rawViewInfo: RawViewInfo,
    column: RawViewColumnInfo
): Promise<RawTableColumnDescriptor> {
    if (column.joinId === null) {
        if (!isView(rawViewInfo.source))
            return error("getLinkColumnForeignKey", `column ${column.id} is not a real link column`)
        const parentViewInfo: RawViewInfo = await core.events.request(
            lvr.getViewInfo(connectionId, rawViewInfo.source.view.id)
        )
        const parentColumn: RawViewColumnInfo = parentViewInfo.columns.find(
            c => c.id === column.parentColumnId
        )!
        return getLinkColumnForeignKey(connectionId, parentViewInfo, parentColumn)
    } else {
        if (!isTable(rawViewInfo.source))
            return error(
                "getLinkColumnForeignKey",
                `view ${rawViewInfo.descriptor.id} is a` + ` filter view, but has joins`
            )
        const join = rawViewInfo.joins.find(j => j.id === column.joinId)!
        const fkColumnId = join.on[0]
        const rawTableInfo: RawTableInfo = await core.events.request(
            pm.getTableInfo(connectionId, rawViewInfo.source.table.id)
        )
        return rawTableInfo.columns.find(c => c.id === fkColumnId)!
    }
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

async function updateRows_({
    connectionId,
    viewId,
    condition,
    values,
}: CoreRequest): Promise<CoreResponse> {
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
    let rawCondition: RawCondition
    if (typeof condition === "number") rawCondition = ["_id", condition]
    else rawCondition = ["_id", "in", condition]

    // 2. map update to sql table
    let rawUpdate: Record<string, unknown>
    try {
        rawUpdate = await mapRowInsertDataToStrings(connectionId, rawViewInfo, values)
    } catch (e) {
        return error("createRow", e.message)
    }

    // 3. get table key
    const tableViewId: RawViewId = await getTableViewId(connectionId, viewId)
    const tableViewInfo: RawViewInfo = await core.events.request(
        lvr.getViewInfo(connectionId, tableViewId)
    )
    const rawTable: RawTableDescriptor = asTable(tableViewInfo.source).table

    // 4. perform the update
    const updated = await core.events.request(
        update(connectionId, rawTable.key, { condition: rawCondition, update: rawUpdate })
    )
    return updated
}

async function deleteRows_({
    connectionId,
    viewId,
    condition,
}: CoreRequest): Promise<CoreResponse> {
    return deleteRows(connectionId, viewId, condition)
}

async function deleteRows(
    connectionId: string,
    viewId: TableId | ViewId,
    condition: number[] | number
): Promise<{ rowsDeleted: number }> {
    const tableViewId = await getTableViewId(connectionId, viewId)
    const tableViewOptions = await coreRequest<RawViewOptions>(
        lvr.getViewOptions(connectionId, tableViewId)
    )
    const rawTableInfo = await coreRequest<RawTableInfo>(
        pm.getTableInfo(connectionId, selectable.getId(tableViewOptions.source))
    )
    const rawTableName = rawTableInfo.table.key

    const rawCondition: RawCondition =
        typeof condition === "number" ? ["_id", condition] : ["_id", "in", condition]

    const { rowsDeleted } = await coreRequest<{ rowsDeleted: number }>(
        deleteRow(connectionId, rawTableName, rawCondition)
    )

    // shift indices of remaining
    const newTableData = await getTableData(connectionId, tableViewId)
    const indexChanges: IndexShiftData[] = newTableData.rows
        .sort((a, b) => a.index - b.index)
        .map((row, newIndex) => ({ rowId: row._id, oldIndex: row.index, index: newIndex }))
        .filter(shift => shift.oldIndex !== shift.index)
    await Promise.all(
        indexChanges.map(async ({ rowId, index }) =>
            coreRequest(
                update(connectionId, rawTableName, {
                    update: { index },
                    condition: ["_id", rowId],
                })
            )
        )
    )

    return { rowsDeleted }
}

async function createUserSettings_({
    connectionId,
    userId,
    defaultUserSettings,
}: CoreRequest): Promise<CoreResponse> {
    return createUserSettings(connectionId, userId, defaultUserSettings)
}

async function createUserSettings(
    connectionId: string,
    userId: number,
    defaultUserSettings?: string
) {
    return core.events.request(
        insert(connectionId, "user_settings", {
            user_id: userId,
            settings: defaultUserSettings ?? "{}",
        })
    )
}

async function getUserSettings_({ connectionId, userId }: CoreRequest): Promise<CoreResponse> {
    return getUserSettings(connectionId, userId)
}

async function getUserSettings(connectionId: string, userId: number) {
    return core.events.request(
        select(connectionId, "user_settings", { condition: ["user_id", userId] })
    )
}

async function updateUserSettings_({
    connectionId,
    userId,
    settings,
}: CoreRequest): Promise<CoreResponse> {
    return updateUserSettings(connectionId, userId, settings)
}

async function updateUserSettings(connectionId: string, userId: number, settings: string) {
    return core.events.request(
        update(connectionId, "user_settings", {
            update: { settings: settings },
            condition: ["user_id", userId],
        })
    )
}
