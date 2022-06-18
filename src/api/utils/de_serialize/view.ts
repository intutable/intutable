import { PLACEHOLDER } from "api/utils/de_serialize/PLACEHOLDER_KEYS"
import { SelectColumn } from "react-data-grid"
import { Column, Row, ViewData } from "types"
import * as Util from "."

/**
 * Serialize - remove all React components from ViewData (in particular the
 * columns) and replace them with string flags.
 */
export const serialize = (view: ViewData): ViewData.Serialized => {
    // serializes each row
    const rows: Row.Serialized[] = view.rows.map(Util.Row.serialize)

    // serialize each column
    const columns: Column.Serialized[] = view.columns.map(Util.Column.serialize)

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

/**
 * Deserialize: hydrate RDG-specific parts of the data structure (the columns
 * in particular) with non-serializable React components. In the back-end,
 * they simply have string flags indicating which component should be used.
 */
export const deserialize = (view: ViewData.Serialized): ViewData => {
    // deserialize each row
    const rows: Row[] = view.rows.map(Util.Row.deserialize)

    // deserialize each column
    const columns: Column[] = view.columns.map(Util.Column.deserialize)

    // add rdg index column
    const rdgIndexCol: Column = {
        name: "Index",
        _kind: "index",
        _cellContentType: "number",
        key: PLACEHOLDER.ROW_INDEX_KEY,
        editable: false,
        resizable: true,
        sortable: true,
        width: 80,
    }
    columns.unshift(rdgIndexCol)

    // add a selector column
    columns.unshift(SelectColumn)

    return {
        ...view,
        columns,
        rows,
    }
}
