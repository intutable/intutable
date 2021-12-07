import type { Column } from "react-data-grid"

/**
 * Defines the type of a table.
 */
export type TableData = {
    tableName: string
    cols: Array<Column<string, unknown>>
    rows: Array<Record<string, unknown>>
}

export type ServerTableData = {}
