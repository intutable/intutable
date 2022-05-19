import { CellContentTypeComponents } from "@datagrid/Editor"
import { isCellContentType } from "@datagrid/Editor/type-management"
import { FormatterComponentMap } from "@datagrid/Formatter/formatters/map"
import { headerRenderer } from "@datagrid/renderers"
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
    name: col.name as string,
    editor: "string", // TODO: must be inferred somehow, but atm it only can have this default value
    formatter: "standard", // TODO: must be inferred somehow, but atm it only can have this default value
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
    /**
     * To understand this condition see {@link MetaColumnProps._kind}
     */
    const formatter = col._kind === "standard" ? col.formatter : col._kind

    return {
        ...col,
        editor: isCellContentType(col.editor)
            ? CellContentTypeComponents[col.editor]
            : undefined,
        formatter: FormatterComponentMap[formatter],
        summaryFormatter: undefined, // currently not supported
        groupFormatter: undefined, // currently not supported
        colSpan: undefined, // currently not supported
        editorOptions: {
            onCellKeyDown: undefined, // currently not supported
            onNavigation: undefined, // currently not supported
        },
        headerRenderer: headerRenderer,
    }
}
