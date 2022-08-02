import { ViewOptions, ViewData as RawViewData } from "@intutable/lazy-views"
import type { Row, ViewData } from "types"
import { Column as ColumnParser, Filter as FilterParser } from "."
import { byIndex } from "./utils"

export const parse = (
    options: ViewOptions,
    view: RawViewData
): ViewData.Serialized => {
    return {
        descriptor: view.descriptor,
        metaColumns: view.columns,
        filters: options.rowOptions.conditions.map(FilterParser.parse),
        sortColumns: options.rowOptions.sortColumns,
        groupColumns: options.rowOptions.groupColumns,
        columns: view.columns
            .sort(byIndex)
            .filter(col => !ColumnParser.isInternalColumn(col))
            .map(ColumnParser.parse),
        rows: view.rows as Row[],
    }
}
