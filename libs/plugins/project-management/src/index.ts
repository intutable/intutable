import { CoreRequest, CoreResponse, PluginLoader } from "@intutable-org/core"
import { Column, ColumnType, SimpleColumnOption } from "@intutable-org/database/dist/types"
import {
    addColumn,
    createTable,
    deleteColumn,
    deleteRow,
    deleteTable,
    insert,
    select,
    update,
    renameTable,
    renameColumn,
    listTables,
} from "@intutable-org/database/dist/requests"

import { generateTableKey, singleValue } from "./utils"
import { ProjectDescriptor, TableDescriptor, ColumnDescriptor, TableInfo } from "./types"
import { CHANNEL } from "./requests"
import * as requests from "./requests"
import * as m from "./meta"

let plugins: PluginLoader

export async function init(pluginInput: PluginLoader) {
    plugins = pluginInput

    plugins
        .listenForRequests(CHANNEL)
        .on("getProjects", getProjects)
        .on("createProject", createProject)
        .on("changeProjectName", changeProjectName)
        .on("removeProject", removeProject)
        .on("getTablesFromProject", getTablesFromProject)
        .on("createTableInProject", createTableInProject)
        .on("getTableInfo", getTableInfo)
        .on("getTableData", getTableData)
        .on("changeTableName", changeTableName)
        .on("removeTable", removeTable)
        .on("getColumnsFromTable", getColumnsFromTable)
        .on("getColumnInfo", getColumnInfo)
        .on("createColumnInTable", createColumnInTable)
        .on("changeColumnName", changeColumnName)
        .on("changeColumnAttributes", changeColumnAttributes)
        .on("removeColumn", removeColumn)
        .on("merge", merge)
        .on("copy", copy)
}

async function getProjectId(connectionId: string, name: string, roleId: number): Promise<number> {
    const projectIdQuery: Array<Record<string, number>> = (await plugins.events.request(
        select(connectionId, m.PROJECTS, {
            columns: [m.ID],
            condition: [{ [m.PROJECT_NAME]: name, [m.OWNER_ID]: roleId }],
        })
    )) as Array<Record<string, number>>

    if (projectIdQuery.length == 0) {
        throw new Error(`No such project: ${name}`)
    }

    return singleValue(projectIdQuery)
}

async function getColumnIdsFromTable(connectionId: string, id: number) {
    return (
        plugins.events.request(
            select(connectionId, m.COLUMNS, {
                columns: [m.ID],
                condition: [m.TABLE_ID, id],
            })
        ) as Promise<any[]>
    ).then(rows => rows.map(row => row[m.ID]))
}

async function getProjects({ connectionId, roleId }: CoreRequest): Promise<CoreResponse> {
    const rows = (await plugins.events.request(
        select(connectionId, m.PROJECTS, {
            columns: [m.ID, m.PROJECT_NAME],
            //condition: [m.ROLE_ID, roleId],
        })
    )) as Record<string, any>[]
    const projects: ProjectDescriptor[] = rows.map(r => ({
        id: r[m.ID],
        name: r[m.PROJECT_NAME],
    }))
    return projects
}

async function projectExists(
    connectionId: string,
    projectName: string,
    roleId: number
): Promise<boolean> {
    return await getProjectId(connectionId, projectName, roleId)
        .then(_projectId => true)
        .catch(_err => false)
}

async function createProject(req: CoreRequest): Promise<CoreResponse> {
    const { connectionId, roleId, newProject } = req

    if (await projectExists(connectionId, newProject, roleId)) {
        throw new Error(`Role ${roleId} already owns a project named ${newProject}`)
    }

    await plugins.events.request(
        insert(connectionId, m.PROJECTS, {
            [m.PROJECT_NAME]: newProject,
            [m.OWNER_ID]: roleId,
        })
    )

    const projectId = await getProjectId(connectionId, newProject, roleId)

    plugins.events.notify({ ...req, method: requests.createdProject })
    return { id: projectId, name: newProject }
}

