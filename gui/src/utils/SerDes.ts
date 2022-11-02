import { Column, Row, ViewData } from "types"
import { ColumnUtility } from "./ColumnUtility"
import { SelectColumn } from "react-data-grid"
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
        const util = new ColumnUtility(column) // TODO: will be replaced by a proxy object

        return {
            ...column,
            editable: util.isEditable(),
            editor: util.getEditor(),
            formatter: util.getFormatter(),
            summaryFormatter: undefined, // currently not supported  // TODO: will be replaced by a proxy object with default settings
            groupFormatter: undefined, // currently not supported  // TODO: will be replaced by a proxy object with default settings
            colSpan: undefined, // currently not supported  // TODO: will be replaced by a proxy object with default settings
            editorOptions: util.getEditorOptions(),
            headerRenderer: util.getHeaderRenderer(),
        }
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
