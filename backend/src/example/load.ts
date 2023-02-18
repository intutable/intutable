import { CoreRequest } from "@intutable/core"
import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import { createProject } from "@intutable/project-management/dist/requests"

import {
    TableDescriptor,
    TableData,
    SerializedColumn,
    LinkKind,
    LinkDescriptor,
    ForwardLinkDescriptor,
} from "shared/dist/types/tables"

import * as dap from "dekanat-app-plugin/dist/requests"
import { StandardColumnSpecifier } from "dekanat-app-plugin/dist/types/requests"

import { getCore } from "../core"
import {
    DEFAULT_COLUMNS,
    TableSpec,
    Table,
    PERSONEN_SPEC,
    PERSONEN,
    PERSONEN_DATA,
    ORGANE_SPEC,
    ORGANE,
    ORGANE_DATA,
    ROLLEN_SPEC,
    ROLLEN,
    ROLLEN_DATA,
} from "./schema"

function coreRequest<T = unknown>(req: CoreRequest): Promise<T> {
    return getCore().events.request(req)
}

export async function createExampleSchema(connectionId: string, adminId: number): Promise<void> {
    const project: ProjectDescriptor = (await getCore().events.request(
        createProject(connectionId, adminId, "Fakultät MathInf")
    )) as ProjectDescriptor
    await createTable(connectionId, adminId, project.id, PERSONEN_SPEC, PERSONEN)
    await createTable(connectionId, adminId, project.id, ORGANE_SPEC, ORGANE)
    await createTable(connectionId, adminId, project.id, ROLLEN_SPEC, ROLLEN)
}
async function createTable(
    connectionId: string,
    roleId: number,
    projectId: number,
    tableSpec: TableSpec,
    slotToSave: Table
): Promise<void> {
    const descriptor = await coreRequest<TableDescriptor>(
        dap.createTable(connectionId, roleId, projectId, tableSpec.name)
    )
    for (const column of tableSpec.columns) {
        await coreRequest<SerializedColumn>(
            dap.createStandardColumn(connectionId, descriptor.id, column)
        )
    }
    if (tableSpec.links.some(table => !table.descriptor))
        throw Error("Not all link tables initialized: " + tableSpec.links)
    for (const linkTable of tableSpec.links) {
        await coreRequest<SerializedColumn>(
            dap.createLinkColumn(connectionId, descriptor.id, {
                foreignTable: linkTable.descriptor.id,
            })
        )
    }
    for (const viewName of tableSpec.views)
        await coreRequest(dap.createView(connectionId, descriptor.id, viewName))
    const tableData = await coreRequest<TableData>(dap.getTableData(connectionId, descriptor.id))
    const columnMappings = getColumnMappings(tableSpec.columns, tableData.columns)
    const linkMappings = getLinkMappings(tableSpec.links, tableData.links)
    slotToSave.spec = tableSpec
    slotToSave.descriptor = descriptor
    slotToSave.columnMappings = columnMappings
    slotToSave.linkMappings = linkMappings
    slotToSave.rowMappings = {}
}

function getColumnMappings(
    columnSpecs: StandardColumnSpecifier[],
    columns: SerializedColumn[]
): Record<string, number> {
    const mappings: Record<string, number> = {}
    const columnNames = DEFAULT_COLUMNS.concat(columnSpecs.map(c => c.name))
    for (const columnSpec of columnNames) {
        const column = columns.find(c => c.name === columnSpec)
        if (!column) throw Error(`no column with name ${columnSpec} found`)
        mappings[columnSpec] = column.id
    }
    return mappings
}

function getLinkMappings(
    linkSpecs: Table[],
    links: LinkDescriptor[]
): Record<string, ForwardLinkDescriptor> {
    const mappings: Record<string, ForwardLinkDescriptor> = {}
    for (const foreignTable of linkSpecs) {
        const tableId = foreignTable.descriptor.id
        const link = links.find(
            link => link.kind === LinkKind.Forward && link.foreignTable === tableId
        ) as ForwardLinkDescriptor
        if (!link) throw Error(`no link with kind "forward" and table ID ${tableId}`)
        mappings[foreignTable.spec.name] = link
    }
    return mappings
}

export async function insertExampleData(connectionId: string): Promise<void> {
    await insertExampleColumnData(connectionId, PERSONEN, PERSONEN_DATA.rows)
    await insertExampleColumnData(connectionId, ORGANE, ORGANE_DATA.rows)
    await insertExampleColumnData(connectionId, ROLLEN, ROLLEN_DATA.rows)
}

async function insertExampleColumnData(
    connectionId: string,
    table: Table,
    data: Record<string, unknown>[]
) {
    for (const row of data) {
        const numberRow = mapStringKeysToIDs(table, row)
        const { _id } = await coreRequest<{ _id: number }>(
            dap.createRow(connectionId, table.descriptor.id, { values: numberRow })
        )
        table.rowMappings[row["Name"] as string] = _id
    }
}

function mapStringKeysToIDs(table: Table, row: Record<string, unknown>): Record<number, unknown> {
    const newRow: Record<number, unknown> = {}
    for (const columnName of Object.keys(row)) {
        if (typeof table.columnMappings[columnName] === "number") {
            const id = table.columnMappings[columnName]
            newRow[id] = row[columnName]
        } else if (typeof table.linkMappings[columnName] === "object") {
            const id = table.linkMappings[columnName].forwardLinkColumn
            const targetRowId = getTargetRow(table, columnName, row[columnName] as string)
            newRow[id] = targetRowId
        } else throw Error(`No column with name ${columnName} found in table ${table.descriptor}`)
    }
    return newRow
}

function getTargetRow(homeTable: Table, foreignTableName: string, value: string): number {
    const foreignTable = homeTable.spec.links.find(table => table.spec.name === foreignTableName)
    if (!foreignTable)
        throw Error(`no foreign table ${foreignTableName} found linked from table ${homeTable}`)
    const rowId = foreignTable.rowMappings[value]
    return rowId
}
