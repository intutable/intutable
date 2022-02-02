import { inspect } from "util"
import { coreRequest, CoreRequestError } from "@app/api/coreinterface/json"
import type { CurrentUser } from "@context/AuthContext"
import type { Row, ServerColumn, ServerTableData, TableData } from "./types"
import { CHANNEL, TableId, TableList, TableName } from "."
import { ProjectList, ProjectId, ProjectName } from "./API_Types"

/**
 * Fetches a list with the names of the tables of a project.
 * @param {CurrentUser} user currently logged-in user.
 * @param {ProjectId} projectId id of the project.
 * @returns {Promise<TableList>} list of table names and IDs.
 */
export const getTablesFromProject = async (
    user: CurrentUser,
    projectId: number
): Promise<TableList> => {
    const coreResponse = await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        getTablesFromProject.name,
        { projectId },
        user.authCookie
    )

    if (Array.isArray(coreResponse) === false)
        return Promise.reject(new Error("Expected an Array!"))

    return Promise.resolve(coreResponse as TableList)
}

/**
 * Fetches the data of a table.
 * @param {CurrentUser} user the currently logged-in user.
 * @param tableName table name.
 * @returns {TableData} table data in case of success, otherwise an error object with error description.
 */
export const getTableData = async (
    user: CurrentUser,
    tableId: TableId
): Promise<ServerTableData> => {
    const coreResponse = (await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        getTableData.name,
        { tableId },
        user.authCookie
    )) as ServerTableData

    // DEV ONLY needed to transform malformed backend data (obsolete with v4)
    const columns = coreResponse.columns.map((item: any) => {
        item.key = item.columnName as string // TODO: is this still needed
        item.name = item.key as string // TODO: backend changed this, investigate on this
        item.editable = Boolean(item.editable) // backend uses `0` / `1` as boolean
        // item.editor = "string" // backend doesnt support this prop, therefore this faker is needed
        item.editor = item.type
        delete item.columnName
        return item
    })

    const table: ServerTableData = {
        ...coreResponse,
        columns,
    }

    return Promise.resolve(table)
}

export const createTableInProject = async (
    user: CurrentUser,
    projectId: ProjectId,
    tableName: TableName
) => {
    await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        createTableInProject.name,
        { userId: user.id, projectId, table: tableName },
        user.authCookie
    )
}

export const removeTable = async (user: CurrentUser, tableId: TableId) => {
    await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        removeTable.name,
        { tableId: tableId },
        user.authCookie
    )
}

export const changeTableName = async (
    user: CurrentUser,
    tableId: TableId,
    newName: TableName
) => {
    await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        changeTableName.name,
        {
            tableId,
            newName,
        },
        user.authCookie
    )
}
