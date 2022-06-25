/**
 * This dummy plugin allows us to run initialization (config, example data)
 * on starting up the core.
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

import { createExampleSchema, insertExampleData } from "./example/load"

let core: PluginLoader
const ADMIN_NAME = "admin@dekanat.de"
let adminId: number

export async function init(plugins: PluginLoader) {
    core = plugins

    // in init.sql until db supports default values
    // await configureColumnAttributes()

    // for dev mode, create some custom data
    if (process.env["npm_lifecycle_event"] === "dev") {
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
    }

    core.listenForRequests(req.CHANNEL)
        .on(req.addColumnToTable.name, addColumnToTable_)
        .on(req.addColumnToViews.name, addColumnToFilterViews_)
        .on(req.removeColumnFromTable.name, removeColumnFromTable_)
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
    createInViews: boolean = true
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
    const tableInfo = (await core.events.request(
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
    const indexKey = A.COLUMN_INDEX.key
    const remainingColumns = tableInfo.columns
        .filter(c => c.attributes[indexKey] > column.attributes[indexKey])
        .map(c => ({
            id: c.id,
            update: { [indexKey]: c.attributes[indexKey] - 1 },
        }))
    await Promise.all(
        remainingColumns.map(async c =>
            changeTableColumnAttributes(tableId, c.id, c.update)
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
        return error(
            "removeColumnFromTable",
            `column belongs to join ${column.joinId}, but no such join found`
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

async function changeTableColumnAttributes(
    tableId: number,
    columnId: number,
    attributes: Partial<lvt.ColumnInfo["attributes"]>,
    changeInViews: boolean = true
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
