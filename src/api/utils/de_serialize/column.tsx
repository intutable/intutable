import { CellContentTypeComponents } from "@datagrid/Editor"
import { inferEditorType } from "@datagrid/Editor/inferEditorType"
import { isCellContentType } from "@datagrid/Editor/type-management"
import { FormatterComponentMap } from "@datagrid/Formatter/formatters/map"
import { inferFormatterType } from "@datagrid/Formatter/utils/inferFormatterType"
import { headerRenderer } from "@datagrid/renderers"
import React from "react"
import { Column, MetaColumnProps } from "types"
import { isNumber } from "utils/isNumber"

/**
 * Serializes a single Column.
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
 * In detail this function does the following:
 *
 * ```
 * 1. replace all placeholders that got inserted when serialized by actual components.
 *    - `editor` property: when serialized, it has a value of {@type {EditorType}} which gets replaces by the actual component {@link getEditor}.
 * 2. not all properties from a serialized column are transfered to a deserialized one, some get removed.
 * ```
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
