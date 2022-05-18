import { CellContentTypeComponents } from "@datagrid/Editor"
import { inferEditorType } from "@datagrid/Editor/inferEditorType"
import { isCellContentType } from "@datagrid/Editor/type-management"
import { FormatterComponentMap } from "@datagrid/Formatter/formatters/map"
import { inferFormatterType } from "@datagrid/Formatter/utils/inferFormatterType"
import { headerRenderer } from "@datagrid/renderers"
import React from "react"
import { Column } from "types"
import { isNumber } from "utils/isNumber"

/**
 * // TODO: serialize correctly
 * @param col
 * @returns
 */
export const serialize = (col: Column.Deserialized): Column.Serialized => ({
    name: col.name as string,
    key: col.key,
    editable: col.editable as boolean,
    editor: inferEditorType(col.editor!),
    formatter: "standard",
    _kind: col._kind!,
    _id: col._id!,
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
    const FormatterComponent = FormatterComponentMap[col.formatter]

    // TODO: find a way to bind children to the function of the formatter
    // use a hoc https://reactjs.org/docs/higher-order-components.html

    return {
        ...col,
        editor: isCellContentType(col.editor)
            ? CellContentTypeComponents[col.editor]
            : undefined,
        formatter: FormatterComponent,
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
