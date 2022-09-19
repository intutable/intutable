import { PLACEHOLDER } from "api/utils/SerDes/PLACEHOLDER_KEYS"
import { SelectColumn } from "react-data-grid"
import { Column, Row, TableData } from "types"
import * as Util from "."

/**
 * Serializes
 */
export const serialize = (
    table: TableData.Deserialized
): TableData.Serialized => {
    /**
     * TODO:
     * 1.1 remove IDs from each row
     * 1.2 and the ID column
     * 2. remove not supported properties
     * 3. cast properties
     */

    // Note: this is not used yet

    // serializes each row
    const rows: Row[] = table.rows.map(Util.Row.serialize)

    // serialize each column
    const columns: Column.Serialized[] = table.columns.map(
        Util.Column.serialize
    )

    // remove selector column
    columns.shift()
    // remove rdg indice column
    columns.shift()

    return {
        metadata: table.metadata,
        columns,
        rows,
    }
}

/**
 * Convert SerializedTableData (abstract, bound neither to database nor to
 * GUI) to {@link TableData}, which can directly be used with RDG.
 */
export const deserialize = (
    table: TableData.Serialized
): TableData.Deserialized => {
    // deserialize each row
    const rows: Row[] = table.rows.map(Util.Row.deserialize)

    // deserialize each column
    const columns: Column[] = table.columns.map(Util.Column.deserialize)

    // add a selector column
    columns.unshift(SelectColumn)

    return {
        metadata: table.metadata,
        columns,
        rows,
    }
}
