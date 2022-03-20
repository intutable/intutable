import { Column, PM as PMKeys, PMTypes as PM } from "types"

export const parse = (column: Column.DBSchema): Column.Serialized => ({
    key: column.columnName,
    name: column.displayName,
    editable: Boolean(column.editable),
    editor: column.type,
})

export const deparse = (
    column: Column.Serialized,
    colId: PM.Column.ID
): Column.DBSchema => ({
    [PMKeys.UID_KEY]: colId,
    columnName: column.key,
    displayName: column.name,
    editable: column.editable ? 1 : 0,
    hidden: 0,
    type: column.editor,
})