async function changeProjectName(req: CoreRequest): Promise<CoreResponse> {
    const { connectionId, id, newName } = req

    const result = await plugins.events.request(
        update(connectionId, m.PROJECTS, {
            condition: [m.ID, id],
            update: {
                [m.PROJECT_NAME]: newName,
            },
        })
    )
    if (result.rowsUpdated !== 1) return Promise.reject({ error: "could not rename project" })
    plugins.events.notify({ ...req, method: requests.changedProjectName })
    return { id, name: newName }
}

async function removeProject(req: CoreRequest): Promise<CoreResponse> {
    const { connectionId, id, tablesToKeep = [] } = req
    const tables: TableDescriptor[] = (
        (await plugins.events.request(
            select(connectionId, m.PROJECTS_TABLES, {
                columns: [`${m.TABLES}.${m.ID}`, `${m.TABLES}.${m.TABLE_NAME}`, m.KEY],
                join: {
                    table: m.TABLES,
                    on: [`${m.TABLES}.${m.ID}`, "=", m.TABLE_ID],
                },
                condition: [m.PROJECT_ID, id],
            })
        )) as any[]
    ).map(r => ({ id: r[m.ID], name: r[m.TABLE_NAME], key: r[m.KEY] }))
    const tablesToRemove = tables.filter(t => !tablesToKeep.includes(t.id))
    const tablesToUnlink = tables.filter(t => tablesToKeep.includes(t.id))

    for (const table of tablesToRemove) {
        await removeTable({
            channel: CHANNEL,
            method: "removeTable",
            connectionId: connectionId,
            id: table.id,
        })
    }
    for (const table of tablesToUnlink) {
        await plugins.events.request(
            deleteRow(connectionId, m.PROJECTS_TABLES, [
                {
                    [m.PROJECT_ID]: id,
                    [m.TABLE_ID]: table.id,
                },
            ])
        )
    }

    await plugins.events.request(deleteRow(connectionId, m.PROJECTS, [m.ID, id]))

    plugins.events.notify({ ...req, method: requests.removedProject })
    return { message: `Deleted project #${id}` }
}

async function getTablesFromProject({ connectionId, id }: CoreRequest): Promise<CoreResponse> {
    return (
        (await plugins.events.request(
            select(connectionId, m.TABLES, {
                columns: [`${m.TABLES}.${m.ID}`, m.TABLE_NAME, m.KEY],
                join: {
                    table: m.PROJECTS_TABLES,
                    on: [`${m.TABLES}.${m.ID}`, "=", `${m.PROJECTS_TABLES}.${m.TABLE_ID}`],
                },
                condition: [`${m.PROJECTS_TABLES}.${m.PROJECT_ID}`, id],
            })
        )) as any
    ).map((t: any) => ({
        id: t[m.ID],
        name: t[m.TABLE_NAME],
        key: t[m.KEY],
    }))
}

async function createTableInProject(req: CoreRequest): Promise<CoreResponse> {
    const { connectionId, roleId, projectId, name, columns: rawColumns = [], options = [] } = req
    const key = generateTableKey(projectId, name)

    let columns: Column[]
    if (rawColumns.length === 0) {
        columns = [
            {
                name: m.ID,
                type: ColumnType.increments,
                options: [SimpleColumnOption.primary, SimpleColumnOption.notNullable],
            },
            {
                name: m.DEFAULT,
                type: ColumnType.string,
            },
        ]
    } else {
        if (!rawColumns.some((c: { name: string }) => c.name === m.ID)) {
            columns = [
                {
                    name: m.ID,
                    type: ColumnType.increments,
                    options: [SimpleColumnOption.primary, SimpleColumnOption.notNullable],
                },
                ...rawColumns,
            ]
        } else columns = rawColumns
    }

    await plugins.events.request(
        createTable(
            connectionId,
            key,
            [...columns.map(({ name, type }: any) => ({ name, type }))],
            options
        )
    )

    const id = await plugins.events
        .request(
            insert(
                connectionId,
                m.TABLES,
                {
                    [m.KEY]: key,
                    [m.TABLE_NAME]: name,
                    [m.OWNER_ID]: roleId,
                },
                [m.ID]
            )
        )
        .then(row => (<any>row)[m.ID] as number)

    // TODO create constant
    await plugins.events.request(
        insert(connectionId, m.PROJECTS_TABLES, {
            [m.PROJECT_ID]: projectId,
            [m.TABLE_ID]: id,
        })
    )

    for (const { name: columnName, options: options, type: columnType, ...column } of columns) {
        await plugins.events.request(
            insert(connectionId, m.COLUMNS, {
                [m.COLUMN_NAME]: columnName,
                [m.TABLE_ID]: id,
                [m.TYPE]: columnType,
                ...column,
            })
        )
    }

    plugins.events.notify({ ...req, method: requests.createdTableInProject })
    return { id, name, key }
}

