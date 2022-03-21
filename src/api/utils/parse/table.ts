import { JtData } from "@intutable/join-tables/dist/types"
import type { Row, TableData } from "types"
import { PM } from "types"
import { Column as ColumnParser } from "."

export const parse = (joinTable: JtData): TableData.Serialized => {
    return {
        table: {
            descriptor: joinTable.descriptor,
            baseTable: joinTable.baseTable,
            joins: joinTable.joins,
        },
        columns: joinTable.columns
            .map(ColumnParser.parse)
            .filter(col => col.key !== PM.UID_KEY),
        rows: joinTable.rows as Row[],
    }
}
