import { JtData } from "@intutable/join-tables/dist/types"
import type { Row, TableData } from "types"
import { PM } from "types"
import { Column as ColumnParser } from "."

export const parse = (joinTable: JtData): TableData.Serialized => {
    return {
        metadata: {
            descriptor: joinTable.descriptor,
            baseTable: joinTable.baseTable,
            joins: joinTable.joins,
            columns: joinTable.columns,
        },
        columns: joinTable.columns
            .filter(col => col.name !== PM.UID_KEY)
            .map(ColumnParser.parse),
        rows: joinTable.rows as Row[],
    }
}
