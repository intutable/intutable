import type { Column as ReactDataGrid_Column } from "react-data-grid"
import type Obj from "@utils/Obj"
import type { CellType } from "../components/DataGrid/Cell/celltype-management/celltypes"
import React from "react"

// TODO: make all props readonly

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

type Table<COL, ROW> = {
    tableName: string
    columns: COL[]
    rows: ROW[]
}

// #################################################################
//       Frontend
// #################################################################

export type Column = ReactDataGrid_Column<Row>

const SELECT_COL_KEY = "__select__" as const
const ID_COL_KEY = "__id__" as const

export const __KEYS__ = { SELECT_COL_KEY, ID_COL_KEY } as const

export type Row = {
    readonly [ID_COL_KEY]: number
    [SELECT_COL_KEY]: React.ReactElement
    [key: string]: unknown
}

export type SummaryRow = {
    readonly [ID_COL_KEY]: number
    selectedCount: number
    totalCount: number
}

export type TableData = Table<Column, Row>

// #################################################################
//       Backend
// #################################################################

export type ServerRow = {
    [key: string]: unknown
}

export type ServerTableData = Table<ServerColumn, ServerRow>

// TODO: change naming to `Abstract[…]` e.g. `AbstractColumn`

/**
 * Copied from react-data-grid's type 'Column' and modified to save an object
 * of this type properly to the db.
 *
 * See the original type in {@link https://github.com/adazzle/react-data-grid/blob/bc23189c4d41725ebd80fdacfa1ddd4054e29658/src/types.ts}).
 *
 * Those properties that are not listed compared to the original type are not used.
 * Additional comments will – only if provided! – explain how the property is modified compared to the original property.
 */
export type ServerColumn = {
    name: string
    key: string
    /**
     * // TODO: instead of pixels use proportions
     */
    // width: number
    /**
     * @default true
     */
    editable: boolean
    // frozen: boolean
    // resizable: boolean
    // sortable: boolean
    /**
     * @default string
     */
    editor: CellType
}
