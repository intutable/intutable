import cells from "@datagrid/Cells"
import { headerRenderer } from "@datagrid/renderers"
import { SelectColumn } from "react-data-grid"
import { Column, Row, ViewData } from "types"
import { mountColumnProxy } from "./column utils/ColumnProxy"

export default class SerDes {
    static serializeRow(row: Row, columns: Column.Serialized[] | Column.Deserialized[]): Row {
        const serializedRow: Row = { ...row }
        columns.forEach(column => {
            const cellUtil = cells.getCell(column.cellType)
            serializedRow[column.key] = cellUtil.serialize(serializedRow[column.key])
        })
        return serializedRow
    }

    static serializeRowValue<T = unknown>(row: Row, column: Column.Deserialized): T {
        const changedValue = row[column.key]
        const cellUtil = cells.getCell(column.cellType)
        const serializedValue = cellUtil.catchEmpty(cellUtil.serialize.bind(cellUtil), changedValue)

        return serializedValue as T
    }

    static deserializeRow(row: Row, columns: Column.Serialized[] | Column.Deserialized[]): Row {
        columns.forEach(column => {
            const cellUtil = cells.getCell(column.cellType)
            row[column.key] = cellUtil.catchEmpty(cellUtil.deserialize.bind(cellUtil), row[column.key])
        })
        return row
    }

    /** deserialize a single column */
    static deserializeColumn(column: Column.Serialized): Column.Deserialized {
        const proxy = mountColumnProxy(column)
        return {
            ...proxy,
            headerRenderer: proxy.headerRenderer, // BUG: there's a bug with the proxy…
        }
    }

    /** deserialize a view */
    static deserializeView(view: ViewData.Serialized): ViewData.Deserialized {
        const deserializedRows: Row[] = view.rows.map(row => SerDes.deserializeRow(row, view.columns))

        const deserializedColumns: Column.Deserialized[] = view.columns.map(SerDes.deserializeColumn)

        return {
            ...view,
            columns: deserializedColumns,
            rows: deserializedRows,
        }
    }
}
