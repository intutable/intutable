import type { Column as ReactDataGrid_Column } from "react-data-grid"
import { PLACEHOLDER } from "api/utils/de_serialize/PLACEHOLDER_KEYS"
import type { CellContentType } from "@datagrid/Editor_Formatter/types/CellContentType"
import { ViewInfo } from "@intutable/lazy-views"

// #################################################################
//       Backend / Database
// #################################################################

/**
 * Project Management Package
 * @constant
 */
export const PM = {
    UID_KEY: "_id",
} as const

/**
 * ### Project Management
 * Type Annotation
 */
export type PM = {
    /**
     * internal backend unique id
     */
    readonly _id?: number
}

// #################################################################
//       Generic
// #################################################################

type Table<COL, ROW> = {
    // Asserting that the view's source is always a table.
    metadata: ViewInfo
    columns: COL[]
    rows: ROW[]
}

export type Column = ReactDataGrid_Column<Row>

export type Row = PM & {
    readonly [PLACEHOLDER.ROW_INDEX_KEY]: number
    [key: string]: unknown
}

type SummaryRow = {
    selectedCount: number
    totalCount: number
}

export type TableData = Table<Column, Row>

// #################################################################
//       Frontend / Serialized
// #################################################################

type SerializedRow = PM & {
    [key: string]: unknown
}

type SerializedTableData = Table<SerializedColumn, SerializedRow>

/**
 * Copied from react-data-grid's type 'Column' and modified to save an object
 * of this type properly to the db.
 *
 * See the original type in {@link https://github.com/adazzle/react-data-grid/blob/bc23189c4d41725ebd80fdacfa1ddd4054e29658/src/types.ts}).
 *
 * Those properties that are not listed compared to the original type are not used.
 * Additional comments will – only if provided! – explain how the property is modified compared to the original property.
 */
type SerializedColumn = PM & {
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
    editor: CellContentType
    formatter: CellContentType | "linkColumn"
}

// #################################################################
//       export
// #################################################################

export namespace Row {
    export type Serialized = SerializedRow
    export type Summary = SummaryRow
    export type Deserialized = Row
}
export namespace Column {
    export type Serialized = SerializedColumn
    export type Deserialized = Column
}
export namespace TableData {
    export type Serialized = SerializedTableData
    export type Deserialized = TableData
}
