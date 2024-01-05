/**
 * For information on the public API methods, see {@link ./requests}
 *
 * @packageDocumentation
 */
import {
    CoreRequest,
    CoreResponse,
    PluginLoader,
    MiddlewareResponseType,
} from "@intutable-org/core"
import Pass = MiddlewareResponseType.Pass
import {
    rawQuery,
    select,
    insert,
    update,
    deleteRow,
    addColumn,
    deleteColumn,
} from "@intutable-org/database/dist/requests"
import * as pm from "@intutable-org/project-management/dist/requests"

import { V } from "./meta"
import * as m from "./meta"
import {
    getJoinIdFromColumnGroup,
    getSourceFromColumnGroup,
    makeColumnInfo,
    getCustomAttributes,
} from "./internal"
import { CHANNEL } from "./requests"
import { setCore, getCore as core } from "./internal/core"
import { error } from "./internal/error"
import * as s from "./internal/selectable"
import type { ColumnDescriptor, ColumnGroupSpecifier } from "./types/internal"
import { Condition, cleanCondition } from "./internal/condition"

import type {
    ViewId,
    ViewColumnId,
    ParentColumnId,
    PM_Column,
    ColumnSpecifier,
    ColumnInfo,
    ViewDescriptor,
    JoinDescriptor,
    JoinSpecifier,
    ColumnOptions,
    RowOptions,
    ViewOptions,
    ViewInfo,
    ViewData,
    ParentColumnDescriptor,
} from "./types/main"
import * as trees from "./internal/trees"
import { buildQueryTree, makeQuery } from "./internal/query"
import * as req from "./requests"

export * as types from "./types"
export * from "./types"
export * as requests from "./requests"
export * from "./requests"
export * as selectable from "./selectable"
export * from "./selectable"
export * as condition from "./condition"
export * from "./condition"

export async function init(plugins: PluginLoader) {
    setCore(plugins)

    plugins
        .listenForRequests(CHANNEL)
        .on(req.createView.name, createView_)
        .on(req.deleteView.name, deleteView_)
        .on(req.listViews.name, listViews_)
        .on(req.getViewOptions.name, getViewOptions_)
        .on(req.getViewInfo.name, getViewInfo_)
        .on(req.getViewData.name, getViewData_)
        .on(req.renameView.name, renameView)
        .on(req.addColumnToView.name, addColumnToView)
        .on(req.removeColumnFromView.name, removeColumnFromView_)
        .on(req.changeRowOptions.name, changeRowOptions_)
        .on(req.getColumnInfo.name, getColumnInfo_)
        .on(req.changeColumnAttributes.name, changeColumnAttributes)
        .on(req.addColumnAttribute.name, addColumnAttribute)
        .on(req.removeColumnAttribute.name, removeColumnAttribute)
        .on(req.addJoinToView.name, addJoinToView_)
        .on(req.removeJoinFromView.name, removeJoinFromView_)
        .on(req.listJoinsTo.name, listJoinsTo_)
    plugins.addMiddleware(async req => {
        if (req.method === pm.removeTable.name)
            await cleanupTableDependents(req.connectionId, s.tableId(req.id))
        return { type: Pass, payload: req }
    })
    plugins.addMiddleware(async req => {
        if (req.method === pm.removeColumn.name)
            await cleanupColumnDependents(req.connectionId, s.SelectableType.Table, req.id)
        return { type: Pass, payload: req }
    })
}

// create view
async function createView(
    connectionId: string,
    source: s.SelectableSpecifier,
    name: string,
    userId: number | null,
    columnOptions: ColumnOptions,
    rowOptions: RowOptions
): Promise<ViewDescriptor> {
    if (columnOptions.columns.length === 0) {
        const columns = await getColumnSpecs(connectionId, source)
        columnOptions = {
            ...columnOptions,
            columns,
        }
    }
    const id = await insertViewIntoViewTable(connectionId, name, source, userId, rowOptions).catch(
        e => error("createView", "could not create view", e)
    )
    await insertRemainingMetadata(connectionId, id, source, columnOptions).catch(e => {
        deleteView(connectionId, id, false)
        return error("createView", "could not create view", e)
    })
    return { id, name }
}
async function createView_({
    connectionId,
    source,
    name,
    userId = null,
    columnOptions,
    rowOptions,
}: CoreRequest): Promise<CoreResponse> {
    return createView(connectionId, source, name, userId, columnOptions, rowOptions)
}

