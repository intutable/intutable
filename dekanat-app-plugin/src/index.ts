/**
 * This plugin allows us to run initialization (config, example data)
 * on starting up the core. We can also create methods to allow complex
 * tasks to be accomplished with only one network request. It may eventually
 * even be a security bonus to create highly specific methods and expose only
 * them for use by the front-end.
 */
import { PluginLoader, CoreRequest, CoreResponse } from "@intutable/core"
import {
    Column,
    ColumnType,
    ColumnOption,
} from "@intutable/database/dist/column"
import { insert, select } from "@intutable/database/dist/requests"
import { removeColumn } from "@intutable/project-management/dist/requests"
import {
    types as lvt,
    requests as lvr,
    selectable,
} from "@intutable/lazy-views/"

import * as req from "./requests"
import { A } from "./attributes"
import { error } from "./internal/error"
import * as perm from "./permissions/requests"

import { createExampleSchema, insertExampleData } from "./example/load"

let core: PluginLoader
const ADMIN_NAME = "admin@dekanat.de"
let adminId: number

export async function init(plugins: PluginLoader) {
    core = plugins

    // in init.sql until db supports default values
    // await configureColumnAttributes()

    // create some custom data
    const maybeAdminId = await getAdminId()
    if (maybeAdminId === null) {
        adminId = await createAdmin()
        console.log("set up admin user")
    } else {
        adminId = maybeAdminId
        console.log("admin user already present")
    }

    // testing data
    if (maybeAdminId === null) {
        console.log("creating and populating example schema")
        await createExampleSchema(core, adminId)
        await insertExampleData(core)
    } else console.log("skipped creating example schema")

    core.listenForRequests(req.CHANNEL)
        .on(req.addColumnToTable.name, addColumnToTable_)
        .on(req.addColumnToViews.name, addColumnToFilterViews_)
        .on(req.removeColumnFromTable.name, removeColumnFromTable_)
        .on(perm.getUsers.name, perm.getUsers_)
        .on(perm.getRoles.name, perm.getRoles_)
        .on(perm.createUser.name, perm.createUser_)
        .on(perm.deleteUser.name, perm.deleteUser_)
        .on(perm.changeRole.name, perm.changeRole_)
}

async function getAdminId(): Promise<number | null> {
    const userRows = await core.events.request(
        select("users", {
            columns: ["_id"],
            condition: ["email", ADMIN_NAME],
        })
    )
    if (userRows.length > 1)
        return Promise.reject("fatal: multiple users with same name exist")
    else if (userRows.length === 1) return userRows[0]["_id"]
    else return null
}

/** Create admin user */
async function createAdmin(): Promise<number> {
    await core.events.request(
        insert("users", {
            email: ADMIN_NAME,
            password:
                "$argon2i$v=19$m=4096,t=3,p=1$vzOdnV+KUtQG3va/nlOOxg$vzo1JP16rQKYmXzQgYT9VjUXUXPA6cWHHAvXutrRHtM",
        })
    )
    return getAdminId().then(definitelyNumber => definitelyNumber!)
}

/** Create the custom attributes for views' columns we need. */
async function configureColumnAttributes(): Promise<void> {
    const customColumns: Column[] = [
        {
            name: "displayName",
            type: ColumnType.text,
            options: [ColumnOption.nullable],
        },
        {
            name: "userPrimary",
            type: ColumnType.integer,
            options: [ColumnOption.notNullable],
        },
        {
            name: "editable",
            type: ColumnType.integer,
            options: [ColumnOption.notNullable],
        },
        {
            name: "editor",
            type: ColumnType.text,
            options: [ColumnOption.nullable],
        },
        {
            name: "formatter",
            type: ColumnType.text,
            options: [ColumnOption.nullable],
        },
    ]
    await Promise.all(
        customColumns.map(c => core.events.request(lvr.addColumnAttribute(c)))
    )
}

async function addColumnToTable_({
    tableId,
    column,
    joinId,
    createInViews,
}: CoreRequest): Promise<CoreResponse> {
    return addColumnToTable(tableId, column, joinId, createInViews)
}
async function addColumnToTable(
    tableId: lvt.ViewDescriptor["id"],
    column: lvt.ColumnSpecifier,
    joinId: number | null = null,
    createInViews = true
): Promise<lvt.ColumnInfo> {
    const tableColumn = (await core.events.request(
        lvr.addColumnToView(tableId, column, joinId)
    )) as lvt.ColumnInfo
    if (createInViews)
        await addColumnToFilterViews(tableId, {
            parentColumnId: tableColumn.id,
            attributes: tableColumn.attributes,
        })
    return tableColumn
}

