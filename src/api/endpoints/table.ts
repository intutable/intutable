import {
    getTablesFromProject,
    getTableData,
    createTableInProject,
    removeTable,
    changeTableName,
} from "@intutable/project-management/dist/requests"
import { coreRequest } from "api/utils/coreRequest"
import type { User } from "auth"
import { Parser } from "api/utils"
import { PMTypes as PM, TableData } from "types"

/**
 * Fetches a list with the names of the tables of a project.
 * @param {User} user currently logged-in user.
 * @param {ProjectId} projectId id of the project.
 * @returns {Promise<TableList>} list of table names and IDs.
 */
export const getTablesFromProject = async (
    user: User,
    projectId: number
): Promise<PM.Table[]> => {
    const coreResponse = await coreRequest(
        getTablesFromProject(projectId),
        user.authCookie
    )
    return coreResponse as PM.Table[]
}

/**
 * Fetches the data of a table.
 * @param {User} user the currently logged-in user.
 * @param tableName table name.
 * @returns {SerializedTableData} table data in case of success, otherwise
 *  an error object with error description.
 */
export const getTableData = async (
    user: User,
    tableId: PM.Table.ID
): Promise<TableData.Serialized> => {
    const coreResponse = (await coreRequest(
        getTableData(tableId),
        user.authCookie
    )) as TableData.DBSchema
    return Parser.Table.parse(coreResponse)
}

export const createTableInProject = async (
    user: User,
    projectId: PM.Project.ID,
    name: PM.Table.Name
): Promise<void> => {
    await coreRequest(
        createTableInProject(user.id, projectId, name),
        user.authCookie
    )
}

export const removeTable = async (
    user: User,
    id: PM.Table.ID
): Promise<void> => {
    await coreRequest(removeTable(id), user.authCookie)
}

export const changeTableName = async (
    user: User,
    id: PM.Table.ID,
    newName: PM.Table.Name
): Promise<void> => {
    await coreRequest(changeTableName(id, newName), user.authCookie)
}