async function getColumnSpecs(
    connectionId: string,
    source: s.SelectableSpecifier
): Promise<ColumnSpecifier[]> {
    return s.branchOnSelectable(
        source,
        (s: s.SourceTableSpecifier) => getTableColumnSpecs(connectionId, s.id),
        (s: s.SourceViewSpecifier) => getViewColumnSpecs(connectionId, s.id)
    )
}
async function getTableColumnSpecs(
    connectionId: string,
    tableId: number
): Promise<ColumnSpecifier[]> {
    const columns = (await core()
        .events.request(pm.getColumnsFromTable(connectionId, tableId))
        .catch(e =>
            error("getTableColumnSpecs", `could not get columns of table #${tableId}`, e)
        )) as PM_Column[]
    return columns.map(c => ({
        parentColumnId: c.id,
        attributes: {},
    }))
}
async function getViewColumnSpecs(connectionId: string, id: number): Promise<ColumnSpecifier[]> {
    const metaRows = (await core().events.request(
        select(connectionId, V.VIEW_COLUMNS, {
            condition: [V.VIEW_ID, id],
        })
    )) as Record<string, any>[]
    return metaRows.map(row => ({
        parentColumnId: row[V.ID],
        attributes: getCustomAttributes(row),
    }))
}
async function insertViewIntoViewTable(
    connectionId: string,
    name: string,
    source: s.SelectableSpecifier,
    userId: number | null,
    rowOptions: RowOptions
): Promise<number> {
    await checkSource(connectionId, source)
    const rs = await core().events.request(
        insert(
            connectionId,
            V.VIEWS,
            {
                [V.NAME]: name,
                ...m.getDbPropsFromSelectable(source),
                [V.USER_ID]: userId,
                [V.ROW_OPTIONS]: JSON.stringify(stripRowOptions(rowOptions)),
            },
            [V.ID]
        )
    )
    return (<any>rs)[V.ID]
}
/** Insert all the metadata except the view's core row in the "views" table */
async function insertRemainingMetadata(
    connectionId: string,
    viewId: number,
    source: s.SelectableSpecifier,
    columnOptions: ColumnOptions
): Promise<void> {
    await checkColumns(connectionId, source, columnOptions.columns)
    await insertColumns(connectionId, viewId, source, columnOptions.columns)
    await insertJoins(connectionId, viewId, columnOptions.joins)
}

/**
 * For convenience, one can simply pass a ColumnInfo into various spots
 * that really only want `{ parentColumnId: number, joinId: JoinId }`.
 * To minimize clutter, this procedure strips away all needless props.
 * Conditions do not need this, because they are made with utility functions
 * that automatically strip them down (see ./condition.ts)
 */
function stripRowOptions(opts: RowOptions): RowOptions {
    const groupColumns = opts.groupColumns.map(g => ({
        parentColumnId: g.parentColumnId,
        joinId: g.joinId,
    }))
    const sortColumns = opts.sortColumns.map(s => ({
        ...s,
        column: {
            parentColumnId: s.column.parentColumnId,
            joinId: s.column.joinId,
        },
    }))
    return { ...opts, groupColumns, sortColumns }
}

