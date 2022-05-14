import { ColumnSpecifier, ColumnInfo } from "@intutable/lazy-views"
import { Column } from "types"

/** Convert a column coming from the DB to a serialized stub of a RDG column. */
export const parse = (column: ColumnInfo): Column.Serialized => ({
    key: column.key,
    name: column.attributes.displayName!,
    editable: Boolean(column.attributes.editable!),
    editor: column.attributes.editor!,
    formatter: column.attributes.formatter,
    // additional stuff
    _id: column.id,
    _kind: column.attributes.kind,
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
        formatter: column.formatter,
        kind: column._kind,
    },
})
