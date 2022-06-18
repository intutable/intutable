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
import {
    types as lv_types,
    requests as lv_req,
    selectable,
} from "@intutable/lazy-views/"

import * as req from "./requests"

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
        customColumns.map(c =>
            core.events.request(lv_req.addColumnAttribute(c))
        )
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
    tableId: lv_types.ViewDescriptor["id"],
    column: lv_types.ColumnSpecifier,
    joinId: number | null = null,
    createInViews: boolean = true
): Promise<lv_types.ColumnInfo> {
    const tableColumn = (await core.events.request(
        lv_req.addColumnToView(tableId, column, joinId)
    )) as lv_types.ColumnInfo
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
    tableId: lv_types.ViewDescriptor["id"],
    column: lv_types.ColumnSpecifier
): Promise<lv_types.ColumnInfo[]> {
    const filterViews = (await core.events.request(
        lv_req.listViews(selectable.viewId(tableId))
    )) as lv_types.ViewDescriptor[]
    return Promise.all(
        filterViews.map(v =>
            core.events.request(lv_req.addColumnToView(v.id, column))
        )
    )
}
