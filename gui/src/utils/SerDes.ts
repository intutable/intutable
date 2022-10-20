import { Column, Row, ViewData } from "types"
import { ColumnUtility } from "./ColumnUtility"
import { SelectColumn } from "react-data-grid"
import { applyColumnProxy, ProxyColumn } from "./column utils/ColumnProxy"

export default class SerDes {
    constructor() {}

    /** not used atm */
    static serializeColumn(column: Column.Deserialized): Column.Serialized {
        if (ColumnUtility.isProxy(column))
            return (column as ProxyColumn).serialized

        throw new RangeError("Column is not a proxy")
    }

    /** deserialize a single column */
    static deserializeColumn(column: Column.Serialized): Column.Deserialized {
        return applyColumnProxy(column)
    }

    /** not used atm */
    static serializeRow(row: Row): Row {
        // TODO: has nothing to do with deserialization, should be moved in the parser
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { __rowIndex__, ...serializedRow } = row // see `deserializeRow`
        return serializedRow as Row
    }

    /** deserialize a single row */
    static deserializeRow(row: Row, index: number): Row {
        return {
            ...row,
            // TODO: has nothing to do with deserialization, should be moved in the parser
            __rowIndex__: index, // TODO: Hack: __rowIndex__ is not saved in the database, the plugins keep the order of the rows. this should be removed in the future by saving the value and combining it with the index column
        } as Row
    }

    /** not used atm */
    static serializeView(view: ViewData.Deserialized): ViewData.Serialized {
        // serializes each row
        const rows: Row[] = view.rows.map(SerDes.serializeRow)

        // serialize each column
        const columns: Column.Serialized[] = view.columns.map(
            SerDes.serializeColumn
        )

        // remove selector column
        columns.shift()
        // remove rdg indice column
        columns.shift()

        return {
            ...view,
            columns,
            rows,
        }
    }

    /** deserialize a view */
    static deserializeView(view: ViewData.Serialized): ViewData.Deserialized {
        const deserializedRows: Row[] = view.rows.map(SerDes.deserializeRow) // will be obsolete
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