async function checkSource(connectionId: string, source: s.SelectableSpecifier): Promise<void> {
    const sourceId = (source as s.SourceTableSpecifier).id
    return s
        .branchOnSelectable(
            source,
            (src: s.SourceTableSpecifier) => checkTable(connectionId, src),
            (src: s.SourceViewSpecifier) => checkView(connectionId, src)
        )
        .catch(e => error("checkSource", `no table with ID ${sourceId} exists`, e))
}
async function checkTable(connectionId: string, source: s.SourceTableSpecifier): Promise<void> {
    return core()
        .events.request(pm.getTableInfo(connectionId, source.id))
        .then(() => {})
}
async function checkView(connectionId: string, source: s.SourceViewSpecifier): Promise<void> {
    return core()
        .events.request(req.getViewOptions(connectionId, source.id))
        .then(() => {})
}

async function checkColumns(
    connectionId: string,
    source: s.SelectableSpecifier,
    columns: ColumnSpecifier[] | number[]
) {
    const sourceId = (source as s.SourceTableSpecifier).id
    let parentColumns: { id: number }[]
    if (s.isTable(source)) {
        parentColumns = (await core().events.request(
            pm.getColumnsFromTable(connectionId, source.id)
        )) as ParentColumnDescriptor[]
    } else {
        parentColumns = await m.getAllColumnDescriptors(connectionId, s.asView(source).id)
    }
    return Promise.all(
        columns.map(c => {
            const id = typeof c === "number" ? c : c.parentColumnId
            if (!parentColumns.some(p => p.id === id))
                return error("checkColumns", "no column with ID" + ` ${id} in table ${sourceId}`)
        })
    )
}

async function checkJoin(
    connectionId: string,
    source: s.SelectableSpecifier,
    join: JoinSpecifier
): Promise<void> {
    await checkSource(connectionId, join.foreignSource)
    await checkColumns(connectionId, source, [join.on[0]]).catch(e =>
        error("checkJoin", "bad left condition operand", e)
    )
    await checkColumns(connectionId, join.foreignSource, [join.on[2]]).catch(e =>
        error("checkJoin", "bad right condition operand", e)
    )
    await checkColumns(connectionId, join.foreignSource, join.columns).catch(e =>
        error("checkJoin", "bad column", e)
    )
}
async function insertColumns(
    connectionId: string,
    viewId: number,
    group: ColumnGroupSpecifier,
    columns: ColumnSpecifier[]
) {
    return Promise.all(columns.map(c => insertColumn(connectionId, viewId, group, c)))
}
async function insertColumn(
    connectionId: string,
    viewId: number,
    group: ColumnGroupSpecifier,
    column: ColumnSpecifier
): Promise<number> {
    return core()
        .events.request(
            insert(
                connectionId,
                V.VIEW_COLUMNS,
                {
                    [V.VIEW_ID]: viewId,
                    [V.JOIN_ID]: getJoinIdFromColumnGroup(group),
                    [V.COLUMN_ID]: column.parentColumnId,
                    ...column.attributes,
                    [V.FUNCTION]: column.outputFunc || null,
                },
                [V.ID]
            )
        )
        .then(ret => (<any>ret)[V.ID])
}
async function insertJoins(connectionId: string, viewId: number, options: JoinSpecifier[]) {
    return Promise.all(options.map(j => insertJoin(connectionId, viewId, j)))
}
async function insertJoin(
    connectionId: string,
    viewId: number,
    join: JoinSpecifier
): Promise<number> {
    const source = await m.getViewMetaRow(connectionId, viewId).then(m.getSelectableFromDbRow)
    try {
        await checkJoin(connectionId, source, join) // also calls checkColumns
        const joinId = (
            (await core().events.request(
                insert(
                    connectionId,
                    V.VIEW_JOINS,
                    {
                        [V.VIEW_ID]: viewId,
                        ...m.getDbPropsFromSelectable(join.foreignSource),
                        [V.ON]: JSON.stringify(join.on),
                        [V.PRE_GROUP]: join.preGroup ? 1 : 0,
                    },
                    [V.ID]
                )
            )) as any
        )[V.ID]
        await insertColumns(
            connectionId,
            viewId,
            { id: joinId, foreignSource: join.foreignSource },
            join.columns
        )
        return joinId
    } catch (e) {
        return error("insertJoin", "could not add join", e)
    }
}