async function changeTableName(req: CoreRequest): Promise<CoreResponse> {
    const { connectionId, id, newName } = req
    const row = (
        (await plugins.events.request(
            select(connectionId, m.PROJECTS_TABLES, {
                columns: [m.PROJECT_ID, m.TABLE_NAME],
                join: {
                    table: m.TABLES,
                    on: [`${m.TABLES}.${m.ID}`, "=", m.TABLE_ID],
                },
                condition: [m.TABLE_ID, id],
            })
        )) as any[]
    )[0]

    const oldName = row[m.TABLE_NAME]
    const projectId = row[m.PROJECT_ID]
    const result = await plugins.events.request(
        update(connectionId, m.TABLES, {
            condition: [m.ID, id],
            update: {
                key: generateTableKey(projectId, newName),
                name: newName,
            },
        })
    )
    if (result.rowsUpdated !== 1) return Promise.reject({ error: "could not rename table" })
    await plugins.events.request(
        renameTable(
            connectionId,
            generateTableKey(projectId, oldName),
            generateTableKey(projectId, newName)
        )
    )

    plugins.events.notify({ ...req, method: requests.changedTableName })
    return { id, name: newName, key: generateTableKey(projectId, newName) }
}

async function removeTable(req: CoreRequest): Promise<CoreResponse> {
    const { connectionId, id } = req
    const tableKey = singleValue(
        (await plugins.events.request(
            select(connectionId, m.TABLES, {
                condition: [m.ID, id],
                columns: [m.KEY],
            })
        )) as Record<string, string>[]
    )
    const columnIds = await getColumnIdsFromTable(connectionId, id)

    await plugins.events.request(deleteRow(connectionId, m.COLUMNS, [m.ID, "in", columnIds]))

    await plugins.events.request(deleteRow(connectionId, m.PROJECTS_TABLES, [m.TABLE_ID, id]))

    await plugins.events.request(deleteRow(connectionId, m.TABLES, [m.ID, id]))

    await plugins.events.request(deleteTable(connectionId, tableKey))

    plugins.events.notify({ ...req, method: requests.removedTable })
    return { message: `Deleted table #${id}` }
}

async function getTableInfo({
    connectionId,
    id,
    attributes = [],
}: CoreRequest): Promise<CoreResponse> {
    const [{ name, key }] = (await plugins.events.request(
        select(connectionId, m.TABLES, {
            columns: [m.TABLE_NAME, m.KEY],
            condition: [m.ID, id],
        })
    )) as Array<Record<string, string>>
    const columns = await getColumnsFromTable({
        connectionId,
        id,
        attributes,
    } as any)

    const table: TableDescriptor = { id, name, key }
    return { table, columns }
}

