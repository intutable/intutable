import { coreRequest } from "@app/api/utils/coreRequest"
import { Column } from "@app/types/types"
import type { CurrentUser } from "@context/AuthContext"
import { CHANNEL } from "../utils"
import { ProjectManagement as PM } from "../utils/ProjectManagement_TypeAnnotations"
import { getTableData } from "./table"

/**
 * Utility that helps getting a column id when there is no column id.
 * @param user
 * @param tableId
 * @param key
 * @returns
 */
const _getColumnId = async (
    user: CurrentUser,
    tableId: PM.Table.ID,
    key: Column["key"]
): Promise<PM.Column.ID> => {
    const table = (await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        getTableData.name,
        { tableId },
        user.authCookie
    )) as PM.DBFormat.Table
    const column = table.columns.find(col => col.columnName === key)
    if (column == null)
        throw new Error(`Did not found a column where key equals '${key}'`)
    return column._id
}

export const createColumnInTable = async (
    user: CurrentUser,
    tableId: PM.Table.ID,
    columnName: PM.Column.Name
): Promise<void> => {
    await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        createColumnInTable.name,
        { tableId, columnName },
        user.authCookie
    )
}

export const changeColumnKey = async (
    user: CurrentUser,
    tableId: PM.Table.ID,
    key: Column["key"],
    newName: PM.Column.Name
): Promise<void> => {
    const columnId = await _getColumnId(user, tableId, key)
    await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        "changeColumnKey",
        { columnId, newName },
        user.authCookie
    )
}

export const changeColumnName = async (
    user: CurrentUser,
    tableId: PM.Table.ID,
    key: Column["key"],
    newName: PM.Column.Name
): Promise<void> => {
    const columnId = await _getColumnId(user, tableId, key)
    await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        "changeColumnAttributes",
        {
            columnId,
            attributes: {
                displayName: newName,
            },
        },
        user.authCookie
    )
}

/**
 * Can not be used until PM supports adding meta data.
 * Because otherwise name would have to be mapped.
 *
 * @deprecated
 *
 * @param user
 * @param tableId
 * @param key
 * @param attributes
 */
export const changeColumnAttributes = async (
    user: CurrentUser,
    tableId: PM.Table.ID,
    key: Column["key"],
    attributes: [keyof PM.DBFormat.Table["columns"], unknown]
): Promise<void> => {
    const columnId = await _getColumnId(user, tableId, key)
    await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        changeColumnAttributes.name,
        { columnId, attributes: attributes },
        user.authCookie
    )

    // TODO: parse if value has correct type
}

export const removeColumn = async (
    user: CurrentUser,
    tableId: PM.Table.ID,
    key: Column["key"]
): Promise<void> => {
    const columnId = await _getColumnId(user, tableId, key)
    console.log(key, tableId, columnId)
    await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        removeColumn.name,
        { columnId },
        user.authCookie
    )
}