// delete view
async function deleteView(
    connectionId: string,
    id: number,
    rejectIfNotExists: boolean
): Promise<CoreResponse> {
    if (await m.viewExists(connectionId, id)) {
        await cleanupTableDependents(connectionId, s.viewId(id))
        return deleteViewMetadata(connectionId, id)
            .then(() => ({ message: `deleted view #${id.toString()}` }))
            .catch(e => error("deleteView", `could not delete view #${id.toString()}`, e))
    } else if (rejectIfNotExists)
        return Promise.reject({
            message: `no such view  #${id.toString()}`,
        })
    else
        return Promise.resolve({
            message: `no such view  #${id.toString()}`,
        })
}

async function deleteView_({
    connectionId,
    id,
    rejectIfNotExists,
}: CoreRequest): Promise<CoreResponse> {
    return deleteView(connectionId, id, rejectIfNotExists)
}
async function deleteViewMetadata(connectionId: string, id: number): Promise<void> {
    await core().events.request(deleteRow(connectionId, V.VIEW_COLUMNS, [V.VIEW_ID, id]))
    await core().events.request(deleteRow(connectionId, V.VIEW_JOINS, [V.VIEW_ID, id]))
    await core().events.request(deleteRow(connectionId, V.VIEWS, [V.ID, id]))
}

// list views
async function listViews(
    connectionId: string,
    source: s.SelectableSpecifier
): Promise<ViewDescriptor[]> {
    return (
        core().events.request(
            select(connectionId, V.VIEWS, {
                columns: [V.ID, V.NAME],
                condition: [m.getDbPropsFromSelectable(source)],
            })
        ) as Promise<any[]>
    )
        .then(rows =>
            rows.map(v => ({
                id: v[V.ID],
                name: v[V.NAME],
            }))
        )
        .catch(e => error("listViews", `cannot list views for ${s.describeSelectable(source)}`, e))
}
async function listViews_({ connectionId, source }: CoreRequest): Promise<CoreResponse> {
    return listViews(connectionId, source)
}

// get summary of view's specifications
async function getViewOptions(connectionId: string, id: number): Promise<ViewOptions> {
    return m
        .getViewMetaRow(connectionId, id)
        .then(async data => ({
            data,
            columnOptions: await getColumnOptions(connectionId, id, m.getSelectableFromDbRow(data)),
        }))
        .then(({ data, columnOptions }) => makeViewOptions(data, columnOptions))
        .catch(e => error("getViewOptions", `cannot get options of view #${id}`, e))
}
async function getViewOptions_({ connectionId, id }: CoreRequest): Promise<CoreResponse> {
    return getViewOptions(connectionId, id)
}
async function makeViewOptions(
    data: Record<string, any>,
    columnOptions: ColumnOptions
): Promise<ViewOptions> {
    return {
        name: data[V.NAME] as string,
        source: m.getSelectableFromDbRow(data),
        userId: data[V.USER_ID] ? (data[V.USER_ID] as number) : null,
        columnOptions,
        rowOptions: JSON.parse(data[V.ROW_OPTIONS]) as RowOptions,
    }
}

async function getColumnOptions(
    connectionId: string,
    viewId: number,
    source: s.SelectableSpecifier
): Promise<ColumnOptions> {
    const columns = await m.getColumnDescriptors(connectionId, viewId, source).then(cs =>
        cs.map(({ parentColumnId, attributes }) => ({
            parentColumnId,
            attributes,
        }))
    )
    return { columns, joins: await getJoinOptions(connectionId, viewId) }
}
async function getJoinOptions(connectionId: string, viewId: number): Promise<JoinSpecifier[]> {
    const joins = await m.getJoinDescriptorsOfView(connectionId, viewId)
    return Promise.all(
        joins.map(async join => {
            const columns = await m.getColumnDescriptors(connectionId, viewId, join).then(cs =>
                cs.map(({ parentColumnId, attributes }) => ({
                    parentColumnId,
                    attributes,
                }))
            )
            return {
                foreignSource: join.foreignSource,
                on: join.on,
                preGroup: join.preGroup,
                columns,
            }
        })
    )
}

