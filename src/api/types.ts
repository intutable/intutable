import type { Column } from "react-data-grid"

/**
 * Defines the type of a table.
 */
export type TableData = {
    tableName: string
    cols: Array<Column<string, unknown>>
    rows: Array<Record<string, unknown>>
}

/**
 * Defined how a column is represented on the server.
 */
export type ServerColumn = {
    name: string
    key: string
    editor: string
    editorOptions: Column<unknown>["editorOptions"]
}
