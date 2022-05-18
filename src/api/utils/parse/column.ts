import { ColumnSpecifier, ColumnInfo } from "@intutable/lazy-views"
import { Column } from "types"
import { isNumber } from "utils/isNumber"

/** Convert a column coming from the DB to a serialized stub of a RDG column. */
export const parse = (column: ColumnInfo): Column.Serialized => ({
    _id: column.id,
    _kind: column.attributes.kind,
    name: column.attributes.displayName,
    key: column.key,
    width: isNumber(column.attributes.width), // this only ensures that stringified numbers will be parsed, nothing more
    minWidth: isNumber(column.attributes.minWidth), // this only ensures that stringified numbers will be parsed, nothing more
    maxWidth: isNumber(column.attributes.maxWidth), // this only ensures that stringified numbers will be parsed, nothing more
    cellClass: column.attributes.cellClass,
    headerCellClass: column.attributes.headerCellClass,
    summaryCellClass: column.attributes.summaryCellClass,
    formatter: column.attributes.formatter,
    summaryFormatter: column.attributes.summaryFormatter,
    groupFormatter: column.attributes.groupFormatter,
    editable:
        column.attributes.editable == null
            ? column.attributes.editable
            : Boolean(column.attributes.editable),
    colSpan: column.attributes.colSpan,
    frozen:
        column.attributes.frozen == null
            ? column.attributes.frozen
            : Boolean(column.attributes.frozen),
    resizable:
        column.attributes.resizable == null
            ? column.attributes.resizable
            : Boolean(column.attributes.resizable),
    sortable:
        column.attributes.sortable == null
            ? column.attributes.sortable
            : Boolean(column.attributes.sortable),
    sortDescendingFirst:
        column.attributes.sortDescendingFirst == null
            ? column.attributes.sortDescendingFirst
            : Boolean(column.attributes.sortDescendingFirst),
    editor: column.attributes.editor,
    editorOptions: {
        renderFormatter:
            column.attributes.renderFormatter == null
                ? column.attributes.renderFormatter
                : Boolean(column.attributes.renderFormatter),
        editOnClick:
            column.attributes.editOnClick == null
                ? column.attributes.editOnClick
                : Boolean(column.attributes.editOnClick),
        commitOnOutsideClick:
            column.attributes.commitOnOutsideClick == null
                ? column.attributes.commitOnOutsideClick
                : Boolean(column.attributes.commitOnOutsideClick),
        onCellKeyDown: column.attributes.onCellKeyDown,
        onNavigation: column.attributes.onNavigation,
    },
    headerRenderer: column.attributes.headerRenderer,
})

/**
 * Convert a serialized RDG column to a ColumnSpecifier for creating a
 * column in the DB.
 */
export const deparse = (
    column: Column.Serialized,
    colId: ColumnSpecifier["parentColumnId"]
): ColumnSpecifier => {
    const deparsed: ColumnSpecifier = {
        parentColumnId: colId,
        attributes: {
            width:
                typeof column.width === "number"
                    ? column.width.toString()
                    : column.width, // this only ensures that numbers get parsed back to strings, nothing more
            minWidth:
                typeof column.minWidth === "number"
                    ? column.minWidth.toString()
                    : column.minWidth, // this only ensures that numbers get parsed back to strings, nothing more
            maxWidth:
                typeof column.maxWidth === "number"
                    ? column.maxWidth.toString()
                    : column.maxWidth, // this only ensures that numbers get parsed back to strings, nothing more
            editable: column.editable ? 1 : 0,
            frozen: column.frozen ? 1 : 0,
            resizable: column.resizable ? 1 : 0,
            sortable: column.sortable ? 1 : 0,
            sortDescendingFirst: column.sortDescendingFirst ? 1 : 0,
            renderFormatter: column.editorOptions?.renderFormatter ? 1 : 0,
            editOnClick: column.editorOptions?.editOnClick ? 1 : 0,
            commitOnOutsideClick: column.editorOptions?.commitOnOutsideClick
                ? 1
                : 0,
            onCellKeyDown: column.editorOptions?.onCellKeyDown,
            onNavigation: column.editorOptions?.onNavigation,
            ...column,
        },
    }
    delete column.editorOptions // no objects in db
    return deparsed
}