// get all metadata of a view
async function getViewInfo(connectionId: string, id: number): Promise<ViewInfo> {
    return trees
        .expandViewTree(connectionId, id)
        .then(trees.flattenViewTree)
        .catch(e => error("getViewInfo", `could not get info of view #${id}`, e))
}
async function getViewInfo_({ connectionId, id }: CoreRequest): Promise<CoreResponse> {
    return getViewInfo(connectionId, id)
}

async function getViewData_({
    connectionId,
    id,
    oneTimeRowOptions,
}: CoreRequest): Promise<CoreResponse> {
    return getViewData(connectionId, id, oneTimeRowOptions)
}
// get all data (meta and object) of a view
async function getViewData(
    connectionId: string,
    id: number,
    oneTimeRowOptions?: Partial<RowOptions>
): Promise<ViewData> {
    return trees
        .expandViewTree(connectionId, id)
        .then(async tree => {
            const info = trees.flattenViewTree(tree)
            const rows = await getViewRows(connectionId, tree, oneTimeRowOptions)
            return {
                ...info,
                rows,
            }
        })
        .catch(e => error("getViewData", `could not get data for view #${id}`, e))
}
async function getViewRows(
    connectionId: string,
    tree: trees.ViewTree,
    oneTimeRowOptions?: Partial<RowOptions>
): Promise<Record<string, any>[]> {
    // get metadata and convert IDs to keys where necessary,
    // the query builder module uses only strings without any DB accesses.
    const recursiveQueryInfo = buildQueryTree(tree, oneTimeRowOptions)
    const query = makeQuery(recursiveQueryInfo)
    return core()
        .events.request(rawQuery(connectionId, { sql: query.sql, bindings: query.bindings }))
        .then(res => (<any>res).rows)
}

// rename view
async function renameView({ connectionId, id, newName }: CoreRequest): Promise<CoreResponse> {
    const source = await getViewOptions(connectionId, id).then(o => o.source)
    const alreadyExisting = await listViews(connectionId, source).then(views =>
        views.filter(view => view.name === newName)
    )
    if (alreadyExisting.length > 0) {
        return error(
            "renameView",
            `${s.describeSelectable(source)} already has view named ${newName}`
        )
    } else {
        await core().events.request(
            update(connectionId, V.VIEWS, {
                condition: [V.ID, id],
                update: {
                    [V.NAME]: newName,
                },
            })
        )

        return { id, name: newName }
    }
}

// create a new column in a view
async function addColumnToView({
    connectionId,
    viewId,
    column,
    joinId,
}: CoreRequest): Promise<CoreResponse> {
    if (joinId) {
        const foreignSource = await m.getForeignSource(connectionId, joinId)
        return addColumnAndReturnInfo(connectionId, viewId, column, {
            id: joinId,
            foreignSource: foreignSource,
        }).catch(e =>
            error(
                "addColumnToView",
                `could not add column #${column.parentColumnId}` +
                    ` to join #${joinId} of view #${viewId}`,
                e
            )
        )
    } else {
        const options = await getViewOptions(connectionId, viewId)
        const source = options.source
        return addColumnAndReturnInfo(connectionId, viewId, column, source).catch(e =>
            error(
                "addColumnToView",
                `could not add column` + ` #${column.parentColumnId} to view #${viewId}`,
                e
            )
        )
    }
}
async function addColumnAndReturnInfo(
    connectionId: string,
    viewId: number,
    column: ColumnSpecifier,
    group: ColumnGroupSpecifier
): Promise<ColumnInfo> {
    const source = getSourceFromColumnGroup(group)
    await checkColumns(connectionId, source, [column])
    const id = await insertColumn(connectionId, viewId, group, column)
    return getColumnInfo(connectionId, id)
}

