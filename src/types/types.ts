import type { Column as ReactDataGrid_Column } from "react-data-grid"
import type Obj from "@utils/Obj"
import type { EditorType } from "../components/DataGrid/Editor/editor-management/editorTypes"
import React from "react"
import { ProjectManagement as PM } from "../api"

/**
 * // TODO: moves this whole thing into /components/DataGrid/
 */

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
    table: PM.Table
    columns: COL[]
    rows: ROW[]
}

// #################################################################
//       Frontend
// #################################################################

export type Column = ReactDataGrid_Column<Row>

const SELECT_COL_KEY = "__select__"
const RDG_ID_KEY = "__id__"
const UID_KEY = "_id"
/**
 * Includes names for keys on objects.
 * Used for rows.
 */
export const __KEYS__ = { SELECT_COL_KEY, RDG_ID_KEY, UID_KEY } as const

export type Row = {
    [SELECT_COL_KEY]: React.ReactElement
    readonly [RDG_ID_KEY]: number
    readonly [UID_KEY]: number
    [key: string]: unknown
}

export type SummaryRow = {
    selectedCount: number
    totalCount: number
}

export type TableData = Table<Column, Row>

// #################################################################
//       Backend
// #################################################################

export type SerializedRow = {
    readonly [UID_KEY]: number
    [key: string]: unknown
}

export type SerializedTableData = Table<SerializedColumn, SerializedRow>

/**
 * Copied from react-data-grid's type 'Column' and modified to save an object
 * of this type properly to the db.
 *
 * See the original type in {@link https://github.com/adazzle/react-data-grid/blob/bc23189c4d41725ebd80fdacfa1ddd4054e29658/src/types.ts}).
 *
 * Those properties that are not listed compared to the original type are not used.
 * Additional comments will – only if provided! – explain how the property is modified compared to the original property.
 */
export type SerializedColumn = {
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
    editor: EditorType
}