async function getTableData({
    connectionId,
    id,
    attributes = [],
}: CoreRequest): Promise<CoreResponse> {
    const [{ name, key }] = (await plugins.events.request(
        select(connectionId, m.TABLES, {
            columns: [m.TABLE_NAME, m.KEY],
            condition: [m.ID, id],
        })
    )) as Array<Record<string, string>>
    const columns = await getColumnsFromTable({
        connectionId,
        id,
        attributes,
    } as any)
    const rows = await getTableRows(connectionId, key, columns)

    const table = { id, name, key }
    return { table, columns, rows }
}

async function getTableRows(connectionId: string, tableKey: string, columns: any) {
    const columnsToGet = new Array<string>()
    for (const col of columns) {
        columnsToGet.push(col.name)
    }

    const rows = (await plugins.events.request(
        select(connectionId, tableKey, {
            columns: columnsToGet,
        })
    )) as Record<string, string>

    return rows
}

async function getColumnsFromTable({
    connectionId,
    id,
    attributes = [],
}: CoreRequest): Promise<CoreResponse> {
    attributes = (<string[]>attributes).filter(a => !m.COLUMN_BASE_ATTRIBUTES.includes(a))
    const rows = (await plugins.events.request(
        select(connectionId, m.COLUMNS, {
            columns: m.COLUMN_BASE_ATTRIBUTES.concat(attributes),
            condition: [m.TABLE_ID, id],
        })
    )) as Record<string, any>[]
    return rows.map(r => {
        const column = {
            id: r[m.ID],
            name: r[m.COLUMN_NAME],
            type: r[m.TYPE],
            attributes: {},
        }
        for (const attribute of m.COLUMN_BASE_ATTRIBUTES) delete r[attribute]
        column.attributes = r
        return column
    })
}

async function createColumnInTable(req: CoreRequest): Promise<CoreResponse> {
    const { connectionId, tableId, name, type, options, attributes } = req
    const tableKey = singleValue(
        (await plugins.events.request(
            select(connectionId, m.TABLES, {
                columns: [m.KEY],
                condition: [m.ID, tableId],
            })
        )) as Record<string, string>[]
    )

    //TODO: if already exists -> error handling
    await plugins.events.request(addColumn(connectionId, tableKey, { name, type, options }))

    await plugins.events.request(
        insert(connectionId, m.COLUMNS, {
            [m.COLUMN_NAME]: name,
            [m.TABLE_ID]: tableId,
            [m.TYPE]: type,
            ...attributes,
        })
    )
    const id = (
        (await plugins.events.request(
            select(connectionId, m.COLUMNS, {
                columns: [m.ID],
                condition: [
                    {
                        [m.TABLE_ID]: tableId,
                        [m.COLUMN_NAME]: name,
                    },
                ],
            })
        )) as any[]
    )[0][m.ID]

    plugins.events.notify({ ...req, method: requests.createdColumnInTable })
    return { id, name, type, attributes: {} } as ColumnDescriptor
}

async function changeColumnName(req: CoreRequest): Promise<CoreResponse> {
    const { connectionId, id, newName } = req
    const [{ [m.COLUMN_NAME]: oldName, [m.KEY]: tableKey }] = (await plugins.events.request(
        select(connectionId, m.TABLES, {
            columns: [m.KEY, m.COLUMN_NAME],
            join: {
                table: m.COLUMNS,
                on: [`${m.TABLES}.${m.ID}`, "=", m.TABLE_ID],
            },
            condition: [`${m.COLUMNS}.${m.ID}`, id],
        })
    )) as any

    await plugins.events.request(renameColumn(connectionId, tableKey, oldName, newName))

    await changeColumnAttributes({
        channel: CHANNEL,
        method: "changeColumnAttributes",
        connectionId,
        id,
        attributes: { [m.COLUMN_NAME]: newName },
    })

    plugins.events.notify({ ...req, method: requests.changedColumnName })
    return getColumnInfo({ connectionId, id, attributes: [] } as any)
}

