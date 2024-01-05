import { Knex } from "knex"
import { Column, Condition, SelectOptions, UpdateOptions, TableOption } from "./types"
import { wrapInArray } from "./utils"

const CHANNEL = "database"

/**
 * Opens a new connection and stores it in the connection pool
 * Do not forget to await this method, or your core calls will encounter
 * some very unhelpful errors.
 *
 * @example ```
 * openConnection("user", "password")
 * ```
 * Response: { connectionId: number } the ID associated with the connection.
 * Do not forget to [close]{@link closeConnection} it, they do not time out.
 * @param username - username for connection
 * @param password - Password for connection
 */
export function openConnection(username: string, password: string) {
    return {
        channel: CHANNEL,
        method: "openConnection",
        username,
        password,
    }
}

/**
 * Close a connection. Reject if no such connection exists.
 * @param connectionId the ID of the connection to close.
 */
export function closeConnection(connectionId: string) {
    return {
        channel: CHANNEL,
        method: "closeConnection",
        connectionId,
    }
}
/**
 * Create a new table
 *
 * @example ```
 * createTable("TableName", [
 *  {
 *      name: "columnName",
 *      type: ColumnType.text,
 *      options: ["notNullable" as ColumnOption],
 *  },
 * ])
 * ```
 *
 * @param name - Name of the table
 * @param columns - List of column objects which will be created in the new table
 * @param connectionId - To find correct database connection
 */
export function createTable(
    connectionId: string,
    name: string,
    columns: Column[],
    options?: TableOption[]
) {
    return {
        channel: CHANNEL,
        method: "createTable",
        name,
        columns,
        options,
        connectionId,
    }
}

/**
 * Delete an existing table
 *
 * @param name - Name of the table
 * @param connectionId - To find correct database connection
 */
export function deleteTable(connectionId: string, name: string) {
    return {
        channel: CHANNEL,
        method: "deleteTable",
        name,
        connectionId,
    }
}

/**
 * Rename an existing table
 *
 * @param oldName - name of the table to be renamed
 * @param newName - new name of the table
 * @param connectionId - To find correct database connection
 */
export function renameTable(connectionId: string, oldName: string, newName: string) {
    return {
        channel: CHANNEL,
        method: "renameTable",
        table: oldName,
        newName: newName, // ?
        connectionId,
    }
}

/**
 * Get a list of all existing tables.
 *
 * @param connectionId - To find correct database connection
 */
export function listTables(connectionId: string) {
    return {
        channel: CHANNEL,
        method: "listTables",
        connectionId,
    }
}

/**
 * Inserts new records into a table
 *
 * @example ```
 *insert("tableName", { first_name: "Max", last_name: "Muster", age: 42 })
 * ```
 * ```
 *insert("tableName", [{ first_name: "Max", last_name: "Messer", age: 42 },
 *                     { first_name: "Maria", last_name: "Gabel", age: 23 },
 *                     { first_name: "Markus", last_name: "Löffel", age: 23 }
 *])
 * ```
 *
 * @param table name of the table where the rows get inserted
 * @param values row data as an anonymous object
 * @param connectionId - To find correct database connection
 */
export function insert<T = Record<string, unknown>>(
    connectionId: string,
    table: string,
    values: T,
    returning: string[] = []
) {
    return {
        channel: CHANNEL,
        method: "insert",
        table,
        values,
        connectionId,
        returning,
    }
}

/**
 * Select rows from a table
 *
 * @example ```
 * select({ table: TEST_TABLE })
 * ```
 * ```
 * select({ table: TEST_TABLE, condition: ["id", 1] })
 * ```
 * ```
 * select({ table: TEST_TABLE, columns: ["first_name", "age"] })
 * ```
 * ```
 * select({
 *  table: "tableName",
 *  join: [
 *      {
 *          table: OTHER_TEST_TABLE,
 *          on: [
 *              `${TEST_TABLE}.last_name`,
 *              "=",
 *              `${OTHER_TEST_TABLE}.last_name`
 *          ]
 *      },
 *      {
 *          table: "parents",
 *          on: [
 *              `${TEST_TABLE}.last_name`,
 *              "=",
 *              `parents.last_name`
 *           ]
 *      }],
 *      columns: [
 *          "students.first_name as s_first_name",
 *          "parents.first_name as p_first_name",
 *          "students.last_name",
 *          "points"
 *      ]
 * })
 *```
 *
 * @param **table** - name of the table;
 * **join** - (Optional) join tables by condition;
 * **columns** - (Optional) columns to select by their name;
 * **condition** - (Optional) condition which rows get selected as an object in the form of [(optional "not"), "column", (optional operator like "<"), value]
 * @param connectionId - To find correct database connection
 */