// remove column
async function removeColumnFromView_({ connectionId, id }: CoreRequest): Promise<CoreResponse> {
    return removeColumnFromView(connectionId, id)
}
async function removeColumnFromView(connectionId: string, id: ViewColumnId) {
    await cleanupColumnDependents(connectionId, s.SelectableType.View, id)
    const columnsWithId = (await core().events.request(
        select(connectionId, V.VIEW_COLUMNS, {
            condition: [V.ID, id],
        })
    )) as any[]
    if (columnsWithId.length < 1) {
        return error("removeColumnFromView", `no such column #${id}`)
    } else {
        await core().events.request(deleteRow(connectionId, V.VIEW_COLUMNS, [V.ID, id]))
        return { message: `removed column #${id}` }
    }
}

// add join
async function addJoinToView(
    connectionId: string,
    viewId: number,
    join: JoinSpecifier
): Promise<JoinDescriptor> {
    const id = await insertJoin(connectionId, viewId, join)
    return { id, foreignSource: join.foreignSource, on: join.on, preGroup: !!join.preGroup }
}
async function addJoinToView_({ connectionId, viewId, join }: CoreRequest): Promise<CoreResponse> {
    return addJoinToView(connectionId, viewId, join)
}

// remove join (deleting all its columns)
async function removeJoinFromView_({ connectionId, id }: CoreRequest): Promise<CoreResponse> {
    return removeJoinFromView(connectionId, id)
}
async function removeJoinFromView(
    connectionId: string,
    id: number
): Promise<{ rowsDeleted: number }> {
    const joinsWithId = (await core().events.request(
        select(connectionId, V.VIEW_JOINS, {
            condition: [V.ID, id],
        })
    )) as any[]
    if (joinsWithId.length < 1) {
        return error("removeJoinFromView", `no such join #${id}`)
    } else {
        const row = joinsWithId[0]
        await cleanupJoinDependents(connectionId, row[V.VIEW_ID], {
            id: row[V.ID],
            foreignSource: m.getSelectableFromDbRow(row),
        })
        return core().events.request(deleteRow(connectionId, V.VIEW_JOINS, [V.ID, id]))
    }
}

async function listJoinsTo_({ connectionId, source }: CoreRequest): Promise<CoreResponse> {
    return listJoinsTo(connectionId, source)
}

async function listJoinsTo(
    connectionId: string,
    source: s.SelectableSpecifier
): Promise<{ join: JoinDescriptor; viewId: ViewId }[]> {
    return m.getJoinsToSource(connectionId, source)
}
// edit (overwrite) the row options of a view
async function changeRowOptions_({
    connectionId,
    id,
    newOptions,
}: CoreRequest): Promise<CoreResponse> {
    return changeRowOptions(connectionId, id, newOptions)
}
async function changeRowOptions(connectionId: string, id: ViewId, newOptions: RowOptions) {
    return core().events.request(
        update(connectionId, V.VIEWS, {
            condition: [V.ID, id],
            update: { [V.ROW_OPTIONS]: JSON.stringify(newOptions) },
        })
    )
}

// change a column's custom attributes
async function changeColumnAttributes({ connectionId, id, attributes }: CoreRequest) {
    for (const attribute of Object.keys(attributes))
        if (m.VIEW_COLUMNS_ATTRIBUTES.includes(attribute))
            return Promise.reject({
                message: "cannot alter basic attribute: " + attribute,
            })
    await core().events.request(
        update(connectionId, V.VIEW_COLUMNS, {
            condition: [V.ID, id],
            update: attributes,
        })
    )
    return getColumnInfo(connectionId, id)
}
// get one column's info.
async function getColumnInfo(connectionId: string, id: ViewColumnId): Promise<ColumnInfo> {
    const row = await m.getColumnMetaRow(connectionId, id)
    let column: ColumnDescriptor
    let parentColumn: ParentColumnDescriptor
    if (row[V.JOIN_ID] === null) {
        const viewRow = await m.getViewMetaRow(connectionId, row[V.VIEW_ID])
        const source = m.getSelectableFromDbRow(viewRow)
        column = await m.getColumnDescriptor(connectionId, id)
        parentColumn = await getParentColumn(connectionId, source, column.parentColumnId)
    } else {
        const join = await m.getJoinDescriptor(connectionId, row[V.JOIN_ID])
        const source = join.foreignSource
        column = await m.getColumnDescriptor(connectionId, id)
        parentColumn = await getParentColumn(connectionId, source, column.parentColumnId)
    }
    return makeColumnInfo(column, parentColumn)
}
async function getColumnInfo_({ connectionId, id }: CoreRequest): Promise<CoreResponse> {
    return getColumnInfo(connectionId, id).catch(e =>
        error("getColumnInfo", "could not fetch column", e)
    )
}
async function getParentColumn(
    connectionId: string,
    source: s.SelectableDescriptor,
    parentColumnId: ParentColumnId
): Promise<ParentColumnDescriptor> {
    return s.branchOnSelectable(
        source,
        _ => core().events.request(pm.getColumnInfo(connectionId, parentColumnId)),
        _ => getColumnInfo(connectionId, parentColumnId)
    )
}

