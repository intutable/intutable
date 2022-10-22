import { Column as DB_Column, ColumnType } from "@intutable/database/dist/types"

import { Row } from "./base"
import { DeserializedTableData, ViewData, Column } from "./rdg"
import { SerializedColumn, TableData, SerializedViewData } from "./serialized"
export type { Row, MetaColumnProps } from "./base"
export * from "./rdg"
export * from "./serialized"

/**
 * The two basic columns that every table must have (in addition to _id, but
 * the plugin creates that automatically)
 */
export const BASIC_TABLE_COLUMNS: DB_Column[] = [
    { name: "index", type: ColumnType.integer, options: [] },
    { name: "name", type: ColumnType.string, options: [] },
]

// #################################################################
//       Table
// #################################################################
export namespace TableData {
    /**
     * @deprecated
     * @legacy
     */
    export type Deserialized = DeserializedTableData
    export type Serialized = TableData
}

// #################################################################
//       View
// #################################################################
export namespace ViewData {
    export type Serialized = SerializedViewData
    export type Deserialized = ViewData
}

// #################################################################
//       Column
// #################################################################
export namespace Column {
    export type Serialized = SerializedColumn
    export type Deserialized = Column
}

export type TableColumn = Column.Serialized

// #################################################################
//       Row
// #################################################################
export type TableRow = Row
