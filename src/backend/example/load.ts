import { PluginLoader } from "@intutable/core"
import { insert } from "@intutable/database/dist/requests"
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

let personen: Table
let organe: Table
let simpleTables: Table[]
let rollen: Table

export async function createExampleSchema(
    core: PluginLoader,
    adminId: number
): Promise<void> {
    const project: ProjectDescriptor = (await core.events.request(
        createProject(adminId, "Fakultät MathInf")
    )) as ProjectDescriptor
    personen = await createTable(core, adminId, project.id, PERSONEN)
    organe = await createTable(core, adminId, project.id, ORGANE)
    simpleTables = [personen, organe]
    rollen = await createTable(core, adminId, project.id, ROLLEN)
}
async function createTable(
    core: PluginLoader,
    userId: number,
    projectId: number,
    table: TableSpec
): Promise<Table> {
    const baseTable: TableDescriptor = (await core.events.request(
        createTableInProject(
            userId,
            projectId,
            table.name,
            table.columns.map(c => c.baseColumn)
        )
    )) as TableDescriptor
    const tableInfo = (await core.events.request(
        getTableInfo(baseTable.id)
    )) as TableInfo
    const viewColumns: v_types.ColumnSpecifier[] = table.columns.map(c => {
        const baseColumn = tableInfo.columns.find(
            parent => parent.name === c.baseColumn.name
        )!
        return {
            parentColumnId: baseColumn.id,
            attributes: c.attributes,
        }
    })
    const tableView = (await core.events.request(
        v_req.createView(
            tableId(baseTable.id),
            table.name,
            { columns: viewColumns, joins: [] },
            EMPTY_ROW_OPTIONS
        )
    )) as v_types.ViewDescriptor
    // add joins
    await Promise.all(table.joins.map(j =>
        addJoin(core, baseTable, tableView, j)))

    const tableViewInfo = await core.events.request(
        v_req.getViewInfo(tableView.id)
    ) as v_types.ViewInfo
    const idColumn = tableViewInfo.columns.find(c => c.name === PK_COLUMN)
    const filterView = await core.events.request(
        v_req.createView(
            viewId(tableView.id),
            "Standard",
            { columns: [], joins: [] },
            baseRowOptions(idColumn)
        )
    )
    const tableDescriptors = { baseTable, tableView, filterView }
    return tableDescriptors
}

async function addJoin(
    core: PluginLoader,
    baseTable: TableDescriptor,
    tableView: v_types.ViewDescriptor,
    join: JoinSpec
): Promise<void> {
    const fk = (await core.events.request(
        createColumnInTable(
            baseTable.id,
            join.fkColumn.name,
            join.fkColumn.type
        )
    )) as ColumnDescriptor
    const foreignTable = simpleTables.find(
        t => t.tableView.name === join.table
    )!
    const info = (await core.events.request(
        v_req.getViewInfo(foreignTable.tableView.id)
    )) as TableInfo
    const pk = info.columns.find(c => c.name === join.pkColumn)!
    const foreignColumns = join.linkColumns.map(l => {
        const parentColumn = info.columns.find(c => c.name === l.name)!
        return {
            parentColumnId: parentColumn.id,
            attributes: l.attributes,
        }
    })
    await core.events.request(
        v_req.addJoinToView(tableView.id, {
            foreignSource: viewId(foreignTable.tableView.id),
            on: [fk.id, "=", pk.id],
            columns: foreignColumns,
        })
    )
}

export async function insertExampleData(core: PluginLoader): Promise<void> {
    await Promise.all(
        PERSONEN_DATA.map(r =>
            core.events.request(insert(personen.baseTable.key, r))
        )
    )
    await Promise.all(
        ORGANE_DATA.map(r =>
            core.events.request(insert(organe.baseTable.key, r))
        )
    )
    await Promise.all(
        ROLLEN_DATA.map(r =>
            core.events.request(insert(rollen.baseTable.key, r))
        )
    )
}

const EMPTY_ROW_OPTIONS: v_types.RowOptions = {
    conditions: [],
    groupColumns: [],
    sortColumns: [],
}
function baseRowOptions(idColumn: ColumnDescriptor): v_types.RowOptions {
    return {
        conditions: [],
        groupColumns: [],
        sortColumns: [
            {
                column: { parentColumnId: idColumn.id, joinId: null },
                order: v_types.SortOrder.Ascending,
            },
        ],
    }
}
