import { ViewData } from "@intutable/lazy-views"
import type { Row, TableData } from "types"
import { PM } from "types"
import { Column as ColumnParser } from "."

export const parse = (view: ViewData): TableData.Serialized => {
    return {
        metadata: {
            descriptor: view.descriptor,
            source: view.source,
            joins: view.joins,
            columns: view.columns,
        },
        columns: view.columns
            .filter(col => col.name !== PM.UID_KEY)
            .map(ColumnParser.parse),
        rows: view.rows as Row[],
    }
}
