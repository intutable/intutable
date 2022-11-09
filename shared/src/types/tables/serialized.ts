/**
 * @module types.tables.serialized
 * Serialized variants of table, view, and column data for sending around
 * the network (typically only from the backend to the frontend)
 * see also `types.tables.rdg`
 */

import { Table, View, MetaColumnProps, Row } from "./base"

/**
 * @description This type is meant to describe {@link Column} in a way
 * it can be serialized and saved to database.
 *
 * See the original type in {@link https://github.com/adazzle/react-data-grid/blob/bc23189c4d41725ebd80fdacfa1ddd4054e29658/src/types.ts}).
 *
 * ---
 *
 * __Note__: Additional notes will explain how the property is modified compared to the original property.
 */
export type SerializedColumn = MetaColumnProps & {
    name: string
    key: string
    width?: number | string | null
    minWidth?: number | null
    maxWidth?: number | null
    cellClass?: string | null
    headerCellClass?: string | null
    summaryCellClass?: string | null
    summaryFormatter?: string | null
    groupFormatter?: string | null
    editable?: boolean | null
    colSpan?: string | null
    frozen?: boolean | null
    resizable?: boolean | null
    sortable?: boolean | null
    sortDescendingFirst?: boolean | null
}

/**
 * This type is not called SerializedTableData because table data are
 * always serialized - the user only ever sees a view, so only a view ever
 * needs to be "deserialized" in the sense of made compatible with RDG.
 */
export type TableData = Table<SerializedColumn, Row>

export type SerializedViewData = View<SerializedColumn, Row>