// add column meta attribute (to the meta table, not to a column)
async function addColumnAttribute({ connectionId, column }: CoreRequest): Promise<CoreResponse> {
    return core().events.request(addColumn(connectionId, V.VIEW_COLUMNS, column))
}

// remove column meta attribute (from the meta table, not from a column)
async function removeColumnAttribute({ connectionId, name }: CoreRequest): Promise<CoreResponse> {
    if (m.VIEW_COLUMNS_ATTRIBUTES.includes(name))
        return Promise.reject({
            message: "cannot remove basic attribute: " + name,
        })
    else return core().events.request(deleteColumn(connectionId, V.VIEW_COLUMNS, name))
}

/** When a table or view is deleted, clean up any views that select from it. */
async function cleanupTableDependents(connectionId: string, source: s.SelectableSpecifier) {
    const views = await listViews(connectionId, source)
    await Promise.all(views.map(v => deleteView(connectionId, v.id, false)))
    const joins = await m
        .getJoinsToSource(connectionId, source)
        .then(joins => joins.map(({ join }) => join))
    await Promise.all(joins.map(j => removeJoinFromView(connectionId, j.id)))
}

/**
 * When a column is deleted, clean up any data (columns, joins, row options) that are based on it.
 */
async function cleanupColumnDependents(
    connectionId: string,
    type: s.SelectableType,
    id: ParentColumnId
) {
    const childColumns = await m.getChildColumnDescriptors(connectionId, type, id)
    await Promise.all(childColumns.map(c => removeColumnFromView(connectionId, c.id)))
    const joins = await m.getJoinsWithColumn(connectionId, type, id)
    await Promise.all(joins.map(j => removeJoinFromView(connectionId, j.id)))
    const rowOptionsRows = await m.getRowOptionsWithColumn(connectionId, type, id)
    await Promise.all(
        rowOptionsRows.map(({ viewId, options }) =>
            changeRowOptions(connectionId, viewId, cleanRowOptions(id, options))
        )
    )
}

/**
 * Strip down a set of row options such that they do not involve a given column.
 */
function cleanRowOptions(columnId: ParentColumnId, options: RowOptions): RowOptions {
    const newConditions = options.conditions
        .map(cond => cleanCondition(columnId, cond))
        .filter(cond => cond !== null) as Condition[] // ok since we used filter
    const newGroupColumns = options.groupColumns.filter(c => c.parentColumnId !== columnId)
    const newSortColumns = options.sortColumns.filter(c => c.column.parentColumnId !== columnId)
    return { conditions: newConditions, groupColumns: newGroupColumns, sortColumns: newSortColumns }
}

/** Clean up all objects that depend on a join: only columns for now. */
async function cleanupJoinDependents(
    connectionId: string,
    viewId: number,
    join: Pick<JoinDescriptor, "id" | "foreignSource">
) {
    const columns = await m.getColumnDescriptors(connectionId, viewId, join)
    await Promise.all(columns.map(c => removeColumnFromView(connectionId, c.id)))
}
