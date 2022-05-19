/**
 * This dummy plugin allows us to run initialization (config, example data)
 * on starting up the core.
 */
import { PluginLoader } from "@intutable/core"
import {
    Column,
    ColumnType,
    ColumnOption
} from "@intutable/database/dist/column"
import { insert, select } from "@intutable/database/dist/requests"
import {
    ProjectDescriptor,
    TableDescriptor,
    TableInfo,
    ColumnDescriptor,
} from "@intutable/project-management/dist/types"
import {
    createProject,
    createTableInProject,
    getTableInfo,
    createColumnInTable,
} from "@intutable/project-management/dist/requests"
import { requests as v_req } from "@intutable/lazy-views/"
import { types as v_types } from "@intutable/lazy-views"
import { tableId, viewId } from "@intutable/lazy-views"

import {
    TableSpec,
    JoinSpec,
    Table,
    PK_COLUMN,
    PERSONEN,
    PERSONEN_DATA,
    ORGANE,
    ORGANE_DATA,
    ROLLEN,
    ROLLEN_DATA,
} from "./schema"

let core: PluginLoader
const ADMIN_NAME = "admin@dekanat.de"
let adminId: number

export async function init(plugins: PluginLoader){
    core = plugins

    // config
    // If the admin user is already present, assume no further set-up is needed.
    const maybeAdminId = await getAdminId()
    if (maybeAdminId === null){
        adminId = await createAdmin()
        console.log("set up admin user")
    } else {
        adminId = maybeAdminId
        console.log("admin user already present")
    }

    // in init.sql until db supports default values
    // await configureColumnAttributes()

    // testing data
    if (maybeAdminId === null) {
        console.log("creating and populating example schema")
        await createExampleSchema(adminId)
        await insertExampleData()
    } else console.log("skipped creating example schema")
}

async function getAdminId(): Promise<number | null> {
    const userRows = await core.events.request(
        select("users", {
            columns: [ "_id" ],
            condition: [ "email", ADMIN_NAME ]
        })
    )
    if (userRows.length > 1)
        return Promise.reject("fatal: multiple users with same name exist")
    else if (userRows.length === 1)
        return userRows[0]["_id"]
    else
        return null
}

/** Create admin user */
async function createAdmin(): Promise<number> {
    await core.events.request(insert("users", {
        email: ADMIN_NAME,
        password: "$argon2i$v=19$m=4096,t=3,p=1$vzOdnV+KUtQG3va/nlOOxg$vzo1JP16rQKYmXzQgYT9VjUXUXPA6cWHHAvXutrRHtM",
    }))
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
    await Promise.all(customColumns.map(
        c => core.events.request(v_req.addColumnAttribute(c))
    ))
}

// example data

let personen: Table
let organe: Table
let simpleTables: Table[]
let rollen: Table

async function createExampleSchema(adminId: number): Promise<void> {
    const project: ProjectDescriptor = await core.events.request(
        createProject(adminId, "Fakultät MathInf")
    ) as ProjectDescriptor
    personen = await createTable(adminId, project.id, PERSONEN)
    organe = await createTable(adminId, project.id, ORGANE)
    simpleTables = [ personen, organe ]
    rollen = await createTable(adminId, project.id, ROLLEN)
}
async function createTable(
    userId: number,
    projectId: number,
    table: TableSpec
): Promise<Table> {
    const baseTable: TableDescriptor = await core.events.request(
        createTableInProject(
            userId,
            projectId,
            table.name,
            table.columns.map(c => c.baseColumn)
        )
    ) as TableDescriptor
    const tableInfo = await core.events.request(
        getTableInfo(baseTable.id)
    ) as TableInfo
    const idColumn = tableInfo.columns.find(c => c.name === PK_COLUMN)
    const viewColumns: v_types.ColumnSpecifier[] = table.columns.map(c => {
        const baseColumn = tableInfo.columns.find(parent =>
            parent.name === c.baseColumn.name)!
        return {
            parentColumnId: baseColumn.id,
            attributes: c.attributes
        }
    })
    const tableView = await core.events.request(
        v_req.createView(
            tableId(baseTable.id),
            table.name,
            { columns: viewColumns, joins: [] },
            EMPTY_ROW_OPTIONS
        )
    ) as v_types.ViewDescriptor
    const filterView = await core.events.request(
        v_req.createView(
            viewId(tableView.id),
            "Standard",
            { columns: [], joins: [] },
            baseRowOptions(idColumn)
        )
    )
    const tableDescriptors = { baseTable, tableView, filterView }
    await Promise.all(
        table.joins.map(j => addJoin(tableDescriptors, j))
    )
    return tableDescriptors
}

async function addJoin(table: Table, join: JoinSpec): Promise<void> {
    const fk = await core.events.request(
        createColumnInTable(
            table.baseTable.id,
            join.fkColumn.name,
            join.fkColumn.type
        )
    ) as ColumnDescriptor
    const foreignTable = simpleTables.find(
        t => t.tableView.name === join.table)!
    const info = await core.events.request(
        v_req.getViewInfo(foreignTable.tableView.id)
    ) as TableInfo
    const pk = info.columns.find(c => c.name === join.pkColumn)!
    const foreignColumns = join.linkColumns.map(l => {
        const parentColumn = info.columns.find(c => c.name === l.name)!
        return {
            parentColumnId: parentColumn.id,
            attributes: l.attributes
        }
    })
    await core.events.request(
        v_req.addJoinToView(table.tableView.id, {
            foreignSource: viewId(foreignTable.tableView.id),
            on: [fk.id, "=", pk.id],
            columns: foreignColumns
        })
    )
}

async function insertExampleData(): Promise<void> {
    await Promise.all(PERSONEN_DATA.map(r => core.events.request(
        insert(personen.baseTable.key, r)
    )))
    await Promise.all(ORGANE_DATA.map(r => core.events.request(
        insert(organe.baseTable.key, r)
    )))
    await Promise.all(ROLLEN_DATA.map(r => core.events.request(
        insert(rollen.baseTable.key, r)
    )))
}

const EMPTY_ROW_OPTIONS: v_types.RowOptions = {
    conditions: [],
    groupColumns: [],
    sortColumns: []
}
function baseRowOptions(idColumn: ColumnDescriptor): v_types.RowOptions {
    return {
        conditions: [],
        groupColumns: [],
        sortColumns: [{
            column: { parentColumnId: idColumn.id, joinId: 0 },
            order: v_types.SortOrder.Ascending
        }],
    }
}
