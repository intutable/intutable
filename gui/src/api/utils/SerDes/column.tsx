import { ColumnUtility } from "utils/ColumnUtility"
import { Column } from "types"
import React from "react"

/**
 * Serializes a single Column.
 *
 * @param {Column} col
 * @returns {SerializedColumn}
 */
export const serialize = (col: Column.Deserialized): Column.Serialized => ({
    ...col,
    _id: col._id!,
    _kind: col._kind!,
    _cellContentType: "string",
    __columnIndex__: col.__columnIndex__!,
    name: col.name as string,
    summaryFormatter: undefined, // currently not supported
    groupFormatter: undefined, // currently not supported
    editable: col.editable as boolean | undefined | null,
    cellClass: undefined, // currently not supported
    summaryCellClass: undefined, // currently not supported
    colSpan: undefined, // currently not supported
    editorOptions: {
        ...col.editorOptions,
        onCellKeyDown: undefined, // currently not supported
        onNavigation: undefined, /// currently not supported
    },
    headerRenderer: undefined, // supported but gets a default value in the deserializer
})

/**
 * Deserializes a single Column.
 *
 * @param {SerializedColumn} col
 * @returns {Column}
 */
export const deserialize = (col: Column.Serialized): Column.Deserialized => {
    const columnUtil = new ColumnUtility(col)

    return {
        ...col,
        editable: columnUtil.isEditable(),
        editor: columnUtil.getEditor(),
        formatter: columnUtil.getFormatter(),
        summaryFormatter: undefined, // currently not supported
        groupFormatter: undefined, // currently not supported
        colSpan: undefined, // currently not supported
        editorOptions: { onNavigation: onEditorNavigation },
        headerRenderer: columnUtil.getHeaderRenderer(),
    }
}

export const isAppColumn = (
    column: Column.Serialized | Column.Deserialized
): boolean => ColumnUtility.isAppColumn(column)

// What to do when the user navigates with tab/shift-tab while editing a
// cell's contents. Returning true means "this truly was a navigation event,
// so allow it to bubble up to the DataGrid so it can switch the focus".
const onEditorNavigation = ({
    key
}: React.KeyboardEvent<HTMLDivElement>): boolean => key === 'Tab'
