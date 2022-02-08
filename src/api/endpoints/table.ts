import { coreRequest } from "@app/api/coreinterface/coreRequest"
import {
    EditorType,
    isEditorType,
} from "@app/components/DataGrid/Editor/editor-management"
import { COLOR_SCHEME } from "@app/theme/theme"
import type { CurrentUser } from "@context/AuthContext"
import { CHANNEL, __KEYS__, ProjectManagement as PM } from ".."
import type {
    SerializedTableData,
    SerializedColumn,
    SerializedRow,
} from "../../types/types"

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
 * @returns {SerializedTableData} table data in case of success, otherwise
 *  an error object with error description.
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
    )) as PM.DBFormat.Table

    // rename props: parse backend col to `ServerColumn`
    const columns: SerializedColumn[] = coreResponse.columns.map(col => {
        return {
            key: col.columnName,
            name: col.displayName,
            editable: Boolean(col.editable),
            editor: col.type as EditorType,
        }
    })

    const rows: SerializedRow[] = coreResponse.rows.map(row => {
        if (!(__KEYS__.UID_KEY in row))
            throw new TypeError("Row missing unique ID")
        else return row as SerializedRow
    })

    const table: SerializedTableData = {
        table: coreResponse.table,
        columns,
        rows,
    }

    return table
}

export const createTableInProject = async (
    user: CurrentUser,
    projectId: PM.Project.ID,
    tableName: PM.Table.Name
) => {
    console.info(tableName)
    await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        createTableInProject.name,
        { userId: user.id, projectId, tableName },
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
