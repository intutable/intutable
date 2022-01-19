import type { Column } from "react-data-grid"
import type Obj from "@utils/Obj"
import type { CellType } from "./celltype-management/celltypes"

// /**
//  * Manages how a user can access a cell.
//  * Tells nothing about the cell's visibility to other users.
//  * @default editable
//  */
// export type CellAccess = "readonly" | "editable"
// /**
//  *
//  * @param value
//  * @returns
//  */
// export const booleanToCellAccessType = (
//     value: boolean | number
// ): CellAccess => {
//     if (typeof value === "boolean") return value ? "editable" : "readonly"
//     return value === 0 ? "readonly" : "editable"
// }

// /**
//  * Position of the cell's content.
//  * @default left
//  */
// export type CellContentPosition = "left" | "right" | "center"

// #################################################################
//       Shared
// #################################################################

export type Row = {
    id: number
    [key: string]: unknown
}

// #################################################################
//       Frontend
// #################################################################

export type TableData<TRow extends Obj = Row> = {
    tableName: string
    columns: Column<TRow>[]
    rows: TRow[]
}

// #################################################################
//       Backend
// #################################################################

export type ServerTableData<TRow extends Obj = Row> = {
    tableName: string
    columns: ServerColumn<TRow>[]
    rows: TRow[]
}

/**
 * copy of 'react-data-grid:Column'
 */
export type ServerColumn<TRow extends Obj> = {
    name: string
    key: string
    width: number
    minWidth: number
    editable: boolean
    frozen: boolean
    resizable: boolean
    sortable: boolean
    editor: CellType
}
