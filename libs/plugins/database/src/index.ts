import { Knex, knex } from "knex"
import schemaInspector from "knex-schema-inspector"
import { PluginLoader, CoreRequest, CoreResponse } from "@intutable-org/core"
import { makeTableSchema, makeColumnSchema } from "./schema"
import { Join } from "./types"

interface DatabaseConnection {
    connection: Knex
    connectionId: string
}

// let db: Knex
// let schema: SchemaInspector
let connections: Array<DatabaseConnection>
let nextConnectionId = 0
function getConnectionId(): string {
    const connectionId = nextConnectionId
    nextConnectionId++
    return connectionId.toString()
}

export async function init(plugin: PluginLoader) {
    // db = knex(config())
    connections = new Array<DatabaseConnection>()
    // schema = schemaInspector(db)

    plugin
        .listenForRequests("database")
        .on("createTable", createTable)
        .on("deleteTable", deleteTable)
        .on("renameTable", renameTable)
        .on("listTables", listTables)
        .on("insert", insert)
        .on("select", select)
        .on("update", update)
        .on("deleteRow", deleteRow)
        .on("listColumns", listColumns)
        .on("listColumnNames", listColumnNames)
        .on("deleteColumn", deleteColumn)
        .on("renameColumn", renameColumn)
        .on("addColumn", addColumn)
        .on("alterColumn", alterColumn)
        .on("rawQuery", rawQuery)
        .on("openConnection", openConnection)
        .on("closeConnection", closeConnection)
}

export async function close() {
    connections.forEach(async conn => await conn.connection.destroy())
}

async function getConnection(connectionId: string): Promise<Knex> {
    const conn = connections.find(x => x.connectionId == connectionId)
    if (!conn) {
        return Promise.reject({
            message: `no connection with ID ${connectionId} exists`,
        })
    }

    return Promise.resolve(conn.connection)
}

function config(username: string, password: string): Knex.Config {
    return {
        client: "pg",
        connection: {
            host: process.env.CI ? "postgres" : "127.0.0.1",
            port: 5432,
            user: username,
            password: password,
            database: "db",
        },
    }
}

async function openConnection(request: CoreRequest): Promise<CoreResponse> {
    const connection = knex(config(request.username, request.password))
    // connecting with bad credentials fails silently, so we have to
    // run a test query to check if it worked. Worse still, many methods
    // just throw undefined instead of the proper "password authentication
    // failed" error that PG returns. This statement works, though.
    const tryQuery = connection.raw("SELECT 1")

    await tryQuery.then(res =>
        (res as any)["rows"] instanceof Array ? Promise.resolve() : Promise.reject(res)
    )

    const connectionId = getConnectionId()

    connections.push({ connection, connectionId: connectionId })

    return { connectionId }
}

async function closeConnection({ connectionId }: CoreRequest): Promise<CoreResponse> {
    return getConnection(connectionId)
        .then(async conn => {
            await conn.destroy()
            connections = connections.filter(c => c.connectionId !== connectionId)
            return Promise.resolve({
                message: `closed connection #${connectionId}`,
            })
        })
        .catch(() =>
            Promise.reject({
                error: `no such connection: ${connectionId}`,
            })
        )
}

async function createTable(request: CoreRequest): Promise<CoreResponse> {
    await (
        await getConnection(request.connectionId)
    ).schema.createTable(request.name, makeTableSchema(request.columns, request.options))

    return { message: `created table ${request.name}` }
}

async function renameTable(request: CoreRequest): Promise<CoreResponse> {
    await (
        await getConnection(request.connectionId)
    ).schema.renameTable(request.table, request.newName)

    return { message: `renamed table ${request.table} to ${request.newName}` }
}

async function deleteTable(request: CoreRequest): Promise<CoreResponse> {
    await (await getConnection(request.connectionId)).schema.dropTableIfExists(request.name)

    return { message: `deleted table ${request.name}` }
}

