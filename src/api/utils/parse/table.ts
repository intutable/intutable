import type { TableData } from "types"
import { EditorType } from "@datagrid/Editor/editor-management"
import { Column, PM } from "types"

const renameKeys = (col: Column.DBSchema): Column.Serialized => ({
    key: col.columnName,
    name: col.displayName,
    editable: Boolean(col.editable),
    editor: col.type as EditorType,
})

export const parse = (table: TableData.DBSchema): TableData.Serialized => {
    return {
        ...table,
        columns: table.columns
            .map(renameKeys)
            .filter(col => col.key !== PM.UID_KEY),
    }
}
