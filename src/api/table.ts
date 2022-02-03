import { coreRequest } from "@app/api/coreinterface/coreRequest"
import {
    CellType,
    isCellType,
} from "@app/components/DataGrid/Cell/celltype-management"
import type { CurrentUser } from "@context/AuthContext"
import { CHANNEL, SerializedColumn, ProjectManagement as PM } from "."
import type { SerializedTableData, TableData } from "./types"

/**
 * Fetches a list with the names of the tables of a project.
 * @param {CurrentUser} user currently logged-in user.
 * @param {ProjectId} projectId id of the project.
 * @returns {Promise<TableList>} list of table names and IDs.
 */
export const getTablesFromProject = async (
    user: CurrentUser,
    projectId: number
): Promise<PM.Table.List> => {
    const coreResponse = await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        getTablesFromProject.name,
        { projectId },
        user.authCookie
    )

    if (Array.isArray(coreResponse) === false)
        throw new Error("Expected an Array!")

    return coreResponse as PM.Table.List
}

/**
 * Fetches the data of a table.
 * @param {CurrentUser} user the currently logged-in user.
 * @param tableName table name.
 * @returns {TableData} table data in case of success, otherwise an error object with error description.
 */
export const getTableData = async (
    user: CurrentUser,
    tableId: PM.Table.ID
): Promise<SerializedTableData> => {
    const coreResponse = (await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        getTableData.name,
        { tableId },
        user.authCookie
    )) as PM.SerializedServerResponse.Table

    // rename props: parse backend col to `ServerColumn`
    const columns: SerializedColumn[] = coreResponse.columns.map(col => {
        return {
            key: col.columnName,
            name: col.columnName,
            editable: Boolean(col.editable),
            editor: col.type as CellType,
        }
    })

    const table: SerializedTableData = {
        ...coreResponse,
        columns,
    }

    return table
}

export const createTableInProject = async (
    user: CurrentUser,
    projectId: PM.Project.ID,
    tableName: PM.Table.Name
) => {
    await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        createTableInProject.name,
        { userId: user.id, projectId, table: tableName },
        user.authCookie
    )
}

export const removeTable = async (user: CurrentUser, tableId: PM.Table.ID) => {
    await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        removeTable.name,
        { tableId: tableId },
        user.authCookie
    )
}

export const changeTableName = async (
    user: CurrentUser,
    tableId: PM.Table.ID,
    newName: PM.Table.Name
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
