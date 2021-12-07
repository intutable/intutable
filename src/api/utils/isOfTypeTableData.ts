import { TableData } from "../types"

export const isOfTypeTableData = (data: unknown): data is TableData => {
    if (typeof data !== "object") return false

    if (data == null || !("tableName" in data)) return false

    if (data == null || !("rows" in data)) return false

    if (data == null || !("cols" in data)) return false

    const emptyTable = data as Partial<TableData>

    if (emptyTable.tableName == null || emptyTable.tableName.length < 1)
        return false

    if (
        emptyTable.rows == null ||
        !Array.isArray(emptyTable.rows) ||
        emptyTable.rows.length < 1
    )
        return false

    if (
        emptyTable.cols == null ||
        !Array.isArray(emptyTable.cols) ||
        emptyTable.cols.length < 1
    )
        return false

    // TODO: any server response wont have cols of type `Column`. A second type should be defined for this purpose.

    return true
}
