import { Row } from "@shared/types/tables/base"
import { DeserializedTableData, ViewData, Column } from "./rdg"
import {
    SerializedColumn,
    TableData,
    SerializedViewData,
} from "@shared/types/tables/serialized"
export type { Row, MetaColumnProps } from "@shared/types/tables/base"
export * from "./rdg"
export * from "@shared/types/tables/serialized"

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
