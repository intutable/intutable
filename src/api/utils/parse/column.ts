import {
    ColumnSpecifier,
    ColumnDescriptor,
} from "@intutable/join-tables/dist/types"
import { Column, PMTypes as PM } from "types"

export const parse = (column: ColumnDescriptor): Column.Serialized => ({
    key: column.key,
    name: column.attributes.displayName!,
    editable: Boolean(column.attributes.editable!),
    editor: column.attributes.editor!,
})

export const deparse = (
    column: Column.Serialized,
    colId: PM.Column.ID
): ColumnSpecifier => ({
    parentColumnId: colId,
    attributes: {
        displayName: column.name,
        editable: column.editable ? 1 : 0,
        editor: column.editor,
    },
})
