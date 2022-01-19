import type { Column } from "react-data-grid"
import type Obj from "@utils/Obj"
import type { CellType } from "./celltype-management/celltypes"

export type Row = {
    id: number
    [key: string]: unknown
}

/**
 * Defines the type of a table.
 */
export type TableData<TRow extends Obj = Row> = {
    tableName: string
    columns: Column<TRow>[]
    rows: TRow[]
}

export type ServerRow = {
    id: string
    [key: string]: string
}

/**
 * Defines the type of a table.
 */
export type ServerTableData<TRow extends Obj = ServerRow> = {
    tableName: string
    columns: ServerColumn<TRow>[]
    rows: TRow[]
}

/**
 * Note: modification of the type `Column` from `react-data-grid`
 */
export type ServerColumn<TRow extends Obj> = {
    name: string
    key: string
    editor: CellType
    editable: CellAccess
}

/**
 * Manages how a user can access a cell.
 * Tells nothing about the cell's visibility to other users.
 * @default editable
 */
export type CellAccess = "readonly" | "editable"
/**
 *
 * @param value
 * @returns
 */
export const booleanToCellAccessType = (
    value: boolean | number
): CellAccess => {
    if (typeof value === "boolean") return value ? "editable" : "readonly"
    return value === 0 ? "readonly" : "editable"
}

/**
 * Position of the cell's content.
 * @default left
 */
export type CellContentPosition = "left" | "right" | "center"
