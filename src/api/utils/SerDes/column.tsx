import { ColumnUtility } from "utils/ColumnUtility"
import { Column } from "types"

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
    const Column = new ColumnUtility(col)

    return {
        ...col,
        editable: Column.isEditable(),
        editor: Column.getEditor(),
        formatter: Column.getFormatter(),
        summaryFormatter: undefined, // currently not supported
        groupFormatter: undefined, // currently not supported
        colSpan: undefined, // currently not supported
        editorOptions: {
            // renderFormatter: true // what is this doing?
            onCellKeyDown: undefined, // currently not supported
            onNavigation: undefined, // currently not supported
        },
        headerRenderer: Column.getHeaderRenderer(),
    }
}

export const isAppColumn = (
    column: Column.Serialized | Column.Deserialized
): boolean => ColumnUtility.isAppColumn(column)
