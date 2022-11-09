import { Column, Row, ViewData } from "types"
import { ColumnUtility } from "./ColumnUtility"
import { SelectColumn } from "react-data-grid"
import { applyColumnProxy, ProxyColumn } from "./column utils/ColumnProxy"
import cells from "@datagrid/Cells"

export default class SerDes {
    static serializeRow(
        row: Row,
        columns: Column.Serialized[] | Column.Deserialized[]
    ): Row {
        const serializedRow: Row = { ...row }
        columns.forEach(column => {
            const cellUtil = cells.getCell(column.cellType)
            serializedRow[column.key] = cellUtil.serialize(
                serializedRow[column.key]
            )
        })
        return serializedRow
    }

    static serializeRowValue<T = unknown>(
        row: Row,
        column: Column.Deserialized
    ): T {
        const changedValue = row[column.key]
        const cellUtil = cells.getCell(column.cellType)
        const serializedValue = cellUtil.serialize(changedValue)

        return serializedValue as T
    }

    static deserializeRow(
        row: Row,
        columns: Column.Serialized[] | Column.Deserialized[]
    ): Row {
        columns.forEach(column => {
            const cellUtil = cells.getCell(column.cellType)
            row[column.key] = cellUtil.deserialize(row[column.key])
        })
        return row
    }

    /** deserialize a single column */
    static deserializeColumn(column: Column.Serialized): Column.Deserialized {
        return applyColumnProxy(column)
    }

    /** deserialize a view */
    static deserializeView(view: ViewData.Serialized): ViewData.Deserialized {
        const deserializedRows: Row[] = view.rows.map(row =>
            SerDes.deserializeRow(row, view.columns)
        )

        const deserializedColumns: Column.Deserialized[] = view.columns.map(
            SerDes.deserializeColumn
        )

        // rdg's checkbox column for selecting rows
        deserializedColumns.unshift(SelectColumn)

        return {
            ...view,
            columns: deserializedColumns,
            rows: deserializedRows,
        }
    }
}
