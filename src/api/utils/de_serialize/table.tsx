import { Checkbox } from "@mui/material"
import { PLACEHOLDER } from "api/utils/de_serialize/PLACEHOLDER_KEYS"
import { Column, Row, TableData } from "types"
import * as Util from "."

/**
 * Serializes
 */
export const serialize = (table: TableData): TableData.Serialized => {
    /**
     * TODO:
     * 1.1 remove IDs from each row
     * 1.2 and the ID column
     * 2. remove not supported properties
     * 3. cast properties
     */

    // Note: this is not used yet

    // serializes each row
    const rows: Row.Serialized[] = table.rows.map(Util.Row.serialize)

    // serialize each column
    const columns: Column.Serialized[] = table.columns.map(
        Util.Column.serialize
    )

    // remove selector column
    columns.shift()
    // remove rdg indice column
    columns.shift()

    return {
        table: table.table,
        columns,
        rows,
    }
}

/**
 * Convert SerializedTableData (abstract, bound neither to database nor to
 * GUI) to {@link TableData}, which can directly be used with RDG.
 */
export const deserialize = (table: TableData.Serialized): TableData => {
    // deserialize each row
    const rows: Row[] = table.rows.map(Util.Row.deserialize)

    // deserialize each column
    const columns: Column[] = table.columns.map(Util.Column.deserialize)

    // add rdg indice column
    const rdgIndexCol: Column = {
        name: "ID",
        key: PLACEHOLDER.ROW_INDEX_KEY,
        editable: false,
        resizable: true,
        sortable: true,
        width: 80,
    }
    columns.unshift(rdgIndexCol)

    // add a selector column
    const selectorCol: Column = {
        name: <Checkbox />,
        key: PLACEHOLDER.SELECTOR_COLUMN_KEY,
        editable: true,
        resizable: false,
        sortable: true,
        width: 50,
    }
    columns.unshift(selectorCol)

    return {
        table: table.table,
        columns,
        rows,
    }
}
