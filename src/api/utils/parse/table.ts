import { ViewData } from "@intutable/lazy-views"
import type { Row, TableData } from "types"
import { project_management_constants } from "types/type-annotations/project-management"
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
            .filter(col => col.name !== project_management_constants.UID_KEY)
            .map(ColumnParser.parse),
        rows: view.rows as Row[],
    }
}
