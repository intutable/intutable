import { cellMap } from "@datagrid/Cells"
import { HeaderRenderer } from "@datagrid/renderers"

import { Column, Row, ViewData } from "types"

export default class SerDes {
    static serializeRow(row: Row, columns: Column.Serialized[] | Column.Deserialized[]): Row {
        const serializedRow: Row = { ...row }
        columns.forEach(column => {
            const cellUtil = cellMap.getCellCtor(column.cellType)
            serializedRow[column.key] = cellUtil.serialize(serializedRow[column.key])
        })
        return serializedRow
    }

    static serializeRowValue<T = unknown>(value: unknown, column: Column.Deserialized): T {
        const changedValue = value
        const cellUtil = cellMap.getCellCtor(column.cellType)
        const serializedValue = cellUtil.catchEmpty(cellUtil.serialize.bind(cellUtil), changedValue)

        return serializedValue as T
    }

    static deserializeRow(row: Row, columns: Column.Serialized[] | Column.Deserialized[]): Row {
        columns.forEach(column => {
            const cellUtil = cellMap.getCellCtor(column.cellType)
            row[column.key] = cellUtil.catchEmpty(cellUtil.deserialize.bind(cellUtil), row[column.key])
        })
        return row
    }

    /** deserialize a single column */
    static deserializeColumn(column: Column.Serialized): Column.Deserialized {
        const cell = cellMap.instantiate(column)

        const deserialized: Column.Deserialized = {
            ...column,
            editable: (() => {
                // index columns are not editable, at least no by the editable
                if (column.kind === "index") return false
                // some types don't have an editor and should not be editable
                if (cell.editor == null) return false
                // TODO: further checking here, e.g. should link and lookup columns be editable??
                return column.editable
            })(),
            formatter: cell.formatter,
            editor: cell.editor,
            headerRenderer: HeaderRenderer,
            editorOptions: cell.editorOptions,
            __serialized: column,
            // in case these would be actually used they would need to be deserialized here
            summaryFormatter: undefined,
            groupFormatter: undefined,
            colSpan: undefined,
        }

        return deserialized
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
