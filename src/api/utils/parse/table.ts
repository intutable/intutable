import type { TableData } from "types"
import { PM } from "types"
import { Column as ColumnParser } from "."

export const parse = (table: TableData.DBSchema): TableData.Serialized => {
    return {
        ...table,
        columns: table.columns
            .map(ColumnParser.parse)
            .filter(col => col.key !== PM.UID_KEY),
    }
}
