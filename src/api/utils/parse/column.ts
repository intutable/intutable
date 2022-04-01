import {
    ColumnSpecifier,
    ColumnDescriptor,
} from "@intutable/join-tables/dist/types"
import { Column } from "types"

/** Convert a column coming from the DB to a serialized stub of a RDG column. */
export const parse = (column: ColumnDescriptor): Column.Serialized => ({
    key: column.key,
    name: column.attributes.displayName!,
    editable: Boolean(column.attributes.editable!),
    editor: column.attributes.editor!,
})

/**
 * Convert a serialized RDG column to a ColumnSpecifier for creating a
 * column in the DB.
 */
export const deparse = (
    column: Column.Serialized,
    colId: ColumnSpecifier["parentColumnId"]
): ColumnSpecifier => ({
    parentColumnId: colId,
    attributes: {
        displayName: column.name,
        editable: column.editable ? 1 : 0,
        editor: column.editor,
    },
})
