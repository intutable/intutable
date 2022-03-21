import { getTableData } from "@intutable/project-management/dist/requests"
import { coreRequest } from "api/utils"
import { User } from "auth"
import { Column, PMTypes as PM, TableData } from "types"

/**
 * Utility that helps getting a column id when there is no column id.
 */
export const _getColumnId = async (
    user: User,
    tableId: PM.Table.ID,
    key: Column["key"]
): Promise<PM.Column.ID> => {
    const table = (await coreRequest(
        getTableData(tableId),
        user.authCookie
    )) as TableData.DBSchema
    const column = table.columns.find(col => col.columnName === key)
    if (column == null)
        throw new Error(`Did not found a column where key equals '${key}'`)
    return column._id
}