async function listTables(request: CoreRequest): Promise<CoreResponse> {
    return await schemaInspector(await getConnection(request.connectionId)).tables()
}

async function insert({
    table,
    values,
    returning,
    connectionId,
}: CoreRequest): Promise<CoreResponse> {
    if (returning.length > 0) {
        return (
            (await getConnection(connectionId))(table)
                .returning(returning)
                .insert(values)
                // eslint-disable-next-line @typescript-eslint/ban-types
                .then((returningColumn: Array<Object>) => {
                    const res: { [key: string]: any } = {}
                    // eslint-disable-next-line @typescript-eslint/ban-types
                    returningColumn.forEach((elem: Object) => {
                        res[Object.keys(elem)[0]] = Object.values(elem)[0]
                    })
                    return res
                })
        )
    } else {
        return (await getConnection(connectionId))(table).insert(values)
    }
}

async function select({
    table,
    join,
    columns = [],
    condition = [],
    connectionId,
}: CoreRequest): Promise<CoreResponse> {
    let from = (await getConnection(connectionId))(table)

    if (join) {
        from = makeJoin(from, join)
    }

    return applyCondition(from.select(columns), condition)
}

// table: knex.QueryBuilder somehow does not work
function makeJoin(table: any, joins: Join[]) {
    for (const { table: otherTable, on } of joins) {
        table = table.join(otherTable, ...on)
    }
    return table
}

async function update({
    table,
    condition = [],
    update,
    connectionId,
}: CoreRequest): Promise<CoreResponse> {
    let query = (await getConnection(connectionId))(table).update(update)
    query = applyCondition(query, condition)

    return query.then((rowsUpdated: number) => ({ rowsUpdated }))
}

function applyCondition(query: any, condition: any[]) {
    if (condition.length === 0) {
        return query
    } else if (condition[0] === "not") {
        return (<any>query.whereNot)(...condition.slice(1))
    } else {
        return (<any>query.where)(...condition)
    }
}

async function deleteRow({
    table,
    condition = [],
    connectionId,
}: CoreRequest): Promise<CoreResponse> {
    return applyCondition((await getConnection(connectionId))(table), condition)
        .del()
        .then((rowsDeleted: number) => ({ rowsDeleted }))
}

async function listColumns(request: CoreRequest): Promise<CoreResponse> {
    return (await getConnection(request.connectionId))(request.table).columnInfo()
}

async function listColumnNames(request: CoreRequest): Promise<CoreResponse> {
    return Object.keys(await listColumns(request))
}

async function deleteColumn({ table, column, connectionId }: CoreRequest): Promise<CoreResponse> {
    await (
        await getConnection(connectionId)
    ).schema.table(table, table => {
        table.dropColumn(column)
    })

    return { message: `deleted column ${column}` }
}

async function renameColumn({
    table,
    columnName,
    newName,
    connectionId,
}: CoreRequest): Promise<CoreResponse> {
    await (
        await getConnection(connectionId)
    ).schema.table(table, table => {
        table.renameColumn(columnName, newName)
    })

    return {
        message: `renamed column ${columnName} to ${newName}`,
    }
}

async function addColumn({ table, column, connectionId }: CoreRequest): Promise<CoreResponse> {
    await (await getConnection(connectionId)).schema.table(table, makeColumnSchema(column))

    return { message: `added column ${column} to table ${table}` }
}

async function alterColumn({ table, column, connectionId }: CoreRequest): Promise<CoreResponse> {
    const options = [...(column.options || []), "alter"]

    await (
        await getConnection(connectionId)
    ).schema.alterTable(table, makeColumnSchema({ ...column, options }))

    return { message: `altered column ${column}` }
}

async function rawQuery({ query, connectionId }: CoreRequest): Promise<CoreResponse> {
    if (typeof query === "string") return (await getConnection(connectionId)).raw(query)
    else return (await getConnection(connectionId)).raw(query.sql, query.bindings)
}
