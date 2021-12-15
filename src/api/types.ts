import type { Column } from "react-data-grid"

/**
 * Defines the type of a table.
 */
export type TableData = {
    tableName: string
    columns: Array<Record<string, unknown>>
    rows: Array<Record<string, unknown>>
}

export type ServerTableData = {}
