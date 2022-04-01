import { headerRenderer } from "@datagrid/renderers"
import { isCellContentType } from "@datagrid/Editor_Formatter/type-management"
import { inferEditorType } from "@datagrid/Editor_Formatter/inferEditorType"
import { CellContentTypeComponents } from "@datagrid/Editor_Formatter"
import { LinkedColumnFormatter } from "@datagrid/Editor_Formatter/components/formatters"
import type { HeaderRendererProps } from "react-data-grid"
import { Column, Row } from "types"
import { inferFormatterType } from "@datagrid/Editor_Formatter/inferFormatterType"

/**
 *
 * @param col
 * @returns
 */
export const serialize = (col: Column.Deserialized): Column.Serialized => ({
    name: col.name as string,
    key: col.key,
    editable: col.editable as boolean,
    editor: inferEditorType(col.editor!),
    formatter: inferFormatterType(col.formatter!),
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
export const deserialize = (col: Column.Serialized): Column => {
    const isLinkedCol = col.editable === false && col.formatter === "linkColumn"

    return {
        name: col.name,
        key: col.key,
        editable: col.editable,
        editor:
            isLinkedCol === false &&
            col.editable &&
            isCellContentType(col.editor)
                ? CellContentTypeComponents[col.editor].editor
                : undefined,
        formatter: isLinkedCol
            ? LinkedColumnFormatter
            : isCellContentType(col.editor)
            ? CellContentTypeComponents[col.editor].formatter
            : undefined,
        editorOptions: {
            editOnClick: col.editable,
            commitOnOutsideClick: col.editable,
        },
        headerRenderer: headerRenderer,
    }
}