async function changeColumnAttributes(req: CoreRequest): Promise<CoreResponse> {
    const { connectionId, id, attributes } = req
    const result = await plugins.events.request(
        update(connectionId, m.COLUMNS, {
            condition: [m.ID, id],
            update: attributes,
        })
    )
    if (result.rowsUpdated !== 1)
        return Promise.reject({ error: "could not change column attributes" })
    const info = await getColumnInfo({
        ...req,
        attributes: Object.keys(attributes),
    })

    plugins.events.notify({ ...req, method: requests.changedColumnAttributes })

    return info
}

async function removeColumn(req: CoreRequest): Promise<CoreResponse> {
    const { connectionId, id } = req
    const row = (
        (await plugins.events.request(
            select(connectionId, m.COLUMNS, {
                join: {
                    table: m.TABLES,
                    on: [`${m.TABLES}.${m.ID}`, "=", m.TABLE_ID],
                },
                condition: [`${m.COLUMNS}.${m.ID}`, id],
            })
        )) as Record<string, any>[]
    )[0]!

    const tableKey = row[m.KEY]
    const tableId = row[`${m.TABLES}.${m.ID}`]
    const columnName = row[m.COLUMN_NAME]

    await plugins.events.request(deleteColumn(connectionId, tableKey, columnName))

    await plugins.events.request(deleteRow(connectionId, m.COLUMNS, [m.ID, id]))

    plugins.events.notify({ ...req, method: requests.removedColumn })
    return { message: `Deleted column #${id} from table #${tableId}` }
}

async function getColumnInfo({ connectionId, id, attributes }: CoreRequest) {
    const metaColumns =
        attributes.length === 0 ? undefined : m.COLUMN_BASE_ATTRIBUTES.concat(attributes)
    const r = (
        (await plugins.events.request(
            select(connectionId, m.COLUMNS, {
                columns: metaColumns,
                condition: [m.ID, id],
            })
        )) as Record<string, any>[]
    )[0]
    if (!r) throw new Error(`no column with ID ${id}`)
    const column = {
        id: r[m.ID],
        name: r[m.COLUMN_NAME],
        type: r[m.TYPE],
        attributes: {},
    }
    for (const attribute of m.COLUMN_BASE_ATTRIBUTES) delete r[attribute]
    column.attributes = r
    return column
}

const getUnderlyingTableKey = async (connectionId: string, tableId: string) => {
    const underlyingTable = (
        (await plugins.events.request(
            select(connectionId, m.TABLES, {
                columns: ["key"],
                condition: [m.ID, tableId],
            })
        )) as Record<string, any>[]
    )[0]
    if (!underlyingTable) throw new Error(`no column with ID ${tableId}`)
    return underlyingTable.key
}

