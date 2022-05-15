import { CellContentTypeComponents } from "@datagrid/Editor_Formatter"
import { inferEditorType } from "@datagrid/Editor_Formatter/inferEditorType"
import { isCellContentType } from "@datagrid/Editor_Formatter/type-management"
import { FormatterComponentMap } from "@datagrid/Formatter/formatters/map"
import { inferFormatterType } from "@datagrid/Formatter/utils/inferFormatterType"
import { headerRenderer } from "@datagrid/renderers"
import { Column } from "types"

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
export const deserialize = (col: Column.Serialized): Column => {
    const FormatterComponent = FormatterComponentMap[col.formatter]

    return {
        name: col.name,
        key: col.key,
        editable: col.editable,
        editor: isCellContentType(col.editor)
            ? CellContentTypeComponents[col.editor]
            : undefined,
        formatter: FormatterComponent,
        editorOptions: {
            editOnClick: col.editable,
            commitOnOutsideClick: col.editable,
        },
        headerRenderer: headerRenderer,
        _id: col._id,
        _kind: col._kind,
    }
}
