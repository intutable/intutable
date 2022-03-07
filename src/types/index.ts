import React from "react"
import type { Column as ReactDataGrid_Column } from "react-data-grid"
import { PLACEHOLDER } from "api/utils/de_serialize/PLACEHOLDER_KEYS"
import type { CellContentType } from "@datagrid/Editor_Formatter/types/CellContentType"

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
 * Project Management Package
 * @namespace
 */
export namespace PMTypes {
    export namespace Project {
        export type ID = number
        export type Name = string
    }
    export type Project = {
        projectId: Project.ID
        projectName: Project.Name
    }

    export namespace Table {
        export type ID = number
        export type Name = string
    }
    export type Table = {
        tableId: Table.ID
        tableName: Table.Name
    }

    export namespace Column {
        export type ID = number
        export type Name = string
    }
    export type Column = {
        columnId: Column.ID
        columnName: Column.Name
    }
}

/**
 * Database
 * @namespace
 */
namespace DB {
    export type Boolean = 1 | 0
    export type Column = {
        readonly [PM.UID_KEY]: number // ID of meta column
        columnName: string // internal name (key)
        displayName: string // display name
        editable: DB.Boolean
        hidden: DB.Boolean
        type: CellContentType // `editor`
    }
    export type Row = {
        readonly [PM.UID_KEY]: number
        [index: string]: unknown
    }
    export type TableData = {
        table: PMTypes.Table
        columns: DB.Column[]
        rows: DB.Row[]
    }
}

// #################################################################
//       Frontend / Deserialized
// #################################################################

type Table<COL, ROW> = {
    table: PMTypes.Table
    columns: COL[]
    rows: ROW[]
}

// #################################################################
//       Frontend / Deserialized
// #################################################################

export type Column = ReactDataGrid_Column<Row>

export type Row = {
    [PLACEHOLDER.SELECTOR_COLUMN_KEY]: React.ReactElement
    readonly [PLACEHOLDER.ROW_INDEX_KEY]: number
    readonly [PM.UID_KEY]: number
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

type SerializedRow = {
    readonly [PM.UID_KEY]: number
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
type SerializedColumn = {
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
}

// #################################################################
//       export
// #################################################################

export namespace Row {
    export type Serialized = SerializedRow
    export type Summary = SummaryRow
    export type Deserialized = Row
    export type DBSchema = DB.Row
}
export namespace Column {
    export type Serialized = SerializedColumn
    export type Deserialized = Column
    export type DBSchema = DB.Column
}
export namespace TableData {
    export type Serialized = SerializedTableData
    export type Deserialized = TableData
    export type DBSchema = DB.TableData
}
