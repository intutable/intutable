import type { Column as ReactDataGrid_Column } from "react-data-grid"
import { PLACEHOLDER } from "api/utils/de_serialize/PLACEHOLDER_KEYS"
import type { CellContentType } from "@datagrid/Editor_Formatter/types/CellContentType"
import { ViewInfo } from "@intutable/lazy-views"
import { project_management } from "./type-annotations/project-management"

// #################################################################
//       Table
// #################################################################

type Table<COL, ROW> = {
    // Asserting that the view's source is always a table.
    metadata: ViewInfo
    columns: COL[]
    rows: ROW[]
}

export type TableData = Table<Column, Row>

type SerializedTableData = Table<SerializedColumn, SerializedRow>

export namespace TableData {
    export type Serialized = SerializedTableData
    export type Deserialized = TableData
}

// #################################################################
//       Row
// #################################################################

export type Row = project_management.UID & {
    readonly [PLACEHOLDER.ROW_INDEX_KEY]: number
    [key: string]: unknown
}

type SerializedRow = project_management.UID & {
    [key: string]: unknown
}

export namespace Row {
    export type Serialized = SerializedRow
    export type Deserialized = Row
}

// #################################################################
//       Column
// #################################################################

export type Column = ReactDataGrid_Column<Row> // alias

/**
 * Copied from react-data-grid's type 'Column' and modified to save an object
 * of this type properly to the db.
 *
 * See the original type in {@link https://github.com/adazzle/react-data-grid/blob/bc23189c4d41725ebd80fdacfa1ddd4054e29658/src/types.ts}).
 *
 * Those properties that are not listed compared to the original type are not used.
 * Additional comments will – only if provided! – explain how the property is modified compared to the original property.
 */
type SerializedColumn = project_management.UID & {
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

export namespace Column {
    export type Serialized = SerializedColumn
    export type Deserialized = Column
}