async function merge({
    connectionId,
    source_id,
    target_id,
    column_option,
    row_option,
}: CoreRequest) {
    const removedColumnIds: number[] = []
    const addedColumnIds: number[] = []
    const targetColumnIds: number[] = []
    const valid_column_options = ["", "intersection", "target", "union"]
    const valid_row_options = ["", "duplicate", "ignore", "expand"]

    if (!valid_column_options.includes(column_option)) {
        throw new Error(`${column_option} is not a valid column option`)
    }

    if (!valid_row_options.includes(row_option)) {
        throw new Error(`${row_option} is not a valid row option`)
    }

    // get target columns
    let cols_target = (await getColumnsFromTable({
        connectionId,
        id: target_id,
    } as any)) as ColumnDescriptor[]

    // get source columns
    const cols_source = (await getColumnsFromTable({
        connectionId,
        id: source_id,
    } as any)) as ColumnDescriptor[]

    const source_key = await getUnderlyingTableKey(connectionId, source_id)
    const target_key = await getUnderlyingTableKey(connectionId, target_id)

    // if intersection: delete non-intersecting columns
    if (column_option === "intersection") {
        const target_temp: ColumnDescriptor[] = []
        const source_columnNames = cols_source.map(col => col.name)
        for (const col of cols_target) {
            if (!source_columnNames.includes(col.name)) {
                await removeColumn({
                    connectionId,
                    id: col.id,
                } as any)
                removedColumnIds.push(col.id)
            } else {
                target_temp.push(col)
            }
        }
        cols_target = target_temp
    }

    // if union: add new columns
    if (column_option === "union") {
        const target_columnNames = cols_target.map(col => col.name)
        for (const col of cols_source) {
            if (!target_columnNames.includes(col.name)) {
                const addedCol = await createColumnInTable({
                    connectionId,
                    tableId: target_id,
                    name: col.name,
                    type: col.type,
                    options: (col as Column).options,
                    attributes: null,
                } as any)

                cols_target.push(col)
                addedColumnIds.push(addedCol.id)
                targetColumnIds.push(col.id)
            }
        }
    }

    // get rows of tables
    const rowsQuery_source = (await plugins.events.request(
        select(connectionId, source_key)
    )) as any[]

    const rowsQuery_target = (await plugins.events.request(
        select(connectionId, target_key)
    )) as any[]

    // get max index in rowsQuery_source
    let max_index = 0
    for (const row of rowsQuery_target) {
        if (row.index > max_index) {
            max_index = row.index
        }
    }
    max_index++

    for (const row_object of rowsQuery_source) {
        const cols_source = Object.keys(row_object)
        const values = Object.values(row_object)

        // find out if duplicate
        let duplicate = false
        if (row_option === "ignore" || row_option === "expand") {
            for (const row_idx in rowsQuery_target) {
                const row_target = rowsQuery_target[row_idx]
                let duplicate_temp = true
                for (const col of cols_target) {
                    if (
                        col.name != "_id" &&
                        cols_source.includes(col.name) &&
                        ![row_object[col.name], null].includes(row_target[col.name])
                    ) {
                        duplicate_temp = false
                    }
                }

                if (duplicate_temp) {
                    duplicate = true
                }

                // update expanded rows
                if (duplicate && row_option === "expand") {
                    for (const col of cols_target) {
                        if (cols_source.includes(col.name) && row_target[col.name] === null) {
                            await plugins.events.request(
                                update(connectionId, target_key, {
                                    update: {
                                        [col.name]: row_object[col.name],
                                    },
                                    condition: ["_id", row_target["_id"]],
                                })
                            )
                        }
                    }
                }
            }
        }

        if (duplicate) {
            continue
        }

        const row = {}

        for (const col of cols_target) {
            if (col.name === "index") {
                Object.assign(row, { [col.name]: max_index++ })
            } else if (col.name != "_id" && col.name != "index" && cols_source.includes(col.name)) {
                const idx = cols_source.indexOf(col.name)
                Object.assign(row, { [col.name]: values[idx] })
            }
        }

        await plugins.events.request(insert(connectionId, target_key, row))
    }
    return { removedColumnIds, addedColumnIds, targetColumnIds }
}

async function copy({ connectionId, source_id, role_id, project_id }: CoreRequest) {
    // setup (get data + create table)
    const tables = await plugins.events.request(listTables(connectionId))
    const source_info = (await getTableInfo({
        connectionId,
        id: source_id,
    } as any)) as TableInfo
    let name = source_info.table.name + "_copy"
    while (tables.includes(name)) {
        name += "_copy"
    }

    const columns = source_info.columns.map(col => {
        return {
            name: col.name,
            type: col.type,
        }
    })

    const target_info = await createTableInProject({
        connectionId,
        roleId: role_id,
        projectId: project_id,
        name,
        columns,
    } as any)

    // add rows from source
    const rowsQuery = (await plugins.events.request(
        select(connectionId, source_info.table.key)
    )) as any[]

    // _id will be reassigned on insert
    // if not deleted, it would cause an error on later inserts due to
    // db plugin trying to reuse existing _id's
    for (const row of rowsQuery) {
        delete row["_id"]
    }

    if (rowsQuery.length !== 0) {
        await plugins.events.request(insert(connectionId, target_info.key, rowsQuery))
    }

    return target_info
}