export function select(
    connectionId: string,
    table: string,
    { columns, condition, join }: SelectOptions = {}
) {
    if (join) {
        join = wrapInArray(join)
    }

    return {
        channel: CHANNEL,
        method: "select",
        table,
        join,
        columns,
        condition,
        connectionId,
    }
}

/**
 * Update rows in a table
 *
 * @example ```
 * update("tableName", {
 *                 condition: ["age", 23 ],
 *                 update: { first_name: "young" },
 *             })
 * ```
 *
 * Response: { rowsUpdated: number } The number of rows changed.
 * @param table - name of the table
 * @param updateOptions - new values and condition in the form of [(optional "not"), "column", (optional operator like "<"), value]
 * @param connectionId - To find correct database connection
 *
 */
export function update(connectionId: string, table: string, { update, condition }: UpdateOptions) {
    return {
        channel: CHANNEL,
        method: "update",
        table,
        condition,
        update,
        connectionId,
    }
}

/**
 * Delete rows in a table
 *
 * Response: { rowsDeleted: number } the number of rows deleted.
 * @param table - name of the table
 * @param condition - condition which rows get selected as an array in the form of [(optional "not"), "column", (optional operator like "<"), value]
 * @param connectionId - To find correct database connection
 */
export function deleteRow(connectionId: string, table: string, condition: Condition) {
    return {
        channel: CHANNEL,
        method: "deleteRow",
        table,
        condition,
        connectionId,
    }
}

/**
 * List all columns of a table including type information
 *
 * @param table - name of the table
 * @param connectionId - To find correct database connection
 */
export function listColumns(connectionId: string, table: string) {
    return {
        channel: CHANNEL,
        method: "listColumns",
        table,
        connectionId,
    }
}

/**
 * List all column names of a table
 *
 * @param table - name of the table
 * @param connectionId - To find correct database connection
 */
export function listColumnNames(connectionId: string, table: string) {
    return {
        channel: CHANNEL,
        method: "listColumnNames",
        table,
        connectionId,
    }
}

/**
 * Delete a column
 *
 * @param table - name of the table
 * @param column - name of the column to be deleted
 * @param connectionId - To find correct database connection
 */
export function deleteColumn(connectionId: string, table: string, column: string) {
    return {
        channel: CHANNEL,
        method: "deleteColumn",
        table,
        column,
        connectionId,
    }
}

/**
 * Rename a column
 *
 * @param table - name of the table
 * @param oldName - old column name to be renamed
 * @param newName - new column name
 * @param connectionId - To find correct database connection
 */
export function renameColumn(
    connectionId: string,
    table: string,
    oldName: string,
    newName: string
) {
    return {
        channel: CHANNEL,
        method: "renameColumn",
        table,
        columnName: oldName,
        newName,
        connectionId,
    }
}

/**
 * Add a new column to an existing table.
 *
 * @example ```
 * addColumn("tableName", { name: "columnName", type: ColumnType.text })
 * ```
 *
 * @param table - Name of the table
 * @param column - column object which will be created
 * @param connectionId - To find correct database connection
 */
export function addColumn(connectionId: string, table: string, column: Column) {
    return {
        channel: CHANNEL,
        method: "addColumn",
        table,
        column,
        connectionId,
    }
}

/**
 * Alter an existing column in an existing table.
 *
 * @example ```
 * alterColumn("tableName", {
 *      name: "age",
 *      type: ColumnType.string,
 * })
 * ```
 *
 * @param table - Name of the table
 * @param column - column object in which the existing one will be transformed in the form of {name: "columnName", type: ColumnType}
 * @param connectionId - To find correct database connection
 */
export function alterColumn(connectionId: string, table: string, column: Column) {
    return {
        channel: CHANNEL,
        method: "alterColumn",
        table,
        column,
        connectionId,
    }
}

export function rawQuery(
    connectionId: string,
    query: string | { sql: Knex.Sql["sql"]; bindings: readonly Knex.Value[] }
) {
    return {
        channel: CHANNEL,
        method: "rawQuery",
        query,
        connectionId,
    }
}
