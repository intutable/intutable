import {
    getTableInfo as getTableInfoR,
    createColumnInTable as createColumnInTableR,
    changeColumnName as changeColumnNameR,
    changeColumnAttributes as changeColumnAttributesR,
    removeColumn as removeColumnR,
} from "@intutable/project-management/dist/requests"
import { coreRequest } from "api/utils/coreRequest"
import type { User } from "auth"
import { PMTypes as PM, TableData, Column } from "types"
import { getTableData } from "./table"

/**
 * Utility that helps getting a column id when there is no column id.
 * @param user
 * @param tableId
 * @param key
 * @returns
 */
const _getColumnId = async (
    user: User,
    tableId: PM.Table.ID,
    key: Column["key"]
): Promise<PM.Column.ID> => {
    const table = (await coreRequest(
        getTableInfoR(tableId),
        user.authCookie
    )) as TableData.DBSchema
    const column = table.columns.find(col => col.columnName === key)
    if (column == null)
        throw new Error(`Did not found a column where key equals '${key}'`)
    return column._id
}

export const createColumnInTable = async (
    user: User,
    tableId: PM.Table.ID,
    name: PM.Column.Name
): Promise<void> => {
    await coreRequest(createColumnInTableR(tableId, name), user.authCookie)
}

/** Change the name of a column (in the database) */
export const changeColumnKey = async (
    user: User,
    tableId: PM.Table.ID,
    key: Column["key"],
    newName: PM.Column.Name
): Promise<void> => {
    const columnId = await _getColumnId(user, tableId, key)
    await coreRequest(changeColumnNameR(columnId, newName), user.authCookie)
}

/** Change the display name of a column */
export const changeColumnName = async (
    user: User,
    tableId: PM.Table.ID,
    key: Column["key"],
    newName: PM.Column.Name
): Promise<void> => {
    const columnId = await _getColumnId(user, tableId, key)
    await coreRequest(
        changeColumnAttributesR(columnId, { displayName: newName }),
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
    user: User,
    tableId: PM.Table.ID,
    key: Column["key"],
    attributes: [keyof Column.DBSchema, unknown]
): Promise<void> => {
    const columnId = await _getColumnId(user, tableId, key)
    await coreRequest(
        changeColumnAttributesR(columnId, attributes),
        user.authCookie
    )

    // TODO: parse if value has correct type
}

export const removeColumn = async (
    user: User,
    tableId: PM.Table.ID,
    name: Column["key"]
): Promise<void> => {
    const columnId = await _getColumnId(user, tableId, name)
    await coreRequest(removeColumnR(columnId), user.authCookie)
}
