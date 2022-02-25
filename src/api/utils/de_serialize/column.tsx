import { ColumnHeader } from "@datagrid/ColumnRenderer"
import { isEditorType } from "@datagrid/Editor/editor-management"
import { getEditor, inferEditorType } from "@datagrid/Editor/EditorComponents"
import type { HeaderRendererProps } from "react-data-grid"
import { Column, Row } from "types"

/**
 *
 * @param col
 * @returns
 */
export const serialize = (col: Column): Column.Serialized => ({
    name: col.name as string, // TODO: this might be also a component in a future version
    key: col.key,
    editable: col.editable as boolean,
    editor: inferEditorType(col.editor!),
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
export const deserialize = (col: Column.Serialized): Column => ({
    name: col.name,
    key: col.key,
    editable: col.editable,
    editor: isEditorType(col.editor) ? getEditor(col.editor) : undefined, // TODO: maybe add the default TextEditor from rdg?!
    // editor: TextEditor,
    editorOptions: {
        editOnClick: true,
    },
    headerRenderer: (props: HeaderRendererProps<Row>) => {
        return (
            <ColumnHeader
                ckey={props.column.key}
                label={props.column.name as string}
                type={col.editor}
            />
        )
    },
})