async function addColumnToFilterViews_({
    tableId,
    column,
}: CoreRequest): Promise<CoreResponse> {
    return addColumnToFilterViews(tableId, column)
}
async function addColumnToFilterViews(
    tableId: lvt.ViewDescriptor["id"],
    column: lvt.ColumnSpecifier
): Promise<lvt.ColumnInfo[]> {
    const filterViews = (await core.events.request(
        lvr.listViews(selectable.viewId(tableId))
    )) as lvt.ViewDescriptor[]
    return Promise.all(
        filterViews.map(v =>
            core.events.request(lvr.addColumnToView(v.id, column))
        )
    )
}

async function removeColumnFromTable_({
    tableId,
    columnId,
}: CoreRequest): Promise<CoreResponse> {
    return removeColumnFromTable(tableId, columnId)
}
async function removeColumnFromTable(
    tableId: lvt.ViewDescriptor["id"],
    columnId: lvt.ColumnInfo["id"]
) {
    let tableInfo = (await core.events.request(
        lvr.getViewInfo(tableId)
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

    const kind = column.attributes._kind
    switch (kind) {
        case "standard":
            await removeStandardColumn(tableId, column)
            break
        case "link":
            await removeLinkColumn(tableId, column)
            break
        case "lookup":
            await removeLookupColumn(tableId, columnId)
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
        lvr.getViewInfo(tableId)
    )) as lvt.ViewInfo
    const indexKey = A.COLUMN_INDEX.key
    const columnUpdates = getColumnIndexUpdates(tableInfo.columns)

    await Promise.all(
        columnUpdates.map(async c =>
            changeTableColumnAttributes(tableId, c.id, { [indexKey]: c.index })
        )
    )

    return { message: `removed ${kind} column #${columnId}` }
}

async function removeLinkColumn(
    tableId: number,
    column: lvt.ColumnInfo
): Promise<void> {
    const info = (await core.events.request(
        lvr.getViewInfo(tableId)
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
        c => c.joinId === join.id && c.attributes._kind === "lookup"
    )

    await Promise.all(
        lookupColumns.map(async c => removeColumnFromTable(tableId, c.id))
    )
    // remove link column
    await removeColumnFromViews(tableId, column.id)
    await core.events.request(lvr.removeColumnFromView(column.id))
    // remove join and FK column
    await core.events.request(lvr.removeJoinFromView(join.id))
    const fkColumnId = join.on[0]
    await core.events.request(removeColumn(fkColumnId))
}

async function removeStandardColumn(
    tableId: number,
    column: lvt.ColumnInfo
): Promise<void> {
    await removeColumnFromViews(tableId, column.id)
    await core.events.request(lvr.removeColumnFromView(column.id))
    await core.events.request(removeColumn(column.parentColumnId))
}

async function removeLookupColumn(
    tableId: number,
    columnId: number
): Promise<void> {
    await removeColumnFromViews(tableId, columnId)
    await core.events.request(lvr.removeColumnFromView(columnId))
}

async function removeColumnFromViews(
    tableId: number,
    parentColumnId: number
): Promise<void> {
    const views = (await core.events.request(
        lvr.listViews(selectable.viewId(tableId))
    )) as lvt.ViewDescriptor[]
    await Promise.all(
        views.map(async v => {
            const info = (await core.events.request(
                lvr.getViewInfo(v.id)
            )) as lvt.ViewInfo
            const viewColumn = info.columns.find(
                c => c.parentColumnId === parentColumnId
            )
            if (viewColumn)
                await core.events.request(
                    lvr.removeColumnFromView(viewColumn.id)
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
    const indexKey = A.COLUMN_INDEX.key
    return columns
        .map((c, index) => ({ column: c, index }))
        .filter(pair => pair.column.attributes[indexKey] !== pair.index)
        .map(pair => ({
            id: pair.column.id,
            index: pair.index,
        }))
}

async function changeTableColumnAttributes(
    tableId: number,
    columnId: number,
    attributes: Partial<lvt.ColumnInfo["attributes"]>,
    changeInViews = true
): Promise<void> {
    await core.events.request(lvr.changeColumnAttributes(columnId, attributes))
    if (changeInViews)
        return changeColumnAttributesInViews(tableId, columnId, attributes)
}

async function changeColumnAttributesInViews(
    tableId: number,
    columnId: number,
    attributes: Partial<lvt.ColumnInfo["attributes"]>
): Promise<void> {
    const views = (await core.events.request(
        lvr.listViews(selectable.viewId(tableId))
    )) as lvt.ViewDescriptor[]
    const viewColumns = await Promise.all(
        views.map(async v => {
            const info = (await core.events.request(
                lvr.getViewInfo(v.id)
            )) as lvt.ViewInfo
            const viewColumn = info.columns.find(
                c => c.parentColumnId === columnId
            )
            return viewColumn || null
        })
    )

    await Promise.all(
        viewColumns.map(async c =>
            core.events.request(lvr.changeColumnAttributes(c.id, attributes))
        )
    )
}
